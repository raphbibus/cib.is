# Testing Strategy

How we test cib.is. The `implement-epic` and `verify-epic` skills follow this document.

## Layers

| Layer | Tool | Where | When it runs |
| :---- | :--- | :---- | :----------- |
| Unit / integration | per the epic's tech spec (Astro default: **Vitest**) | next to source / `tests/` | **per task** during implementation (lightweight) + in full QA |
| End-to-end (e2e) | **Playwright Test** (`@playwright/test`) | `e2e/<epic-slug>/*.spec.ts` | full epic QA only |
| Agentic click-through | **Playwright MCP** (`browser_*` tools) | driven by `verify-epic` | full epic QA only |

- **Written e2e tests** use Playwright Test and run automatically via `npx playwright test`.
- **Click-through** is an interactive pass the agent performs with the Playwright MCP to confirm the feature actually works in a real browser, beyond the scripted specs.

## Commands

```bash
npm test                 # unit/integration (fast) — run during task implementation
npx playwright test      # full e2e suite (uses playwright.config.ts)
npx playwright test e2e/<epic-slug>   # one epic's e2e specs
```

`playwright.config.ts` boots the Astro preview server (`npm run preview`, port 4321) automatically, so e2e runs need no manual server.

## Lightweight vs. full QA

- **During implementation** (`implement-epic`, per task): run only the fast unit/integration tests for the task in hand. Do **not** run the full e2e suite or click-through on every task — it's slow and redundant.
- **At the end** (`implement-epic` → `verify-epic`): run the whole pyramid — unit/integration + e2e + Playwright click-through — as one QA gate, then report AC coverage.

## Screenshots

`verify-epic` only captures screenshots when invoked with `--screenshots`.

- Location: **`e2e/screenshots/<epic-slug>/`**, named `NN-step-description.png` (zero-padded order).
- These are intentional QA evidence and **are committed** (tracked in git). Playwright's own failure screenshots/traces go to `e2e/.test-results/` and are git-ignored.

## One-time setup (Epic 1)

The Astro app and test tooling are installed during Epic 1 implementation:

```bash
npm install -D @playwright/test vitest
npx playwright install chromium
```

`playwright.config.ts`, `e2e/`, and `e2e/screenshots/` already exist in the repo as the integration scaffold.
