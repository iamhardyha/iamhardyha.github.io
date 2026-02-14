
---
layout: post
title: "[AWS 시리즈] "
date: 2026-01-25
categories: [infra]
tags: [AWS, VPC, VPCENDPOINT, GATEWAY]
thumbnail: "/assets/img/awsvpc3.png"
---

> 1편에서 VPC, ENI, NAT 게이트웨이, VPC 엔드포인트의 개념과 종류를 정리했다.
> 2편에서는 실전 구축 과정과 보안·비용 관점에서 어떻게 설계하면 좋은지에 집중해보자!

---

## 1. 게이트웨이 엔드포인트 깊게 보기 (S3/DynamoDB)

### 1-1. Prefix List와 라우팅 테이블

게이트웨이 엔드포인트는 **라우팅 테이블 기반**으로 동작한다.

- AWS는 S3, DynamoDB가 사용하는 IP 범위를 **AWS 관리형 프리픽스 리스트(AWS-managed Prefix List)**로 제공한다.
- 프리픽스 리스트에는 여러 CIDR 블록이 묶여 있으며, 하나의 ID(pl-xxxxxx)로 관리된다.
- 게이트웨이 엔드포인트를 만들면, 선택한 라우팅 테이블에 다음과 같은 규칙이 자동으로 추가된다.
    - 목적지: S3 프리픽스 리스트(pl-xxxxxx)
    - 대상: 게이트웨이 엔드포인트(vpce-xxxxxx)

프라이빗 서브넷의 EC2가 S3에 요청을 보내면:

1. 목적지 IP가 S3 프리픽스 리스트에 포함되는지 검사한다.
2. 포함된다면 게이트웨이 엔드포인트로 라우팅한다.
3. 게이트웨이 엔드포인트가 AWS 내부 네트워크를 통해 S3로 전달한다.

이 과정 덕분에, **인터넷 게이트웨이를 거치지 않고도 S3와 통신**할 수 있다.

### 1-2. 게이트웨이 엔드포인트의 특징 요약

| 항목 | 설명 |
|------|------|
| **지원 서비스** | S3, DynamoDB 만 |
| **생성 수준** | VPC 단위 |
| **적용 대상** | 선택한 라우팅 테이블 |
| **보안 그룹** | 필요 없음 |
| **비용** | 엔드포인트 사용료 무료 |
| **데이터 전송료** | 무료 (AWS 내부) |
| **고가용성** | 자동 (모든 AZ) |

---

## 2. 인터페이스 엔드포인트 깊게 보기 (PrivateLink)

### 2-1. ENI 기반 구조

인터페이스 엔드포인트는 특정 서브넷에 ENI를 하나 생성하고, 이 ENI를 통해 서비스에 연결한다.

- 서브넷 단위로 생성하며, 고가용성을 위해 각 AZ마다 따로 만들 수 있다.
- ENI에는 프라이빗 IP와 보안 그룹이 할당된다.
- EC2는 이 ENI의 프라이빗 IP로 트래픽을 보내고, AWS PrivateLink가 백엔드에서 실제 서비스(SNS, SQS 등)로 라우팅한다.

### 2-2. 프라이빗 DNS 이름

인터페이스 엔드포인트 생성 시 **프라이빗 DNS 이름(Private DNS)** 옵션을 켜면 편의성이 크게 올라간다.

- AWS가 Route 53 프라이빗 호스팅 영역을 자동으로 만들어,
  `sns.amazonaws.com` 같은 도메인을 엔드포인트 ENI의 프라이빗 IP로 매핑한다.
- VPC에서 DNS 해석(DNS Resolution)과 DNS 호스트명(DNS Hostnames)이 활성화되어 있어야 작동한다.
- 이렇게 설정하면 애플리케이션 코드를 수정하지 않고도,
  기존 도메인 그대로 사용하면서 VPC 엔드포인트 경로를 타게 된다.

예를 들어, Spring Boot에서 이렇게 작성해도:

