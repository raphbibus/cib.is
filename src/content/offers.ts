/**
 * German Offers & Contact copy (Epic 2 — R1, R2, R4, R5, R8, R11, R12).
 *
 * The money path: three offers in priority order, the Friday sold as one
 * repeatable 490 € product, and the booking-form labels / captcha / success /
 * error copy. Voice mirrors `landing.ts`: punk as bait, credibility as the
 * close, no upselling. On-brand placeholder draft — flagged for Ralph's
 * editorial pass before Epic 4 go-public. No hard-coded strings in `.astro`.
 */

export interface Offer {
  /** in-page anchor id + stable key (kebab-case) */
  id: string;
  kicker: string;
  title: string;
  body: string;
}

export interface Friday {
  id: string;
  kicker: string;
  title: string;
  body: string;
  price: string; // "490 €"
  priceNote: string; // netto = brutto / Kleinunternehmerregelung
  travelNote: string; // >2h von Bamberg ⇒ Reisekosten on top
  delivery: string; // vor Ort default, remote on request (R8/AC7)
}

export interface OffersForm {
  /** visible labels for each field */
  fields: { name: string; email: string; company: string; role: string; message: string };
  /** optional helper/placeholder for the free-text message */
  messagePlaceholder: string;
  required: ['name', 'email', 'message'];
  captchaLabel: string; // surrounds the build-time question, e.g. "Kurze Kontrollfrage: {q}"
  submitLabel: string; // primary CTA label, e.g. "Freitag anfragen"
  honeypotName: string; // hidden honeypot field name
  /** field-level + captcha validation messages (consumed by the bundled script) */
  errors: { name: string; email: string; emailFormat: string; message: string; captcha: string };
  /** short inline privacy note (full Datenschutz page lands in Epic 4) */
  privacyNote: string;
  /** label for the surfaced mailto fallback in the error state (R12) */
  mailtoFallbackLabel: string;
}

export interface OffersContent {
  /** repeated single primary CTA + the form section heading (R9) */
  cta: { id: string; label: string; headline: string; body: string };
  /** intro above the three offers */
  intro: { kicker: string; title: string; body: string };
  offers: [Offer, Offer, Offer]; // leadership, org dev, agile — in order (R3)
  friday: Friday;
  form: OffersForm;
  confirmation: { headline: string; body: string }; // "persönlich, binnen 2 Werktage" (R11/AC10)
  error: { body: string }; // inline submit-failure copy (R12/AC11)
}

