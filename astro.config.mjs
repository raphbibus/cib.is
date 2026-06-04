// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static, zero-JS-by-default build for Netlify (see docs/architecture.md).
// Tailwind 4 is wired purely through the Vite plugin — no tailwind.config.js;
// brand tokens live in src/styles/global.css under @theme.
export default defineConfig({
  site: 'https://ralphcibis.netlify.app',
  output: 'static',
  // Inline the (small) page CSS to remove the render-blocking stylesheet
  // request and protect LCP — see docs/coding-guidelines.md perf budget.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