```java
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.regions.Region;
import org.springframework.stereotype.Service;

@Service
public class SnsMessageService {
    
    private final SnsClient snsClient;
    
    public SnsMessageService() {
        this.snsClient = SnsClient.builder()
            .region(Region.AP_NORTHEAST_2)
            .build();
    }
    
    public void publishMessage(String topicArn, String message) {
        PublishRequest request = PublishRequest.builder()
            .topicArn(topicArn)
            .message(message)
            .build();
        
        PublishResponse result = snsClient.publish(request);
        System.out.println("Message published successfully: " + result.messageId());
    }
}
```

DNS가 `sns.ap-northeast-2.amazonaws.com`을 엔드포인트 ENI의 프라이빗 IP로 해석해주기 때문에,
외부 인터넷이 아니라 인터페이스 엔드포인트를 통해 SNS에 접근한다. 개발자 관점에서는 코드 변경이 **전혀 필요 없다**.

---

## 3. 실전: 게이트웨이 엔드포인트로 S3 프라이빗 통신 구성하기

### 3-1. 요구사항 시나리오

- VPC는 이미 구성되어 있고, 퍼블릭/프라이빗 서브넷이 분리되어 있다.
- 프라이빗 서브넷의 EC2가 S3 버킷에서 데이터를 읽어와야 한다.
- 인터넷으로 나가지 않고, VPC 내부에서만 S3와 통신하고 싶다.
- 비용도 최소화하고 싶다.

### 3-2. Step 1 – EC2 IAM 역할에 S3 권한 부여

네트워크 이전에 먼저 **권한**을 맞춰야 한다.

EC2에 할당된 IAM 역할에 최소한 다음 권한이 있어야 한다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}
```

권한이 없다면 VPC 엔드포인트를 어떻게 구성해도 S3 접근은 실패한다.

### 3-3. Step 2 – S3 버킷 생성

- S3 콘솔에서 새 버킷을 만든다.
- 버킷 이름은 전 세계에서 유일해야 하며, 소문자와 하이픈만 사용 가능하다.
- 예: `my-company-private-logs-apne2`

### 3-4. Step 3 – VPC 게이트웨이 엔드포인트 생성

VPC 콘솔에서:

1. **엔드포인트 생성** 클릭
2. 엔드포인트 유형: **Gateway**
3. 서비스 이름: `com.amazonaws.ap-northeast-2.s3` (리전에 맞춰 선택)
4. VPC: 대상 VPC 선택
5. 라우팅 테이블: S3를 사용하게 할 프라이빗 서브넷의 라우팅 테이블 선택
6. 엔드포인트 정책: 처음에는 기본(Full Access)으로 두고, 이후 필요시 제한

생성이 완료되면 라우팅 테이블에 Prefix List를 이용한 규칙이 자동 추가된다.

### 3-5. Step 4 – S3 버킷 정책으로 VPC 엔드포인트만 허용하기

이제 S3 버킷 정책으로 **"이 VPC 엔드포인트를 통해 오는 요청만 허용"**하도록 제한할 수 있다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowOnlyFromSpecificVPCE",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-company-private-logs-apne2",
        "arn:aws:s3:::my-company-private-logs-apne2/*"
      ],
      "Condition": {
        "StringNotEquals": {
          "aws:sourceVpce": "vpce-1a2b3c4d5e6f7g8h9"
        }
      }
    }
  ]
}
```

이렇게 하면:

- 같은 AWS 계정·같은 IAM 권한이라도,
- `aws:sourceVpce`가 지정한 엔드포인트가 아니라면 모두 거부된다.

즉, 인터넷을 통해 직접 S3에 접근할 수 없고 **반드시 VPC 엔드포인트를 거쳐야만** 이 버킷에 접근 가능해진다.

### 3-6. Step 5 – Spring Boot 애플리케이션에서 S3 접근 테스트

Spring Boot 애플리케이션에서 프라이빗 서브넷 내의 EC2에서 실행할 경우, 다음과 같은 코드로 S3에 접근할 수 있다.

**pom.xml (Maven 의존성):**

```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.24.0</version>
</dependency>
```

