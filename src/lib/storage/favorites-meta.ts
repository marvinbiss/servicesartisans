/**
 * favorites-meta — companion store for `useFavorites`.
 *
 * `useFavorites` only persists IDs in `sa_favorites`. To render the
 * `/mes-favoris` dashboard we need the artisan's display name, specialty,
 * city, and profile URL captured at favorite time. This module keeps a
 * keyed-by-id map of that metadata under `sa:favorites-meta:v1`.
 *
 * Legacy favorites without meta are still surfaced — the page falls back to
 * "Artisan favori" + a link to the unknown profile.
 */
export type FavoriteMeta = {
  id: string
  name: string
  slug: string | null
  specialty: string | null
  city: string | null
  href: string
  savedAt: number
}

export const FAVORITES_META_STORAGE_KEY = 'sa:favorites-meta:v1'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function readMap(): Record<string, FavoriteMeta> {
  if (!isBrowser()) return {}
  try {
    const raw = localStorage.getItem(FAVORITES_META_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, FavoriteMeta>
  } catch {
    return {}
  }
}

function writeMap(map: Record<string, FavoriteMeta>): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(FAVORITES_META_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // quota / private mode — silent
  }
}

export function setFavoriteMeta(item: Omit<FavoriteMeta, 'savedAt'>): void {
  if (!item.id) return
  const map = readMap()
  map[item.id] = { ...item, savedAt: Date.now() }
  writeMap(map)
}

export function removeFavoriteMeta(id: string): void {
  const map = readMap()
  if (!(id in map)) return
  delete map[id]
  writeMap(map)
}

export function loadFavoritesMeta(): Record<string, FavoriteMeta> {
  return readMap()
}

export function clearFavoritesMeta(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(FAVORITES_META_STORAGE_KEY)
  } catch {
    // noop
  }
}
