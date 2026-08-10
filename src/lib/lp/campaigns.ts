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
 *
 * ---------------------------------------------------------------------------
 * REVUE FACTUELLE YMYL — 2026-07-28
 * ---------------------------------------------------------------------------
 * Ces pages sont diffusées en Google Ads : une allégation chiffrée fausse est
 * un motif de désapprobation (règle « déclarations trompeuses ») en plus du
 * risque DGCCRF. Tout montant affiché ici doit être sourcé officiellement.
 *
 * Corrections appliquées :
 *   - `isolation-aides` annonçait « 75 €/m² » pour l'ITE/ITI. FAUX depuis le
 *     01/01/2026 : l'isolation des murs est sortie du parcours par geste
 *     (également chaudières biomasse). Page recentrée sur combles / toiture /
 *     planchers bas, qui restent éligibles ; les murs sont renvoyés vers
 *     CEE / TVA 5,5 % / éco-PTZ / parcours accompagné. Cohérent avec le
 *     commit 78b1ef84 qui a corrigé les guides et le blog.
 *   - `aides-pac` annonçait « jusqu'à 11 000 € d'aides » avec un trust block
 *     « Aides cumulées max 2026 ». Ce chiffre est le forfait MPR géothermie
 *     ménages bleus, PAS un cumul, et PAS ce que cherche un internaute sur
 *     « aides pompe à chaleur » (intention = air/eau). Remplacé par le
 *     forfait air/eau ménage modeste 4 000 €, plafond de dépense 12 000 €,
 *     corroboré par economie.gouv.fr.
 *
 * Sources : anah.gouv.fr, france-renov.gouv.fr/aides/mpr, economie.gouv.fr
 * (parcours par geste), consultées le 2026-07-28. Guichet MPR rouvert le
 * 23/02/2026.
 *
 *   - `prime-cee` citait « jusqu'à 4 200 € » et nommait Effy, Sonergia et
 *     TotalEnergies comme « délégataires partenaires ». Deux problèmes :
 *     (a) le seed 387 classe ces trois acteurs en vague 1 = « cibles
 *     d'intégration immédiate », SIRET à NULL, PAS partenaires signés — et
 *     Effy est un concurrent direct ; (b) `forfaits-cee-2026.ts` marque tous
 *     les forfaits concernés UNVERIFIED et interdit explicitement de citer un
 *     montant. Une prime CEE n'est de toute façon pas un forfait réglementaire
 *     (kWh cumac × taux délégataire). Noms et montant retirés, promesse de
 *     versement « 30-60j » retirée (tunnel CEE partiellement en 501).
 *   - `audit-energetique` accolait l'aide MPR 500 € à l'audit RÉGLEMENTAIRE de
 *     vente. Or l'aide vise l'audit préalable aux travaux, « demandé avant le
 *     début des travaux » (France Rénov'). Un vendeur sans projet de travaux
 *     n'y a pas droit. Les deux audits sont désormais distingués et le montant
 *     non resourcé est retiré. Les dates et la validité 5 ans, elles, sont
 *     confirmées par ecologie.gouv.fr et conservées.
 *
 * Sources : anah.gouv.fr, france-renov.gouv.fr/aides/mpr, economie.gouv.fr
 * (parcours par geste), ecologie.gouv.fr (audit énergétique réglementaire),
 * consultées le 2026-07-28. Guichet MPR rouvert le 23/02/2026.
 *
 * NON VÉRIFIÉ / à ne pas réintroduire sans grille officielle : le forfait
 * géothermie 11 000 € (ménages bleus), les montants €/m² isolation, les
 * forfaits MPR Audit 500/400/300 € et tout montant CEE en euros. Le barème
 * interne `src/lib/aides/bareme-mpr-2026.ts` est un snapshot du 2026-04-15
 * ANTÉRIEUR à la réforme — ne pas s'en servir comme source pour ces pages.
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
  // Intention ÉQUIPEMENT (« je veux une pompe à chaleur »), à distinguer de
  // `aides-pac` qui cible l'intention AIDE (« quelles primes pour une PAC »).
  // Deux intentions, deux pages, deux groupes d'annonces — sinon les deux LP
  // se disputent les mêmes enchères et le message match s'effondre.
  //
  // Grounding paid : `docs/audit-ahrefs-2026-05-03/paid_intelligence_2026-05.csv`
  // — la page payante la mieux dotée d'Effy sur ce cluster est
  // `/lp/chauffage/pompe-a-chaleur/pompe-a-chaleur-air-eau-newform` (27 mots-clés
  // achetés), une LP équipement, pas une LP aides.
  //
  // Aucun montant affiché : sur cette intention, la promesse est le devis et
  // l'artisan certifié, pas un chiffre d'aide invérifiable (cf. revue YMYL).
  'pompe-a-chaleur': {
    slug: 'pompe-a-chaleur',
    serviceSlug: 'pompe-a-chaleur',
    h1: "Pompe à chaleur : devis gratuit d'un artisan RGE QualiPAC",
    subheadline:
      "Installation ou remplacement de chaudière par une pompe à chaleur air/eau, air/air ou géothermique. Comparez les devis d'artisans RGE QualiPAC certifiés près de chez vous, sans engagement.",
    ctaLabel: 'Recevoir mes devis PAC',
    trustBlocks: [
      { label: 'Artisans RGE QualiPAC', value: '49 000+' },
      { label: 'Réponse devis', value: '< 24h' },
      { label: 'Mise en relation', value: 'Gratuite' },
    ],
    kind: 'service',
    legalNote:
      "Mise en relation gratuite et sans engagement avec des artisans RGE QualiPAC en qualification active. Des aides (MaPrimeRénov', CEE) existent selon les revenus et l'équipement : la PAC air/air n'est pas éligible à MaPrimeRénov'.",
  },
  'aides-pac': {
    slug: 'aides-pac',
    serviceSlug: 'pompe-a-chaleur',
    h1: "Pompe à chaleur air/eau : MaPrimeRénov' + prime CEE 2026",
    subheadline:
      "MaPrimeRénov' jusqu'à 4 000 € pour un ménage modeste, dans la limite de 12 000 € de dépense éligible, cumulable avec la prime CEE. Devis gratuit, artisan RGE QualiPAC.",
    ctaLabel: 'Calculer mes aides PAC',
    trustBlocks: [
      { label: 'Artisans RGE QualiPAC', value: '49 000+' },
      { label: 'MPR air/eau, ménage modeste', value: '4 000 €' },
      { label: 'Réponse devis', value: '< 24h' },
    ],
    kind: 'government',
    maxAmountEur: 4000,
    legalNote:
      "Montant selon revenus et composition du foyer ; plafond de dépense éligible 12 000 €. PAC air/air non éligible à MaPrimeRénov'. Artisan RGE QualiPAC actif requis. Source : Anah / France Rénov' 2026.",
  },
  'prime-cee': {
    slug: 'prime-cee',
    serviceSlug: 'isolation-thermique',
    h1: 'Prime CEE 2026 : estimez votre montant avec un artisan RGE',
    subheadline:
      "La prime CEE finance vos travaux d'économie d'énergie : isolation, chauffage, ventilation. Montant calculé selon l'opération, la zone climatique et vos revenus, puis versé par un délégataire agréé.",
    ctaLabel: 'Estimer ma prime CEE',
    trustBlocks: [
      { label: 'Artisans RGE vérifiés', value: '49 000+' },
      { label: 'Opérations couvertes', value: 'BAR-EN / BAR-TH' },
      { label: 'Réponse devis', value: '< 24h' },
    ],
    kind: 'financial',
    legalNote:
      "Une prime CEE n'est pas un forfait réglementaire : elle dépend de l'opération (BAR-EN / BAR-TH), de la zone climatique, du volume de kWh cumac et des revenus. Son montant est arrêté par le délégataire. Artisan RGE actif requis à la signature.",
  },
  'isolation-aides': {
    slug: 'isolation-aides',
    serviceSlug: 'isolation-thermique',
    h1: 'Isolation combles et toiture : aides 2026 + artisan RGE',
    subheadline:
      "Combles, toiture et planchers bas restent éligibles à MaPrimeRénov' par geste en 2026, cumulable avec la prime CEE. Isolation des murs : CEE, TVA 5,5 % et éco-PTZ. Devis gratuit, artisan RGE Qualibat.",
    ctaLabel: 'Estimer mes aides isolation',
    trustBlocks: [
      { label: 'Artisans RGE Qualibat', value: '49 000+' },
      { label: 'TVA travaux de rénovation', value: '5,5 %' },
      { label: 'Réponse devis', value: '< 24h' },
    ],
    kind: 'government',
    legalNote:
      "Depuis le 01/01/2026, l'isolation des murs n'est plus financée par MaPrimeRénov' par geste : elle reste aidée via les CEE, la TVA 5,5 %, l'éco-PTZ ou le parcours accompagné. Source : Anah / France Rénov' 2026.",
  },
  'audit-energetique': {
    slug: 'audit-energetique',
    serviceSlug: 'renovation-energetique',
    h1: 'Audit énergétique : auditeur RGE certifié, devis en 24h',
    subheadline:
      'Audit réglementaire pour vendre un logement classé F, G ou E, ou audit préalable à des travaux de rénovation. Réalisé par un auditeur RGE OPQIBI 1905 ou Qualibat 8731. Validité 5 ans.',
    ctaLabel: 'Demander mon audit énergétique',
    trustBlocks: [
      { label: 'Auditeurs RGE certifiés', value: 'OPQIBI 1905' },
      { label: "Validité de l'audit", value: '5 ans' },
      { label: 'Réponse devis', value: '< 24h' },
    ],
    kind: 'service',
    legalNote:
      "Audit obligatoire à la vente : DPE F/G depuis le 01/04/2023, E depuis le 01/01/2025, D au 01/01/2034. L'aide MaPrimeRénov' Audit vise l'audit préalable aux travaux, demandé avant leur démarrage — pas l'audit de vente. Source : ecologie.gouv.fr.",
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
