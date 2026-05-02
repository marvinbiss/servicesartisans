/**
 * Allocation tiered des combos /services/[s]/[v] — Stratégie 140K vague 2 #6.
 *
 * Voir docs/strategy-140k-2026-04-29.md.
 *
 * ## Phase A — signal Google non-destructif (toujours actif)
 * Le sitemap émet `priority` différencié par tier, ce qui pousse Googlebot à
 * prioriser le crawl des Tier A et raréfier celui des Tier C — sans rien
 * couper du sitemap. Effet attendu : recrawl Tier A ×2 plus rapide, Tier C ×0.5.
 *
 *   - Tier A (12 métiers haute demande) → priority 0.9
 *   - Tier B (18 métiers moyenne)       → priority 0.7
 *   - Tier C (vide depuis pivot RGE)    → priority 0.4
 *
 * ## Phase B — coupe destructive (vague α nettoyage 2026-05-02, ON par défaut)
 * Allocation cible ~33 000 URLs (vs ~68 000 historique = -35K kill) :
 *   - Tier A × 2 000 villes (top pop)  = 24 000
 *   - Tier B × 500 villes              =  9 000
 *   - Tier C × 0 (vide pivot RGE)      =      0
 *
 * Initialement bloquée "jusqu'à G3 (top 1000 pages clics GSC 90j)" pour filet
 * "≥1 clic = épargné". Le pivot RGE 2026-05-01 a vidé Tier C (16 métiers niche
 * supprimés de france.ts) → le risque résiduel se limite aux combos Tier B
 * × villes hors top 500. Estimation pessimiste : <2 % du trafic SEO actuel
 * vient de combos Tier B + ville rang 500-2267 (audit GSC 30/04, mémoire
 * `servicesartisans-gsc-diagnostic-2026-04-30.md`).
 *
 * Pour rollback urgence : `SA_DISABLE_SERVICES_TIERED=1` désactive la coupe
 * et restaure le sitemap full ~68K URLs.
 *
 * Edge runtime safe — Sets en mémoire, lookup O(1), zéro I/O.
 */

import { villes, services } from '@/lib/data/france'

export type ServiceTier = 'A' | 'B' | 'C'

/** Tier A — 12 métiers haute demande (Ahrefs vol search > 5K/mois). */
export const TIER_A_SERVICES: ReadonlySet<string> = new Set([
  'plombier',
  'electricien',
  'chauffagiste',
  'peintre-en-batiment',
  'serrurier',
  'couvreur',
  'menuisier',
  'macon',
  'carreleur',
  'vitrier',
  'climaticien',
  'ramoneur',
])

/** Tier B — 18 métiers moyenne demande (vol search 500-5K/mois) + cluster RGE. */
export const TIER_B_SERVICES: ReadonlySet<string> = new Set([
  'jardinier',
  'paysagiste',
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'renovation-energetique',
  'borne-recharge',
  'charpentier',
  'zingueur',
  'etancheiste',
  'facadier',
  'platrier',
  'salle-de-bain',
  'cuisiniste',
  'alarme-securite',
  'demenageur',
  'nettoyage',
  'diagnostiqueur',
])

/**
 * Tier C — vide depuis pivot RGE 2026-05-01.
 * Les 16 métiers niche (solier, terrassier, métallier, ferronnier,
 * poseur-de-parquet, miroitier, storiste, architecte-interieur,
 * decorateur, domoticien, pisciniste, antenniste, ascensoriste,
 * geometre, desinsectisation, deratisation) ont été supprimés du
 * catalogue : zéro overlap RGE/CEE, faible volume search, focus
 * stratégique sur la rénovation énergétique.
 */
export const TIER_C_SERVICES: ReadonlySet<string> = new Set([])

const TIER_A_PRIORITY = 0.9
const TIER_B_PRIORITY = 0.7
const TIER_C_PRIORITY = 0.4

/** Allocation villes par tier (Phase B). */
const TIER_A_CITY_COUNT = 2_000
const TIER_B_CITY_COUNT = 500
const TIER_C_CITY_COUNT = 200

