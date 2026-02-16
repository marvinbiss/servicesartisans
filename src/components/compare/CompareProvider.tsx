'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ui/Toast'

const MAX_COMPARE = 3

export interface CompareProvider {
  id: string
  name: string
  slug: string
  stable_id?: string
  specialty?: string
  address_city?: string
  address_region?: string
  is_verified?: boolean
  rating_average?: number
  review_count?: number
  experience_years?: number
  certifications?: string[]
  insurance?: string[]
  services_offered?: string[]
  avatar_url?: string
  phone?: string
  emergency_available?: boolean
  hourly_rate_min?: number
  hourly_rate_max?: number
}

interface CompareContextType {
  compareList: CompareProvider[]
  addToCompare: (provider: CompareProvider) => void
  removeFromCompare: (providerId: string) => void
  isInCompare: (providerId: string) => boolean
  clearCompare: () => void
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProviderWrapper({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<CompareProvider[]>([])
  const { toasts, removeToast, warning } = useToast()

  const addToCompare = useCallback(
    (provider: CompareProvider) => {
      setCompareList((prev) => {
        if (prev.some((p) => p.id === provider.id)) return prev
        if (prev.length >= MAX_COMPARE) {
          // Toast is scheduled after state update via setTimeout to avoid
          // calling setState (addToast) inside another setState updater
          setTimeout(() => warning('Maximum 3 artisans \u00e0 comparer'), 0)
          return prev
        }
        return [...prev, provider]
      })
    },
    [warning],
  )

  const removeFromCompare = useCallback((providerId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== providerId))
  }, [])

  const isInCompare = useCallback(
    (providerId: string) => compareList.some((p) => p.id === providerId),
    [compareList],
  )

  const clearCompare = useCallback(() => {
    setCompareList([])
  }, [])

  const value = useMemo(
    () => ({
      compareList,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
    }),
    [compareList, addToCompare, removeFromCompare, isInCompare, clearCompare],
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProviderWrapper')
  }
  return context
}