**S3Service.java:**

```java
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import org.springframework.stereotype.Service;
import java.io.InputStream;

@Service
public class S3Service {
    
    private final S3Client s3Client;
    private final String bucketName = "my-company-private-logs-apne2";
    
    public S3Service() {
        this.s3Client = S3Client.builder()
            .region(Region.AP_NORTHEAST_2)
            .build();
    }
    
    // S3 버킷의 객체 목록 조회
    public void listObjects() {
        ListObjectsV2Request listReq = ListObjectsV2Request.builder()
            .bucket(bucketName)
            .build();
        
        ListObjectsV2Response listRes = s3Client.listObjectsV2(listReq);
        
        for (S3Object object : listRes.contents()) {
            System.out.println("Object: " + object.key());
        }
    }
    
    // S3에서 특정 파일 다운로드
    public void downloadFile(String key, String localPath) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();
        
        try (ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getObjectRequest)) {
            // 파일을 로컬에 저장하는 로직
            s3Object.transferTo(new java.io.FileOutputStream(localPath));
            System.out.println("File downloaded successfully: " + key);
        } catch (Exception e) {
            System.err.println("Error downloading file: " + e.getMessage());
        }
    }
}
```

**Controller에서 사용 예시:**

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class S3Controller {
    
    private final S3Service s3Service;
    
    public S3Controller(S3Service s3Service) {
        this.s3Service = s3Service;
    }
    
    @GetMapping("/s3/list")
    public String listObjects() {
        s3Service.listObjects();
        return "Objects listed successfully via VPC Endpoint";
    }
    
    @GetMapping("/s3/download")
    public String downloadFile(@RequestParam String key) {
        s3Service.downloadFile(key, "/tmp/" + key);
        return "File downloaded successfully: " + key;
    }
}
```

요청이 성공하면, S3와의 통신이 NAT/인터넷 없이 게이트웨이 엔드포인트를 통해 이루어지고 있다는 뜻이다. **모든 트래픽은 VPC 엔드포인트 경로로 자동 라우팅된다**.

---

## 4. 엔드포인트 정책과 보안 그룹 설계

### 4-1. 엔드포인트 정책(VPCE Policy)

VPC 엔드포인트 자체에 붙는 리소스 기반 정책이다.

- "이 엔드포인트를 통해 어떤 리소스에, 어떤 동작을 허용/거부할지"를 정의
- 예: `my-company-private-logs-*` 버킷에 대한 `GetObject`/`PutObject`만 허용

엔드포인트 정책에서 걸러지고, 그 다음 S3 버킷 정책, 마지막으로 IAM 권한이 평가된다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-company-*/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:DeleteBucket",
      "Resource": "*"
    }
  ]
}
```

### 4-2. 인터페이스 엔드포인트와 보안 그룹

인터페이스 엔드포인트는 ENI이기 때문에, 여기에 보안 그룹을 붙여야 한다.

- **인바운드 규칙**: 어떤 소스(VPC, 서브넷, 보안 그룹)에서 오는 트래픽을 허용할지
- 예: 특정 애플리케이션 서버 SG에서만 SNS 엔드포인트로 접근하게 하기

```
SNS 엔드포인트 보안 그룹 인바운드 규칙:
- 프로토콜: HTTPS (443)
- 소스: app-sg (애플리케이션 서버 보안 그룹)
- 설명: Allow SNS from app servers
```

이렇게 하면, 같은 VPC 안에 있더라도 **모든 리소스가 무조건 엔드포인트를 쓸 수 있는 것이 아니라**, 보안 그룹으로 대상 애플리케이션만 선택적으로 허용할 수 있다.

---

## 5. 고가용성과 비용: NAT vs VPC 엔드포인트

### 5-1. 처리량과 할당량

AWS PrivateLink(인터페이스 엔드포인트)는 AZ당 기본 10Gbps, 최대 100Gbps까지 자동 스케일링된다.
VPC 하나당 생성할 수 있는 엔드포인트 수는 기본 50개 정도이며, 필요하면 제한 증가 요청을 할 수 있다.

