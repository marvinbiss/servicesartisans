/**
 * Helpers opt-out prospection (P1.3 — traçabilité CNIL)
 *
 * - Token HMAC SHA-256 signé (secret PROSPECTION_OPTOUT_SECRET)
 * - Empêche un tiers de désinscrire arbitrairement un email en forgeant un lien
 * - Distinct du système {{unsubscribe_link}} existant (template-renderer.ts)
 *   qui signe un contact_id ; ici on signe (email + campaign_id) car
 *   l'endpoint optout accepte l'email en clair dans l'URL pour traçabilité
 *   directe dans `prospection_optouts`.
 */

import crypto from 'crypto'
import { SITE_URL } from '@/lib/seo/config'
import { logger } from '@/lib/logger'

const TOKEN_VERSION = 'v1'

/**
 * Résout la clé de signature. Fail-close en production si la variable
 * d'environnement n'est pas définie (pour éviter qu'un déploiement
 * accidentel ne crée des liens non-signables).
 */
function getSigningKey(): string {
  const secret = process.env.PROSPECTION_OPTOUT_SECRET
  if (secret && secret.length >= 16) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('PROSPECTION_OPTOUT_SECRET must be set (min 16 chars) in production')
  }

  // Dev fallback — dérivé mais loggé pour que le dev sache qu'il doit
  // définir la vraie variable avant tout envoi réel.
  logger.warn(
    "PROSPECTION_OPTOUT_SECRET non défini — utilisation d'un fallback dev. À NE PAS utiliser en prod."
  )
  return 'dev-only-prospection-optout-fallback-secret'
}

/**
 * Normalise l'email (lowercase + trim) avant signature/vérification pour
 * qu'un token reste valide même si l'email est passé en casse différente.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sign(payload: string): string {
  const key = getSigningKey()
  return crypto.createHmac('sha256', key).update(payload).digest('base64url')
}

/**
 * Génère un token opt-out signé pour une paire (email, campaignId).
 * Format : `v1.<base64url(email|campaignId)>.<hmac>`
 */
export function generateOptoutToken(email: string, campaignId: string): string {
  const normalized = normalizeEmail(email)
  const body = Buffer.from(`${normalized}|${campaignId}`).toString('base64url')
  const signature = sign(`${TOKEN_VERSION}.${body}`)
  return `${TOKEN_VERSION}.${body}.${signature}`
}

/**
 * Vérifie un token opt-out. Retourne `true` ssi la signature est valide et
 * correspond EXACTEMENT à la paire (email, campaignId) fournie.
 * Utilise `timingSafeEqual` pour éviter les timing attacks.
 */
export function verifyOptoutToken(token: string, email: string, campaignId: string): boolean {
  if (!token || !email || !campaignId) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [version, body, providedSig] = parts
  if (version !== TOKEN_VERSION) return false

  // Re-signer à partir des inputs attendus et comparer
  const normalized = normalizeEmail(email)
  const expectedBody = Buffer.from(`${normalized}|${campaignId}`).toString('base64url')
  if (body !== expectedBody) return false

  const expectedSig = sign(`${version}.${expectedBody}`)

  try {
    const a = Buffer.from(providedSig)
    const b = Buffer.from(expectedSig)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Construit l'URL complète d'opt-out à injecter dans un email.
 * L'email est encodé dans le querystring mais aussi dans le token ; ça
 * permet à l'endpoint de logger l'email EXACT qui a cliqué (preuve CNIL)
 * sans devoir le décoder depuis le token.
 */
export function buildOptoutUrl(email: string, campaignId: string): string {
  const baseUrl = SITE_URL
  const token = generateOptoutToken(email, campaignId)
  const params = new URLSearchParams({
    email: normalizeEmail(email),
    campaign: campaignId,
    token,
  })
  return `${baseUrl}/api/prospection/optout?${params.toString()}`
}

/**
 * Hash SHA-256 d'une IP avec un sel dédié (pour stocker une preuve sans
 * conserver l'IP brute — exigence CNIL/RGPD minimisation).
 *
 * Le sel est distinct du secret HMAC de signature des tokens :
 * - Rôle HMAC `PROSPECTION_OPTOUT_SECRET` : signer les liens opt-out
 * - Rôle sel `PROSPECTION_IP_HASH_SALT` : empêcher la réversibilité des IPs
 * Mélanger les deux rôles affaiblit les deux primitives en cas de leak.
 *
 * Fail-close en production si le sel est absent (pas de fallback hardcodé
 * silencieux). En dev, retourne `null` : la colonne `ip_hash` étant
 * nullable, l'opt-out reste fonctionnel sans preuve IP.
 */
export function hashIp(ip: string): string | null {
  const salt = process.env.PROSPECTION_IP_HASH_SALT
  if (!salt) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'PROSPECTION_IP_HASH_SALT doit être défini en production (min 16 chars aléatoires)'
      )
    }
    logger.warn('PROSPECTION_IP_HASH_SALT non défini — ip_hash=null (dev uniquement)')
    return null
  }
  return crypto.createHash('sha256').update(`${ip}|${salt}`).digest('hex')
}
