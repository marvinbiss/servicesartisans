/**
 * Cron: Recalculate Review Metrics
 * Runs daily at 02:00 UTC (see vercel.json)
 *
 * Recalculates rating_average and review_count for all active providers.
 * The trigger on reviews (migration 014) handles real-time updates,
 * but this daily job ensures consistency and catches any missed updates.
 *
 * NOTE: trust_badge and trust_score columns were DROPPED in v2
 * (100_v2_schema_cleanup.sql). This cron now only updates:
 *   - rating_average (from reviews table)
 *   - review_count   (from reviews table)
 *
 * Hardening SLA-99.9 (2026-05-06) :
 *   - Lease anti-double-run via RPC `acquire_cron_lease` (mig 411) avec abort 5s
 *   - Wall-clock guard 50s : on sort de la boucle batch + on tente quand même
 *     les MV refresh si on a le budget (très court)
 *   - Release du lease en finally
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 200

// SLA-99.9 : wall-clock 50s sous Vercel maxDuration 60s.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_calculate_trust_badges'
const LEASE_TTL_SECONDS = 30 * 60

export const GET = withCronCheckIn('cron-calculate-trust-badges', async (request: Request) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { success: false, error: { message: 'Configuration Supabase manquante' } },
      { status: 500 }
    )
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // -- Auth ----------------------------------------------------------------
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[Cron] Unauthorized access attempt to calculate-trust-badges')
    return NextResponse.json(
      { success: false, error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('[Cron] calculate-trust-badges lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[Cron] calculate-trust-badges skipped (lease already held)', {
      lease: LEASE_NAME,
    })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    logger.info('[Cron] Starting review metrics recalculation')

    let totalUpdated = 0
    let totalErrors = 0
    let totalSkipped = 0
    let offset = 0
    let hasMore = true
    let capReached = false

    while (hasMore) {
      // SLA-99.9 : wall-clock guard.
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        capReached = true
        break
      }

      // Fetch active providers with their current metrics
      const { data: providers, error } = await supabase
        .from('providers')
        .select('id, rating_average, review_count')
        .eq('is_active', true)
        .range(offset, offset + BATCH_SIZE - 1)
        .order('id')

      if (error) {
        logger.error('[Cron] Error fetching providers:', error)
        totalErrors++
        break
      }

      if (!providers || providers.length === 0) {
        hasMore = false
        break
      }

      // Batch-fetch all reviews for this batch of providers (eliminates N+1)
      const providerIds = providers.map((p) => p.id).filter((id): id is string => !!id)

      if (providerIds.length === 0) {
        if (providers.length < BATCH_SIZE) {
          hasMore = false
        } else {
          offset += BATCH_SIZE
        }
        continue
      }

      // Single query instead of N queries
      const { data: allReviews, error: reviewError } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', providerIds)
        .eq('status', 'published')

      if (reviewError) {
        logger.error('[Cron] Error batch-fetching reviews:', reviewError)
        totalErrors++
      } else {
        // Group reviews by provider_id
        const reviewsByProvider = new Map<string, number[]>()
        for (const r of allReviews || []) {
          const existing = reviewsByProvider.get(r.provider_id) || []
          existing.push(r.rating || 0)
          reviewsByProvider.set(r.provider_id, existing)
        }

        // Prepare batch updates
        const updates: Promise<void>[] = []

        for (const provider of providers) {
          const ratings = reviewsByProvider.get(provider.id) || []
          const reviewCount = ratings.length
          const ratingAverage =
            reviewCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount : 0
          const roundedRating = Math.round(ratingAverage * 100) / 100

          // Skip update if nothing changed
          if (provider.rating_average === roundedRating && provider.review_count === reviewCount) {
            totalSkipped++
            continue
          }

          updates.push(
            Promise.resolve(
              supabase
                .from('providers')
                .update({ rating_average: roundedRating, review_count: reviewCount })
                .eq('id', provider.id)
            )
              .then(({ error: updateError }) => {
                if (updateError) {
                  totalErrors++
                  logger.error(`[Cron] Error updating provider ${provider.id}:`, updateError)
                } else {
                  totalUpdated++
                }
              })
              .catch((err) => {
                totalErrors++
                logger.error(`[Cron] Error processing provider ${provider.id}:`, err)
              })
          )
        }

        // Execute updates in parallel (batch of 50 max)
        const CONCURRENT_UPDATES = 50
        for (let i = 0; i < updates.length; i += CONCURRENT_UPDATES) {
          // SLA-99.9 : wall-clock guard fin-grain pour quitter au plus vite.
          if (Date.now() - startedAt > MAX_RUNTIME_MS) {
            capReached = true
            break
          }
          await Promise.allSettled(updates.slice(i, i + CONCURRENT_UPDATES))
        }
      }

      if (capReached) break
      if (providers.length < BATCH_SIZE) {
        hasMore = false
      } else {
        offset += BATCH_SIZE
      }
    }

    logger.info(
      `[Cron] Review metrics recalculation complete: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors${
        capReached ? ' (wall-clock cap reached)' : ''
      }`
    )

    // Refresh des vues matérialisées (uniquement si on a encore du budget).
    let mvRefreshed = false
    let reviewStatsDeptRefreshed = false

    if (Date.now() - startedAt < MAX_RUNTIME_MS) {
      try {
        const { error: mvError } = await supabase.rpc('refresh_provider_stats')
        if (mvError) {
          logger.error('[Cron] Failed to refresh mv_provider_stats:', mvError)
        } else {
          mvRefreshed = true
          logger.info('[Cron] mv_provider_stats refreshed successfully')
        }
      } catch (mvErr) {
        logger.error('[Cron] Exception refreshing mv_provider_stats:', mvErr)
      }
    }

    if (Date.now() - startedAt < MAX_RUNTIME_MS) {
      try {
        const { error: rvError } = await supabase.rpc('fn_refresh_review_stats')
        if (rvError) {
          logger.error('[Cron] Failed to refresh review_stats_by_dept:', rvError)
        } else {
          reviewStatsDeptRefreshed = true
          logger.info('[Cron] review_stats_by_dept refreshed successfully')
        }
      } catch (rvErr) {
        logger.error('[Cron] Exception refreshing review_stats_by_dept:', rvErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Review metrics recalculated',
      updated: totalUpdated,
      skipped: totalSkipped,
      errors: totalErrors,
      mvRefreshed,
      reviewStatsDeptRefreshed,
      cap_reached: capReached,
      duration_ms: Date.now() - startedAt,
    })
  } catch (error) {
    logger.error('[Cron] Error in calculate-trust-badges:', error)
    return NextResponse.json(
      { success: false, error: { message: "Erreur lors du recalcul des métriques d'avis" } },
      { status: 500 }
    )
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
