/**
 * Cron : exécute les suppressions GDPR programmées dont la date est échue.
 *
 * Audit 2026-04-25 (agent #3 BLOCKER) : auparavant, `/api/gdpr/delete` posait
 * `scheduled_deletion_at = now() + 30j` mais aucun job ne reprenait ces rows
 * pour exécuter la suppression réelle. La promesse RGPD vis-à-vis du user
 * (« vos données seront supprimées dans 30 jours ») était fausse.
 *
 * Ce cron tourne quotidiennement à 04:00 UTC (cf vercel.json) et :
 *   1. récupère les rows `deletion_requests` `scheduled` dont
 *      `scheduled_deletion_at <= now()`
 *   2. appelle le service GDPR `adminDeleteUserData(user_id)` qui anonymise
 *      les profils + bookings + reviews
 *   3. flippe la row en `completed`
 *   4. trace dans `audit_logs` (immutable trail Art. 5.2 RGPD).
 *
 * Erreurs : la row reste `scheduled` et sera retentée au prochain run.
 * Sentry monitor + heartbeat pour observabilité (agent #7 H1).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { adminDeleteUserData } from '@/lib/services/gdpr-service'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// SLA-99.9 : lease anti-double-run (release best-effort en finally, TTL filet).
const LEASE_NAME = 'cron_process_gdpr_deletions'
const LEASE_TTL_SECONDS = 15 * 60

export const GET = withCronCheckIn('cron-process-gdpr-deletions', async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    logger.warn('[process-gdpr-deletions] Unauthorized')
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
    logger.error('[process-gdpr-deletions] lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[process-gdpr-deletions] skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  let processed = 0
  let succeeded = 0
  let failed = 0
  const errors: Array<{ id: string; error: string }> = []

  try {
    const { data: due, error: queryError } = await admin
      .from('deletion_requests')
      .select('id, user_id, scheduled_deletion_at')
      .eq('status', 'scheduled')
      .lte('scheduled_deletion_at', new Date().toISOString())
      .order('scheduled_deletion_at', { ascending: true })
      .limit(100)

    if (queryError) {
      logger.error('[process-gdpr-deletions] query failed', queryError)
      captureError(queryError, {
        tags: { route: 'cron/process-gdpr-deletions', step: 'query', critical: 'true' },
      })
      return NextResponse.json({ success: false, error: queryError.message }, { status: 500 })
    }

    if (!due || due.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No deletion requests due',
        processed: 0,
        durationMs: Date.now() - startedAt,
      })
    }

    for (const row of due) {
      processed++
      try {
        const result = await adminDeleteUserData(admin, row.user_id)
        if (result.error) {
          throw new Error(result.error)
        }

        const { error: updateError } = await admin
          .from('deletion_requests')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', row.id)
          .eq('status', 'scheduled')

        if (updateError) throw updateError

        // Audit log immutable (Art. 5.2 RGPD accountability)
        await admin
          .from('audit_logs')
          .insert({
            user_id: row.user_id,
            action: 'gdpr_deletion_completed',
            resource_type: 'deletion_requests',
            resource_id: row.id,
            metadata: { completed_at: new Date().toISOString() },
          })
          .throwOnError()
          .then(
            () => undefined,
            (auditErr) => {
              // Ne pas faire échouer la boucle pour l'audit log — log puis continue.
              logger.error('[process-gdpr-deletions] audit_logs insert failed', auditErr)
            }
          )

        succeeded++
      } catch (rowErr) {
        failed++
        const message = rowErr instanceof Error ? rowErr.message : String(rowErr)
        errors.push({ id: row.id, error: message })
        logger.error('[process-gdpr-deletions] row failed', rowErr as Error, {
          deletion_request_id: row.id,
        })
        captureError(rowErr, {
          tags: { route: 'cron/process-gdpr-deletions', step: 'row', critical: 'true' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      succeeded,
      failed,
      errors: errors.slice(0, 10),
      durationMs: Date.now() - startedAt,
    })
  } catch (err) {
    logger.error('[process-gdpr-deletions] fatal', err as Error)
    captureError(err, {
      tags: { route: 'cron/process-gdpr-deletions', step: 'fatal', critical: 'true' },
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
