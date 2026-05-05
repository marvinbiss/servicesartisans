/**
 * Fonctions serveur pour récupérer les vraies statistiques depuis Supabase
 * Utilisées dans les pages SSR/ISR — NE PAS importer dans des composants client
 *
 * Les fonctions sont wrappées avec unstable_cache pour garantir le CDN caching.
 * Sans ce wrapper, les appels Supabase (fetch tiers) contournent le cache Next.js
 * et forcent un rendu dynamique sur chaque requête.
 */

import { unstable_cache } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

const IS_BUILD = process.env.NEXT_BUILD_SKIP_DB === '1' && !process.env.NEXT_PUBLIC_SUPABASE_URL

/**
 * Nombre total d'artisans RGE actifs dans la base.
 * 2026-05-05 pivot full RGE — comptait tous providers actifs avant.
 */
async function _getProviderCount(): Promise<number> {
  try {
    const supabase = createAdminClient()
    const todayIso = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('rge_qualifications', 'is', null)
      .gte('rge_valid_until', todayIso)
    return count ?? 0
  } catch {
    return 0
  }
}

export const getProviderCount = unstable_cache(_getProviderCount, ['provider-count'], {
  revalidate: 3600, // 1h — aligné sur le revalidate du root layout
  tags: ['providers'],
})

/**
 * Nombre d'artisans RGE actifs dans une région (par nom de région).
 * 2026-05-05 pivot full RGE — default `rgeOnly: true`.
 */
export async function getProviderCountByRegion(
  regionName: string,
  options: { rgeOnly?: boolean } = {}
): Promise<number> {
  // Fail open at build: default to indexed. ISR will correct with real DB data.
  if (IS_BUILD) return 1
  const rgeOnly = options.rgeOnly ?? true
  try {
    const supabase = createAdminClient()
    const todayIso = new Date().toISOString().slice(0, 10)
    let query = supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('address_region', regionName)
    if (rgeOnly) {
      query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
    }
    const { count } = await query
    return count ?? 0
  } catch {
    return 1 // Fail open: default to indexed. ISR will correct with real DB data.
  }
}

/**
 * Nombre d'artisans RGE actifs dans un département.
 * `deptCode` = CODE INSEE 2-3 chars ('75', '69', '2A'). DB stocke le code,
 * pas le nom — bug fixé 2026-05-05.
 * 2026-05-05 pivot full RGE — default `rgeOnly: true`.
 */
export async function getProviderCountByDepartment(
  deptCode: string,
  options: { rgeOnly?: boolean } = {}
): Promise<number> {
  // Fail open at build: default to indexed. ISR will correct with real DB data.
  if (IS_BUILD) return 1
  const rgeOnly = options.rgeOnly ?? true
  try {
    const supabase = createAdminClient()
    const todayIso = new Date().toISOString().slice(0, 10)
    let query = supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('address_department', deptCode)
    if (rgeOnly) {
      query = query.not('rge_qualifications', 'is', null).gte('rge_valid_until', todayIso)
    }
    const { count } = await query
    return count ?? 0
  } catch {
    return 1 // Fail open: default to indexed. ISR will correct with real DB data.
  }
}

/** Formate un nombre d'artisans pour l'affichage (ex: 12 450) */
export function formatProviderCount(count: number): string {
  return count.toLocaleString('fr-FR')
}

export interface SiteStats {
  artisanCount: number
  reviewCount: number
  avgRating: number
  deptCount: number
}

// ── Homepage-specific types ──────────────────────────────────────
export interface HomepageProvider {
  name: string
  slug: string
  specialty: string | null
  address_city: string | null
  address_postal_code: string | null
  is_verified: boolean
  rating_average: number | null
  review_count: number | null
  stable_id: string | null
}

export interface HomepageReview {
  author_name: string | null
  rating: number
  content: string | null
  created_at: string
}

export interface HomepageData extends SiteStats {
  serviceCounts: Record<string, number>
  topProviders: HomepageProvider[]
  recentReviews: HomepageReview[]
}

/**
 * Toutes les stats du site en un seul appel (pour la homepage).
 *
 * 2026-05-05 — wrappé `unstable_cache` (revalidate 1h) car l'absence de cache
 * faisait rejouer 4 count-queries sur `providers` (970K rows) à chaque cold
 * ISR de la homepage. LCP cold = 9.6s observé en Lighthouse prod.
 */
