import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://iamhardyha.github.io',
  output: 'static',
  integrations: [mdx(), sitemap(), pagefind()],
  markdown: {
    shikiConfig: { theme: 'github-light', wrap: true },
  },
});