export const offers: OffersContent = {
  cta: {
    id: 'kontakt',
    label: 'Freitag anfragen',
    headline: 'Ein Freitag. Ein klarer Blick von außen.',
    body: 'Kein Abo, kein Paket, kein Berater-Theater. Schreiben Sie mir, woran es bei Ihnen hakt – ich melde mich persönlich und schlage einen Freitag vor.',
  },

  intro: {
    kicker: 'Das Angebot',
    title: 'Drei Wege, eine Haltung: erst verstehen, dann bauen.',
    body: 'Ich verkaufe keine Methode von der Stange. Je nachdem, wo es klemmt, arbeiten wir an der Führung, an der Organisation oder an der Art, wie Ihre Teams liefern. Alles drei läuft über dasselbe Format – einen Freitag bei Ihnen.',
  },

  offers: [
    {
      id: 'leadership',
      kicker: '01 · Leadership',
      title: 'Führung, die trägt statt verwaltet',
      body: 'Führungskräfte-Training und Coaching für Menschen, die Verantwortung tragen und nicht nur Status-Meetings moderieren wollen. Ich war selbst über zehn Jahre Führungskraft – ich kenne den Spagat zwischen Zahlen, Menschen und der eigenen Glaubwürdigkeit. Wir arbeiten an echten Situationen aus eurem Alltag, nicht an Rollenspielen aus dem Seminarkatalog.',
    },
    {
      id: 'org-dev',
      kicker: '02 · Organisationsentwicklung',
      title: 'Organisationen wie Systeme umbauen',
      body: 'Die teuersten Bugs stecken nicht im Code, sondern in der Organisation drumherum – in Strukturen, die gegen die eigenen Leute arbeiten. Ich schaue mir an, wo Zuständigkeiten, Entscheidungswege und Anreize klemmen, und baue gemeinsam mit Ihnen um. Beobachten, verstehen, umbauen, messen – wie in der Technik, nur mit Menschen.',
    },
    {
      id: 'agile',
      kicker: '03 · Agiles Coaching',
      title: 'Agil ohne Buzzword-Bingo',
      body: 'Scrum, Kanban, OKR – ich kenne die Verfahren aus der Praxis, bete sie aber nicht an. Wenn ein Team verlässlicher liefern und besser zusammenarbeiten soll, zählt nicht das Framework auf der Folie, sondern was bei Ihnen tatsächlich funktioniert. Oft ist die Antwort weniger Methode und mehr gesunder Menschenverstand.',
    },
  ],

  friday: {
    id: 'freitag',
    kicker: 'Das Produkt',
    title: 'Der Freitag',
    body: 'Ein ganzer Freitag, nur mit Ihnen. Vormittags verstehe ich, woran es wirklich hakt – mit den Leuten, die es betrifft. Nachmittags arbeiten wir an einem konkreten Schritt nach vorn. Am Ende haben Sie keinen Foliensatz, sondern etwas, das Sie ab Montag anfassen können. Ein abgeschlossenes Ding, kein Einstieg in ein großes Programm.',
    price: '490 €',
    priceNote: 'Festpreis pro Freitag. Netto = brutto: Ich arbeite als Kleinunternehmer. Gemäß §19 UStG wird keine Umsatzsteuer berechnet.',
    travelNote: 'Reisekosten transparent on top: Ab etwa 2 Stunden Anfahrt kommt immer eine Hotelübernachtung dazu. Die Fahrt – egal ob Bahn oder Auto – berechne ich pauschal mit 30 Cent pro Kilometer ab Bamberg Hauptbahnhof. Sonst nichts.',
    delivery: 'Standard ist vor Ort bei Ihnen – da entsteht das meiste. Remote geht auf Anfrage, wenn es nicht anders passt.',
  },

  form: {
    fields: {
      name: 'Name',
      email: 'E-Mail',
      company: 'Unternehmen (optional)',
      role: 'Rolle (optional)',
      message: 'Worum geht es?',
    },
    messagePlaceholder: 'Was klemmt gerade – und was wäre nach einem guten Freitag anders?',
    required: ['name', 'email', 'message'],
    captchaLabel: 'Kurze Kontrollfrage gegen Spam-Bots',
    submitLabel: 'Freitag anfragen',
    honeypotName: 'firma-nachname', // plausible-looking trap field; real users never see it
    errors: {
      name: 'Bitte geben Sie Ihren Namen an.',
      email: 'Bitte geben Sie Ihre E-Mail-Adresse an.',
      emailFormat: 'Diese E-Mail-Adresse sieht nicht gültig aus.',
      message: 'Bitte beschreiben Sie kurz, worum es geht.',
      captcha: 'Die Antwort stimmt nicht ganz – rechnen Sie nochmal nach.',
    },
    privacyNote: 'Ihre Angaben nutze ich nur, um Ihnen persönlich zu antworten. Keine Newsletter, kein Tracking, keine Weitergabe.',
    mailtoFallbackLabel: 'Schreiben Sie mir direkt eine E-Mail',
  },

  confirmation: {
    headline: 'Anfrage ist da. Danke!',
    body: 'Ich melde mich persönlich – in der Regel binnen 2 Werktage – und schlage Ihnen einen konkreten Freitag vor. Kein Automat, keine Warteschleife.',
  },

  error: {
    body: 'Das Absenden hat gerade nicht geklappt. Ihre Eingaben stehen noch da – versuchen Sie es gleich nochmal, oder schreiben Sie mir direkt.',
  },
};
