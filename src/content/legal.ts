/**
 * German legal copy — Impressum + Datenschutzerklärung (Epic 4 — R2, R3, R5, R8).
 *
 * Hand-authored against the §5 DDG and DSGVO checklists, tailored to the actual
 * stack: Netlify (US) hosting + Forms, zero tracking, zero cookies. Mirrors
 * `landing.ts` / `offers.ts`: no hard-coded strings in `.astro`.
 *
 * ⚠ PLACEHOLDERS — Ralph supplies the real values before go-live (see the
 * go-live checklist). They are clearly marked with `[…]` so a missing value is
 * obvious in QA and never accidentally shipped as fact.
 */

export interface Impressum {
  /** legal name (Diensteanbieter, §5 Abs. 1 Nr. 1 DDG) */
  name: string;
  /** ladungsfähige Anschrift (no PO box) — one line per array entry */
  address: string[];
  /** obfuscated contact address, fed to MailtoLink */
  email: { user: string; domain: string };
  /** USt-IdNr (§5 Abs. 1 Nr. 6 DDG) */
  ustId: string;
  /** §19 UStG Kleinunternehmer line */
  kleinunternehmerNote: string;
  /** second quick-contact channel — phone number (R7, per IHK: §5 DDG requires
   *  a means of fast direct contact; the booking-form link was replaced). */
  phone: string;
}

export interface DatenschutzSection {
  heading: string;
  body: string[];
}

export interface Datenschutz {
  /** Verantwortlicher (Art. 4 Nr. 7 DSGVO) */
  controller: string;
  sections: DatenschutzSection[];
  /** concrete retention rule (R8) */
  retention: string;
  /** data-subject rights list (R8) */
  rights: string[];
  /** responsible Aufsichtsbehörde for the Beschwerderecht (R8), as display lines */
  supervisoryAuthority: string[];
}

export const impressum: Impressum = {

  name: 'Ralph Cibis',

  address: [
    'Adam-Senger-Str. 18',
    '96052 Bamberg',
    'Deutschland',
  ],
  email: { user: 'website', domain: 'cib.is' },
  // ⚠ PLACEHOLDER — USt-IdNr nach §27a UStG.
  ustId: 'DE319898841',
  kleinunternehmerNote:
    'Gemäß §19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).',
  phone: '0176 2357 9314',
};

export const datenschutz: Datenschutz = {
  controller:
    'Verantwortlich für die Datenverarbeitung auf dieser Website ist Ralph Cibis, erreichbar über die im Impressum genannte Anschrift und E-Mail-Adresse.',

  sections: [
    {
      heading: 'Überblick: keine Cookies, kein Tracking',
      body: [
        'Diese Website kommt ohne Cookies, ohne Analyse- oder Tracking-Dienste und ohne Werbe-Netzwerke aus. Es werden keine Daten an Drittanbieter weitergegeben und keine Inhalte von fremden Servern nachgeladen. Deshalb gibt es hier auch keinen Cookie-Banner – es gibt schlicht nichts zuzustimmen.',
        'Personenbezogene Daten verarbeiten wir nur in zwei Fällen: technisch notwendige Server-Logs beim Aufruf der Seite und die Angaben, die du uns über das Kontaktformular freiwillig schickst.',
      ],
    },
    {
      heading: 'Hosting und Formulare über Netlify (USA)',
      body: [
        'Diese Website wird bei der Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107, USA gehostet. Netlify verarbeitet als Auftragsverarbeiter im Sinne des Art. 28 DSGVO die technisch notwendigen Verbindungsdaten (insbesondere die IP-Adresse, Datum und Uhrzeit des Zugriffs, abgerufene Seite, Browsertyp – sogenannte Server-Logfiles).',
        'Auch die Übermittlung des Kontaktformulars läuft über Netlify Forms. Dabei werden die von dir eingegebenen Angaben (Name, E-Mail-Adresse, optional Unternehmen und Rolle sowie deine Nachricht) an Netlify übertragen und an uns weitergeleitet.',
        'Rechtsgrundlage für die Server-Logfiles ist unser berechtigtes Interesse am sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Rechtsgrundlage für die Verarbeitung deiner Formularangaben ist die Bearbeitung deiner Anfrage bzw. die Anbahnung eines Vertrags (Art. 6 Abs. 1 lit. b DSGVO).',
        'Da Netlify ein US-Unternehmen ist, kann es zu einer Übermittlung von Daten in die USA kommen. Mit Netlify besteht ein Auftragsverarbeitungsvertrag (Data Processing Agreement, DPA), der die EU-Standardvertragsklauseln (Standard Contractual Clauses, SCC) einschließt, um ein angemessenes Datenschutzniveau für die Übermittlung in die USA sicherzustellen.',
      ],
    },
    {
      heading: 'Kontaktaufnahme',
      body: [
        'Wenn du uns über das Formular oder per E-Mail kontaktierst, verarbeiten wir deine Angaben ausschließlich, um deine Anfrage zu beantworten. Es findet kein Newsletter-Versand, keine Profilbildung und keine Weitergabe zu Werbezwecken statt.',
      ],
    },
  ],

  retention:
    'Anfragen über das Kontaktformular löschen wir innerhalb eines Monats nach Abschluss der jeweiligen Anfrage, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',

  rights: [
    'Recht auf Auskunft (Art. 15 DSGVO)',
    'Recht auf Berichtigung (Art. 16 DSGVO)',
    'Recht auf Löschung (Art. 17 DSGVO)',
    'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)',
    'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
    'Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)',
    'Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)',
  ],

  // Für die Privatwirtschaft (Unternehmen, Vereine, Freiberufler) zuständige
  // Landesdatenschutzbehörde.
  supervisoryAuthority: [
    'Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)',
    'Promenade 27, 91522 Ansbach',
    'E-Mail: poststelle@lda.bayern.de',
    'Telefon: 0981 53-1300',
  ],
};
