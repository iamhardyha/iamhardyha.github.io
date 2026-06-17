import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('빈 본문은 최소 1분', () => {
    expect(readingTime('')).toBe(1);
  });

  it('마크다운 기호/코드는 제외하고 글자 수로 계산', () => {
    const text = '가'.repeat(1000);
    expect(readingTime(text)).toBe(2);
  });

  it('한글 1500자는 3분', () => {
    const text = '나'.repeat(1500);
    expect(readingTime(text)).toBe(3);
  });

  it('마크다운 문법 문자는 세지 않는다', () => {
    const md = '# 제목\n\n```js\nconst a = 1;\n```\n' + '다'.repeat(500);
    expect(readingTime(md)).toBe(1);
  });
});
