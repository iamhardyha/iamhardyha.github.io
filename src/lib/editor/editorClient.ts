/**
 * Browser logic for the local /editor page.
 *
 * Loaded ONLY in dev, via a `<script is:inline src="/src/lib/editor/editorClient.ts">`
 * tag that Astro renders solely when `import.meta.env.DEV` is true. In a
 * production build the tag is never emitted and this file is never imported by
 * anything, so it (and its endpoints) leave no trace in `dist/`. The Vite dev
 * server transforms this TS on the fly when the browser requests it.
 */
import { slugify, serializePost, parsePost, validatePostInput, type PostMeta } from './postFile';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const els = {
  title: $<HTMLInputElement>('f-title'),
  slug: $<HTMLInputElement>('f-slug'),
  description: $<HTMLTextAreaElement>('f-description'),
  pubDate: $<HTMLInputElement>('f-pubDate'),
  draft: $<HTMLInputElement>('f-draft'),
  tags: $<HTMLInputElement>('f-tags'),
  series: $<HTMLInputElement>('f-series'),
  body: $<HTMLTextAreaElement>('f-body'),
  status: $<HTMLParagraphElement>('status'),
  previewFile: $<HTMLElement>('preview-file').querySelector('code')!,
  previewPath: $<HTMLElement>('preview-path'),
  slugEcho: $<HTMLElement>('slug-echo'),
  loadSelect: $<HTMLSelectElement>('loadSelect'),
};

const STORAGE_KEY = 'editor:autosave';
let loadedSlug = ''; // the slug currently open (edits to it are implicit overwrites)

const todayISO = (): string => new Date().toISOString().slice(0, 10);

// ---- read / write the form --------------------------------------------------
function parseTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function gather(): { meta: PostMeta; slug: string; body: string } {
  return {
    slug: els.slug.value.trim(),
    body: els.body.value,
    meta: {
      title: els.title.value.trim(),
      description: els.description.value.trim(),
      pubDate: els.pubDate.value,
      tags: parseTags(els.tags.value),
      series: els.series.value.trim() || undefined,
      draft: els.draft.checked,
    },
  };
}

function fill(meta: PostMeta, slug: string, body: string): void {
  els.title.value = meta.title;
  els.slug.value = slug;
  els.description.value = meta.description;
  els.pubDate.value = meta.pubDate;
  els.tags.value = meta.tags.join(', ');
  els.series.value = meta.series ?? '';
  els.draft.checked = meta.draft;
  els.body.value = body;
  loadedSlug = slug;
  render();
}

// ---- status + live preview --------------------------------------------------
function setStatus(message: string, kind: 'ok' | 'err' | '' = ''): void {
  els.status.textContent = message;
  els.status.dataset.kind = kind;
}

function render(): void {
  const { meta, slug, body } = gather();
  els.slugEcho.textContent = slug || '…';
  els.previewPath.textContent = `src/content/posts/${slug || '…'}.md`;
  els.previewFile.textContent = serializePost({ meta, body });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, slug, body }));
  } catch {
    /* storage full / disabled — autosave is best-effort */
  }
}

// ---- server calls -----------------------------------------------------------
async function refreshList(): Promise<void> {
  try {
    const res = await fetch('/__editor/list');
    const json = await res.json();
    if (!json.success) return;
    const current = els.loadSelect.value;
    els.loadSelect.innerHTML = '<option value="">기존 글 불러오기…</option>';
    for (const post of json.data) {
      const opt = document.createElement('option');
      opt.value = post.slug;
      let isDraft = false;
      try {
        isDraft = parsePost(post.raw).meta.draft;
      } catch {
        /* a malformed file just shows as non-draft */
      }
      opt.textContent = isDraft ? `${post.slug} · 초안` : post.slug;
      els.loadSelect.appendChild(opt);
    }
    els.loadSelect.value = current;
  } catch (error) {
    console.error(error);
  }
}

