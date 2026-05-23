/**
 * Cron : purges RGPD article 5.1.e (limitation de la conservation).
 *
 * Audit 2026-04-25 (agent #10 conformité — HIGH plainte CNIL) :
 *   /confidentialite annonce 1 an de rétention pour audit_logs et 3 ans
 *   pour les comptes inactifs, mais aucun cron n'exécutait ces purges.
 *   Promesse RGPD non tenue → article 5.1.e violé → plainte CNIL → 4% CA.
 *
 * Ce cron tourne quotidiennement à 05:00 UTC (cf vercel.json, après
 * process-gdpr-deletions à 04:00) et :
 *   1. purge `audit_logs.created_at < NOW() - AUDIT_LOGS_RETENTION_DAYS`
 *      via RPC SECURITY DEFINER `purge_audit_logs(int)` (migration 475).
 *   2. liste les user IDs inactifs >= INACTIVE_USERS_RETENTION_DAYS via
 *      RPC `find_inactive_users(int)` puis `auth.admin.deleteUser(id)`
 *      pour propager la cascade auth.users → profiles → tables liées.
 *
 * Rétentions configurables via env (défauts conformes au /confidentialite) :
 *   - AUDIT_LOGS_RETENTION_DAYS   : 365 (1 an)
 *   - INACTIVE_USERS_RETENTION_DAYS : 1095 (3 ans)
 *
 * Cap : `find_inactive_users` est borné à 1000/run dans la RPC (sécurité
 * anti-purge-massif accidentel). Sur 1M de users, plusieurs runs nécessaires.
 *
 * Sentry alert : `business_impact:rgpd_compliance` taggue toute erreur pour
 * saved-search dédiée (article 5.1.e violé = plainte CNIL).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const DEFAULT_AUDIT_LOGS_RETENTION_DAYS = 365
const DEFAULT_INACTIVE_USERS_RETENTION_DAYS = 1095

// SLA-99.9 : cap dur sur le nombre d'utilisateurs supprimés par run (en plus
// du cap interne de find_inactive_users) + lease anti-double-run.
const MAX_USERS_PER_RUN = 1000
const LEASE_NAME = 'cron_purge_rgpd'
const LEASE_TTL_SECONDS = 30 * 60

// F-quater + G2-bis : Supabase AuthApiError expose `status` (number) et
// `code` (string). On vérifie d'abord la forme typée du SDK, puis fallback
// regex sur `message` (que err soit Error ou objet plain Supabase) avant de
// finir sur String(err). "no rows" retiré du regex (trop permissif).
function isUserNotFoundError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { status?: unknown; code?: unknown; message?: unknown }
    if (e.status === 404) return true
    if (typeof e.code === 'string' && /user[_ ]?not[_ ]?found/i.test(e.code)) {
      return true
    }
    if (typeof e.message === 'string' && /user[_ ]?not[_ ]?found/i.test(e.message)) {
      return true
    }
  }
  const msg = err instanceof Error ? err.message : String(err)
  return /user[_ ]?not[_ ]?found/i.test(msg)
}

function parseRetention(envName: string, fallback: number, minimum: number): number {
  const raw = process.env[envName]
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < minimum) {
    logger.warn(`[purge-rgpd] invalid ${envName}=${raw}, using fallback`, { fallback })
    return fallback
  }
  return parsed
}

export const GET = withCronCheckIn('cron-purge-rgpd', async (request: Request) => {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    logger.warn('[purge-rgpd] Unauthorized')
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
  let leaseAcquired: boolean | null = null
  let leaseAcqErr: { message: string } | null = null
  try {
    const leaseResult = await admin
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    leaseAcquired = leaseResult.data as boolean | null
    leaseAcqErr = leaseResult.error
  } catch (err) {
    leaseAcqErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseAcqErr) {
    logger.error('[purge-rgpd] lease error', leaseAcqErr.message)
    return NextResponse.json({ success: false, error: { message: 'lease_error' } }, { status: 500 })
  }
  if (leaseAcquired !== true) {
    logger.info('[purge-rgpd] skipped (lease already held)')
    return NextResponse.json({ success: true, skipped: true, reason: 'already_running' })
  }

  try {
    const auditRetention = parseRetention(
      'AUDIT_LOGS_RETENTION_DAYS',
      DEFAULT_AUDIT_LOGS_RETENTION_DAYS,
      30
    )
    const userRetention = parseRetention(
      'INACTIVE_USERS_RETENTION_DAYS',
      DEFAULT_INACTIVE_USERS_RETENTION_DAYS,
      365
    )

    let auditDeleted = 0
    let auditPhaseFailed = false
    let usersDeleted = 0
    let usersAlreadyGone = 0
    let usersFailed = 0
    let usersPhaseFailed = false
    const userErrors: Array<{ id: string; error: string }> = []

    // ── 1. Audit logs ──────────────────────────────────────────────────────
    try {
      const { data, error } = await admin
        .rpc('purge_audit_logs', {
          retention_days: auditRetention,
        })
        .abortSignal(AbortSignal.timeout(10_000))
      if (error) throw error
      auditDeleted = typeof data === 'number' ? data : 0
      logger.info('[purge-rgpd] audit_logs purged', {
        retention: auditRetention,
        deleted: auditDeleted,
      })
    } catch (err) {
      auditPhaseFailed = true
      logger.error('[purge-rgpd] audit_logs purge failed', err)
      captureError(err, {
        tags: {
          route: 'cron/purge-rgpd',
          step: 'audit_logs',
          critical: 'true',
          business_impact: 'rgpd_compliance',
        },
      })
    }

    // ── 2. Inactive users ──────────────────────────────────────────────────
    try {
      const { data: candidates, error } = await admin
        .rpc('find_inactive_users', {
          retention_days: userRetention,
        })
        .abortSignal(AbortSignal.timeout(10_000))
      if (error) throw error

      const ids: string[] = (
        Array.isArray(candidates)
          ? candidates
              .map((row: { user_id?: string }) => row.user_id)
              .filter((id): id is string => typeof id === 'string')
          : []
      ).slice(0, MAX_USERS_PER_RUN)

      logger.info('[purge-rgpd] inactive users found', {
        retention: userRetention,
        count: ids.length,
      })

      for (const id of ids) {
        try {
          const { error: deleteError } = await admin.auth.admin.deleteUser(id)
          if (deleteError) throw deleteError
          usersDeleted++
        } catch (err) {
          if (isUserNotFoundError(err)) {
            usersAlreadyGone++
            // Race avec process-gdpr-deletions ou retry idempotent : log info.
            logger.info('[purge-rgpd] user already gone (idempotent)', { id })
            continue
          }
          usersFailed++
          userErrors.push({
            id,
            error: err instanceof Error ? err.message : String(err),
          })
          // Continue with next user — don't fail the whole run.
        }
      }

      // F-sexies : si on avait des candidats mais aucune suppression effective
      // (taux d'échec 100%), c'est un signe fort d'un bug systémique (RLS,
      // permission auth.admin, supabase outage). Marquer partial_failure pour
      // que le monitoring HTTP voie un 500, et alerter Sentry séparément.
      if (ids.length > 0 && usersDeleted === 0 && usersAlreadyGone === 0) {
        usersPhaseFailed = true
        const sample = userErrors.slice(0, 3).map((e) => e.error)
        const systemic = new Error(
          `[purge-rgpd] 100% fail rate on ${ids.length} candidates: ${sample.join(' | ')}`
        )
        logger.error('[purge-rgpd] systemic failure on inactive users', {
          candidates: ids.length,
          failed: usersFailed,
          sample,
        })
        captureError(systemic, {
          tags: {
            route: 'cron/purge-rgpd',
            step: 'inactive_users_systemic',
            critical: 'true',
            business_impact: 'rgpd_compliance',
          },
        })
      }
    } catch (err) {
      usersPhaseFailed = true
      logger.error('[purge-rgpd] inactive users phase failed', err)
      captureError(err, {
        tags: {
          route: 'cron/purge-rgpd',
          step: 'inactive_users',
          critical: 'true',
          business_impact: 'rgpd_compliance',
        },
      })
    }

    // F-quinquies : si une phase a complètement échoué, success doit être false
    // sinon le monitoring HTTP voit un 200 vert alors que la purge n'a rien fait.
    const partialFailure = auditPhaseFailed || usersPhaseFailed
    const durationMs = Date.now() - startedAt
    logger.info('[purge-rgpd] done', {
      auditDeleted,
      auditPhaseFailed,
      auditRetention,
      usersDeleted,
      usersAlreadyGone,
      usersFailed,
      usersPhaseFailed,
      userRetention,
      durationMs,
    })

    return NextResponse.json(
      {
        success: !partialFailure,
        partial_failure: partialFailure,
        audit_logs: {
          retention_days: auditRetention,
          deleted: auditDeleted,
          phase_failed: auditPhaseFailed,
        },
        inactive_users: {
          retention_days: userRetention,
          deleted: usersDeleted,
          already_gone: usersAlreadyGone,
          failed: usersFailed,
          phase_failed: usersPhaseFailed,
          ...(userErrors.length > 0 ? { errors: userErrors.slice(0, 10) } : {}),
        },
        duration_ms: durationMs,
      },
      { status: partialFailure ? 500 : 200 }
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
