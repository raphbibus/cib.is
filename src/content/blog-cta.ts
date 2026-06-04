/**
 * End-of-post CTA copy (Epic 3 — R1/AC1).
 *
 * Personal, FIRST-PERSON voice — Ralph as a person, not a company / "Laden".
 * Every post detail ends with this block linking into the Offers funnel
 * (`/angebot`). On-brand placeholder draft — flagged for Ralph's editorial pass
 * before Epic 4 go-public. No hard-coded strings in `.astro`.
 */
export interface BlogCta {
  /** mono kicker above the block */
  kicker: string;
  /** poster headline */
  headline: string;
  /** first-person body */
  body: string;
  /** button label + target route */
  buttonLabel: string;
  href: '/angebot';
}

export const blogCta: BlogCta = {
  kicker: 'Und jetzt?',
  headline: 'Wenn dich das anspricht, lass uns reden.',
  body: 'Ich schreibe hier über das, womit ich arbeite: Führung, Organisation und die Frage, wie Teams wirklich liefern. Wenn bei euch gerade etwas davon klemmt, schau ich es mir an – einen Freitag lang, persönlich, ohne Berater-Theater.',
  buttonLabel: 'Mein Angebot ansehen',
  href: '/angebot',
};