async function loadPost(slug: string): Promise<void> {
  if (!slug) return;
  const res = await fetch(`/__editor/load?slug=${encodeURIComponent(slug)}`);
  const json = await res.json();
  if (!json.success) {
    setStatus(`불러오기 실패: ${json.error}`, 'err');
    return;
  }
  const { meta, body } = parsePost(json.data.raw);
  fill(meta, slug, body);
  setStatus(`불러옴: ${slug}.md`, 'ok');
}

async function save({ silent = false, label = '저장됨' } = {}): Promise<boolean> {
  const { meta, slug, body } = gather();
  const check = validatePostInput({ ...meta, slug });
  if (!check.ok) {
    setStatus(check.errors.join('  '), 'err');
    return false;
  }
  const content = serializePost({ meta, body });
  const overwrite = slug === loadedSlug; // editing an existing file is implicit overwrite

  const post = (force: boolean) =>
    fetch('/__editor/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, content, overwrite: force }),
    }).then((r) => r.json());

  let json = await post(overwrite);
  if (!json.success && json.error?.includes('이미 존재')) {
    if (!confirm(`${slug}.md 가 이미 있습니다. 덮어쓸까요?`)) {
      setStatus('저장 취소됨.', '');
      return false;
    }
    json = await post(true);
  }
  if (!json.success) {
    setStatus(`저장 실패: ${json.error}`, 'err');
    return false;
  }
  loadedSlug = slug;
  if (!silent) setStatus(`${label} → ${json.data.path}`, 'ok');
  await refreshList();
  return true;
}

/** Save as a hidden draft (draft: true). The file is written but never built. */
async function saveDraft(): Promise<void> {
  els.draft.checked = true;
  render();
  await save({ label: '임시 저장됨 · 초안(비공개)' });
}

/** Flip draft off and save, so the next `git push` makes it public. */
async function publish(): Promise<void> {
  if (!els.slug.value.trim()) {
    setStatus('발행하려면 slug이 필요합니다.', 'err');
    return;
  }
  const ok = confirm('이 글을 발행 상태로 저장할까요? (draft 해제)\n실제 공개는 git push 후 적용됩니다.');
  if (!ok) return;
  els.draft.checked = false;
  render();
  await save({ label: '발행 준비됨 · git push 하면 공개' });
}

// ---- wiring -----------------------------------------------------------------
function newPost(): void {
  fill({ title: '', description: '', pubDate: todayISO(), tags: [], draft: false }, '', '');
  loadedSlug = '';
  els.loadSelect.value = '';
  setStatus('새 글', '');
  els.title.focus();
}

els.loadSelect.addEventListener('change', () => loadPost(els.loadSelect.value));
$<HTMLButtonElement>('newBtn').addEventListener('click', newPost);
$<HTMLButtonElement>('saveBtn').addEventListener('click', () => save());
$<HTMLButtonElement>('draftBtn').addEventListener('click', saveDraft);
$<HTMLButtonElement>('publishBtn').addEventListener('click', publish);
$<HTMLButtonElement>('slugBtn').addEventListener('click', () => {
  els.slug.value = slugify(els.title.value);
  render();
  if (!els.slug.value) setStatus('한글 제목은 slug을 직접 입력하세요.', 'err');
});
$<HTMLButtonElement>('previewBtn').addEventListener('click', async () => {
  const slug = els.slug.value.trim();
  if (!slug) {
    setStatus('미리보기하려면 slug이 필요합니다.', 'err');
    return;
  }
  const saved = await save({ silent: true });
  if (saved) window.open(`/posts/${slug}`, '_blank');
});

for (const el of [
  els.title,
  els.slug,
  els.description,
  els.pubDate,
  els.draft,
  els.tags,
  els.series,
  els.body,
]) {
  el.addEventListener('input', render);
}

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    save();
  }
});

// ---- boot -------------------------------------------------------------------
function boot(): void {
  els.pubDate.value = todayISO();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const { meta, slug, body } = JSON.parse(saved);
      if (meta?.title || body) {
        fill(meta, slug ?? '', body ?? '');
        setStatus('자동 저장된 초안을 복구했습니다. (새 글로 비울 수 있어요)', '');
      }
    } catch {
      /* ignore corrupt autosave */
    }
  }
  render();
  refreshList();
}

boot();
