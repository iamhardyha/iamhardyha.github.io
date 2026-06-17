export const SITE = {
  title: 'Hardy Ha',
  tagline: '하루하루 성장하는 개발자의 에세이',
  description: '개발·기술·조직문화·AI에 대한 개인적 사견을 에세이로 씁니다.',
  author: '하창현 (Hardy)',
  url: 'https://iamhardyha.github.io',
  avatar: 'https://avatars.githubusercontent.com/u/203849847?v=4',
  postsPerPage: 10,
};

export const NAV = [
  { label: 'Writing', href: '/writing' },
  { label: 'Topics', href: '/topics' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
];

export const SOCIAL = {
  github: 'https://github.com/iamhardyha',
  email: 'mailto:hachanghyeon411@gmail.com',
  tistory: 'https://devhardy.tistory.com/',
};

// 외부 서비스 설정값 — 발급 후 채운다. 빈 값이면 해당 기능 비활성.
export const GISCUS = {
  repo: 'iamhardyha/iamhardyha.github.io',
  repoId: '',       // giscus.app에서 발급
  category: 'Comments',
  categoryId: '',   // giscus.app에서 발급
};

export const GOATCOUNTER = {
  code: '',         // 예: 'iamhardyha'
  apiToken: '',     // read-only 통계 토큰
};
