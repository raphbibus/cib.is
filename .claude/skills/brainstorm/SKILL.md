---
name: brainstorm
description: Iteratively build an epic PRD through a file-based Q&A loop. Creates the PRD if it doesn't exist, reconciles answered questions into concrete requirements and acceptance criteria, and appends new option-based questions until confidence reaches 90%. Takes an epic name as the argument.
argument-hint: [epic-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Bash(mkdir *)
---

# Brainstorm an Epic PRD

Drive an epic from a vague idea to an implementation-ready PRD through repeated runs.
Each run **reconciles** the answers the user has marked, then **asks more** until the PRD
is confident enough to build from. The whole question/answer exchange happens *in the PRD
file* via Markdown checkboxes — never through interactive prompts.

**Epic name = `$ARGUMENTS`** (the full text after the command; may contain spaces).
If it is empty, stop and ask the user to run `/brainstorm <epic-name>`.

## The one rule that must never break

> **Never select an option yourself.** You write options as empty checkboxes `[ ]` and mark
> exactly one as `**(recommended)**`. Only the user converts `[ ]` → `[x]`. You must not tick,
> untick, reorder, or rewrite the user's checkboxes during reconciliation.

## Files & conventions

- Slugify the epic name: lowercase, spaces and `&`/`/` → `-`, strip other punctuation, collapse repeats. (e.g. `Offers & Contact Funnel` → `offers-contact-funnel`.)
- PRD path: **`specs/<slug>/prd.md`**. Create the directory if needed (`mkdir -p`).
- Roadmap context (if present): **`specs/roadmap.md`** — read it to ground the epic's context and pull any decisions already locked there.

## Procedure

### Step 0 — Locate
Resolve the slug and PRD path. Glob `specs/<slug>/prd.md`.

### Step 1 — If the PRD does NOT exist: create it
1. Read `specs/roadmap.md` if present; find the matching epic's goal/scope to seed **Context**.
2. Write `specs/<slug>/prd.md` from the **PRD template** below, filling Context from the roadmap (or a short stub if no roadmap match).
3. Leave Requirements / Acceptance Criteria / Resolved Decisions mostly empty.
4. Generate the **first batch of Open Questions** (see "Writing questions"): target the highest-impact unknowns first — scope boundaries, primary user/flow, must-have vs out-of-scope, key technical choices.
5. Set the confidence score (it will be low, typically 20–40%).
6. Report to the user (see Step 4).

### Step 2 — If the PRD exists: reconcile, then extend
1. Read the whole PRD.
2. **Reconcile every answered Open Question.** A question is *answered* when exactly one of its options is `[x]`, or its `Other:` line has user text.
   - Translate the chosen answer into one or more **concrete, testable** entries: a Requirement (`R#`) and/or an Acceptance Criterion (`AC#`). Keep them specific — no "should be nice/fast"; state the observable behavior.
   - Add a row to **Resolved Decisions** linking question → chosen option → the `R#`/`AC#` it produced.
   - Remove that question from **Open Questions** (it now lives in the decision log).
   - If a question has **multiple `[x]`**, treat it as unresolved: leave it in place and add a one-line note `> ⚠ multiple options selected — pick one`. Do not guess.
   - Never alter checkboxes on still-unanswered questions.
3. **Re-estimate confidence** with the rubric below.
4. **If confidence < 90%:** append a new batch of Open Questions covering the largest remaining ambiguities. Prefer 3–6 sharp questions over many shallow ones. Renumber Q-ids so they stay unique across the file.
5. **If confidence ≥ 90%:** set status to `Ready`, add no new questions, and write a brief "Ready to build" note. If any optional/cosmetic questions remain, list them under a `Deferred (non-blocking)` heading instead of blocking.
6. Update the status line (status + confidence + run count). Save.
7. Report to the user (Step 4).

### Step 3 — Confidence rubric (score 0–100%)
Confidence = how completely the PRD can be implemented without a builder having to guess.
Weigh these dimensions; an unresolved question in a dimension caps that dimension low:
- **Scope clarity** — in-scope vs out-of-scope is explicit.
- **Functional completeness** — every primary flow has Requirements.
- **Acceptance testability** — each Requirement maps to a verifiable AC.
- **Technical approach** — key build/stack/data decisions are made (or deferred deliberately).
- **Constraints & edge cases** — limits, error states, non-functional needs (perf, a11y, legal/GDPR, etc.) are addressed.

Report the number and one line on what is still dragging it down.

### Step 4 — Report (short)
Tell the user, concisely:
- What you reconciled this run (e.g. "3 answers → R4–R6, AC3").
- New confidence and the main gap.
- How many Open Questions now await them, and that they should **edit `specs/<slug>/prd.md`**, mark one `[x]` per question (or fill `Other:`), then re-run `/brainstorm <epic-name>`.
- When ≥ 90%: say it's ready to build and point at the Requirements/AC sections.

## Writing questions

For each Open Question:
- One clear decision per question.
- 2–4 concrete options, each an empty checkbox with a short rationale.
- Mark exactly one option `**(recommended)**`, chosen from the epic's context, the roadmap's locked decisions, and good engineering defaults. Briefly say *why* it's recommended.
- Always include an `Other:` write-in line so the user isn't boxed in.
- Keep boxes empty. The recommendation is a label only — it is **not** a selection.

Question block format (copy exactly):

```
### Q<id>: <the decision to make>
- [ ] <Option A> — <one-line rationale>
- [ ] <Option B> — <one-line rationale> **(recommended)** — <why recommended>
- [ ] <Option C> — <one-line rationale>
- [ ] Other: <user writes here>
```

## PRD template (used only when creating a new PRD)

```
# Epic PRD — <Epic Name>

> **Status:** Drafting · **Confidence:** <N>% · **Brainstorm runs:** <count>
> **Source:** [Roadmap](../roadmap.md)

## 1. Context
<Why this epic exists, the outcome it delivers, who it serves. Seeded from the roadmap.>

## 2. Requirements
<Numbered, testable statements. Empty until decisions are reconciled.>
<!-- R1: ... -->

## 3. Acceptance Criteria
<Each maps to one or more Requirements; verifiable in the browser / by test.>
<!-- AC1: ... -->

## 4. Open Questions
> How to answer: change `[ ]` to `[x]` on **one** option per question, or fill its `Other:` line.
> Don't delete a question — it moves to "Resolved Decisions" automatically on the next run.
> The `**(recommended)**` label is a suggestion only; nothing is pre-selected.

### Q1: <first decision>
- [ ] <Option A> — <rationale>
- [ ] <Option B> — <rationale> **(recommended)** — <why>
- [ ] Other: 

## 5. Resolved Decisions
<Decision log. Empty until answers are reconciled.>
<!-- | D# | Question | Chosen | Produced | -->
```

## Notes
- Idempotent: re-running with no new answers should reconcile nothing, keep confidence, and simply restate the open questions.
- Keep the PRD the single source of truth — write decisions into it, don't just summarize in chat.
- Don't touch other epics' PRDs or the roadmap; this skill only reads the roadmap for context.
