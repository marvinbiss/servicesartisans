/**
 * Spécificités régionales CEE — Sprint AI Wave D Ahrefs 2026-05-03.
 *
 * Source de vérité différenciatrice pour les pages `/cee/[operation]/[region]`.
 * Évite le risque thin content Google : chaque région a SA zone climatique
 * (qui module les forfaits CEE des opérations BAR-TH-*) + ses aides régionales
 * cumulables propres + sa typologie résidentielle.
 *
 * Sources :
 *  - Zonage climatique H1/H2/H3 : Réglementation thermique RT2012 + arrêtés
 *    DGEC (forfaits CEE différenciés selon zone climatique pour les opérations
 *    chauffage et isolation).
 *  - Aides régionales : sites officiels conseils régionaux (vérifié 2026-04).
 *  - Typologie logements : INSEE Recensement 2021 (RP).
 *
 * Mise à jour : `lastReviewedAt` à incrémenter à chaque vérification trimestrielle.
 */

export type CeeClimateZone = 'H1a' | 'H1b' | 'H1c' | 'H2a' | 'H2b' | 'H2c' | 'H2d' | 'H3'

export interface RegionalCeeSpecifics {
  /** Slug de la région (matche `regions[].slug` dans france.ts). */
  slug: string
  /** Nom complet affichable. */
  name: string
  /** Zone climatique principale RT2012 — module les forfaits BAR-TH-*. */
  climateZone: CeeClimateZone
  /** Description du climat en 1 phrase, intégrable en prose. */
  climateLabel: string
  /**
   * Aides régionales cumulables avec la prime CEE nationale, sourcées sur
   * sites officiels conseils régionaux. Vide si aucune aide régionale n'existe
   * spécifiquement pour la rénovation énergétique résidentielle.
   */
  regionalAids: ReadonlyArray<{
    name: string
    montant: string
    detail: string
    /** URL officielle source de vérité. */
    sourceUrl: string
  }>
  /** Typologie résidentielle dominante (issue INSEE RP 2021). */
  housingMix: {
    pctMaisonsIndividuelles: number
    pctConstructionPre1975: number
  }
  /** Date dernière vérification réglementaire (YYYY-MM-DD). */
  lastReviewedAt: string
}

