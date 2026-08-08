/**
 * Normalisation + hachage SHA-256 des données utilisateur pour l'Advanced Matching
 * Meta (Pixel & Conversions API).
 *
 * Meta exige que chaque champ soit normalisé AVANT hachage, sinon le taux de
 * correspondance (Event Match Quality) s'effondre. Les règles appliquées ici
 * suivent la spec « Customer Information Parameters » :
 *   - minuscules, sans espaces de bord
 *   - téléphone en chiffres uniquement, indicatif pays inclus, sans zéro initial
 *   - noms sans accents, sans ponctuation, sans espaces
 *   - code postal FR : 5 premiers chiffres
 *
 * Server-only : utilise `node:crypto`.
 */
import { createHash } from 'crypto'

/** Indicatif pays par défaut pour les numéros saisis au format national (France). */
const DEFAULT_COUNTRY_CALLING_CODE = '33'

/** SHA-256 hexadécimal minuscule — format attendu par Meta. */
function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** Retire les diacritiques (é → e) tout en gardant la casse d'origine. */
function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Un champ déjà haché (64 hex) est renvoyé tel quel : évite le double hachage
 * quand un appelant transmet une valeur pré-hachée.
 */
function isAlreadyHashed(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value)
}

function hashNormalized(normalized: string): string | undefined {
  if (!normalized) return undefined
  return sha256(normalized)
}

/** Email : trim + minuscules. */
export function hashEmail(email?: string | null): string | undefined {
  if (!email) return undefined
  const raw = email.trim()
  if (isAlreadyHashed(raw)) return raw.toLowerCase()
  const normalized = raw.toLowerCase()
  // Garde-fou minimal : sans « @ » ce n'est pas un email, hacher n'apporte rien.
  if (!normalized.includes('@')) return undefined
  return hashNormalized(normalized)
}

/**
 * Téléphone : chiffres uniquement, indicatif pays inclus.
 * `0612345678` (FR) → `33612345678`
 * `+33 6 12 34 56 78` → `33612345678`
 */
export function hashPhone(
  phone?: string | null,
  countryCallingCode: string = DEFAULT_COUNTRY_CALLING_CODE
): string | undefined {
  if (!phone) return undefined
  const raw = phone.trim()
  if (isAlreadyHashed(raw)) return raw.toLowerCase()

  let digits = raw.replace(/\D/g, '')
  if (!digits) return undefined

  // 00 33 6... → 33 6...
  if (digits.startsWith('00')) digits = digits.slice(2)

  // Format national (0X XX XX XX XX) → on préfixe l'indicatif pays.
  if (digits.startsWith('0')) {
    digits = countryCallingCode + digits.replace(/^0+/, '')
  } else if (!digits.startsWith(countryCallingCode)) {
    // Numéro national sans zéro initial (612345678) → préfixe aussi.
    // Un numéro déjà international d'un autre pays garde son indicatif.
    if (digits.length <= 10) digits = countryCallingCode + digits
  }

  // Un numéro plausible fait au minimum 8 chiffres indicatif compris.
  if (digits.length < 8) return undefined
  return hashNormalized(digits)
}

/** Prénom / nom : minuscules, sans accents, sans ponctuation ni espaces. */
export function hashName(name?: string | null): string | undefined {
  if (!name) return undefined
  const raw = name.trim()
  if (isAlreadyHashed(raw)) return raw.toLowerCase()
  const normalized = stripAccents(raw)
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  return hashNormalized(normalized)
}

/** Ville : minuscules, sans accents, sans espaces ni ponctuation. */
export function hashCity(city?: string | null): string | undefined {
  return hashName(city)
}

/** Code postal FR : 5 premiers chiffres. */
export function hashZip(zip?: string | null): string | undefined {
  if (!zip) return undefined
  const raw = zip.trim()
  if (isAlreadyHashed(raw)) return raw.toLowerCase()
  const normalized = raw.replace(/\D/g, '').slice(0, 5)
  if (normalized.length < 5) return undefined
  return hashNormalized(normalized)
}

/** Pays : code ISO 3166-1 alpha-2 en minuscules. */
export function hashCountry(country?: string | null): string | undefined {
  if (!country) return undefined
  const raw = country.trim()
  if (isAlreadyHashed(raw)) return raw.toLowerCase()
  const normalized = raw.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2)
  if (normalized.length !== 2) return undefined
  return hashNormalized(normalized)
}

/** Identifiant interne (user id, lead id) — haché pour ne jamais sortir en clair. */
export function hashExternalId(externalId?: string | null): string | undefined {
  if (!externalId) return undefined
  const raw = String(externalId).trim()
  if (!raw) return undefined
  if (isAlreadyHashed(raw)) return raw.toLowerCase()
  return hashNormalized(raw.toLowerCase())
}