엔드포인트의 트래픽과 에러율은 CloudWatch 메트릭(예: BytesProcessed, PacketsDropped)을 통해 모니터링할 수 있다.

### 5-2. 비용 비교 예시

**시나리오:** 월 1TB 데이터를 S3로 주고받는 배치 처리 시스템

**NAT 게이트웨이 1개 사용:**

```
시간 요금: 730시간 × $0.045/시간 = $32.85/월
NAT 데이터 처리: 1,024GB × $0.045/GB = $46.08/월
인터넷 아웃바운드: 1,024GB × $0.09/GB = $92.16/월
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $171.09/월
```

**게이트웨이 엔드포인트(S3) 사용:**

```
엔드포인트 사용료: $0
S3와의 내부 통신 데이터 전송료: $0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
합계: $0/월
```

**절감액: 월 $171 × 12개월 × 3년 = $6,156/년**

### 5-3. 고가용성을 위한 다중 AZ 배치

프로덕션 환경에서는 **가용성(Availability)**을 반드시 고려해야 한다.

```
❌ 단일 AZ 구성:
AZ-1: 인터페이스 엔드포인트 ✓
AZ-2: (없음)
→ AZ-1 장애 시 서비스 불가능

✓ 권장 구성 (다중 AZ):
AZ-1: 인터페이스 엔드포인트 ✓
AZ-2: 인터페이스 엔드포인트 ✓
AZ-3: 인터페이스 엔드포인트 ✓
→ 한 AZ 장애 시에도 다른 AZ로 자동 failover
```

**비용 vs 가용성:**

- 1개 AZ: $7.30/월 (개발/테스트)
- 2개 AZ: $14.60/월 (프로덕션 권장)
- 3개 AZ: $21.90/월 (금융/의료 시스템)

같은 AZ 내 트래픽은 **무료**이므로, 여러 AZ에 배치해도 비용 효율적이다.

### 5-4. 언제 NAT, 언제 VPC 엔드포인트?

| 상황 | 추천 솔루션 |
|------|------------|
| S3/DynamoDB만 필요한 데이터 처리 배치 | **게이트웨이 엔드포인트**만 사용 |
| SNS, SQS, CloudWatch Logs 등 다수의 AWS 서비스 사용 | S3/DynamoDB는 게이트웨이, 나머지는 **인터페이스 엔드포인트** |
| 외부 결제 서비스·외부 API 호출 필요 | VPC 엔드포인트 + **NAT 게이트웨이** 병행 |
| 외부 인터넷 접근은 아예 차단, AWS 서비스만 사용 | NAT 제거, VPC 엔드포인트만 사용 |

---

## 6. 모니터링과 운영 팁

### 6-1. CloudWatch 메트릭 활용

인터페이스 엔드포인트는 CloudWatch에 여러 메트릭을 기록한다.

```
BytesProcessed: 처리된 총 바이트 수
→ 대역폭 계산에 사용

PacketsDropped: 버려진 패킷 수
→ 갑자기 증가하면 MTU, 보안 정책, 서비스 장애 의심

ActiveConnectionCount: 현재 연결 수
→ 부하 수준 파악
```

중요 메트릭에 대해 알람을 걸어두면, 장애나 성능 병목을 빠르게 감지할 수 있다.

**Spring Boot에서 CloudWatch 메트릭 모니터링:**