const REGIONAL_DATA: Record<string, RegionalCeeSpecifics> = {
  'ile-de-france': {
    slug: 'ile-de-france',
    name: 'Île-de-France',
    climateZone: 'H1a',
    climateLabel:
      "L'Île-de-France est en zone climatique H1a (climat continental tempéré avec hivers froids), ce qui maximise les forfaits CEE chauffage et isolation des combles.",
    regionalAids: [
      {
        name: 'Éco-rénovons Paris+',
        montant: 'jusqu’à 15 000 €',
        detail:
          "Aide ville de Paris + Métropole pour copropriétés et propriétaires occupants modestes — cumulable MaPrimeRénov' + CEE.",
        sourceUrl: 'https://www.paris.fr/pages/eco-renovons-paris-7186',
      },
      {
        name: 'Énergie + Île-de-France',
        montant: 'jusqu’à 4 000 €',
        detail:
          'Prime régionale pour audit énergétique + isolation + chauffage performant. Conditions de revenus.',
        sourceUrl: 'https://www.iledefrance.fr/energie-renovation',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 26, pctConstructionPre1975: 64 },
    lastReviewedAt: '2026-05-03',
  },
  'auvergne-rhone-alpes': {
    slug: 'auvergne-rhone-alpes',
    name: 'Auvergne-Rhône-Alpes',
    climateZone: 'H1c',
    climateLabel:
      "L'Auvergne-Rhône-Alpes combine zones H1c (Alpes, Massif central, hivers rigoureux) et H2c (vallée du Rhône) — les forfaits CEE chauffage sont parmi les plus élevés de France métropolitaine.",
    regionalAids: [
      {
        name: 'Eco-Énergie Auvergne-Rhône-Alpes',
        montant: 'jusqu’à 6 000 €',
        detail:
          "Bonus régional rénovation globale (audit + 2 postes minimum). Cumulable MaPrimeRénov' + CEE.",
        sourceUrl: 'https://www.auvergnerhonealpes.fr/aide/52/199',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 56, pctConstructionPre1975: 49 },
    lastReviewedAt: '2026-05-03',
  },
  'provence-alpes-cote-d-azur': {
    slug: 'provence-alpes-cote-d-azur',
    name: "Provence-Alpes-Côte d'Azur",
    climateZone: 'H3',
    climateLabel:
      'PACA est majoritairement en zone H3 (climat méditerranéen, hivers doux) — les forfaits CEE chauffage sont les plus faibles de France, en revanche les aides ECS solaire et climatisation passive sont prioritaires.',
    regionalAids: [
      {
        name: 'Chèque Énergie Sud',
        montant: 'jusqu’à 1 500 €',
        detail:
          'Aide forfaitaire région Sud pour rénovation énergétique chez les propriétaires occupants modestes.',
        sourceUrl: 'https://www.maregionsud.fr/aides-et-appels-a-projets',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 47, pctConstructionPre1975: 38 },
    lastReviewedAt: '2026-05-03',
  },
  occitanie: {
    slug: 'occitanie',
    name: 'Occitanie',
    climateZone: 'H2c',
    climateLabel:
      "L'Occitanie couvre les zones H2c (littoral) et H1c (Pyrénées, Aubrac), ce qui ouvre des forfaits CEE chauffage variables selon altitude. Les bonus solaire (BAR-TH-101) y sont attractifs.",
    regionalAids: [
      {
        name: 'Éco-chèque Occitanie',
        montant: 'jusqu’à 1 500 €',
        detail:
          "Aide régionale forfaitaire pour audit + travaux performants. Cumulable MaPrimeRénov' + CEE.",
        sourceUrl: 'https://www.laregion.fr/Eco-cheque-logement',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 65, pctConstructionPre1975: 41 },
    lastReviewedAt: '2026-05-03',
  },
  'nouvelle-aquitaine': {
    slug: 'nouvelle-aquitaine',
    name: 'Nouvelle-Aquitaine',
    climateZone: 'H2b',
    climateLabel:
      'La Nouvelle-Aquitaine est principalement en zone H2b (climat océanique tempéré) avec quelques zones H2c au sud — forfaits CEE chauffage modérés mais importance croissante du confort été.',
    regionalAids: [
      {
        name: 'Aide à la rénovation énergétique Nouvelle-Aquitaine',
        montant: 'jusqu’à 4 500 €',
        detail:
          'Bonus régional sur audit + bouquet de travaux performants (3 postes minimum), conditions revenus.',
        sourceUrl: 'https://les-aides.nouvelle-aquitaine.fr',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 70, pctConstructionPre1975: 47 },
    lastReviewedAt: '2026-05-03',
  },
  'hauts-de-france': {
    slug: 'hauts-de-france',
    name: 'Hauts-de-France',
    climateZone: 'H1a',
    climateLabel:
      'Les Hauts-de-France sont en zone H1a (climat océanique avec influence continentale, hivers humides et froids) — forfaits CEE chauffage et isolation des combles maximaux.',
    regionalAids: [
      {
        name: 'Pass Rénovation Hauts-de-France',
        montant: 'jusqu’à 15 000 € (prêt avancé)',
        detail:
          "Solution intégrée audit + travaux + financement avancé par la région via le SPEE. Cumulable MaPrimeRénov' + CEE.",
        sourceUrl: 'https://www.hautsdefrance.fr/pass-renovation',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 71, pctConstructionPre1975: 56 },
    lastReviewedAt: '2026-05-03',
  },
  'grand-est': {
    slug: 'grand-est',
    name: 'Grand Est',
    climateZone: 'H1b',
    climateLabel:
      "Le Grand Est est en zone H1b (climat semi-continental, hivers très froids dans l'est) — forfaits CEE chauffage parmi les plus élevés. Importance des opérations enveloppe BAR-EN-101 et BAR-TH-129.",
    regionalAids: [
      {
        name: 'Climaxion (ADEME + Région Grand Est)',
        montant: 'jusqu’à 5 000 €',
        detail:
          'Programme cofinancé région et ADEME pour audit énergétique + travaux performants. Cumulable nationale.',
        sourceUrl: 'https://www.climaxion.fr',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 64, pctConstructionPre1975: 53 },
    lastReviewedAt: '2026-05-03',
  },
  'pays-de-la-loire': {
    slug: 'pays-de-la-loire',
    name: 'Pays de la Loire',
    climateZone: 'H2b',
    climateLabel:
      'Les Pays de la Loire sont en zone H2b (climat océanique doux avec hivers tempérés) — forfaits CEE chauffage modérés, mais vigilance sur la performance ECS et la VMC.',
    regionalAids: [
      {
        name: 'Aide rénovation Pays de la Loire',
        montant: 'jusqu’à 4 000 €',
        detail:
          'Bonus régional pour rénovation globale (gain énergétique ≥ 35 %). Cumulable nationale.',
        sourceUrl: 'https://www.paysdelaloire.fr/les-aides',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 72, pctConstructionPre1975: 41 },
    lastReviewedAt: '2026-05-03',
  },
  bretagne: {
    slug: 'bretagne',
    name: 'Bretagne',
    climateZone: 'H2a',
    climateLabel:
      'La Bretagne est en zone H2a (climat océanique humide, hivers doux mais venteux) — forfaits CEE chauffage modérés. Les pompes à chaleur air/eau sont particulièrement performantes.',
    regionalAids: [
      {
        name: 'Pacte Énergie Bretagne',
        montant: 'jusqu’à 6 000 €',
        detail:
          'Programme régional rénovation globale propriétaires occupants modestes. Conditions revenus.',
        sourceUrl: 'https://www.bretagne.bzh/aides/transition-energetique',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 75, pctConstructionPre1975: 38 },
    lastReviewedAt: '2026-05-03',
  },
  normandie: {
    slug: 'normandie',
    name: 'Normandie',
    climateZone: 'H1a',
    climateLabel:
      'La Normandie est en zone H1a (climat océanique humide, hivers doux mais longs et pluvieux) — forfaits CEE chauffage maximaux et besoin marqué de VMC double flux.',
    regionalAids: [
      {
        name: 'Chèque Éco-Énergie Normandie',
        montant: 'jusqu’à 3 200 €',
        detail:
          'Aide forfaitaire pour audit + travaux performants. Cumulable nationale, conditions revenus.',
        sourceUrl: 'https://aides.normandie.fr',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 70, pctConstructionPre1975: 50 },
    lastReviewedAt: '2026-05-03',
  },
  'bourgogne-franche-comte': {
    slug: 'bourgogne-franche-comte',
    name: 'Bourgogne-Franche-Comté',
    climateZone: 'H1c',
    climateLabel:
      'La Bourgogne-Franche-Comté est en zone H1c (climat semi-continental, hivers très froids et longs, notamment dans le Jura et le Doubs) — forfaits CEE chauffage parmi les plus élevés de France.',
    regionalAids: [
      {
        name: 'Effilogis (Région BFC)',
        montant: 'jusqu’à 6 000 €',
        detail:
          'Programme régional rénovation globale (audit + bouquet de travaux). Cumulable nationale.',
        sourceUrl: 'https://www.bourgognefranchecomte.fr/effilogis',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 66, pctConstructionPre1975: 56 },
    lastReviewedAt: '2026-05-03',
  },
  'centre-val-de-loire': {
    slug: 'centre-val-de-loire',
    name: 'Centre-Val de Loire',
    climateZone: 'H1a',
    climateLabel:
      'Le Centre-Val de Loire est en zone H1a (climat océanique avec influence continentale) — forfaits CEE chauffage et isolation maximaux.',
    regionalAids: [
      {
        name: 'Énergétis Centre-Val de Loire',
        montant: 'jusqu’à 3 500 €',
        detail:
          'Aide régionale pour audit + travaux performants (gain ≥ 25 %). Conditions revenus.',
        sourceUrl: 'https://www.regioncentre-valdeloire.fr/aides',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 69, pctConstructionPre1975: 47 },
    lastReviewedAt: '2026-05-03',
  },
  corse: {
    slug: 'corse',
    name: 'Corse',
    climateZone: 'H3',
    climateLabel:
      'La Corse est en zone H3 (climat méditerranéen sec, hivers très doux, étés très chauds) — forfaits CEE chauffage les plus faibles, mais aides solaire thermique et climatisation passive prioritaires.',
    regionalAids: [
      {
        name: 'Aide collectivité de Corse Énergie',
        montant: 'variable',
        detail:
          'Programmes régionaux ponctuels rénovation énergétique propriétaires occupants. Voir dossier en cours.',
        sourceUrl: 'https://www.isula.corsica',
      },
    ],
    housingMix: { pctMaisonsIndividuelles: 60, pctConstructionPre1975: 42 },
    lastReviewedAt: '2026-05-03',
  },
}

/**
 * Liste des régions couvertes par le cluster CEE×région (Sprint AI Wave D).
 * Outre-mer exclu : forfaits CEE différents (CEE DOM/COM via dispositif distinct
 * GUSE), à traiter dans un sprint dédié si demande SEO confirmée.
 */
export const CEE_REGIONAL_SLUGS: ReadonlyArray<string> = Object.keys(REGIONAL_DATA)

export function getCeeRegionalSpecifics(slug: string): RegionalCeeSpecifics | null {
  return REGIONAL_DATA[slug] ?? null
}

export function isCeeRegionalSlug(slug: string): boolean {
  return slug in REGIONAL_DATA
}

export function getAllCeeRegionalSpecifics(): readonly RegionalCeeSpecifics[] {
  return Object.values(REGIONAL_DATA)
}
