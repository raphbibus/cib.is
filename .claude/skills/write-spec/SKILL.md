---
name: write-spec
description: Turn an epic's PRD into a detailed, TDD-oriented technical specification. Reads specs/<slug>/prd.md (stops if missing), covers every requirement and acceptance criterion, highlights key architecture decisions, and appends high-impact tech decisions as option-based questions until confidence reaches 90% and all high-impact decisions are resolved. Takes an epic name as the argument.
argument-hint: [epic-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash(mkdir *)
---

# Write a Technical Spec from an Epic PRD

Convert a PRD into an implementation-ready tech spec across repeated runs. Each run
**reconciles** the tech decisions the user has marked, then **asks more** until the spec is
confident enough to build from and every high-impact decision is settled. The question/answer
exchange happens *in the spec file* via Markdown checkboxes — never through interactive prompts.

**Epic name = `$ARGUMENTS`** (full text after the command; may contain spaces).
If it is empty, stop and ask the user to run `/write-spec <epic-name>`.

## The one rule that must never break

> **Never select an option yourself.** You write options as empty checkboxes `[ ]` and mark
> exactly one as `**(recommended)**`. Only the user converts `[ ]` → `[x]`. You must not tick,
> untick, reorder, or rewrite the user's checkboxes during reconciliation.

## Files & conventions

- Slugify the epic name: lowercase, spaces and `&`/`/` → `-`, strip other punctuation, collapse repeats.
- **Input PRD:** `specs/<slug>/prd.md` — required.
- **Output spec:** `specs/<slug>/<slug>-spec.md` (the `-spec.md` suffix).
- **Project guidelines (if present):** `docs/architecture.md`, `docs/coding-guidelines.md` — read for context and align the spec with them.

## Procedure

### Step 0 — Locate & guard
1. Resolve the slug, PRD path, and spec path.
2. **If `specs/<slug>/prd.md` does not exist: STOP.** Tell the user there is no PRD and to run `/brainstorm <epic-name>` first. Do nothing else.
3. Read the PRD. If it still has unresolved **Open Questions** or its confidence is `< 90%`, warn the user that the spec may be built on shifting ground — but continue.
4. Read `docs/architecture.md` and `docs/coding-guidelines.md` if they exist.

### Step 1 — If the spec does NOT exist: create it
1. Extract **every** Requirement (`R#`) and Acceptance Criterion (`AC#`) from the PRD.
2. Write `specs/<slug>/<slug>-spec.md` from the **spec template** below.
3. Design the technical approach so that **every R# and AC# is covered** — verify with the traceability table (each R/AC maps to at least one implementation task).
4. **Highlight key architecture decisions** in their own section (what was chosen and why).
5. Plan implementation **TDD-first**: every task is written test-first (failing test → implement → refactor), references the R#/AC# it satisfies, and is ordered so tests precede code.
6. Identify **high-impact tech decisions** (hard to reverse, broad blast radius, or cost/performance/security-sensitive) and write them as **Open Tech Decisions** (option-based, one `**(recommended)**` each).
7. Set the confidence score (rubric below).
8. Report (Step 4).

### Step 2 — If the spec exists: reconcile, then extend
1. Read the whole spec.
2. **Reconcile every answered Open Tech Decision.** A decision is *answered* when exactly one option is `[x]`, or its `Other:` line has user text.
   - Fold the choice into the spec: update the **Architecture Decisions**, component/data design, and **TDD task plan** to reflect it.
   - Add a row to **Resolved Tech Decisions** (decision → chosen option → what it changed).
   - Remove that question from Open Tech Decisions.
   - Multiple `[x]` on one question → leave it unresolved, add `> ⚠ multiple options selected — pick one`. Don't guess.
   - Never alter checkboxes on still-unanswered questions.
3. Re-check **R#/AC# coverage** — add tasks for anything still uncovered (e.g. new PRD items since last run).
4. **Re-estimate confidence** (rubric below).
5. **If confidence < 90% OR any high-impact decision is still open:** append a new batch of Open Tech Decisions / clarifying questions for the largest gaps (3–6 sharp ones).
6. **If confidence ≥ 90% AND no high-impact decision remains open:** set status to `Ready to build`, add no new blocking questions (list any minor ones under `Deferred (non-blocking)`).
7. Update the status line and save.
8. Report (Step 4).

### Step 3 — Confidence rubric (0–100%)
Confidence = how completely a developer could implement this spec without guessing.
- **Requirement coverage** — every R#/AC# maps to a task in the traceability table.
- **Architecture clarity** — key decisions are made and justified.
- **TDD plan completeness** — tasks are test-first, ordered, and sized.
- **Interface & data design** — components, contracts, and data shapes are specified.
- **Risks & non-functional** — perf, a11y, security, GDPR/legal, error/edge cases addressed.
- **High-impact decisions resolved** — *hard gate:* if any remain open, confidence is capped below 90% regardless of the rest.

Report the number plus one line on the main remaining gap.

### Step 4 — Report (short)
Tell the user, concisely:
- What you reconciled this run and how the architecture/tasks changed.
- New confidence + main gap; how many high-impact decisions are still open.
- That they should **edit `specs/<slug>/<slug>-spec.md`**, mark one `[x]` per Open Tech Decision (or fill `Other:`), then re-run `/write-spec <epic-name>`.
- When done (≥ 90% and no open high-impact decisions): say it's ready to build and point at the TDD task plan.

## Writing tech-decision questions

- One decision per question; 2–4 concrete options, each an empty checkbox with a short trade-off note.
- Mark exactly one option `**(recommended)**`, chosen from the PRD, `docs/` guidelines, roadmap constraints, and sound engineering defaults — say briefly *why*.
- Always include an `Other:` write-in line.
- Boxes stay empty. The recommendation is a label, not a selection.

Question block format (copy exactly):

```
### TD<id>: <the technical decision> _(high-impact)_
- [ ] <Option A> — <trade-off>
- [ ] <Option B> — <trade-off> **(recommended)** — <why>
- [ ] <Option C> — <trade-off>
- [ ] Other: <user writes here>
```

Omit `_(high-impact)_` for routine decisions; keep it for ones that gate readiness.

## Spec template (used only when creating a new spec)

```
# Tech Spec — <Epic Name>

> **Status:** Drafting · **Confidence:** <N>% · **Spec runs:** <count>
> **Source PRD:** [prd.md](prd.md)
> **Guidelines:** docs/architecture.md, docs/coding-guidelines.md

## 1. Overview
<What we're building, technically, and how it satisfies the PRD's intent.>

## 2. Key Architecture Decisions
<Highlight the decisions that shape the implementation. For each: choice + rationale + alternatives rejected.>

## 3. Design
### 3.1 Components / Modules
### 3.2 Data model & contracts
### 3.3 External integrations / config

## 4. Requirement → Implementation Traceability
| Item | Covered by tasks |
| :--- | :--- |
<!-- R1 | T1, T3 -->
<!-- AC1 | T3 -->

## 5. TDD Implementation Plan
<Each task is test-first. Order so tests precede implementation.>
<!--
### T1 — <task>  (satisfies R1, AC1)
1. Write failing test: <what it asserts>
2. Implement: <minimal code to pass>
3. Refactor: <cleanup>
-->

## 6. Testing Strategy
<Test layers (unit/integration/e2e/browser), tools, and how ACs are verified.>

## 7. Risks & Non-functional
<Performance, accessibility, security, GDPR/legal, edge cases, rollback.>

## 8. Open Tech Decisions
> How to answer: change `[ ]` to `[x]` on **one** option per decision, or fill its `Other:` line.
> Don't delete a decision — it moves to "Resolved Tech Decisions" on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### TD1: <first decision> _(high-impact)_
- [ ] <Option A> — <trade-off>
- [ ] <Option B> — <trade-off> **(recommended)** — <why>
- [ ] Other: 

## 9. Resolved Tech Decisions
<Decision log. Empty until reconciled.>
<!-- | TD# | Chosen | Changed -->
```

## Notes
- Idempotent: a run with no new answers reconciles nothing, keeps confidence, and restates open decisions.
- The spec is the single source of truth for implementation — write decisions into it, don't just summarize in chat.
- Stay within this epic: read the PRD, roadmap, and `docs/` for context; don't edit them.
