/**
 * German landing copy (R7/R14, A5) — drafted by Claude from
 * `specs/2026-cv-de-ralph.pdf` + `specs/foundation-landing-page/infos-ralph/`.
 *
 * Voice: punk as bait, credibility as the close. Every claim in the
 * experience cards traces to the CV. Flagged for Ralph's editorial pass
 * before Epic 4 go-public.
 */

export interface ExperienceCard {
  /** Period + employer, e.g. "2019 – 2025 · Thomann" */
  period: string;
  title: string;
  body: string;
}

export interface LandingSection {
  /** in-page anchor id (matches Header nav + Section component) */
  id: string;
  kicker: string;
  title: string;
  body: string;
  cards?: ExperienceCard[];
}

export interface Landing {
  hero: {
    kicker: string;
    headline: string;
    lead: string;
  };
  sections: LandingSection[];
  cta: {
    id: string;
    kicker: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
}

export const landing: Landing = {
  hero: {
    kicker: 'Organisationsingenieur · Agile Punk · Teilzeit-Berater',
    headline: 'Schluss mit Org-Theater.\nBauen wir Organisationen, die liefern.',
    lead: 'Ich bin Ralph Cibis. Ich entwickle Menschen und designe Organisationen – pragmatisch, ohne Bullshit, ohne Beraterfolien zum Selbstzweck. Punk als Haltung, Handwerk als Beweis.',
  },

  sections: [
    {
      id: 'story',
      kicker: 'Die Geschichte',
      title: 'Erst der Code. Dann die ganze Organisation.',
      body: 'Angefangen habe ich da, wo es konkret wird: im Code. Aus 14 Jahren Softwareentwicklung und -architektur wurden 10 Jahre Führung. Irgendwann war klar, dass die teuersten Bugs nicht im System stecken, sondern in der Organisation drumherum – in Strukturen, die gegen die eigenen Leute arbeiten. Genau da setze ich an: Ich baue Organisationen wie Systeme. Beobachten, verstehen, umbauen, messen.',
    },
    {
      id: 'haltung',
      kicker: 'Die Haltung',
      title: 'Kein Bullshit. Kein Upselling. Keine heilige Methode.',
      body: 'Ich verkaufe keine Methode von der Stange. Ich schaue zuerst, was bei Ihnen wirklich klemmt, und baue dann gemeinsam mit Ihnen die Lösung – egal, ob am Ende ein bekanntes Verfahren wie Scrum draufsteht oder schlicht gesunder Menschenverstand. Die gängigen Methoden kenne ich aus der Praxis; ich bete sie nur nicht an.',
    },
    {
      id: 'erfahrung',
      kicker: 'Der Beweis',
      title: 'Was ich gebaut, geführt und skaliert habe',
      body: 'Reden kann jeder. Hier sind die Stationen, an denen ich geliefert habe:',
      cards: [
        {
          period: '2025 – heute · Thomann.io',
          title: 'Den Online-Shop fit für die Zukunft machen',
          body: 'Ich leite den Umbau einer in die Jahre gekommenen Shop-Plattform (rund 1,5 Mrd. € Umsatz) auf eine moderne, wartbare Technik. Dafür bringe ich ein großes Team aus Entwicklung, Technik und Design an einen Tisch – über Abteilungsgrenzen hinweg, ohne klassische Vorgesetztenrolle.',
        },
        {
          period: '2019 – 2025 · Thomann',
          title: 'Eine Abteilung von 25 auf 100 Menschen aufgebaut',
          body: 'Ich habe die Technik- und Datenabteilung mehr als vervierfacht – und dafür gesorgt, dass sie nicht im Chaos versinkt: klare Zuständigkeiten, faire Karriere- und Gehaltswege, eine Kultur, in der Leute gern bleiben. Mit Verantwortung für ein Jahresbudget von rund 1,2 Mio. €.',
        },
        {
          period: '2018 – 2019 · CodeCamp:N',
          title: 'Teams zum Laufen gebracht',
          body: 'Als Coach habe ich mehreren Teams geholfen, verlässlicher zu liefern und besser zusammenzuarbeiten – mit handfesten Methoden statt Theorie und mit Runden, in denen Teams voneinander lernen, statt dass jeder für sich kämpft.',
        },
        {
          period: '2014 – 2018 · Startups',
          title: 'Mitgegründet, Technik geführt, Teams aufgebaut',
          body: 'Als Tech Lead, Mitgründer und CTO habe ich Produkte von der ersten Zeile an gebaut, veraltete Technik abgelöst und Entwicklerteams zusammengestellt – inklusive Unterstützung bei der Suche nach Investoren.',
        },
        {
          period: '2012 – 2013 · New York',
          title: 'Erste Station im Ausland: IT in Manhattan',
          body: 'Für ein Unternehmen in New York habe ich die komplette IT betreut – Server, Netzwerk und Support für rund 200 Mitarbeitende – und nebenbei eigene interne Programme entwickelt, die den Arbeitsalltag spürbar einfacher gemacht haben.',
        },
        {
          period: 'ehrenamtlich · Beirat',
          title: 'Beirat im Gründerzentrum Lagarde 1',
          body: 'Ehrenamtlich begleite ich das digitale Gründerzentrum Lagarde 1 als Beirat. Ich gebe weiter, was ich beim Aufbau von Teams und Firmen gelernt habe – an Gründerinnen und Gründer, die gerade selbst loslegen.',
        },
      ],
    },
  ],

  cta: {
    id: 'kontakt',
    kicker: 'Der nächste Schritt',
    headline: 'Lust auf eine Organisation, die nicht gegen sich selbst arbeitet?',
    body: 'Aktuell berate ich in Teilzeit – fokussiert, ehrlich, in überschaubaren Einheiten. Das konkrete Angebot ist ein Freitag bei Ihnen. Schauen Sie es sich an.',
    buttonLabel: 'Angebot ansehen',
  },
};
