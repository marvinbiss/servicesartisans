import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeatStage } from '@/lib/monitoring/heartbeat'

/**
 * Sentry Cron Monitor check-in wrapper for Vercel/Next.js HTTP-triggered crons.
 *
 * Pattern : in_progress au début → ok à la fin si succès, error si throw.
 * Idempotent côté Sentry : si pas de DSN ou Sentry indispo, no-op silencieux
 * (les calls retournent undefined sans throw).
 *
 * 2026-05-02 : ajout double-écriture vers healthchecks.io (pingHeartbeatStage).
 *   Pourquoi 2 systèmes ? Sentry monitor échoue silencieusement si
 *   `SENTRY_DSN` n'est pas configuré sur l'env, ou si le quota Sentry est
 *   dépassé. healthchecks.io est un fallback indépendant : un cron qui
 *   "ne ping pas pendant N min" déclenche email/Slack via leur règle d'alerte.
 *   Les 2 providers s'overlap volontairement (defense-in-depth observability).
 *
 *   Le slug Sentry (kebab-case) sert aussi de slug healthchecks (auto-create
 *   recommandé côté dashboard hc-ping). Pas de mapping séparé à maintenir.
 *
 * Usage :
 *   export const GET = withCronCheckIn('cron-send-reminders-1h', async (req) => {
 *     // logique du cron
 *     return NextResponse.json({ ok: true })
 *   })
 */
export function withCronCheckIn<T extends Request>(
  monitorSlug: string,
  handler: (request: T) => Promise<Response>
): (request: T) => Promise<Response> {
  return async (request: T): Promise<Response> => {
    let checkInId: string | undefined
    try {
      checkInId = Sentry.captureCheckIn({
        monitorSlug,
        status: 'in_progress',
      })
    } catch {
      // Sentry indispo (pas de DSN, edge runtime issue) → on continue sans
      // tracking. Le cron doit toujours s'exécuter, observability est best-effort.
    }

    // healthchecks.io ping start — fire-and-forget, jamais blocant
    pingHeartbeatStage(monitorSlug, 'start').catch(() => undefined)

    const startedAt = Date.now()

    try {
      const response = await handler(request)
      const durationMs = Date.now() - startedAt
      // Vercel HTTP crons : 2xx = succès, 4xx/5xx = échec.
      const isOk = response.status >= 200 && response.status < 400
      try {
        Sentry.captureCheckIn({
          monitorSlug,
          status: isOk ? 'ok' : 'error',
          checkInId,
        })
      } catch {
        /* never break the response */
      }
      pingHeartbeatStage(
        monitorSlug,
        isOk ? 'success' : 'fail',
        `${isOk ? 'ok' : 'http_' + response.status} ${durationMs}ms`
      ).catch(() => undefined)
      return response
    } catch (err) {
      const durationMs = Date.now() - startedAt
      try {
        Sentry.captureCheckIn({ monitorSlug, status: 'error', checkInId })
      } catch {
        /* never swallow the original error */
      }
      const message = err instanceof Error ? err.message : String(err)
      pingHeartbeatStage(
        monitorSlug,
        'fail',
        `throw ${durationMs}ms: ${message.slice(0, 500)}`
      ).catch(() => undefined)
      logger.error(`[${monitorSlug}] uncaught cron error`, err)
      throw err
    }
  }
}
