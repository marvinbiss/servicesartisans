/**
 * Hash IP SHA-256 salé — conformité RGPD
 * Source : docs/rgpd-simulateur-aides.md §6 (sécurité), §1.5 (données passives)
 *
 * Contrat :
 * - Même IP + même salt → même hash (déterminisme, rate-limiting)
 * - Salt manquant : throw en dev, warn + fallback no-op en prod
 * - Jamais de stockage IP en clair
 */

import { createHash } from 'node:crypto'
import { logger } from '@/lib/logger'

const SALT_ENV_VAR = 'RGPD_IP_SALT'

/**
 * Hash une adresse IP (v4 ou v6) avec SHA-256 + salt depuis env.
 *
 * @param ip - IP client (string), ex : "81.64.12.5" ou "::1"
 * @returns hash hex 64 chars
 * @throws Error si salt manquant en environnement non-production
 */
export function hashIp(ip: string): string {
  if (typeof ip !== 'string' || ip.length === 0) {
    throw new Error('hashIp: IP argument must be a non-empty string')
  }

  const salt = process.env[SALT_ENV_VAR]

  if (!salt || salt.length === 0) {
    // Hard throw en tout environnement : un hash non-salé est trivialement
    // réversible par rainbow-table sur l'espace IPv4 (2^32) et rompt la
    // pseudonymisation RGPD. Mieux vaut un 500 explicite qu'une fuite
    // silencieuse.
    logger.error(`${SALT_ENV_VAR} is missing — refusing to hash IP (RGPD requirement)`, {
      component: 'simulateur/rgpd/hash-ip',
    })
    throw new Error(`${SALT_ENV_VAR} must be set to hash IP addresses (RGPD requirement)`)
  }

  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
