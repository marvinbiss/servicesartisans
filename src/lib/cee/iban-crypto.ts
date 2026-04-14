/**
 * IBAN validation helpers — CEE partners (SA Energy mandataire).
 *
 * Le chiffrement est effectué de bout-en-bout côté Postgres via la RPC
 * SECURITY DEFINER `cee_store_partner_iban` (migration 434). Aucune clé ni
 * IBAN ne transite par Node après cette RPC.
 *
 * Design
 * ------
 * - **Validation seule ici** : regex IBAN FR strict + modulo 97 (ISO 7064).
 * - **Pas de helper encrypt/decrypt côté Node** : la RPC encapsule l'opération
 *   atomique (insert/update + iban_last4 + audit). Voir `src/app/api/cee/
 *   partners/onboarding/iban/route.ts`.
 * - **Zéro PII log** : l'IBAN n'est jamais loggé, jamais renvoyé sauf last4.
 */

// ---------------------------------------------------------------------------
// CEE_IBAN_KEY startup validation (MUST-12 / CWE-321)
//
// The key must be a base64-encoded 32-byte value (AES-256). Anything shorter
// or not decodable at boot means IBAN encryption is silently broken — which is
// worse than a loud failure. This guard throws during module initialisation so
// the error surfaces immediately in Vercel Function logs / health checks.
//
// Skipped in test / build environments where the key is not present.
// ---------------------------------------------------------------------------

function validateCeeIbanKey(): void {
  // Skip in test / CI / build environments.
  if (process.env.VITEST || process.env.NODE_ENV === 'test' || process.env.NEXT_BUILD_SKIP_DB) {
    return
  }

  const raw = process.env.CEE_IBAN_KEY
  if (!raw) {
    // Key absent — not fatal outside production (dev may skip CEE feature).
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[CEE_IBAN_KEY] Missing in production. ' + 'Set a base64-encoded 32-byte key (AES-256).'
      )
    }
    return
  }

  let decoded: Buffer
  try {
    decoded = Buffer.from(raw, 'base64')
  } catch {
    throw new Error(
      '[CEE_IBAN_KEY] Not valid base64. ' + 'Provide a base64-encoded 32-byte key (AES-256).'
    )
  }

  if (decoded.length !== 32) {
    throw new Error(
      `[CEE_IBAN_KEY] Decoded to ${decoded.length} bytes — expected exactly 32 (AES-256). ` +
        "Re-generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    )
  }
}

// Run once at module load. Fails loud and early (CWE-321 weak key prevention).
validateCeeIbanKey()

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IbanValidationResult {
  valid: boolean
  /** Derniers 4 caractères alphanumériques (affichage UI). */
  last4: string | null
  /** IBAN normalisé (uppercase, sans espaces). */
  normalized: string | null
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

// IBAN FR : FR + 2 clés + 5 banque + 5 guichet + 11 compte + 2 RIB = 27 chars
const IBAN_FR_REGEX = /^FR\d{2}[0-9A-Z]{23}$/

/**
 * Convertit un IBAN en base 10 pour le check modulo 97 (ISO 7064).
 * `A=10, B=11, ..., Z=35`.
 */
function ibanToBigIntString(iban: string): string {
  // Déplace les 4 premiers caractères à la fin
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  let result = ''
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0)
    if (code >= 48 && code <= 57) {
      result += ch
    } else if (code >= 65 && code <= 90) {
      result += (code - 55).toString()
    } else {
      // Caractère invalide — validation amont doit avoir rejeté, mais on sécurise
      return '0'
    }
  }
  return result
}

/**
 * Modulo 97 en long-division string (évite BigInt pour compat Node + perf).
 */
function mod97(numericString: string): number {
  let remainder = 0
  for (const digit of numericString) {
    remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder
}

/**
 * Valide un IBAN français (regex + modulo 97 ISO 7064).
 *
 * @param iban IBAN à valider (espaces tolérés, case-insensitive)
 * @returns `{ valid, last4, normalized }` — `last4` et `normalized` sont
 *   `null` si invalide.
 *
 * @example
 * validateIban('FR76 3000 4000 0312 3456 7890 143')
 * // { valid: true, last4: '0143', normalized: 'FR76...0143' }
 */
export function validateIban(iban: string): IbanValidationResult {
  if (typeof iban !== 'string') {
    return { valid: false, last4: null, normalized: null }
  }

  const normalized = iban.replace(/\s+/g, '').toUpperCase()

  if (!IBAN_FR_REGEX.test(normalized)) {
    return { valid: false, last4: null, normalized: null }
  }

  const numeric = ibanToBigIntString(normalized)
  if (mod97(numeric) !== 1) {
    return { valid: false, last4: null, normalized: null }
  }

  const last4 = normalized.slice(-4)
  return { valid: true, last4, normalized }
}
