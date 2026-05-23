/**
 * Cron : ré-affecte les leads laissés en `declined` ou en `pending` au-delà
 * de `algorithm_config.auto_reassign_hours` (default 24h).
 *
 * Audit 2026-04-25 (agent #5 BLOCKER) : `algorithm_config.auto_reassign_hours`
 * existait depuis migration 303 mais aucun job ne le consommait. Les leads
 * déclinés étaient orphelins, et avec ~0 artisans qui acceptent aujourd'hui,
 * chaque lead mourait silencieusement.
 *
 * Stratégie :
 *   - on cherche les `lead_assignments` `declined` ou `pending` plus vieux
 *     que la fenêtre de réassignation
 *   - pour chaque `lead_id` distinct, on appelle `dispatchLead(lead_id)` qui
 *     est idempotent (si déjà ré-assigné, le RPC retourne les assignations
 *     existantes — cf. mig 462:83-91).
 *
 * Schedule : toutes les 4h (cf. vercel.json), aligné sur la default
 * auto_reassign_hours = 24h.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { dispatchLead } from '@/app/actions/dispatch'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// SLA-99.9 : lease anti-double-run (release best-effort en finally, TTL filet).
const LEASE_NAME = 'cron_lead_reassign'
const LEASE_TTL_SECONDS = 15 * 60

export const GET = withCronCheckIn('cron-lead-reassign', async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[lead-reassign] Unauthorized')
    return NextResponse.json(
      { success: false, error: { message: 'Non autorisé' } },
      { status: 401 }
    )
  }

  const admin = createAdminClient()
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await admin
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
    logger.error('[lead-reassign] lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[lead-reassign] skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    // Fenêtre de ré-assignation depuis algorithm_config (default 24h).
    const { data: cfg } = await admin
      .from('algorithm_config')
      .select('auto_reassign_hours')
      .limit(1)
      .maybeSingle()
    const reassignHours = (cfg?.auto_reassign_hours as number | undefined) ?? 24
    const cutoff = new Date(Date.now() - reassignHours * 3_600_000).toISOString()

    const { data: stale, error } = await admin
      .from('lead_assignments')
      .select('lead_id, status, assigned_at, source_table')
      .in('status', ['declined', 'pending'])
      .lt('assigned_at', cutoff)
      .order('assigned_at', { ascending: true })
      .limit(200)

    if (error) {
      logger.error('[lead-reassign] query failed', error)
      captureError(error, {
        tags: { route: 'cron/lead-reassign', step: 'query', critical: 'true' },
      })
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!stale || stale.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No leads to reassign',
        reassignHours,
        durationMs: Date.now() - startedAt,
      })
    }

    // Dedup par lead_id (un lead peut avoir plusieurs assignments)
    const uniqueLeads = Array.from(
      new Map(
        stale.map((row) => [row.lead_id as string, (row.source_table as string | null) ?? null])
      ).entries()
    )

    let succeeded = 0
    let failed = 0

    for (const [leadId, sourceTable] of uniqueLeads) {
      try {
        const result = await dispatchLead(leadId, {
          sourceTable: (sourceTable as 'devis_requests' | 'leads') || 'devis_requests',
        })
        if (result.length === 0) {
          // Pas un échec — peut-être plus aucun artisan éligible.
          logger.info('[lead-reassign] no eligible providers', { leadId })
        }
        succeeded++
      } catch (err) {
        failed++
        logger.error('[lead-reassign] dispatch failed', err as Error, { leadId })
        captureError(err, {
          tags: { route: 'cron/lead-reassign', step: 'dispatch', critical: 'true' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      reassignHours,
      uniqueLeads: uniqueLeads.length,
      succeeded,
      failed,
      durationMs: Date.now() - startedAt,
    })
  } catch (err) {
    logger.error('[lead-reassign] fatal', err as Error)
    captureError(err, {
      tags: { route: 'cron/lead-reassign', step: 'fatal', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'fatal' },
      { status: 500 }
    )
  } finally {
    // SLA-99.9 : release best-effort.
    try {
      await admin.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
