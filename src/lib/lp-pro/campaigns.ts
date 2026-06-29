/**
 * Landing Pages PRO — campagnes lead-gen hors-RGE (Meta/Google Ads).
 *
 * Distinct des LP RGE (`src/lib/lp/campaigns.ts`) : ici PAS d'angle aides /
 * MaPrimeRénov' / CEE. Pure capture de devis pour les métiers généralistes
 * (plomberie, électricité, toiture, serrurerie…) ciblés par des ads où la
 * promesse est « devis gratuit, artisans vérifiés, réponse rapide » — pas de
 * subvention.
 *
 * Convention :
 *   - URL  : /lp-pro/<slug>
 *   - source Pipedrive : `lppro_<slug>`
 *   - noindex absolu (paid traffic uniquement, jamais d'organique)
 *   - schema : Service (pas de FinancialProduct/GovernmentService — aucune aide)
 *
 * `serviceSlug` route le lead vers `/api/devis` (Pipedrive). Les slugs hors
 * catalogue canonique (serrurier, carreleur…) restent valides : `/api/devis`
 * accepte n'importe quel string et pousse le lead, le dispatch est manuel.
 */

export type LpProCampaign = {
  /** URL slug — kebab-case [a-z0-9-]+ */
  slug: string
  /** Service envoyé à /api/devis (routing Pipedrive) */
  serviceSlug: string
  /** Métier affiché (capitalisé) */
  trade: string
  /** H1 court ≤ 70 chars, terme search exact */
  h1: string
  /** Sub-headline ≤ 200 chars — problème + promesse */
  subheadline: string
  /** Form CTA ≤ 50 chars */
  ctaLabel: string
  /** 3 blocs de réassurance (label + value) */
  trustBlocks: ReadonlyArray<{ label: string; value: string }>
}

const SHARED_TRUST: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'Artisans vérifiés', value: 'SIRET + décennale' },
  { label: 'Devis gratuit', value: '< 24h' },
  { label: 'Sans engagement', value: '100 %' },
]

const CAMPAIGNS: Record<string, LpProCampaign> = {
  plombier: {
    slug: 'plombier',
    serviceSlug: 'plombier',
    trade: 'Plombier',
    h1: 'Plombier près de chez vous : devis gratuit en 24h',
    subheadline:
      "Fuite, chauffe-eau, robinetterie, débouchage : recevez un devis gratuit d'un plombier vérifié près de chez vous. Réponse rapide, sans engagement.",
    ctaLabel: 'Recevoir mon devis plombier',
    trustBlocks: SHARED_TRUST,
  },
  electricien: {
    slug: 'electricien',
    serviceSlug: 'electricien',
    trade: 'Électricien',
    h1: 'Électricien près de chez vous : devis gratuit en 24h',
    subheadline:
      'Panne, mise aux normes, tableau électrique, dépannage : un électricien vérifié vous établit un devis gratuit près de chez vous. Sans engagement.',
    ctaLabel: 'Recevoir mon devis électricien',
    trustBlocks: SHARED_TRUST,
  },
  couvreur: {
    slug: 'couvreur',
    serviceSlug: 'couvreur',
    trade: 'Couvreur',
    h1: 'Couvreur près de chez vous : devis gratuit en 24h',
    subheadline:
      "Réfection de toiture, fuite, démoussage, gouttières : recevez un devis gratuit d'un couvreur vérifié près de chez vous. Réponse rapide, sans engagement.",
    ctaLabel: 'Recevoir mon devis toiture',
    trustBlocks: SHARED_TRUST,
  },
  serrurier: {
    slug: 'serrurier',
    serviceSlug: 'serrurier',
    trade: 'Serrurier',
    h1: 'Serrurier près de chez vous : devis gratuit en 24h',
    subheadline:
      'Ouverture de porte, changement de serrure, blindage : un serrurier vérifié près de chez vous vous établit un devis clair. Tarifs honnêtes, sans engagement.',
    ctaLabel: 'Recevoir mon devis serrurier',
    trustBlocks: SHARED_TRUST,
  },
  peintre: {
    slug: 'peintre',
    serviceSlug: 'peintre-en-batiment',
    trade: 'Peintre',
    h1: 'Peintre en bâtiment : devis gratuit en 24h',
    subheadline:
      "Peinture intérieure, extérieure, rénovation, enduits : recevez un devis gratuit d'un peintre vérifié près de chez vous. Sans engagement.",
    ctaLabel: 'Recevoir mon devis peinture',
    trustBlocks: SHARED_TRUST,
  },
  macon: {
    slug: 'macon',
    serviceSlug: 'macon',
    trade: 'Maçon',
    h1: 'Maçon près de chez vous : devis gratuit en 24h',
    subheadline:
      "Mur, dalle, ouverture, extension, terrasse : recevez un devis gratuit d'un maçon vérifié près de chez vous. Réponse rapide, sans engagement.",
    ctaLabel: 'Recevoir mon devis maçonnerie',
    trustBlocks: SHARED_TRUST,
  },
  menuisier: {
    slug: 'menuisier',
    serviceSlug: 'menuisier',
    trade: 'Menuisier',
    h1: 'Menuisier près de chez vous : devis gratuit en 24h',
    subheadline:
      "Pose de portes, fenêtres, parquet, dressing sur mesure : recevez un devis gratuit d'un menuisier vérifié près de chez vous. Sans engagement.",
    ctaLabel: 'Recevoir mon devis menuiserie',
    trustBlocks: SHARED_TRUST,
  },
  chauffagiste: {
    slug: 'chauffagiste',
    serviceSlug: 'chauffagiste',
    trade: 'Chauffagiste',
    h1: 'Chauffagiste près de chez vous : devis gratuit en 24h',
    subheadline:
      'Panne de chaudière, entretien, dépannage chauffage : un chauffagiste vérifié vous établit un devis gratuit près de chez vous. Réponse rapide, sans engagement.',
    ctaLabel: 'Recevoir mon devis chauffage',
    trustBlocks: SHARED_TRUST,
  },
}

export const LP_PRO_CAMPAIGN_SLUGS = Object.keys(CAMPAIGNS) as readonly string[]

export function getLpProCampaign(slug: string): LpProCampaign | undefined {
  return CAMPAIGNS[slug]
}

export function getAllLpProCampaigns(): readonly LpProCampaign[] {
  return Object.values(CAMPAIGNS)
}

/** Pipedrive source field value — convention `lppro_<slug>`. */
export function getLpProPipedriveSource(slug: string): string {
  return `lppro_${slug}`
}
