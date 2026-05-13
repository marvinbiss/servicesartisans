'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  buildSearchId,
  clearSavedSearches,
  loadSavedSearches,
  removeSearch,
  SAVED_SEARCHES_STORAGE_KEY,
  saveSearch,
  type SavedSearch,
} from '@/lib/storage/saved-searches'

export function useSavedSearches(): {
  searches: SavedSearch[]
  isSaved: (service: string, ville: string, filters?: string) => boolean
  save: (s: Omit<SavedSearch, 'id' | 'savedAt'>) => void
  remove: (id: string) => void
  clear: () => void
} {
  const [searches, setSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    setSearches(loadSavedSearches())
    function onStorage(e: StorageEvent) {
      if (e.key !== SAVED_SEARCHES_STORAGE_KEY) return
      setSearches(loadSavedSearches())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const save = useCallback((s: Omit<SavedSearch, 'id' | 'savedAt'>) => {
    setSearches(saveSearch(s))
  }, [])

  const remove = useCallback((id: string) => {
    setSearches(removeSearch(id))
  }, [])

  const clear = useCallback(() => {
    clearSavedSearches()
    setSearches([])
  }, [])

  const isSaved = useCallback(
    (service: string, ville: string, filters = ''): boolean => {
      const id = buildSearchId(service, ville, filters)
      return searches.some((s) => s.id === id)
    },
    [searches]
  )

  return { searches, isSaved, save, remove, clear }
}