const tierACitiesSet: ReadonlySet<string> = new Set(
  villes.slice(0, TIER_A_CITY_COUNT).map((v) => v.slug)
)
const tierBCitiesSet: ReadonlySet<string> = new Set(
  villes.slice(0, TIER_B_CITY_COUNT).map((v) => v.slug)
)
const tierCCitiesSet: ReadonlySet<string> = new Set(
  villes.slice(0, TIER_C_CITY_COUNT).map((v) => v.slug)
)

/**
 * Retourne le tier d'un service. Tout slug inconnu fallback sur Tier C
 * (priorité basse, sans casser).
 */
export function getServiceTier(serviceSlug: string): ServiceTier {
  if (TIER_A_SERVICES.has(serviceSlug)) return 'A'
  if (TIER_B_SERVICES.has(serviceSlug)) return 'B'
  return 'C'
}

/**
 * Phase A — priority sitemap par tier.
 * Émis sur tous les combos sans coupe : signal soft à Googlebot.
 */
export function getServiceCityPriority(serviceSlug: string): number {
  switch (getServiceTier(serviceSlug)) {
    case 'A':
      return TIER_A_PRIORITY
    case 'B':
      return TIER_B_PRIORITY
    case 'C':
      return TIER_C_PRIORITY
  }
}

/**
 * Phase B — combo (service, ville) éligible à l'index post-coupe.
 * GATE ON par défaut depuis vague α nettoyage 2026-05-02 (sitemap allégé
 * de 68K → 33K URLs). Pour rollback urgence : `SA_DISABLE_SERVICES_TIERED=1`
 * restaure le comportement full.
 *
 * Comportement coupe : les combos hors allocation tiered sont retirés du
 * sitemap. Côté page `/services/[s]/[v]` : la mécanique fail-open noindex
 * existante (count=0 + dept-fallback < 3 → robots:noindex) catches les
 * pages exclues qui resteraient accessibles via URL directe.
 */
export function isServiceVilleIndexable(serviceSlug: string, villeSlug: string): boolean {
  // Rollback escape hatch : SA_DISABLE_SERVICES_TIERED=1 désactive la coupe.
  if (process.env.SA_DISABLE_SERVICES_TIERED === '1') return true
  switch (getServiceTier(serviceSlug)) {
    case 'A':
      return tierACitiesSet.has(villeSlug)
    case 'B':
      return tierBCitiesSet.has(villeSlug)
    case 'C':
      return tierCCitiesSet.has(villeSlug)
  }
}

/**
 * Audit cohérence : tous les services france.ts doivent appartenir à exactement
 * 1 tier (ABC partition). Throw au boot si la liste services bouge sans MAJ
 * de l'allocation. Appelé par le sitemap au build.
 */
export function assertTierPartitionCoverage(): void {
  const allTiered = new Set([
    ...Array.from(TIER_A_SERVICES),
    ...Array.from(TIER_B_SERVICES),
    ...Array.from(TIER_C_SERVICES),
  ])
  const slugs = services.map((s) => s.slug)
  const missing = slugs.filter((s) => !allTiered.has(s))
  if (missing.length > 0) {
    throw new Error(
      `services-tiers.ts: missing tier assignment for: ${missing.join(', ')}. ` +
        `Add to TIER_A/B/C_SERVICES in src/lib/seo/services-tiers.ts.`
    )
  }
  // Detect double-assignment
  for (const slug of slugs) {
    const inA = TIER_A_SERVICES.has(slug)
    const inB = TIER_B_SERVICES.has(slug)
    const inC = TIER_C_SERVICES.has(slug)
    const count = (inA ? 1 : 0) + (inB ? 1 : 0) + (inC ? 1 : 0)
    if (count > 1) {
      throw new Error(`services-tiers.ts: ${slug} in multiple tiers (A=${inA} B=${inB} C=${inC})`)
    }
  }
}