async function _getSiteStats(): Promise<SiteStats> {
  try {
    const supabase = createAdminClient()
    const todayIso = new Date().toISOString().slice(0, 10)

    // 2026-05-05 pivot full RGE — artisanCount = artisans RGE actifs uniquement
    // (non plus tous providers actifs). Aligne homepage TrustBar + barometres
    // sur le positionnement "annuaire 100% RGE certifiés".
    const [providerRes, reviewCountRes, ratingsRes, deptRes] = await Promise.all([
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', todayIso),
      supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('reviews').select('rating').eq('status', 'published').limit(500),
      supabase
        .from('communes')
        .select('departement_code')
        .gt('provider_count', 0)
        .not('departement_code', 'is', null)
        .limit(10000),
    ])

    const artisanCount = providerRes.count ?? 0
    const reviewCount = reviewCountRes.count ?? 0

    let avgRating = 4.9
    if (ratingsRes.data && ratingsRes.data.length >= 5) {
      const sum = ratingsRes.data.reduce((acc, r) => acc + (r.rating ?? 0), 0)
      const computed = Math.round((sum / ratingsRes.data.length) * 10) / 10
      if (computed >= 1 && computed <= 5) avgRating = computed
    }

    const depts = new Set(deptRes.data?.map((c) => c.departement_code).filter(Boolean))
    const deptCount = depts.size || 96

    return { artisanCount, reviewCount, avgRating, deptCount }
  } catch {
    return { artisanCount: 0, reviewCount: 0, avgRating: 4.9, deptCount: 96 }
  }
}

export const getSiteStats = unstable_cache(_getSiteStats, ['site-stats'], {
  revalidate: 3600,
  tags: ['providers', 'reviews'],
})

// Pivot full RGE 2026-05-03 : serrurier retiré (commodity hors RGE) — homepage
// met désormais en avant 8 métiers RGE-canonical (catalog SSoT).
const HOMEPAGE_SERVICE_SLUGS = [
  'plombier',
  'electricien',
  'chauffagiste',
  'peintre-en-batiment',
  'menuisier',
  'macon',
  'pompe-a-chaleur',
  'isolation-thermique',
]

/**
 * Données complètes pour la homepage : stats + providers + avis + compteurs.
 *
 * 2026-05-05 — wrappé `unstable_cache` 1h. La query `serviceCounts` pull TOUS
 * les rows providers matchant les 8 slugs (potentiellement 200K+) juste pour
 * faire un .reduce en JS — on conserve la logique tant qu'on n'a pas un index
 * dédié, mais on amortit le coût sur 1h via le cache.
 */
async function _getHomepageData(): Promise<HomepageData> {
  const stats = await getSiteStats()

  if (IS_BUILD) {
    return { ...stats, serviceCounts: {}, topProviders: [], recentReviews: [] }
  }

  try {
    const supabase = createAdminClient()

    const todayIso = new Date().toISOString().slice(0, 10)

    const [countsResults, providersRes, reviewsRes] = await Promise.all([
      // 2026-05-05 — passé de SELECT-rows-and-reduce (200K rows ~3s) à 8
      // HEAD-count parallèles (~50ms total, indexed). Le résultat est cached
      // 1h via unstable_cache.
      // 2026-05-05 pivot full RGE — counts homepage filtrés RGE-only.
      Promise.all(
        HOMEPAGE_SERVICE_SLUGS.map((slug) =>
          supabase
            .from('providers')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .eq('specialty', slug)
            .not('rge_qualifications', 'is', null)
            .gte('rge_valid_until', todayIso)
            .then(({ count }) => [slug, count ?? 0] as [string, number])
        )
      ),
      // 2026-05-05 pivot full RGE — topProviders homepage = RGE certifiés only.
      supabase
        .from('providers')
        .select(
          'name, slug, specialty, address_city, address_postal_code, is_verified, rating_average, review_count, stable_id'
        )
        .eq('is_active', true)
        .eq('is_verified', true)
        .not('rating_average', 'is', null)
        .not('address_city', 'is', null)
        .not('specialty', 'is', null)
        .not('rge_qualifications', 'is', null)
        .gte('rge_valid_until', todayIso)
        .gt('review_count', 2)
        .lt('review_count', 500)
        .gte('rating_average', 4)
        .order('review_count', { ascending: false })
        .order('rating_average', { ascending: false })
        .limit(3),
      supabase
        .from('reviews')
        .select('author_name, rating, content, created_at')
        .eq('status', 'published')
        .not('content', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const serviceCounts: Record<string, number> = {}
    for (const [slug, count] of countsResults) {
      serviceCounts[slug] = count
    }

    return {
      ...stats,
      serviceCounts,
      topProviders: (providersRes.data ?? []) as HomepageProvider[],
      recentReviews: (reviewsRes.data ?? []) as HomepageReview[],
    }
  } catch {
    return { ...stats, serviceCounts: {}, topProviders: [], recentReviews: [] }
  }
}

export const getHomepageData = unstable_cache(_getHomepageData, ['homepage-data'], {
  revalidate: 3600,
  tags: ['providers', 'reviews'],
})
