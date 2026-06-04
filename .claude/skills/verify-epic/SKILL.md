---
name: verify-epic
description: Run full QA for an epic — execute its automated tests (unit/integration/functional/e2e) and perform a Playwright browser click-through of the feature to confirm it works. Pass --screenshots to save click-through screenshots into e2e/screenshots/<epic-slug>/. Takes an epic name as the argument. Invoked at the end of implement-epic, or directly.
argument-hint: [epic-name] [--screenshots]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_snapshot, mcp__plugin_playwright_playwright__browser_take_screenshot, mcp__plugin_playwright_playwright__browser_click, mcp__plugin_playwright_playwright__browser_type, mcp__plugin_playwright_playwright__browser_fill_form, mcp__plugin_playwright_playwright__browser_wait_for, mcp__plugin_playwright_playwright__browser_console_messages, mcp__plugin_playwright_playwright__browser_resize, mcp__plugin_playwright_playwright__browser_navigate_back, mcp__plugin_playwright_playwright__browser_close
---

# Verify an Epic (Full QA)

Run the complete QA gate for one epic: every relevant automated test **plus** a real-browser
Playwright click-through of the feature. Report acceptance-criteria coverage.

**Argument = `$ARGUMENTS`.** It contains the **epic name** and an optional **`--screenshots`** flag.
- Detect `--screenshots` anywhere in the argument; if present, set screenshots ON and remove the token.
- The remaining trimmed text is the epic name. If it's empty, stop and ask the user to run `/verify-epic <epic-name>`.

Reference: **docs/testing.md** (testing strategy), **playwright.config.ts** (e2e runner).

## Files & conventions

- Slugify the epic name: lowercase, spaces and `&`/`/` → `-`, strip other punctuation, collapse repeats.
- **Spec:** `specs/<slug>/<slug>-spec.md` (for ACs + flows). **PRD:** `specs/<slug>/prd.md`.
- **E2E specs:** `e2e/<slug>/*.spec.ts`. **Screenshots:** `e2e/screenshots/<slug>/`.

## Guard

If `specs/<slug>/<slug>-spec.md` is missing, stop and tell the user to run `/write-spec <epic-name>`
first (there's nothing defining what to verify).

## Procedure

### 1. Scope the QA
- Read the spec + PRD. Extract every Acceptance Criterion (`AC#`) and the primary user flows / e2e scenarios for this epic.
- Build the click-through plan: the concrete browser steps that exercise each browser-verifiable AC.

### 2. Run automated tests
- Ensure tooling is installed (per docs/testing.md); if `@playwright/test` or browsers are missing, install them (`npm install -D @playwright/test`, `npx playwright install chromium`).
- **Unit/integration/functional:** run the project's test command (e.g. `npm test` / `npx vitest run`).
- **E2E:** run `npx playwright test e2e/<slug>` (fall back to the full `npx playwright test` if this epic's specs aren't isolated to that folder).
- Capture real pass/fail counts and the failing test names. Never report a pass you didn't run.

### 3. Bring the app up for the click-through
- `playwright.config.ts` already starts the preview server for `playwright test`. For the MCP click-through, ensure a server is reachable at the base URL (default `http://localhost:4321`): if none is running, start one in the background (`npm run build` then `npm run preview`, or reuse a running `npm run dev`).
- Confirm the URL responds before driving the browser.

### 4. Playwright click-through (MCP)
Walk the feature as a user, using the Playwright MCP `browser_*` tools:
- `browser_navigate` to the relevant pages.
- `browser_snapshot` to assert key elements/text/state (snapshots are the assertion mechanism — better than screenshots).
- `browser_click` / `browser_type` / `browser_fill_form` to exercise each primary flow end-to-end.
- `browser_console_messages` to catch JS errors.
- Record, per AC, whether the click-through confirms it.

**If `--screenshots` is ON:**
- Ensure `e2e/screenshots/<slug>/` exists (`mkdir -p`).
- At each key step, call `browser_take_screenshot` with `filename` `e2e/screenshots/<slug>/NN-<step>.png` (zero-padded `NN`; use `fullPage: true` for whole-page shots).
- If the MCP wrote the file to its own output directory instead of the repo path, move it into `e2e/screenshots/<slug>/` with Bash. End with the files actually sitting in `e2e/screenshots/<slug>/`.

### 5. Tear down
- `browser_close`; stop any background server you started.

### 6. QA report (always print)

```
# QA Report — <Epic Name>

**Spec:** specs/<slug>/<slug>-spec.md
**Automated tests:** unit/integration <Xu/Yu> · e2e <Xe/Ye>  (commands run: ...)
**Click-through:** <pages/flows walked>  · console errors: <none / list>
**Screenshots:** <e2e/screenshots/<slug>/ — N files | not requested>

## Acceptance Criteria coverage
| AC  | Status   | Confirmed by            | Notes |
| :-- | :------- | :---------------------- | :---- |
| AC1 | done     | e2e spec + click-through |       |
| AC2 | partly   | unit only               | not exercised in browser |
| AC3 | not done | —                       | <failure / blocker> |

## Failures & blockers
- <failing test or broken flow, with the evidence>
```

Status: **done** = automated test green *and* confirmed in the browser; **partly** = covered in one
layer but not fully verified; **not done** = failing, missing, or blocked (state why).

## Notes
- This is the heavyweight gate — full suite + e2e + click-through. Lightweight per-task testing belongs in `implement-epic`.
- Don't commit/push unless asked. Committed screenshots in `e2e/screenshots/` are intentional QA evidence.
- Stay within this epic's scope.
