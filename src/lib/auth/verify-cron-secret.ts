import 'server-only'
import { timingSafeEqual } from 'node:crypto'

/**
 * Validation timing-safe du header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Audit 2026-04-25 (agent #9 finding H1) : 9 routes cron utilisaient
 * `authHeader !== \`Bearer ${cronSecret}\`` — comparaison sensible aux
 * timing attacks (un attaquant peut bruteforcer le secret octet par octet
 * sur un réseau stable). Les routes CEE utilisaient déjà `timingSafeEqual` ;
 * on uniformise via cet helper.
 *
 * Retourne `true` ssi le header matche le secret env. Retourne `false` si :
 *   - `CRON_SECRET` n'est pas défini en env (fail-closed)
 *   - `header` est null/undefined/vide
 *   - les longueurs diffèrent
 *   - les bytes diffèrent
 */
export function verifyCronSecret(header: string | null | undefined): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return false
  if (!header) return false

  const expected = `Bearer ${cronSecret}`
  // timingSafeEqual exige des buffers de longueur identique.
  if (header.length !== expected.length) return false

  try {
    return timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  } catch {
    return false
  }
}
