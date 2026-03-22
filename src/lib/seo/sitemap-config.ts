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

/** Phase 1: submit only top-N cities for new domain (conservative crawl budget) */
export const TOP_CITIES_PHASE1 = 300
