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

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request: Request) {
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
  }
}
