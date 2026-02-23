// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from './src/site.config';
import { remarkReadingTime } from './src/utils/reading-time';

const DIST_PAGEFIND = path.resolve('dist/pagefind');

const MIME_TYPES = {
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.pagefind': 'application/octet-stream',
  '.pf_meta': 'application/octet-stream',
  '.pf_fragment': 'application/octet-stream',
  '.pf_index': 'application/octet-stream',
};

function pagefindDevPlugin() {
  let warned = false;

  return {
    name: 'pagefind-dev',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/pagefind/')) return next();

        // Strip query params (pagefind appends ?ts=... for cache-busting)
        const urlPath = req.url.split('?')[0];
        const filePath = path.join(DIST_PAGEFIND, urlPath.replace('/pagefind/', ''));

        if (!fs.existsSync(filePath)) return next();

        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        fs.createReadStream(filePath).pipe(res);
      });
    },

    resolveId(id) {
      if (id === '/pagefind/pagefind.js') return id;
    },

    load(id) {
      if (id === '/pagefind/pagefind.js') {
        const realFile = path.join(DIST_PAGEFIND, 'pagefind.js');
        if (fs.existsSync(realFile)) return fs.readFileSync(realFile, 'utf-8');
        if (!warned) {
          console.warn(
            '\x1b[33m[pagefind]\x1b[0m No search index found. Run \x1b[1mpnpm build\x1b[0m once to generate it.'
          );
          warned = true;
        }
        return 'export async function search() { return { results: [] }; }; export function init() {}';
      }
    },
  };
}

export default defineConfig({
  site: SITE.url,
  output: 'static',
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [react(), mdx(), sitemap()],
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    plugins: [tailwindcss(), pagefindDevPlugin()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
