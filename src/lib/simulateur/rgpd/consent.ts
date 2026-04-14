/**
 * Enregistrement des consentements RGPD
 * Source : docs/rgpd-simulateur-aides.md §3
 */

export type ConsentType = 'rgpd' | 'marketing' | 'majorite'

/**
 * Version du texte de consentement actuellement affiché (doc RGPD §3.1).
 * À incrémenter à chaque changement de wording du consentement.
 */
export const CONSENT_TEXT_VERSION = '2026-04-14'

export interface ConsentRecord {
  type: ConsentType
  granted: boolean
  grantedAt: string // ISO 8601
  textVersion: string
  ipHash: string | null
  userAgent: string | null
}

export interface ConsentContext {
  ipHash?: string | null
  userAgent?: string | null
  now?: () => Date // injection pour tests
}

/**
 * Enregistre un consentement avec horodatage.
 * Pure function — pas d'I/O, juste la construction du record.
 * La persistance DB est faite en amont par l'appelant.
 */
export function recordConsent(
  type: ConsentType,
  granted: boolean,
  ctx: ConsentContext = {}
): ConsentRecord {
  const now = (ctx.now ?? (() => new Date()))()
  return {
    type,
    granted,
    grantedAt: now.toISOString(),
    textVersion: CONSENT_TEXT_VERSION,
    ipHash: ctx.ipHash ?? null,
    userAgent: ctx.userAgent ?? null,
  }
}
