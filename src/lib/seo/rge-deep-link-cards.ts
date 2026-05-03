/**
 * RGE Deep-Link Cards — Action #3 Bloc 4-5 Ahrefs 2026-05-03.
 *
 * Surface explicite sur le pillar `/rge` des deep H2 anchors créés dans
 * `trade-deep-sections.ts` (Bloc 1 + Bloc 2). Chaque card pointe vers
 * un H2 SEO précis ciblant un KW à fort volume (Ahrefs Phase 0
 * STRIKING_DISTANCE_PLAN.md).
 *
 * Pourquoi un module séparé ?
 *   - Découple la surface (cards UX) de la donnée (deep-sections.ts).
 *   - Test de cohérence anchor stability : chaque href cité ICI doit
 *     exister dans trade-deep-sections.ts (sinon broken anchor en prod).
 *   - Permet réutilisation future sur `/cee` et `/aides` (mêmes deep
 *     anchors pillars).
 */

export type RgeDeepLinkCard = {
  /** Service slug source — doit exister dans trade-deep-sections */
  serviceSlug: string
  /** Anchor id — doit matcher un section.id dans trade-deep-sections */
  anchorId: string
  /** Libellé affiché (≤ 50 chars) */
  label: string
  /** Sous-titre court (≤ 90 chars) */
  hint: string
  /** Volume KW mensuel adressable (Ahrefs FR) */
  monthlyVolume: number
}

export const RGE_DEEP_LINK_CARDS: readonly RgeDeepLinkCard[] = [
  {
    serviceSlug: 'pompe-a-chaleur',
    anchorId: 'pompe-a-chaleur-air-eau',
    label: 'PAC air/eau : prix, COP, aides',
    hint: 'La solution n°1 pour remplacer une chaudière fioul ou gaz (10 000 à 18 000 €).',
    monthlyVolume: 11000,
  },
  {
    serviceSlug: 'pompe-a-chaleur',
    anchorId: 'pompe-a-chaleur-geothermique',
    label: 'PAC géothermique : performance maximale',
    hint: 'Capteur enterré, COP 4-5 même en hiver. Surcoût 5 000 à 10 000 € vs PAC air/eau.',
    monthlyVolume: 3600,
  },
  {
    serviceSlug: 'isolation-thermique',
    anchorId: 'isolation-par-exterieur-ite',
    label: "Isolation par l'extérieur (ITE)",
    hint: "Supprime 100 % des ponts thermiques. 100-200 €/m² posé. CEE BAR-EN-103 jusqu'à 25 €/m².",
    monthlyVolume: 13000,
  },
  {
    serviceSlug: 'isolation-thermique',
    anchorId: 'choisir-isolant-thermique',
    label: 'Quel isolant thermique choisir',
    hint: 'Comparatif laine de roche / verre / biosourcés / polyuréthane — performance/prix.',
    monthlyVolume: 8200,
  },
  {
    serviceSlug: 'panneaux-solaires',
    anchorId: 'panneaux-photovoltaiques-autoconsommation',
    label: 'Photovoltaïque en autoconsommation',
    hint: "Production 3 200-4 200 kWh/an pour 3 kWc, prime Enedis jusqu'à 2 700 € (9 kWc).",
    monthlyVolume: 8100,
  },
  {
    serviceSlug: 'panneaux-solaires',
    anchorId: 'photovoltaique-3kwc-6kwc-9kwc',
    label: 'Quelle puissance : 3, 6 ou 9 kWc',
    hint: 'Dimensionnement par consommation annuelle — basculement régime pro au-delà de 9 kWc.',
    monthlyVolume: 5000,
  },
] as const

/** Total volume mensuel adressable via les cards. */
export function getRgeDeepLinkTotalVolume(): number {
  return RGE_DEEP_LINK_CARDS.reduce((sum, c) => sum + c.monthlyVolume, 0)
}

/** Vérifie qu'un anchorId est utilisé par au moins une card. */
export function hasDeepLinkCardForAnchor(anchorId: string): boolean {
  return RGE_DEEP_LINK_CARDS.some((c) => c.anchorId === anchorId)
}
