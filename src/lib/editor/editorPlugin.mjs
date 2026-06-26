import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Dev-only Vite plugin powering the local post editor (`/editor`).
 *
 * `apply: 'serve'` means this plugin is loaded ONLY by `astro dev` — it is
 * never part of `astro build`, so the write endpoints below cannot exist on
 * the deployed GitHub Pages site. That absence (not obscurity) is the security
 * boundary: production has no server and no way to mutate content.
 *
 * Endpoints (all under /__editor, JSON in/out):
 *   GET  /__editor/list           -> { success, data: [{ slug, raw }] }
 *   GET  /__editor/load?slug=...  -> { success, data: { slug, raw } }
 *   POST /__editor/save           -> { success, data: { slug, path } }
 *        body: { slug, content, overwrite? }
 */

const POSTS_SUBDIR = 'src/content/posts';
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BODY_BYTES = 1_000_000; // 1 MB — generous for prose, caps abuse.

export default function editorPlugin() {
  return {
    name: 'local-post-editor',
    apply: 'serve',
    configureServer(server) {
      const postsDir = path.join(server.config.root, POSTS_SUBDIR);

      server.middlewares.use('/__editor', async (req, res) => {
        try {
          const url = new URL(req.url ?? '', 'http://localhost');
          const route = url.pathname; // already stripped of /__editor prefix

          if (req.method === 'GET' && route === '/list') {
            return await handleList(res, postsDir);
          }
          if (req.method === 'GET' && route === '/load') {
            return await handleLoad(res, postsDir, url.searchParams.get('slug'));
          }
          if (req.method === 'POST' && route === '/save') {
            return await handleSave(req, res, postsDir);
          }
          return sendJson(res, 404, { success: false, error: 'Unknown editor route.' });
        } catch (error) {
          // Never leak a stack to the client; log full context server-side.
          console.error('[local-post-editor]', error);
          return sendJson(res, 500, {
            success: false,
            error: error instanceof Error ? error.message : 'Internal editor error.',
          });
        }
      });

      server.config.logger.info('  \x1b[32m➜\x1b[0m  \x1b[1mEditor:\x1b[0m   /editor (dev only)');
    },
  };
}

async function handleList(res, postsDir) {
  const entries = await fs.readdir(postsDir);
  const markdown = entries.filter((name) => name.endsWith('.md') || name.endsWith('.mdx'));
  const data = await Promise.all(
    markdown.map(async (filename) => {
      const raw = await fs.readFile(path.join(postsDir, filename), 'utf8');
      return { slug: filename.replace(/\.(md|mdx)$/, ''), raw };
    }),
  );
  return sendJson(res, 200, { success: true, data });
}

async function handleLoad(res, postsDir, slug) {
  const filePath = safePostPath(postsDir, slug);
  if (!filePath) {
    return sendJson(res, 400, { success: false, error: 'Invalid slug.' });
  }
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return sendJson(res, 200, { success: true, data: { slug, raw } });
  } catch {
    return sendJson(res, 404, { success: false, error: 'Post not found.' });
  }
}

async function handleSave(req, res, postsDir) {
  const body = await readJsonBody(req);
  const { slug, content, overwrite } = body ?? {};

  if (typeof content !== 'string' || !content.trim()) {
    return sendJson(res, 400, { success: false, error: 'Empty content.' });
  }
  const filePath = safePostPath(postsDir, slug);
  if (!filePath) {
    return sendJson(res, 400, {
      success: false,
      error: 'Invalid slug (a-z, 0-9, hyphen only).',
    });
  }

  if (!overwrite) {
    const exists = await fileExists(filePath);
    if (exists) {
      return sendJson(res, 409, {
        success: false,
        error: `이미 존재하는 글입니다: ${slug}.md (덮어쓰려면 overwrite).`,
      });
    }
  }

  await fs.writeFile(filePath, content, 'utf8');
  return sendJson(res, 200, {
    success: true,
    data: { slug, path: `${POSTS_SUBDIR}/${slug}.md` },
  });
}

/**
 * Resolve <postsDir>/<slug>.md and confirm it stays inside postsDir.
 * Returns null on any invalid/unsafe slug — the SLUG_RE check rejects '/',
 * '..', and non-ascii, and the prefix assertion is belt-and-suspenders.
 */
function safePostPath(postsDir, slug) {
  if (typeof slug !== 'string' || !SLUG_RE.test(slug)) return null;
  const resolved = path.resolve(postsDir, `${slug}.md`);
  const root = path.resolve(postsDir) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error('Malformed JSON body.'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}
