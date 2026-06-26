/**
 * Pure helpers for the local-only post editor.
 *
 * Shared between the browser (the /editor page client script) and the test
 * suite. Has NO Astro or Node dependencies so it runs anywhere. The dev-only
 * Vite plugin re-validates independently at the boundary — this module is for
 * shaping content, not for trusting it.
 */

/** URL-safe kebab-case slug: lowercase ascii words joined by single hyphens. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** YYYY-MM-DD. */
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface PostMeta {
  title: string;
  description: string;
  pubDate: string; // YYYY-MM-DD
  tags: string[];
  series?: string;
  cover?: string;
  draft: boolean;
  updatedDate?: string; // YYYY-MM-DD
}

export interface PostFile {
  meta: PostMeta;
  body: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

/**
 * Derive an ascii slug from a title. Korean (and other non-ascii) characters
 * are dropped, so a pure-Korean title yields '' and the caller must supply a
 * slug by hand — matching how the existing posts are named.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Quote and escape a string for a YAML double-quoted scalar. */
function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Render a tags array as a YAML flow sequence: ["a", "b"]. */
function yamlTags(tags: string[]): string {
  return `[${tags.map(yamlString).join(', ')}]`;
}

/**
 * Serialize a post into the exact on-disk markdown format: YAML frontmatter,
 * one blank line, then the body (always newline-terminated). Optional fields
 * that are empty are omitted so generated files match the hand-written ones.
 */
export function serializePost({ meta, body }: PostFile): string {
  const lines: string[] = ['---'];
  lines.push(`title: ${yamlString(meta.title)}`);
  lines.push(`description: ${yamlString(meta.description)}`);
  lines.push(`pubDate: ${meta.pubDate}`);
  if (meta.updatedDate) lines.push(`updatedDate: ${meta.updatedDate}`);
  if (meta.tags.length > 0) lines.push(`tags: ${yamlTags(meta.tags)}`);
  if (meta.series) lines.push(`series: ${yamlString(meta.series)}`);
  if (meta.cover) lines.push(`cover: ${yamlString(meta.cover)}`);
  lines.push(`draft: ${meta.draft}`);
  lines.push('---');

  const trimmedBody = body.replace(/^\n+/, '').replace(/\s+$/, '');
  return `${lines.join('\n')}\n\n${trimmedBody}\n`;
}

/** Strip surrounding quotes and unescape a YAML scalar (double- or single-quoted). */
function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (trimmed.length >= 2 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'"); // YAML: '' is an escaped quote
  }
  return trimmed;
}

/** Parse a YAML flow sequence of quoted strings: ["a", "b"] -> ['a', 'b']. */
function parseTags(value: string): string[] {
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  if (!inner) return [];
  return inner.split(',').map((item) => unquote(item)).filter(Boolean);
}

/**
 * Parse a markdown file (as produced by serializePost, or hand-written in the
 * same shape) back into meta + body. Tolerant of missing optional keys; only
 * the keys this editor understands are read.
 */
export function parsePost(raw: string): PostFile {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { meta: emptyMeta(), body: raw };
  }

  const frontmatter = match[1];
  const body = raw.slice(match[0].length).replace(/^\n+/, '');

  const meta = emptyMeta();
  const lines = frontmatter.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    switch (key) {
      case 'title':
        meta.title = unquote(value);
        break;
      case 'description':
        meta.description = unquote(value);
        break;
      case 'pubDate':
        meta.pubDate = value.trim();
        break;
      case 'updatedDate':
        meta.updatedDate = value.trim();
        break;
      case 'tags':
        if (value.trim()) {
          meta.tags = parseTags(value); // flow style: tags: ["a", "b"]
        } else {
          // block style (as Sveltia/Decap writes):  tags:\n  - a\n  - b
          const items: string[] = [];
          let j = i + 1;
          while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
            items.push(unquote(lines[j].replace(/^\s*-\s+/, '')));
            j += 1;
          }
          meta.tags = items.filter(Boolean);
          i = j - 1;
        }
        break;
      case 'series':
        meta.series = unquote(value);
        break;
      case 'cover':
        meta.cover = unquote(value);
        break;
      case 'draft':
        meta.draft = value.trim() === 'true';
        break;
    }
  }

  return { meta, body: body.endsWith('\n') ? body : `${body}\n` };
}

function emptyMeta(): PostMeta {
  return { title: '', description: '', pubDate: '', tags: [], draft: false };
}

/**
 * Validate editor input at the boundary. Returns user-facing Korean messages.
 * `slug` is required here (separate from the title) because it becomes a file
 * path — the SLUG_RE check is also the path-traversal guard.
 */
export function validatePostInput(input: {
  title?: string;
  description?: string;
  slug?: string;
  pubDate?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!input.title || !input.title.trim()) {
    errors.push('제목(title)을 입력하세요.');
  }
  if (!input.description || !input.description.trim()) {
    errors.push('설명(description)을 입력하세요.');
  }
  if (!input.slug || !SLUG_RE.test(input.slug)) {
    errors.push('slug은 영문 소문자/숫자/하이픈만 가능합니다 (예: my-first-post).');
  }
  if (!input.pubDate || !DATE_RE.test(input.pubDate)) {
    errors.push('날짜(pubDate)는 YYYY-MM-DD 형식이어야 합니다.');
  }

  return { ok: errors.length === 0, errors };
}
