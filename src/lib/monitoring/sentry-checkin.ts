import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

/**
 * Sentry Cron Monitor check-in wrapper for Vercel/Next.js HTTP-triggered crons.
 *
 * Pattern : in_progress au début → ok à la fin si succès, error si throw.
 * Idempotent côté Sentry : si pas de DSN ou Sentry indispo, no-op silencieux
 * (les calls retournent undefined sans throw).
 *
 * Usage :
 *   export const GET = withCronCheckIn('cron-send-reminders-1h', async (req) => {
 *     // logique du cron
 *     return NextResponse.json({ ok: true })
 *   })
 *
 * Le slug DOIT matcher exactement le `name` du monitor créé dans Sentry UI.
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

    try {
      const response = await handler(request)
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
      return response
    } catch (err) {
      try {
        Sentry.captureCheckIn({ monitorSlug, status: 'error', checkInId })
      } catch {
        /* never swallow the original error */
      }
      logger.error(`[${monitorSlug}] uncaught cron error`, err)
      throw err
    }
  }
}
