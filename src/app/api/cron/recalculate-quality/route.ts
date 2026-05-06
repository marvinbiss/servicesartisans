/**
 * Cron: Recalculate Data Quality Scores
 * Runs daily at 04:00 UTC (see vercel.json)
 *
 * Recalculates data_quality_score for providers whose data has changed
 * since their last score calculation. Uses batch SQL updates for efficiency.
 *
 * Hardening SLA-99.9 (2026-05-06) :
 *   - Auth timing-safe (verifyCronSecret)
 *   - Lease anti-double-run via RPC `acquire_cron_lease` (mig 411)
 *     avec abort 5s pour ne jamais bloquer le run sur DB lente
 *   - Wall-clock guard 50s : on sort proprement de la boucle batch
 *     plutôt que de risquer un kill Vercel sans release du lease
 *   - Release du lease en finally (best-effort, TTL 30 min en filet)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'

const BATCH_SIZE = 500
const UPDATE_CHUNK_SIZE = 50

// SLA-99.9 : wall-clock guard. Vercel maxDuration = 60s ; on s'arrête à 50s
// pour avoir le temps d'appeler release_cron_lease avant kill.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_recalculate_quality'
const LEASE_TTL_SECONDS = 30 * 60

/**
 * Calculate data quality score for a provider record (0-100).
 * Mirrors the formula in scripts/lib/data-quality.ts.
 */
function calculateQualityScore(provider: Record<string, unknown>): {
  score: number
  flags: string[]
} {
  let score = 0
  const flags: string[] = []

  // Identity (30 points)
  if (provider.name) score += 10
  else flags.push('missing_name')
  if (provider.siren) score += 10
  else flags.push('missing_siren')
  if (provider.siret) score += 10
  else flags.push('missing_siret')

  // Address (25 points)
  if (provider.address_street) score += 5
  else flags.push('missing_street')
  if (provider.address_city) score += 5
  else flags.push('missing_city')
  if (provider.address_postal_code) score += 5
  else flags.push('missing_postal_code')
  if (provider.address_department) score += 5
  else flags.push('missing_department')
  if (provider.latitude && provider.longitude) score += 5
  else flags.push('missing_gps')

  // Contact (15 points)
  if (provider.phone) score += 10
  else flags.push('missing_phone')
  if (provider.email) score += 5
  else flags.push('missing_email')

  // Business info (10 points)
  if (provider.specialty) score += 10
  else flags.push('missing_specialty')

  // Extras (5 points)
  if (provider.description) score += 5

  return { score: Math.min(100, score), flags }
}

export const GET = withCronCheckIn('cron-recalculate-quality', async (request: Request) => {
  // -- Auth ---------------------------------------------------------------
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[Cron] Unauthorized access attempt to recalculate-quality')
    return NextResponse.json(
      { success: false, error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s pour ne pas bloquer si DB stalle.
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
    logger.error('[Cron] recalculate-quality lease acquisition failed', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }

  if (acquired !== true) {
    logger.info('[Cron] recalculate-quality skipped (lease already held)', {
      lease: LEASE_NAME,
    })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    logger.info('[Cron] Starting data quality score recalculation')

    let totalUpdated = 0
    let totalErrors = 0
    let offset = 0
    let hasMore = true
    let capReached = false

    while (hasMore) {
      // SLA-99.9 : wall-clock guard avant chaque batch (le plus coûteux).
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        capReached = true
        break
      }

      // Fetch active providers for quality score calculation
      const { data: providers, error } = await supabase
        .from('providers')
        .select(
          'id, name, siren, siret, address_street, address_city, address_postal_code, address_department, latitude, longitude, phone, email, specialty, description, updated_at'
        )
        .eq('is_active', true)
        .range(offset, offset + BATCH_SIZE - 1)
        .order('id')

      if (error) {
        logger.error('[Cron] Error fetching providers for quality recalc:', error)
        totalErrors++
        break
      }

      if (!providers || providers.length === 0) {
        hasMore = false
        break
      }

      // Calculate scores in memory first, then batch-update in parallel chunks
      const updates = providers.map((provider) => {
        const { score, flags } = calculateQualityScore(provider)
        return { id: provider.id, score, flags }
      })

      // Process updates in chunks of UPDATE_CHUNK_SIZE, parallelized within each chunk
      for (let i = 0; i < updates.length; i += UPDATE_CHUNK_SIZE) {
        // SLA-99.9 : wall-clock guard fin-grain pour quitter au plus vite.
        if (Date.now() - startedAt > MAX_RUNTIME_MS) {
          capReached = true
          break
        }
        const chunk = updates.slice(i, i + UPDATE_CHUNK_SIZE)

        const results = await Promise.all(
          chunk.map((u) =>
            supabase
              .from('providers')
              .update({
                data_quality_score: u.score,
                data_quality_flags: u.flags,
              })
              .eq('id', u.id)
              .then(({ error: updateError }) => ({
                id: u.id,
                score: u.score,
                flags: u.flags,
                updateError,
              }))
          )
        )

        for (const result of results) {
          if (result.updateError) {
            logger.error(
              `[Cron] Failed to update quality score for provider ${result.id}:`,
              result.updateError
            )
            totalErrors++
          } else {
            totalUpdated++
          }
        }
      }

      logger.info(`[Cron] Batch processed: ${updates.length} providers (offset=${offset})`)

      if (capReached) break
      if (providers.length < BATCH_SIZE) {
        hasMore = false
      } else {
        offset += BATCH_SIZE
      }
    }

    logger.info(
      `[Cron] Data quality recalculation complete: ${totalUpdated} updated, ${totalErrors} errors${
        capReached ? ' (wall-clock cap reached)' : ''
      }`
    )

    return NextResponse.json({
      success: true,
      message: 'Data quality scores recalculated',
      updated: totalUpdated,
      errors: totalErrors,
      cap_reached: capReached,
      duration_ms: Date.now() - startedAt,
    })
  } catch (error) {
    logger.error('[Cron] Error in recalculate-quality:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors du recalcul des scores de qualité' } },
      { status: 500 }
    )
  } finally {
    // SLA-99.9 : release best-effort. Lease expire naturellement au TTL.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
