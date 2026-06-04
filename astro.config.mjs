// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Static, zero-JS-by-default build for Netlify (see docs/architecture.md).
// Tailwind 4 is wired purely through the Vite plugin — no tailwind.config.js;
// brand tokens live in src/styles/global.css under @theme.
export default defineConfig({
  site: 'https://www.cib.is',
  output: 'static',
  // Inline the (small) page CSS to remove the render-blocking stylesheet
  // request and protect LCP — see docs/coding-guidelines.md perf budget.
  build: {
    inlineStylesheets: 'always',
  },
  // Sitemap (R9/TD4): generate /sitemap-index.xml. Exclude /danke — the no-JS
  // form thank-you page is a flow endpoint, not a crawlable destination.
  integrations: [
    sitemap({
      filter: (page) => !/\/danke\/?$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
