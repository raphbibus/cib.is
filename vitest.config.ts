import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Vitest covers pure logic (src/lib/*), token/contrast checks, and build-output
// assertions only. All .astro/DOM behaviour is verified by Playwright e2e (see A9).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
