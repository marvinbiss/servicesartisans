/**
 * Heartbeat helper — BetterStack + healthchecks.io
 *
 * Pourquoi 2 providers ?
 *   - BetterStack : déjà en place pour heartbeats simples (var par cron)
 *   - healthchecks.io : ajouté 2026-05-02 pour les crons "vie ou mort" (RGPD,
 *     reminders bookings, prospection). Avantages : grace period par check,
 *     schedule-aware (alerte si NOTHING in 70min sur un cron 60min), ping
 *     start/success/fail séparés, self-host possible.
 *
 * Usage :
 *
 *   // Simple ping success-only (pattern existant) :
 *   await pingHeartbeat('HEALTH')
 *
 *   // Wrapper start/success/fail autour d'une route handler :
 *   export const GET = withHeartbeat('purge-rgpd', async (req) => {
 *     // ... business logic ...
 *     return NextResponse.json({ ok: true })
 *   })
 *
 * Configuration :
 *   - HEALTHCHECKS_PING_BASE_URL = "https://hc-ping.com/<project-uuid>"
 *     (ou self-host : "https://healthchecks.example.com/ping/<project-uuid>")
 *   - <name> est mappé sur un slug Healthchecks (`auto-create` activé côté
 *     dashboard) → ping URL devient `<base>/<name>`.
 *   - Si HEALTHCHECKS_PING_BASE_URL absent → no-op silencieux (dev).
 *   - BETTERSTACK_HEARTBEAT_<NAME> reste supporté pour compat.
 *
 * Timeouts : 5s par ping. Échec ping = warn log only (jamais blocant cron).
 */

import { logger } from '@/lib/logger'

const HC_TIMEOUT_MS = 5000

type HeartbeatStage = 'start' | 'success' | 'fail'

function envKey(name: string): string {
  return name.toUpperCase().replace(/-/g, '_')
}

function healthchecksUrl(name: string, stage: HeartbeatStage): string | null {
  const base = process.env.HEALTHCHECKS_PING_BASE_URL?.replace(/\/+$/, '')
  if (!base) return null
  switch (stage) {
    case 'start':
      return `${base}/${name}/start`
    case 'success':
      return `${base}/${name}`
    case 'fail':
      return `${base}/${name}/fail`
  }
}

function betterStackUrl(name: string): string | null {
  return process.env[`BETTERSTACK_HEARTBEAT_${envKey(name)}`] ?? null
}

async function pingUrl(url: string, body?: string): Promise<void> {
  try {
    await fetch(url, {
      method: body ? 'POST' : 'GET',
      body,
      headers: body ? { 'Content-Type': 'text/plain; charset=utf-8' } : undefined,
      signal: AbortSignal.timeout(HC_TIMEOUT_MS),
    })
  } catch (error) {
    logger.warn(`Heartbeat ping failed: ${url}`, {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Pattern legacy — ping success uniquement (BetterStack OU healthchecks.io).
 * Conservé pour compat avec les call sites existants (cron healthcheck etc.).
 */
export async function pingHeartbeat(name: string): Promise<void> {
  const targets = [betterStackUrl(name), healthchecksUrl(name, 'success')].filter(
    (url): url is string => url !== null
  )
  if (targets.length === 0) return
  await Promise.all(targets.map((url) => pingUrl(url)))
}

/**
 * Ping de stade explicite (start | success | fail). Utilisé par `withHeartbeat`.
 * Multi-provider : ping BetterStack + healthchecks.io en parallèle si configurés.
 *
 * - `success` : ping BetterStack (URL identique) + healthchecks `/${name}`
 * - `start`   : ping healthchecks `/${name}/start` uniquement (BetterStack pas
 *               de notion de start), avec body si fourni
 * - `fail`    : ping healthchecks `/${name}/fail` (BetterStack ne distingue
 *               pas, donc on ne ping pas BetterStack en fail = il restera
 *               silencieux et déclenchera son alerte par absence de ping)
 */
export async function pingHeartbeatStage(
  name: string,
  stage: HeartbeatStage,
  body?: string
): Promise<void> {
  const targets: string[] = []
  const hc = healthchecksUrl(name, stage)
  if (hc) targets.push(hc)
  if (stage === 'success') {
    const bs = betterStackUrl(name)
    if (bs) targets.push(bs)
  }
  if (targets.length === 0) return
  await Promise.all(targets.map((url) => pingUrl(url, body)))
}

/**
 * Wrapper handler Next.js : pingue start avant exécution, success après, fail
 * sur exception. Rethrow l'erreur pour que Sentry/Vercel la voient.
 *
 * Le `name` doit matcher le slug du check côté healthchecks.io
 * (auto-create activé recommandé pour ne pas avoir à créer chaque check à la
 * main). Convention : nom du cron sans slash, ex `purge-rgpd`, `send-reminders-1h`.
 */
export function withHeartbeat<TArgs extends unknown[], TReturn>(
  name: string,
  handler: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const startedAt = Date.now()
    await pingHeartbeatStage(name, 'start')
    try {
      const result = await handler(...args)
      const durationMs = Date.now() - startedAt
      await pingHeartbeatStage(name, 'success', `ok ${durationMs}ms`)
      return result
    } catch (err) {
      const durationMs = Date.now() - startedAt
      const message = err instanceof Error ? err.message : String(err)
      await pingHeartbeatStage(name, 'fail', `fail ${durationMs}ms: ${message.slice(0, 500)}`)
      throw err
    }
  }
}
