/**
 * Sitemap constants — single source of truth.
 *
 * Shared by:
 *   - src/app/sitemap.ts              (static sitemaps generation)
 *   - src/app/api/sitemap-index/route.ts (sitemap index XML)
 *   - src/app/api/sitemap-providers/route.ts (dynamic provider sitemaps)
 *
 * Google recommends ≤30K URLs per sitemap file for optimal processing (2-day turnaround).
 * See: SEO Programmatique Playbook 2025-2026, §3 (Eleni Tarantou case study, 14M pages).
 */

/** Batch size for intent pages (devis, urgence, tarifs, avis, problemes × city) */
export const STATIC_BATCH = 10_000

/** Batch size for large sitemaps (service×city, dept×service, tarifs-task×city) */
export const LARGE_BATCH = 25_000

/** Batch size for provider sitemaps (DB-dependent, served via API route) */
export const PROVIDER_BATCH_SIZE = 5_000

/** Cap on provider sitemaps to avoid declaring hundreds of broken sitemaps */
export const MAX_PROVIDER_SITEMAPS = 20

/**
 * City counts for sitemap generation — tiered strategy.
 *
 * Tier 1 pages (service×ville, devis, tarifs, urgence) = contenu le plus riche
 * (25-50 data points uniques/page) → full scale, toutes les villes.
 *
 * Tier 2 pages (tarifs-tâche, avis, problèmes) = plus template-like
 * → top 500 villes seulement, pour éviter de diluer le ratio d'indexation
 * pendant que Google évalue la qualité du site (HCU site-level signal).
 *
 * Quand le ratio d'indexation Tier 1 dépassera 30-40%, scaler Tier 2 au full.
 *
 * Total: ~742K URLs.
 */
export const SITEMAP_CITY_COUNT = 2_267
export const SITEMAP_CITY_COUNT_TIER2 = 500
