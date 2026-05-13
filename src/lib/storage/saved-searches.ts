/**
 * Recherches sauvegardées — pattern Indeed/LinkedIn "Saved jobs".
 *
 * Persiste les paires `service + ville` (+ filtres futurs) que l'utilisateur
 * souhaite suivre. Limité à 10 entrées (UI manageable, localStorage léger).
 *
 * Identité : on hashe `service|ville|filters` pour détecter les duplicates
 * et bumper le timestamp au lieu de créer un doublon.
 *
 * RGPD : aucune donnée perso n'est stockée. La liste est consultable et
 * effaçable depuis `/mes-recherches`.
 */
const KEY = 'sa:saved-searches:v1'
const MAX = 10

export type SavedSearch = {
  /** Hash déterministe (service|ville|filters) servant d'identifiant stable. */
  id: string
  service: string
  serviceLabel: string
  ville: string
  villeLabel: string
  /** Filtres URL sérialisés (string `?rge=1&dist=20`). Vide si pas de filtre. */
  filters: string
  /** Timestamp ms de la dernière sauvegarde ou bump. */
  savedAt: number
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function isValid(v: unknown): v is SavedSearch {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.service === 'string' &&
    typeof r.ville === 'string' &&
    typeof r.savedAt === 'number'
  )
}

function readRaw(): SavedSearch[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((p) => {
        if (!p || typeof p !== 'object') return null
        const r = p as Record<string, unknown>
        // Hydrate optional fields that older entries may lack
        const hydrated = {
          ...r,
          serviceLabel: typeof r.serviceLabel === 'string' ? r.serviceLabel : (r.service as string),
          villeLabel: typeof r.villeLabel === 'string' ? r.villeLabel : (r.ville as string),
          filters: typeof r.filters === 'string' ? r.filters : '',
        }
        return isValid(hydrated) ? hydrated : null
      })
      .filter((v): v is SavedSearch => v !== null)
  } catch {
    return []
  }
}

function writeRaw(items: SavedSearch[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

/**
 * Returns saved searches, freshest first. Side-effect free.
 */
export function loadSavedSearches(): SavedSearch[] {
  return readRaw()
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, MAX)
}

export function buildSearchId(service: string, ville: string, filters = ''): string {
  return `${service}|${ville}|${filters}`
}

/**
 * Builds the canonical pathname for a saved search.
 */
export function buildSearchHref(
  search: Pick<SavedSearch, 'service' | 'ville' | 'filters'>
): string {
  const base = `/services/${search.service}/${search.ville}`
  return search.filters ? `${base}?${search.filters.replace(/^\?/, '')}` : base
}

/**
 * Idempotent save : if the same `service|ville|filters` triple already
 * exists, bump its `savedAt`. Returns the new persisted list (sorted
 * freshest first, capped at MAX).
 */
export function saveSearch(payload: Omit<SavedSearch, 'id' | 'savedAt'>): SavedSearch[] {
  if (!isBrowser()) return []
  if (!payload.service || !payload.ville) return loadSavedSearches()
  const id = buildSearchId(payload.service, payload.ville, payload.filters)
  const now = Date.now()
  const rest = readRaw().filter((s) => s.id !== id)
  const next: SavedSearch[] = [{ ...payload, id, savedAt: now }, ...rest].slice(0, MAX)
  writeRaw(next)
  return next.sort((a, b) => b.savedAt - a.savedAt)
}

export function removeSearch(id: string): SavedSearch[] {
  if (!isBrowser()) return []
  const next = readRaw().filter((s) => s.id !== id)
  writeRaw(next)
  return next.sort((a, b) => b.savedAt - a.savedAt)
}

export function clearSavedSearches(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export function isSearchSaved(service: string, ville: string, filters = ''): boolean {
  if (!isBrowser()) return false
  const id = buildSearchId(service, ville, filters)
  return readRaw().some((s) => s.id === id)
}

export const SAVED_SEARCHES_STORAGE_KEY = KEY
