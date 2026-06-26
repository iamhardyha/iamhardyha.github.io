import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import editorPlugin from './src/lib/editor/editorPlugin.mjs';

export default defineConfig({
  site: 'https://iamhardyha.github.io',
  output: 'static',
  // The editor endpoints live in an `apply: 'serve'` Vite plugin, so they exist
  // only under `astro dev` and never in the production build.
  vite: { plugins: [editorPlugin()] },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !page.includes('/editor') }),
    pagefind(),
  ],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: true,
    },
  },
});
