'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'
import type { RgeQualification } from '@/lib/rge/has-active-qualification'
import { loadCompareList, saveCompareList } from '@/lib/storage/compare-store'

const MAX_COMPARE = 3

export interface CompareProvider {
  id: string
  name: string
  slug: string
  stable_id?: string
  specialty?: string
  address_city?: string
  address_region?: string
  address_postal_code?: string
  is_verified?: boolean
  rating_average?: number
  review_count?: number
  phone?: string
  siret?: string
  // Mig 306 signals
  hourly_rate_min?: number | null
  hourly_rate_max?: number | null
  emergency_available?: boolean
  available_24h?: boolean
  free_quote?: boolean
  accepts_new_clients?: boolean
  // RGE
  rge_qualifications?: RgeQualification[] | null
  rge_valid_until?: string | null
}

interface CompareContextType {
  compareList: CompareProvider[]
  addToCompare: (provider: CompareProvider) => void
  removeFromCompare: (providerId: string) => void
  isInCompare: (providerId: string) => boolean
  clearCompare: () => void
  notifySuccess: (title: string, message?: string) => void
  notifyError: (title: string, message?: string) => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProviderWrapper({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<CompareProvider[]>([])
  const hydratedRef = useRef(false)
  const { toasts, removeToast, warning, success, error } = useToast()

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const stored = loadCompareList()
    if (stored.length > 0) setCompareList(stored)
    hydratedRef.current = true
  }, [])

  // Persist after hydration so the initial empty-state pass doesn't clobber
  // a previously saved list.
  useEffect(() => {
    if (!hydratedRef.current) return
    saveCompareList(compareList)
  }, [compareList])

  const addToCompare = useCallback(
    (provider: CompareProvider) => {
      setCompareList((prev) => {
        if (prev.some((p) => p.id === provider.id)) return prev
        if (prev.length >= MAX_COMPARE) {
          // Toast is scheduled after state update via setTimeout to avoid
          // calling setState (addToast) inside another setState updater
          setTimeout(() => warning('Maximum 3 artisans à comparer'), 0)
          return prev
        }
        return [...prev, provider]
      })
    },
    [warning]
  )

  const removeFromCompare = useCallback((providerId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== providerId))
  }, [])

  const isInCompare = useCallback(
    (providerId: string) => compareList.some((p) => p.id === providerId),
    [compareList]
  )

  const clearCompare = useCallback(() => {
    setCompareList([])
  }, [])

  const notifySuccess = useCallback(
    (title: string, message?: string) => {
      success(title, message)
    },
    [success]
  )

  const notifyError = useCallback(
    (title: string, message?: string) => {
      error(title, message)
    },
    [error]
  )

  const value = useMemo(
    () => ({
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      notifySuccess,
      notifyError,
    }),
    [
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
      notifySuccess,
      notifyError,
    ]
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </CompareContext.Provider>
  )
}

const noopContext: CompareContextType = {
  compareList: [],
  addToCompare: () => {},
  removeFromCompare: () => {},
  isInCompare: () => false,
  clearCompare: () => {},
  notifySuccess: () => {},
  notifyError: () => {},
}

export function useCompare() {
  const context = useContext(CompareContext)
  // Return noop context during SSR or if provider is not yet mounted
  if (context === undefined) return noopContext
  return context
}