```java
import software.amazon.awssdk.services.cloudwatch.CloudWatchClient;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsRequest;
import software.amazon.awssdk.services.cloudwatch.model.GetMetricStatisticsResponse;
import software.amazon.awssdk.services.cloudwatch.model.Dimension;
import software.amazon.awssdk.regions.Region;
import java.time.Instant;

@Service
public class VpcEndpointMonitoringService {
    
    private final CloudWatchClient cloudWatchClient;
    
    public VpcEndpointMonitoringService() {
        this.cloudWatchClient = CloudWatchClient.builder()
            .region(Region.AP_NORTHEAST_2)
            .build();
    }
    
    public void getEndpointMetrics(String endpointId) {
        GetMetricStatisticsRequest request = GetMetricStatisticsRequest.builder()
            .namespace("AWS/VPCEndpoint")
            .metricName("BytesProcessed")
            .dimensions(
                Dimension.builder()
                    .name("VpcEndpointId")
                    .value(endpointId)
                    .build()
            )
            .startTime(Instant.now().minusSeconds(3600))
            .endTime(Instant.now())
            .period(300)
            .statistics("Sum", "Average")
            .build();
        
        GetMetricStatisticsResponse response = cloudWatchClient.getMetricStatistics(request);
        response.datapoints().forEach(dp -> 
            System.out.println("Bytes: " + dp.sum() + ", Avg: " + dp.average())
        );
    }
}
```

### 6-2. 엔드포인트 수명 주기 관리

- 사용하지 않는 엔드포인트는 정리해 비용과 관리 포인트를 줄인다.
- 서비스별로 태그를 잘 붙여서, 나중에 청구서에서 어떤 팀/시스템이 비용을 쓰고 있는지 추적하기 쉽게 만든다.

```
엔드포인트 태그 예시:
- Team: backend
- Service: payment-processor
- Environment: production
- CostCenter: platform-ops
```

---

## 7. 마무리: VPC 엔드포인트를 기본값으로 가져가자

정리하면:

- **게이트웨이 엔드포인트**는 S3/DynamoDB에 대해 "무료이면서 가장 강력한" 옵션이다.
- **인터페이스 엔드포인트**는 SNS, SQS, CloudWatch, Secrets Manager 등 대부분의 AWS 서비스에 대해 NAT를 대체하는 안전한 통로다.
- NAT 게이트웨이는 **정말로 외부 인터넷이 필요할 때만** 쓰는 것이 비용과 보안 측면에서 유리하다.

새로운 VPC를 설계한다면, 처음부터 다음을 기본값으로 두는 것을 추천한다.

1. S3/DynamoDB를 사용할 계획이 있다 → **게이트웨이 엔드포인트부터 만든다.**
2. CloudWatch Logs, SNS/SQS를 사용한다 → **인터페이스 엔드포인트를 AZ별로 구성한다.**
3. 외부 API를 몇 군데만 호출한다 → NAT 게이트웨이 1개 + 라우팅 최소화.

이렇게만 해도, 보안은 강화되고 비용은 눈에 띄게 줄어든다.

이미 운영 중인 시스템이라면, NAT 트래픽이 많은 워크로드부터 하나씩 VPC 엔드포인트로 옮겨보는 것을 추천한다.

---

## 참고 링크

### AWS 공식 문서

- [AWS VPC 엔드포인트 - 공식 문서](https://docs.aws.amazon.com/vpc/latest/privatelink/)
- [게이트웨이 엔드포인트 구성](https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html)
- [인터페이스 엔드포인트 구성](https://docs.aws.amazon.com/vpc/latest/privatelink/interface-endpoints.html)
- [AWS PrivateLink 개념](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html)
- [VPC 엔드포인트 정책 관리](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-access.html)
- [프라이빗 DNS 이름 관리](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)
- [AWS 관리 프리픽스 리스트](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-aws-managed-prefix-lists.html)
- [NAT 게이트웨이 요금](https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html)
- [AWS PrivateLink 할당량](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-limits-endpoints.html)
- [CloudWatch를 이용한 VPC 엔드포인트 모니터링](https://community.aws/content/2hDuaJGRF6qRvnpdljQBG2WyYQk/monitor-vpc-interface-endpoints-with-cloudwatch)

### 관련 AWS 서비스

- [Amazon S3 (Simple Storage Service)](https://docs.aws.amazon.com/s3/)
- [Amazon DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Amazon CloudWatch](https://docs.aws.amazon.com/cloudwatch/)
- [Amazon SNS (Simple Notification Service)](https://docs.aws.amazon.com/sns/)
- [Amazon SQS (Simple Queue Service)](https://docs.aws.amazon.com/sqs/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)

---