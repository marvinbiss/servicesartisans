/**
 * Historique de consultation fiche artisan — pattern Amazon "Recently viewed".
 *
 * Pourquoi un stockage dédié vs `sa:user-prefs:v1` :
 * - Liste ordonnée (LRU), pas un objet plat.
 * - Durée de vie distincte : 30 jours TTL (au-delà, signal trop faible).
 * - Multi-tab sync via `storage` event natif.
 *
 * RGPD : aucune donnée perso n'est stockée. On enregistre l'identifiant
 * public + nom + spécialité (déjà visibles dans l'URL). L'historique est
 * effaçable en vidant le cache navigateur ; un bouton "Effacer mon
 * historique" est exposé dans `/espace-client/preferences`.
 *
 * Schéma versionné via la clé (`:v1`) — bump pour casser proprement.
 */
const KEY = 'sa:recently-viewed:v1'
const MAX = 10
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 jours

export type RecentlyViewedItem = {
  id: string
  name: string
  specialty?: string | null
  city?: string | null
  href: string
  /** Timestamp ms (epoch) de la dernière vue. */
  viewedAt: number
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function isValidItem(v: unknown): v is RecentlyViewedItem {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    typeof r.href === 'string' &&
    typeof r.viewedAt === 'number'
  )
}

function readRaw(): RecentlyViewedItem[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidItem)
  } catch {
    return []
  }
}

function writeRaw(items: RecentlyViewedItem[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // QuotaExceeded ou storage indisponible — silencieux
  }
}

/**
 * Returns the recent items, freshest first, TTL-filtered.
 * Side-effect free.
 */
export function loadRecentlyViewed(): RecentlyViewedItem[] {
  const now = Date.now()
  const items = readRaw()
    .filter((i) => now - i.viewedAt <= TTL_MS)
    .sort((a, b) => b.viewedAt - a.viewedAt)
  return items.slice(0, MAX)
}

/**
 * Tracks a provider view. Idempotent : if `id` already exists in the list,
 * its `viewedAt` is refreshed (LRU bump) and the rest of the fields are
 * overwritten with the latest payload (useful when an artisan changes name/
 * city). Enforces MAX cap and TTL pruning.
 */
export function trackProviderView(payload: Omit<RecentlyViewedItem, 'viewedAt'>): void {
  if (!isBrowser()) return
  if (!payload.id || !payload.name || !payload.href) return
  const now = Date.now()
  const existing = readRaw().filter((i) => i.id !== payload.id && now - i.viewedAt <= TTL_MS)
  const next: RecentlyViewedItem[] = [{ ...payload, viewedAt: now }, ...existing].slice(0, MAX)
  writeRaw(next)
}

export function clearRecentlyViewed(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const RECENTLY_VIEWED_STORAGE_KEY = KEY
