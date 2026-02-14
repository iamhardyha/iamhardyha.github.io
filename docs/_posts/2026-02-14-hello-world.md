---
layout: post
title: "Hello World - 블로그를 시작합니다"
date: 2026-02-14
categories: [backend]
tags: [blog, jekyll]
---

첫 번째 블로그 포스트입니다. 이 블로그에서는 소프트웨어 엔지니어링에 관한 글을 작성할 예정입니다.

## 코드 하이라이팅 예시

### Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

### JavaScript

```javascript
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch:", error);
  }
};
```

### Java

```java
public class HelloWorld {
    public static void main(String[] args) {
        List<String> items = List.of("Hello", "World");
        items.stream()
             .map(String::toUpperCase)
             .forEach(System.out::println);
    }
}
```

## 마크다운 기능

> 인용문도 지원됩니다.

| Feature | Supported |
|---------|-----------|
| Code highlighting | Yes |
| Categories | Yes |
| Tags | Yes |
| RSS Feed | Yes |
| SEO | Yes |

앞으로 다양한 기술 주제에 대해 글을 작성하겠습니다.
