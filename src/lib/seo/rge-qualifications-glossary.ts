/**
 * RGE Qualifications Glossary — Sprint J Ahrefs 2026-05-03.
 *
 * Vocabulaire technique RGE (Reconnu Garant de l'Environnement) sous forme
 * de Schema.org DefinedTerm. Ces termes sont massivement cités dans nos deep
 * sections (Sprints A→G) et nos guides éditoriaux : Qualibat 7141, QualiPAC,
 * Qualifelec IRVE P1, OPQIBI 1905, etc. Émis en DefinedTermSet pour
 * permettre à Google AI Overviews + Bing de citer la définition exacte
 * (rich snippet "definition" pour les requêtes "qu'est-ce que QualiPAC",
 * "Qualibat 7141 c'est quoi", "OPQIBI 1905 définition").
 *
 * Convention :
 *   - `code` : identifiant officiel court (Qualibat 7141, BAR-TH-104, etc.)
 *   - `name` : libellé humain affichable (≤ 80 chars)
 *   - `definition` : définition courte 100-300 chars, ton expert YMYL
 *   - `organisme` : organisme certificateur (Qualibat, Qualit'EnR, AFNOR…)
 *   - `inDefinedTermSet` : URL groupant les termes (RGE_GLOSSARY_URL)
 *
 * Le module est leaf (zéro import) — peut être importé partout sans cycle.
 *
 * Sources officielles :
 *   - france-renov.gouv.fr (référentiel public)
 *   - annuaire-rge.ademe.fr (validation qualifications)
 *   - Arrêté du 12 janvier 2017 (IRVE)
 *   - Arrêté Anah 2024-12-23 (RGE obligatoire MaPrimeRénov')
 */

/**
 * Sprint AI Ahrefs 2026-05-03 — source de vérité unique du path canonique.
 *
 * Avant Sprint AI, `${SITE_URL}/rge/glossaire` était hardcodé sur 5+ callsites
 * (page hubs, routes API, helpers). Tout rename de la route silenciait des
 * sameAs Schema.org sans warning. Cette constante centralise — le module
 * étant leaf (zéro import), tout consommateur peut l'importer sans cycle.
 */
export const RGE_GLOSSAIRE_PATH = '/rge/glossaire'

export type RgeGlossaryEntry = {
  /** Identifiant slug stable kebab-case (utilisé pour @id et anchors). */
  slug: string
  /** Code officiel (Qualibat 7141, QualiPAC, IRVE P1, etc.). */
  code: string
  /** Libellé humain. */
  name: string
  /** Définition 100-300 chars, ton YMYL expert. */
  definition: string
  /** Organisme certificateur. */
  organisme: string
  /** URL officielle (france-renov.gouv.fr ou organisme certificateur). */
  termCode?: string
}

