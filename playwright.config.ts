import { defineConfig, devices } from '@playwright/test';

/**
 * E2E configuration for cib.is.
 *
 * - Specs live in `e2e/`, grouped per epic: `e2e/<epic-slug>/*.spec.ts`.
 * - Intentional QA screenshots (`/verify-epic <epic> --screenshots`) are written to
 *   `e2e/screenshots/<epic-slug>/`. Failure screenshots/traces go to `e2e/.test-results/`.
 * - Runs against the Astro preview server (default port 4321). Override with PLAYWRIGHT_BASE_URL.
 *
 * See docs/testing.md for the full testing strategy.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
