'use client'

import { X } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  EMPTY_FILTERS,
  filtersToSearchParams,
  parseFilters,
  type ProviderFilters,
} from './FilterPanel'

type Chip = {
  key: keyof ProviderFilters
  label: string
}

function buildChips(filters: ProviderFilters): Chip[] {
  const chips: Chip[] = []
  if (filters.rge) chips.push({ key: 'rge', label: 'RGE certifié' })
  if (filters.verified) chips.push({ key: 'verified', label: 'Vérifié' })
  if (filters.claimed) chips.push({ key: 'claimed', label: 'Revendiqué' })
  if (filters.emergency) chips.push({ key: 'emergency', label: 'Urgences 24/7' })
  if (filters.freeQuote) chips.push({ key: 'freeQuote', label: 'Devis gratuit' })
  if (filters.ratingMin > 0) {
    chips.push({ key: 'ratingMin', label: `Note ≥ ${filters.ratingMin}` })
  }
  return chips
}

type Props = {
  className?: string
}

export function ActiveFilterChips({ className = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const chips = useMemo(() => buildChips(filters), [filters])

  const removeOne = useCallback(
    (key: keyof ProviderFilters) => {
      const next: ProviderFilters = {
        ...filters,
        ...(key === 'ratingMin' ? { ratingMin: 0 as const } : { [key]: false }),
      }
      const params = filtersToSearchParams(next, searchParams)
      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [filters, searchParams, router, pathname]
  )

  const clearAll = useCallback(() => {
    const params = filtersToSearchParams(EMPTY_FILTERS, searchParams)
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [searchParams, router, pathname])

  if (chips.length === 0) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      role="region"
      aria-label="Filtres actifs"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => removeOne(chip.key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-800 text-xs font-medium rounded-full border border-primary-200 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          aria-label={`Retirer le filtre ${chip.label}`}
        >
          <span>{chip.label}</span>
          <X
            className="w-3.5 h-3.5 text-primary-600 group-hover:text-primary-800"
            aria-hidden="true"
          />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-charcoal-600 underline hover:text-charcoal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded px-1"
        >
          Tout effacer
        </button>
      )}
    </div>
  )
}