const RGE_GLOSSARY: Record<string, RgeGlossaryEntry> = {
  qualipac: {
    slug: 'qualipac',
    code: 'QualiPAC',
    name: 'QualiPAC',
    definition:
      "Qualification RGE délivrée par Qualit'EnR pour l'installation de pompes à chaleur aérothermiques (air/eau, air/air) et géothermiques. Obligatoire pour ouvrir droit à MaPrimeRénov' et à la prime CEE BAR-TH-104 sur les PAC chauffage.",
    organisme: "Qualit'EnR",
    termCode: 'QualiPAC',
  },
  'qualipac-cet': {
    slug: 'qualipac-cet',
    code: 'QualiPAC module CET',
    name: 'QualiPAC module CET',
    definition:
      "Module additionnel de la qualification QualiPAC, dédié à l'installation de chauffe-eau thermodynamiques (CET). Obligatoire pour la prime CEE BAR-TH-148 et le crédit MaPrimeRénov' sur les CET (jusqu'à 1 200 € selon revenus).",
    organisme: "Qualit'EnR",
    termCode: 'QualiPAC-CET',
  },
  qualipv: {
    slug: 'qualipv',
    code: 'QualiPV',
    name: 'QualiPV',
    definition:
      "Qualification RGE délivrée par Qualit'EnR pour l'installation de panneaux photovoltaïques en autoconsommation et/ou revente. Obligatoire pour la prime à l'autoconsommation Enedis et la TVA réduite à 5,5 % depuis le 1er octobre 2025.",
    organisme: "Qualit'EnR",
    termCode: 'QualiPV',
  },
  qualisol: {
    slug: 'qualisol',
    code: 'QualiSol',
    name: 'QualiSol',
    definition:
      "Qualification RGE délivrée par Qualit'EnR pour l'installation de capteurs solaires thermiques (chauffe-eau solaire individuel CESI, système solaire combiné SSC). Obligatoire pour MaPrimeRénov' et la prime CEE BAR-TH-101.",
    organisme: "Qualit'EnR",
    termCode: 'QualiSol',
  },
  qualibois: {
    slug: 'qualibois',
    code: 'QualiBois',
    name: 'QualiBois',
    definition:
      "Qualification RGE délivrée par Qualit'EnR pour l'installation d'appareils de chauffage au bois performants (chaudières biomasse, poêles à granulés ou bûches). Obligatoire pour MaPrimeRénov' et primes CEE BAR-TH-112/113.",
    organisme: "Qualit'EnR",
    termCode: 'QualiBois',
  },
  'qualibat-7141': {
    slug: 'qualibat-7141',
    code: 'Qualibat 7141',
    name: "Qualibat 7141 — Isolation thermique par l'extérieur (ITE)",
    definition:
      "Qualification Qualibat RGE pour l'isolation thermique par l'extérieur (ITE) des murs avec enduit ou bardage. Obligatoire pour MaPrimeRénov' jusqu'à 75 €/m² et prime CEE BAR-EN-103 jusqu'à 25 €/m².",
    organisme: 'Qualibat',
    termCode: 'Qualibat-7141',
  },
  'qualibat-7144': {
    slug: 'qualibat-7144',
    code: 'Qualibat 7144',
    name: "Qualibat 7144 — Isolation thermique par l'intérieur (ITI)",
    definition:
      "Qualification Qualibat RGE pour l'isolation thermique par l'intérieur (ITI) des murs périphériques. Obligatoire pour MaPrimeRénov' jusqu'à 25 €/m² et prime CEE BAR-EN-102 jusqu'à 15 €/m².",
    organisme: 'Qualibat',
    termCode: 'Qualibat-7144',
  },
  'qualibat-7131': {
    slug: 'qualibat-7131',
    code: 'Qualibat 7131',
    name: 'Qualibat 7131 — Isolation des combles',
    definition:
      "Qualification Qualibat RGE pour l'isolation des combles perdus et aménagés. Obligatoire pour MaPrimeRénov' et prime CEE BAR-EN-101 (jusqu'à 12 €/m² combles perdus, 18 €/m² rampants).",
    organisme: 'Qualibat',
    termCode: 'Qualibat-7131',
  },
  'qualibat-8731': {
    slug: 'qualibat-8731',
    code: 'Qualibat 8731',
    name: 'Qualibat 8731 — Audit énergétique enveloppe + équipements',
    definition:
      "Qualification Qualibat RGE pour la réalisation d'audits énergétiques réglementaires (vente DPE F/G/E) couvrant enveloppe et équipements. Obligatoire pour MaPrimeRénov' Audit jusqu'à 500 € selon revenus.",
    organisme: 'Qualibat',
    termCode: 'Qualibat-8731',
  },
  'opqibi-1905': {
    slug: 'opqibi-1905',
    code: 'OPQIBI 1905',
    name: 'OPQIBI 1905 — BET audit énergétique',
    definition:
      "Qualification OPQIBI pour les bureaux d'études thermiques (BET) habilités à réaliser les audits énergétiques réglementaires (vente DPE F/G/E depuis 2023). Obligatoire pour MaPrimeRénov' Audit et MaPrimeRénov' Parcours Accompagné.",
    organisme: 'OPQIBI',
    termCode: 'OPQIBI-1905',
  },
  'qualifelec-irve-p1': {
    slug: 'qualifelec-irve-p1',
    code: 'Qualifelec IRVE P1',
    name: 'Qualifelec IRVE P1 — Bornes de recharge ≤ 22 kW',
    definition:
      "Qualification Qualifelec niveau 1 pour l'installation de bornes de recharge de véhicules électriques (≤ 22 kW non communicantes) en maison individuelle ou petit professionnel. Obligatoire pour le crédit d'impôt 75 % plafond 500 € (arrêté 12 janvier 2017).",
    organisme: 'Qualifelec',
    termCode: 'Qualifelec-IRVE-P1',
  },
  'qualifelec-irve-p2': {
    slug: 'qualifelec-irve-p2',
    code: 'Qualifelec IRVE P2',
    name: 'Qualifelec IRVE P2 — Bornes communicantes',
    definition:
      'Qualification Qualifelec niveau 2 pour les bornes communicantes pilotables à distance (supervision, modulation de charge, badge RFID) en habitat collectif et tertiaire. Requis pour la prime ADVENIR copropriété 600 €.',
    organisme: 'Qualifelec',
    termCode: 'Qualifelec-IRVE-P2',
  },
  'qualifelec-irve-p3': {
    slug: 'qualifelec-irve-p3',
    code: 'Qualifelec IRVE P3',
    name: 'Qualifelec IRVE P3 — Recharge rapide DC',
    definition:
      'Qualification Qualifelec niveau 3 pour les stations de recharge rapide (≥ 50 kW courant continu) sur sites publics et autoroutes. Formation de 35 heures + module DC obligatoire.',
    organisme: 'Qualifelec',
    termCode: 'Qualifelec-IRVE-P3',
  },
  'qualibat-4311': {
    slug: 'qualibat-4311',
    code: 'Qualibat 4311',
    name: 'Qualibat 4311 — Réseaux aérauliques',
    definition:
      "Qualification Qualibat RGE pour l'installation de réseaux aérauliques (VMC simple flux et double flux). Obligatoire pour MaPrimeRénov' jusqu'à 4 000 € et prime CEE BAR-TH-125 jusqu'à 1 500 € sur les VMC double flux haut rendement.",
    organisme: 'Qualibat',
    termCode: 'Qualibat-4311',
  },
  'qualibat-5111': {
    slug: 'qualibat-5111',
    code: 'Qualibat 5111',
    name: 'Qualibat 5111 — Menuiserie extérieure',
    definition:
      "Qualification Qualibat RGE pour le remplacement de menuiseries extérieures (fenêtres, portes-fenêtres). Obligatoire pour MaPrimeRénov' jusqu'à 100 €/fenêtre et prime CEE BAR-EN-104. Exige Uw ≤ 1,3 W/m².K et Sw ≥ 0,30.",
    organisme: 'Qualibat',
    termCode: 'Qualibat-5111',
  },
  'rge-eco-artisan': {
    slug: 'rge-eco-artisan',
    code: 'RGE éco-artisan',
    name: 'RGE éco-artisan',
    definition:
      "Mention RGE délivrée par la CAPEB pour les artisans engagés dans la rénovation énergétique globale. Couvre l'accompagnement MaPrimeRénov' Parcours Accompagné et l'expertise multi-corps de métier en performance énergétique.",
    organisme: 'CAPEB',
    termCode: 'RGE-eco-artisan',
  },
} as const

/**
 * Returns the glossary entry for a slug, or null if not defined.
 * Safe to call for any slug — never throws.
 */
export function getRgeGlossaryEntry(slug: string): RgeGlossaryEntry | null {
  return RGE_GLOSSARY[slug] ?? null
}

/**
 * Returns all glossary entries as an ordered array (insertion order = sort).
 */
export function getAllRgeGlossaryEntries(): readonly RgeGlossaryEntry[] {
  return Object.values(RGE_GLOSSARY)
}

/**
 * List of glossary entry slugs. Used for tests (drift check vs RGE_QUALIFICATION_LABELS).
 */
export function getRgeGlossarySlugs(): readonly string[] {
  return Object.keys(RGE_GLOSSARY)
}
