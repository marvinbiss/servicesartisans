import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { getReviewStatsByDept, SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'

/**
 * Mini-badge social proof (★ + count sous H1, 6 templates pSEO).
 *
 * Source unique de vérité : table `reviews` (status=published) jointe sur
 * `providers` (is_active=true). Helpers backed by :
 *   - `review_stats_by_dept` (materialized view, mig 423) pour (service × dept).
 *   - `get_aggregate_rating_by_specialties` RPC (mig 529) pour cluster national.
 *   - `get_aggregate_rating_global` RPC (mig 529) pour commune-level (pas de service).
 *
 * Anti-fake (memory `feedback_legal_data_quality.md` + Google rich-snippet abuse) :
 *   - Si count < 3 → retourne `null` (le composant SocialProofBadge skip déjà
 *     mais on filtre aussi côté serveur pour économiser le rendu).
 *   - Jamais de moyenne inventée. Pas d'agrégat Google Places ici (le badge
 *     page-level reste first-party uniquement ; le fallback Google est réservé
 *     au schema JSON-LD par-artisan, cf. `buildAggregateRatingFromProviders`).
 */

export type SocialProof = {
  average: number
  count: number
  label: string
}

const MIN_COUNT = 3

function isUsable(avg: unknown, count: unknown): { avg: number; count: number } | null {
  const a = typeof avg === 'string' ? Number(avg) : (avg as number)
  const c = typeof count === 'string' ? Number(count) : (count as number)
  if (!Number.isFinite(a) || !Number.isFinite(c)) return null
  if (c < MIN_COUNT) return null
  if (a <= 0 || a > 5) return null
  return { avg: a, count: c }
}

/**
 * (service × dept) → badge dept-level "X avis vérifiés en {dept}".
 * Fallback automatique national si la combinaison n'a pas assez de reviews.
 */
export async function getSocialProofForService(
  serviceSlug: string,
  ville?: { dept_code?: string | null; dept_name?: string | null } | null
): Promise<SocialProof | null> {
  // 1) Tentative dept-level via materialized view (rapide, déjà cachée)
  const deptCode = ville?.dept_code?.trim()
  if (deptCode) {
    try {
      const stats = await getReviewStatsByDept(serviceSlug, deptCode)
      const usable = isUsable(stats?.avg_rating, stats?.review_count)
      if (usable) {
        const where = ville?.dept_name ? ` en ${ville.dept_name}` : ''
        return {
          average: usable.avg,
          count: usable.count,
          label: `avis vérifiés${where}`,
        }
      }
    } catch (err) {
      logger.warn('social_proof.dept_lookup_failed', {
        serviceSlug,
        deptCode,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // 2) Fallback national filtré par spécialités du service
  return getSocialProofForCluster([serviceSlug])
}

/**
 * Cluster-level (un ou plusieurs services). Utilisé par
 * /renovation-energetique/[cluster], /cee/[operation], /cee/[op]/[ville].
 */
export async function getSocialProofForCluster(
  serviceSlugs: readonly string[]
): Promise<SocialProof | null> {
  const specialties = Array.from(
    new Set(
      serviceSlugs
        .flatMap((slug) => SERVICE_TO_SPECIALTIES[slug] ?? [])
        .filter((s): s is string => !!s)
    )
  )
  if (specialties.length === 0) {
    // Cluster sans mapping spécialité connu → fallback national global.
    return getSocialProofGlobal('avis vérifiés en France')
  }

  const cacheKey = `social-proof:cluster:${specialties.sort().join(',')}`
  return getCachedData(
    cacheKey,
    async () => {
      try {
        const admin = createAdminClient()
        const { data, error } = await admin.rpc('get_aggregate_rating_by_specialties', {
          p_specialties: specialties,
        })
        if (error) {
          logger.warn('social_proof.cluster_rpc_failed', { specialties, error: error.message })
          return null
        }
        // RPC returns TABLE (avg_rating, review_count) — Supabase wraps it as array
        const row = Array.isArray(data) ? data[0] : data
        const usable = isUsable(row?.avg_rating, row?.review_count)
        if (!usable) return null
        return {
          average: usable.avg,
          count: usable.count,
          label: 'avis vérifiés en France',
        }
      } catch (err) {
        logger.warn('social_proof.cluster_exception', {
          specialties,
          error: err instanceof Error ? err.message : String(err),
        })
        return null
      }
    },
    CACHE_TTL.artisans,
    { skipNull: true }
  )
}

/**
 * Global (tous artisans). Commune-level ou hub global.
 */
export async function getSocialProofGlobal(label = 'avis vérifiés'): Promise<SocialProof | null> {
  const cacheKey = `social-proof:global`
  const proof = await getCachedData(
    cacheKey,
    async () => {
      try {
        const admin = createAdminClient()
        const { data, error } = await admin.rpc('get_aggregate_rating_global')
        if (error) {
          logger.warn('social_proof.global_rpc_failed', { error: error.message })
          return null
        }
        const row = Array.isArray(data) ? data[0] : data
        const usable = isUsable(row?.avg_rating, row?.review_count)
        if (!usable) return null
        return { average: usable.avg, count: usable.count, label: 'avis vérifiés' }
      } catch (err) {
        logger.warn('social_proof.global_exception', {
          error: err instanceof Error ? err.message : String(err),
        })
        return null
      }
    },
    CACHE_TTL.artisans,
    { skipNull: true }
  )
  if (!proof) return null
  return { ...proof, label }
}
