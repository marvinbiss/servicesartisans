'use client'

/**
 * Hook qui expose la liste "consultés récemment" synchronisée entre onglets.
 *
 * Le `storage` event est natif : il se déclenche dans les autres tabs quand
 * `localStorage.setItem` est appelé. On l'écoute pour re-lire et propager
 * les changements sans serveur ni broadcast channel.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  loadRecentlyViewed,
  clearRecentlyViewed,
  RECENTLY_VIEWED_STORAGE_KEY,
  type RecentlyViewedItem,
} from '@/lib/storage/recently-viewed'

export function useRecentlyViewed(): {
  items: RecentlyViewedItem[]
  clear: () => void
} {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    setItems(loadRecentlyViewed())
    function onStorage(e: StorageEvent) {
      if (e.key !== RECENTLY_VIEWED_STORAGE_KEY) return
      setItems(loadRecentlyViewed())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const clear = useCallback(() => {
    clearRecentlyViewed()
    setItems([])
  }, [])

  return { items, clear }
}
