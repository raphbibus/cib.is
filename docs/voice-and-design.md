# Voice & Design Guide — cib.is

> The **living artifact** read at the start of every future refinement, alongside
> [architecture.md](architecture.md) and [coding-guidelines.md](coding-guidelines.md).
> Drafted by Claude from the corpus (19 blog posts + `landing.ts` + `offers.ts`) and the roadmap;
> **edited and approved by Ralph** (sign-off recorded in
> [design-voice-audit.md](../specs/coherence-pass-design-voice/design-voice-audit.md) → "Sign-off").
>
> The baseline in one line: **more punk, more Mittelstand, more Ralph.** Three dials held in
> balance — edgy/punk attitude, the trust and register German Mittelstand decision-makers expect,
> and Ralph's authentic personal voice.

---

## 1. Voice principles (the dials)

Five named principles. When a sentence is in doubt, run it past these:

1. **Punk als Köder, Glaubwürdigkeit als Abschluss.** Open with the edgy hook ("Schluss mit
   Org-Theater"), then immediately back it with CV-traceable proof. Attitude earns attention;
   evidence closes. Never attitude without the receipts.
2. **Kein Bullshit, kein Upselling.** No buzzword-bingo, no consultant-deck filler, no manufactured
   urgency, no "Pakete/Abos". One honest product (the Freitag), one honest price. If a sentence
   could appear on any agency's site, cut it.
3. **Konkret vor abstrakt.** Prefer the concrete noun and the named result over the abstract
   process word. "Eine Abteilung von 25 auf 100 aufgebaut" beats "Skalierungserfahrung". Claims
   trace to `specs/2026-cv-de-ralph.pdf`.
4. **Ingenieur, der mit Menschen baut.** The throughline metaphor: organisations are systems you
   observe, understand, rebuild, measure — "die teuersten Bugs stecken in der Organisation". Keep
   the engineering register, but it's always *people* being built.
5. **Kurz, rhythmisch, mit Kante.** Short declarative sentences. Fragments for punch. Em-dashes for
   the turn. Band/merch/stage metaphors (Backstage Pass, Tracklist, Live on Stage, Encore) are the
   sanctioned flavour — used sparingly, never forced.

## 2. Register rule (Sie / first person)

The one hard rule, split by surface:

- **Funnel & chrome → formal *Sie*.** Every conversion/marketing surface — landing, offers, the
  contact/booking form (labels, validation, success, error), 404, and footer chrome — addresses the
  reader as formal **Sie**. **No `du`/`dein`/`dich`/`dir` reader-address forms, and no informal
  plural `euch`/`euer`/`eure`/`ihr`** for the reader. Legal pages (Impressum/Datenschutz) follow the
  same Sie rule.
- **Blog → first person, Ralph's voice.** The blog (post bodies **and** the post CTA, `blog-cta.ts`)
  keeps Ralph's authentic **first-person / du** voice and is **exempt** from the Sie rule. The
  migrated post bodies in `src/content/blog/*` are the archive — left exactly as authored.
- **Ralph himself is always "ich".** First person for Ralph is constant on every surface; only the
  *reader-address* switches between Sie (funnel) and du (blog).

## 3. Terminology glossary (canonical wording)

Use these exact forms; don't paraphrase the entity names.

| Concept | Canonical term | Notes |
| :--- | :--- | :--- |
| Ralph's identity | **Organisationsingenieur**, **Agile Punk**, **Teilzeit-Berater** | The hero kicker triad. "Organisations-Punk" is the footer variant. |
| Posture | **Agile Punk / Punk als Haltung** | Attitude, not a job title. |
| The product | **Der Freitag** | One repeatable day, capital-D "Der Freitag". Not "Workshop", not "Session". |
| Price | **490 € · netto = brutto** | Festpreis pro Freitag. **Gemäß §19 UStG wird keine Umsatzsteuer berechnet** (Kleinunternehmerregelung). Never "zzgl. USt/MwSt". |
| Travel | **Reisekosten transparent on top** | ~2 h Anfahrt ab Bamberg Hauptbahnhof ⇒ Hotel + 30 ct/km. |
| Delivery | **vor Ort** (Standard) · **remote** auf Anfrage | Keep both words. |
| Reply promise | **persönlich, in der Regel binnen 2 Werktage** | No automation language. |
| Method stance | **"Ich kenne die Verfahren, bete sie aber nicht an."** | Scrum/Kanban/OKR named, never worshipped. |
| The anti-pattern | **Org-Theater · Berater-Theater · Buzzword-Bingo** | The named enemies. |
| Engineering metaphor | **beobachten, verstehen, umbauen, messen** | "Die teuersten Bugs stecken in der Organisation." |
| Company | **Thomann / Thomann.io** | Exact casing. |

## 4. Do / Don't examples

| Don't (so nicht) | Do (so ja) | Why |
| :--- | :--- | :--- |
| "Wir bieten maßgeschneiderte Lösungen für Ihren Erfolg." | "Ich schaue zuerst, was bei Ihnen wirklich klemmt, und baue dann mit Ihnen die Lösung." | Principle 2 — kill agency filler; be concrete and personal. |
| "Schreib mir, woran es bei euch hakt." (funnel) | "Schreiben Sie mir, woran es bei Ihnen hakt." | Register rule — Sie on the funnel. |
| "Nutzen Sie unser bewährtes agiles Framework." | "Scrum, Kanban, OKR — ich kenne sie aus der Praxis, bete sie aber nicht an." | Principle 1 + glossary — proof + attitude, no worship. |
| "Skalierungs- und Transformationsexpertise." | "Eine Abteilung von 25 auf 100 Menschen aufgebaut." | Principle 3 — named result over abstract noun. |
| "Jetzt unverbindliches Beratungspaket sichern!" | "Ein Freitag bei Ihnen. 490 €, netto = brutto." | Principle 2 — one honest product + price, no upsell/urgency. |
| Blog rewritten to Sie. | Blog stays first person/du — "Wenn dich das anspricht, lass uns reden." | Register rule — blog is exempt. |

## 5. Design reference (tokens + shared components)

The durable design half of the guide. Full rationale in
[coding-guidelines.md → Visual system](coding-guidelines.md).

**Identity:** dark-first **band-merch / tour-poster** aesthetic. Sharpen *within* it — no new
identity motifs (R9/AD1).

**Tokens (`src/styles/global.css` `@theme`)** — the single source of truth; never hard-code:

| Token | Use |
| :--- | :--- |
| `--color-ink` `--color-paper` `--color-surface` `--color-line` `--color-muted` `--color-ghost` | Stage / text / panels / hairlines / secondary / dim numerals |
| `--color-neon-pink` `--color-neon-green` `--color-neon-cyan` `--gradient-accent` | Neon accents (the pink→green gradient) |
| `--font-display` (Anton) `--font-mono` (IBM Plex Mono) `--font-body` (Inter) | Poster heads / labels-passes-meta / body |
| `--spacing-section` `--border-hair|raw|slab` `--radius-none` | Rhythm + brutalist edges |

**Contrast contract (strict):** neon is **text only on ink**, a **fill with ink text on top**, a
**focus ring**, or **decorative graphics** — **never neon text on a light fill**. New text pairings
are checked in `tests/global-css.test.ts`.

**Shared components (`src/components/`)** — compose from these; never inline a one-off for what a
primitive covers:

| Primitive | Owns |
| :--- | :--- |
| `Button` | The button CTA. **`variant="primary"`** is the unified CTA treatment (gradient fill + green hard-shadow hover) for every button-styled CTA **outside** header/footer. `solid`/`outline` remain for chrome/secondary. |
| `Section` | Anchor `id`, `scroll-mt`, kicker pill + poster heading + optional `accent` bar. |
| `Card` | Tracklist row (CV stations) / generic card. |
| `Hero`, `Prose`, `FormField`, `MailtoLink`, `PriceTag`, `PostCta` | Manifesto hook / readable prose / form field / obfuscated mailto / price block / blog CTA. |

**Per-page by choice (TD2):** the "backstage-pass/ticket" CTA *panels* stay per-page — only the
button inside is shared. Coherence of the panels rides on the shared button + Ralph's sign-off.

**Motion (R9/AC9):** any animation is **CSS-only** (no client JS) and **suppressed under
`@media (prefers-reduced-motion: reduce)`**. 8-bit/pixel accents are committed inline SVG — no new
`@font-face`.

---

## 6. Voice checklist (R6)

Apply to **every in-scope surface** during review. Each surface gets a row in the sign-off table
(T9). A surface passes only when every box is ✓.

- [ ] **Register** — funnel/legal/chrome is formal **Sie**; no `du`/`dein`/`dich`/`dir`/`euch`/`ihr`
      reader-address. Blog stays first person/du.
- [ ] **Ralph = ich** — Ralph is "ich" throughout; reader-address is the only thing that switches.
- [ ] **Terminology** — entity names match the glossary (Der Freitag, 490 € netto = brutto, §19
      UStG, Agile Punk, Thomann). No "zzgl. USt", no "Paket/Abo".
- [ ] **Punk → proof** — every edgy hook is backed by a concrete, CV-traceable claim.
- [ ] **No bullshit** — no buzzword-bingo, no upselling, no manufactured urgency, no agency filler.
- [ ] **Concrete > abstract** — named results over process nouns.
- [ ] **Rhythm & tone** — short, declarative, with-kante; band/stage metaphors used, not forced.
- [ ] **Design coherence** — tokens (no raw hex), shared `Button variant="primary"` on button CTAs,
      consistent section/CTA rhythm, contrast contract held, motion reduced-motion-safe.
</content>
