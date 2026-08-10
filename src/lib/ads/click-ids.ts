/**
 * Capture des click-IDs publicitaires (Google Ads) — maillon 1 de la chaîne
 * d'attribution paid → lead → conversion offline.
 *
 * Pourquoi : sans `gclid` rattaché au lead, l'import de conversions hors ligne
 * (Offline Conversion Import) est impossible, et le Smart Bidding optimise sur
 * « formulaire soumis » au lieu de « lead réellement vendu ». Sur un modèle de
 * leads exclusifs, l'écart entre les deux est exactement la marge.
 *
 * Périmètre des identifiants :
 *   - `gclid`  — clic standard (auto-tagging Google Ads)
 *   - `gbraid` — clic iOS app→web, parcours sans cookie tiers
 *   - `wbraid` — clic web iOS, parcours sans cookie tiers
 * Un clic ne porte qu'un seul de ces trois paramètres.
 *
 * RGPD / ePrivacy — décision de conception :
 *   La lecture se fait par défaut UNIQUEMENT depuis l'URL courante, sans aucune
 *   écriture de stockage terminal. C'est suffisant pour les landing pages `/lp`
 *   et `/lp-pro` (formulaire above-fold, soumission sans navigation : le
 *   paramètre est encore dans l'URL au submit) et cela n'exige aucun
 *   consentement préalable.
 *   Le repli `sessionStorage`, qui survit à une navigation interne, n'est
 *   activé QUE si un consentement « mesure publicitaire » a été recueilli.
 *   Tant qu'aucune CMP n'est branchée, `hasAdsConsent()` renvoie false et rien
 *   n'est écrit. Voir le chantier Consent Mode v2.
 */

export const CLICK_ID_PARAMS = ['gclid', 'gbraid', 'wbraid'] as const
export const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const

export type ClickIdParam = (typeof CLICK_ID_PARAMS)[number]
export type UtmParam = (typeof UTM_PARAMS)[number]

export type AdsAttribution = Partial<Record<ClickIdParam | UtmParam, string>>

/** Clé sessionStorage du repli inter-pages (écrit sous consentement seulement). */
const STORAGE_KEY = 'sa_ads_attribution'

/**
 * Les click-IDs Google sont des chaînes opaques base64url-like. On borne
 * strictement la forme pour éviter d'injecter n'importe quoi en base et dans
 * le payload API Google Ads.
 */
const CLICK_ID_RE = /^[A-Za-z0-9._-]{1,512}$/
const MAX_UTM_LENGTH = 120

function sanitizeClickId(raw: string | null): string | undefined {
  if (!raw) return undefined
  const value = raw.trim()
  return CLICK_ID_RE.test(value) ? value : undefined
}

function sanitizeUtm(raw: string | null): string | undefined {
  if (!raw) return undefined
  // Neutralise les caractères de contrôle, garde le reste tel quel (les
  // valeurs utm sont libres et peuvent contenir accents, espaces, `+`).
  const value = raw
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .slice(0, MAX_UTM_LENGTH)
  return value.length > 0 ? value : undefined
}

/**
 * Extrait l'attribution d'une query string. Fonction pure — c'est elle qui est
 * testée, `captureAdsAttribution` n'étant qu'un wrapper navigateur.
 */
export function parseAdsAttribution(search: string): AdsAttribution {
  const params = new URLSearchParams(search)
  const out: AdsAttribution = {}

  for (const key of CLICK_ID_PARAMS) {
    const value = sanitizeClickId(params.get(key))
    if (value) out[key] = value
  }
  for (const key of UTM_PARAMS) {
    const value = sanitizeUtm(params.get(key))
    if (value) out[key] = value
  }

  return out
}

/** True si au moins un click-ID publicitaire est présent. */
export function hasClickId(attribution: AdsAttribution): boolean {
  return CLICK_ID_PARAMS.some((key) => Boolean(attribution[key]))
}

/**
 * Consentement « mesure publicitaire ». Retourne false tant qu'aucune CMP n'a
 * positionné le signal — donc aucun stockage terminal par défaut.
 *
 * Le jour où Consent Mode v2 est branché, la CMP doit écrire
 * `localStorage.sa_consent_ads = 'granted'` (ou exposer `window.__saConsent`)
 * et ce repli s'active sans autre changement de code.
 */
export function hasAdsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.__saConsent?.ads === true) return true
    return window.localStorage.getItem('sa_consent_ads') === 'granted'
  } catch {
    // Safari mode privé / stockage bloqué → pas de consentement exploitable.
    return false
  }
}

function readStoredAttribution(): AdsAttribution {
  if (typeof window === 'undefined' || !hasAdsConsent()) return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    // Re-valide au lieu de faire confiance au stockage.
    const entries = Object.entries(parsed as Record<string, unknown>).filter(
      ([, v]) => typeof v === 'string'
    ) as Array<[string, string]>
    return parseAdsAttribution(new URLSearchParams(entries).toString())
  } catch {
    return {}
  }
}

function persistAttribution(attribution: AdsAttribution): void {
  if (typeof window === 'undefined' || !hasAdsConsent()) return
  if (Object.keys(attribution).length === 0) return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // Quota / stockage bloqué : l'attribution reste disponible via l'URL.
  }
}

/**
 * Attribution courante côté navigateur : URL d'abord (source de vérité du clic
 * en cours), repli sur le stockage de session si consenti.
 *
 * À appeler au moment de la soumission du formulaire, pas au montage : sur les
 * LP le paramètre est toujours dans l'URL, et cela évite de figer une valeur
 * périmée si l'utilisateur navigue.
 */
export function captureAdsAttribution(): AdsAttribution {
  if (typeof window === 'undefined') return {}
  const fromUrl = parseAdsAttribution(window.location.search)

  if (hasClickId(fromUrl)) {
    persistAttribution(fromUrl)
    return fromUrl
  }

  const stored = readStoredAttribution()
  // L'URL prime champ par champ ; le stockage ne comble que les trous.
  return { ...stored, ...fromUrl }
}

declare global {
  interface Window {
    __saConsent?: { ads?: boolean }
  }
}
