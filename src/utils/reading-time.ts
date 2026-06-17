const CHARS_PER_MINUTE = 500;

/** 마크다운 본문에서 읽는 시간(분, 최소 1)을 계산한다. */
export function readingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/[#>*_~\-`!\[\]()]/g, '')
    .replace(/\s+/g, '');
  const minutes = Math.ceil(text.length / CHARS_PER_MINUTE);
  return Math.max(1, minutes);
}
