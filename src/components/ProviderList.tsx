'use client'

import { useState } from 'react'
import { Provider } from '@/types'
import type { LegacyProvider } from '@/types/legacy'
import ProviderCard from './ProviderCard'
import SearchFilters from './SearchFilters'
import { ProviderListSkeleton } from '@/components/ui/Skeleton'

interface ProviderListProps {
  providers: Provider[]
  onProviderHover?: (provider: Provider | null) => void
  isLoading?: boolean
}

interface FilterState {
  verified: boolean
  premium: boolean
  minRating: number | null
  sortBy: 'relevance' | 'rating' | 'name'
}

export default function ProviderList({
  providers,
  onProviderHover,
  isLoading = false,
}: ProviderListProps) {
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    premium: false,
    minRating: null,
    sortBy: 'relevance',
  })
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Apply filters (cast to LegacyProvider for legacy premium filter — will be removed)
  const filteredProviders = providers.filter((provider) => {
    const lp = provider as LegacyProvider
    if (filters.verified && !provider.is_verified) return false
    if (filters.premium && !lp.is_premium) return false
    // Rating filter would need actual rating data
    return true
  })

  // Apply sorting (legacy premium sort — will be replaced by neutral ordering)
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'rating':
        // Would need actual rating data
        return 0
      case 'relevance':
      default: {
        // Legacy premium sort — undefined at runtime (column dropped)
        const aLp = a as LegacyProvider
        const bLp = b as LegacyProvider
        if (aLp.is_premium !== bLp.is_premium) return aLp.is_premium ? -1 : 1
        if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1
        return 0
      }
    }
  })

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <SearchFilters
        onFilterChange={setFilters}
        totalResults={isLoading ? 0 : sortedProviders.length}
      />

      {/* Provider list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="region"
        aria-label="Liste des artisans"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <ProviderListSkeleton count={5} />
        ) : sortedProviders.length > 0 ? (
          <ul className="space-y-4" role="list">
            {sortedProviders.map((provider) => (
              <li
                key={provider.id}
                onMouseEnter={() => {
                  setHoveredId(provider.id)
                  onProviderHover?.(provider)
                }}
                onMouseLeave={() => {
                  setHoveredId(null)
                  onProviderHover?.(null)
                }}
                onFocus={() => {
                  setHoveredId(provider.id)
                  onProviderHover?.(provider)
                }}
                onBlur={() => {
                  setHoveredId(null)
                  onProviderHover?.(null)
                }}
              >
                <ProviderCard
                  provider={provider}
                  isHovered={hoveredId === provider.id}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="text-center py-12"
            role="status"
            aria-live="polite"
          >
            <p className="text-gray-500 text-lg">Aucun artisan trouvé</p>
            <p className="text-gray-400 text-sm mt-2">
              Essayez de modifier vos filtres
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
