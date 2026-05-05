/**
 * Landing Pages — Campaigns Registry (Action #5 Ahrefs 2026-05-03).
 *
 * Source plan : `docs/audit-ahrefs-2026-05-03/INDEX.md` section 3 + `paid_intelligence_2026-05.csv`.
 * Pattern Effy validé : `/lp/generique/aides/prime-cee` (507 KW achetées) +
 * `/parcours/1/travaux-aides` (243 KW). On reproduit côté SA en pillar
 * léger noindex Google Ads-only.
 *
 * Convention :
 *   - URL : /lp/<slug>
 *   - source Pipedrive : `lp_<slug>` (mig 499)
 *   - noindex absolu (paid traffic uniquement, pas d'SEO organique)
 *   - schema enrichi : FinancialProduct ou GovernmentService selon `kind`
 *
 * Modification : éditer ICI uniquement. Test cohérence
 * `__tests__/lib/lp/campaigns.test.ts` verrouille la shape.
 */

export type LpCampaignKind = 'financial' | 'government' | 'service'

export type LpCampaign = {
  /** URL slug — kebab-case [a-z0-9-]+ */
  slug: string
  /** Service Pipedrive cible (devis API) — slug existant dans canonical-slugs */
  serviceSlug: string
  /** H1 court ≤ 70 chars, terme search exact */
  h1: string
  /** Sub-headline ≤ 200 chars — pose le problem + promise */
  subheadline: string
  /** Form CTA ≤ 50 chars */
  ctaLabel: string
  /** 3 trust blocks (label + value) — preuves sociales + chiffres */
  trustBlocks: ReadonlyArray<{ label: string; value: string }>
  /** Schema enrichment kind */
  kind: LpCampaignKind
  /** Montant max aide (€) — pour FinancialProduct/GovernmentService schema */
  maxAmountEur?: number
  /** Texte court sous le formulaire — précisions YMYL ≤ 250 chars */
  legalNote: string
}

const CAMPAIGNS: Record<string, LpCampaign> = {
  'aides-pac': {
    slug: 'aides-pac',
    serviceSlug: 'pompe-a-chaleur',
    h1: "Pompe à chaleur : jusqu'à 11 000 € d'aides en 2026",
    subheadline:
      "Estimez vos aides MaPrimeRénov' + prime CEE en 2 minutes. Devis gratuit avec un artisan RGE QualiPAC certifié près de chez vous.",
    ctaLabel: 'Calculer mes aides PAC',
    trustBlocks: [
      { label: 'Artisans RGE QualiPAC', value: '49 000+' },
      { label: 'Aides cumulées max 2026', value: '11 000 €' },
      { label: 'Réponse devis', value: '< 24h' },
    ],
    kind: 'government',
    maxAmountEur: 11000,
    legalNote:
      'Montants indicatifs maximaux. Conditions Anah selon revenus du foyer. Installation par artisan RGE QualiPAC actif obligatoire (cf. arrêté Anah 2024-12-23).',
  },
  'prime-cee': {
    slug: 'prime-cee',
    serviceSlug: 'isolation-thermique',
    h1: "Prime CEE 2026 : jusqu'à 4 200 € pour vos travaux énergétiques",
    subheadline:
      "Calculez votre prime CEE (Certificat d'Économies d'Énergie) en 2 minutes. Versement direct par les délégataires Effy, Sonergia, TotalEnergies sous 30 à 60 jours.",
    ctaLabel: 'Estimer ma prime CEE',
    trustBlocks: [
      { label: 'Délégataires partenaires', value: '4 majors' },
      { label: 'Prime CEE PAC + isolation', value: '4 200 €' },
      { label: 'Versement', value: '30-60j' },
    ],
    kind: 'financial',
    maxAmountEur: 4200,
    legalNote:
      'Montants indicatifs selon barème DGEC en vigueur 2026. Conditions : artisan RGE actif au moment de la signature du devis, opération éligible (BAR-EN/BAR-TH).',
  },
  'isolation-aides': {
    slug: 'isolation-aides',
    serviceSlug: 'isolation-thermique',
    h1: "Isolation thermique : 75 €/m² d'aides en 2026",
    subheadline:
      "Isolation par l'extérieur (ITE) ou par l'intérieur (ITI), combles, planchers : MaPrimeRénov' jusqu'à 75 €/m² + CEE BAR-EN-103 jusqu'à 25 €/m². Devis gratuit avec artisan RGE Qualibat.",
    ctaLabel: 'Estimer mes aides isolation',
    trustBlocks: [
      { label: 'Artisans RGE Qualibat', value: '49 000+' },
      { label: 'Aide max ITE par m²', value: '100 €' },
      { label: 'TVA réduite', value: '5,5 %' },
    ],
    kind: 'government',
    maxAmountEur: 75,
    legalNote:
      "Aide MaPrimeRénov' + CEE cumulées par m² isolé. Plafonds Anah selon revenus. Artisan RGE Qualibat 7141 ou 7144 obligatoire pour aides publiques.",
  },
  'audit-energetique': {
    slug: 'audit-energetique',
    serviceSlug: 'renovation-energetique',
    h1: "Audit énergétique : aide MaPrimeRénov' jusqu'à 500 €",
    subheadline:
      "Audit énergétique réglementaire obligatoire pour la vente d'un DPE F ou G (et E depuis 2025). Réalisé par un auditeur RGE OPQIBI 1905 ou Qualibat 8731. Devis gratuit en 24h.",
    ctaLabel: 'Demander mon audit énergétique',
    trustBlocks: [
      { label: 'Auditeurs RGE certifiés', value: 'OPQIBI 1905' },
      { label: 'Aide MaPrimeRénov Audit', value: '500 €' },
      { label: 'Validité audit', value: '5 ans' },
    ],
    kind: 'service',
    maxAmountEur: 500,
    legalNote:
      "Audit obligatoire à la vente DPE F/G depuis 2023, étendu E depuis 2025, D au 1er janvier 2034. MaPrimeRénov' Audit : 500 € très modestes / 400 € modestes / 300 € intermédiaires.",
  },
}

export const LP_CAMPAIGN_SLUGS = Object.keys(CAMPAIGNS) as readonly string[]

export function getLpCampaign(slug: string): LpCampaign | undefined {
  return CAMPAIGNS[slug]
}

export function getAllLpCampaigns(): readonly LpCampaign[] {
  return Object.values(CAMPAIGNS)
}

/** Pipedrive source field value — mig 499 convention `lp_<slug>`. */
export function getLpPipedriveSource(slug: string): string {
  return `lp_${slug}`
}
