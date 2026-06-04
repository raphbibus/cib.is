---
name: implement-epic
description: Implement an epic end-to-end from its tech spec using a test-driven workflow. Reads specs/<slug>/<slug>-spec.md (stops if missing), writes tests from the spec, implements task-by-task with lightweight tests, then runs full epic QA via verify-epic (whole suite + e2e + browser click-through) and reports acceptance-criteria coverage as done/partly/not-done. Takes an epic name as the argument.
argument-hint: [epic-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Implement an Epic (TDD)

Implement an epic until **all of its requirements are implemented and confirmed by passing tests**.
Drive the work test-first and report acceptance-criteria coverage at the end.

**Epic name = `$ARGUMENTS`** (full text after the command; may contain spaces).
If it is empty, stop and ask the user to run `/implement-epic <epic-name>`.

## Files & conventions

- Slugify the epic name: lowercase, spaces and `&`/`/` → `-`, strip other punctuation, collapse repeats. (An already-slug input like `epic-1` stays `epic-1`.)
- **Input spec:** `specs/<slug>/<slug>-spec.md` — required.
- **Input PRD (for AC list):** `specs/<slug>/prd.md` — read if present.
- **Guidelines:** `docs/architecture.md`, `docs/coding-guidelines.md`, `docs/testing.md` — follow if present.
- **E2E specs:** `e2e/<slug>/*.spec.ts` (Playwright Test). Final QA is delegated to the **`verify-epic`** skill.

## Guard

If `specs/<slug>/<slug>-spec.md` does **not** exist: **STOP.** Tell the user there is no tech spec
and to run `/write-spec <epic-name>` first. Do nothing else.

Before implementing, confirm the spec's **Status** is `Ready to build` and it has no open
high-impact decisions. If it is still drafting / has open decisions, warn the user and ask whether
to proceed anyway; don't silently build against an unsettled spec.

## Workflow

Work through the whole epic, not a single task. Repeat steps 2–5 **per task group** with
**lightweight** testing, then run the heavyweight full-epic QA once in step 6.

### 1. Analyze the specification
- Read the spec and PRD. Extract every Requirement (`R#`), Acceptance Criterion (`AC#`), and the spec's **TDD task plan** (`T#`) and **traceability table**.
- Detect the project's test setup (test runner, config, existing tests, how `npm`/the toolchain runs them). If none exists, set up the minimal tooling the spec's **Testing Strategy** / `docs/testing.md` calls for before writing tests.
- Build a short internal checklist mapping each AC → the test(s) that will prove it.

### 2. Build tests according to the spec (red)
- For each task/AC, write the failing test first.
- **Unit/integration/functional** tests are the per-task driver — keep them fast.
- For browser-verifiable ACs, **author the Playwright e2e specs** under `e2e/<slug>/` now, but **do not run the full e2e suite per task** — that's deferred to step 6.
- Tests must assert the **observable behavior** named in the AC, not implementation details.
- Run the task's unit/integration tests to confirm they fail for the right reason (red).

### 3. Implement the requirements (green)
- Write the minimal code to satisfy the failing tests, following `docs/coding-guidelines.md` and matching existing patterns in the codebase.
- Implement in the spec's task order so dependencies land first.

### 4. Verify the task (lightweight)
- Run **only** the fast unit/integration/functional tests relevant to the current task. Do **not** run the full e2e suite, browser click-through, or a production build on every task — those happen once in step 6.
- Capture real output — never claim a pass you didn't run.

### 5. Fix until the task's tests pass
- Loop: diagnose failures, fix code (or correct a test that misread the AC — note it if so), re-run the lightweight tests.
- If a failure is environmental or a true blocker (missing dependency, ambiguous AC, external service), stop looping on that item, leave it failing, and record it for the report rather than forcing a false green.
- Move to the next task. When all task groups are implemented with green lightweight tests, go to step 6.

### 6. Full epic QA (delegate to verify-epic)
- Invoke the **`verify-epic`** skill for this epic to run the heavyweight gate: full unit/integration/e2e suite **plus** the Playwright browser click-through that confirms the feature works for real.
  - Run it via the Skill tool: `verify-epic <epic-name>` (add `--screenshots` if the user asked for screenshots).
- Use `verify-epic`'s QA report as the **authoritative** acceptance-criteria coverage.
- If it surfaces failures, return to steps 3–5 to fix them, then re-run `verify-epic`. Repeat until QA is green or only recorded blockers remain.

### 7. Finish & report
When QA passes (or remaining failures are recorded blockers), stop and produce the report below, folding in the `verify-epic` results.

## Final report (always print this)

```
# Implementation Report — <Epic Name>

**Spec:** specs/<slug>/<slug>-spec.md
**QA:** via verify-epic — unit/integration <…> · e2e <…> · click-through <pass/fail>

## Acceptance Criteria coverage  (from verify-epic)
| AC  | Status        | Evidence (test / file) | Notes |
| :-- | :------------ | :--------------------- | :---- |
| AC1 | done          | <test name>            |       |
| AC2 | partly        | <test name>            | <what's missing> |
| AC3 | not done      | —                      | <why / blocker> |

## Requirements coverage
- R1 — done (T1, T2) · R2 — partly · ...

## Remaining work / blockers
- <anything not done, with the reason>

## Changed files
- <key files added/modified>
```

Status definitions:
- **done** — implemented and a passing test confirms the AC.
- **partly** — some of the AC works / test partially covers it; state the gap.
- **not done** — not implemented or blocked; state why.

## Notes
- Stay within this epic's scope as defined by the spec; flag out-of-scope needs rather than expanding silently.
- Do **not** commit or push unless the user asks — leave changes in the working tree.
- For a large epic, you may delegate independent task groups to subagents, but keep the test-first order and reconcile all results into the single report.
- Report honestly: if tests fail or a step was skipped, say so with the evidence.
