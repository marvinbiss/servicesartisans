'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Provider } from '@/types'

import ProviderCard from './ProviderCard'
import SearchFilters from './SearchFilters'
import { ProviderListSkeleton } from '@/components/ui/Skeleton'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface ProviderListProps {
  providers: Provider[]
  onProviderHover?: (provider: Provider | null) => void
  isLoading?: boolean
  totalCount?: number
  searchQuery?: string
  sortOrder?: 'default' | 'relevance' | 'name' | 'rating' | 'reviews'
  highlightedProviderId?: string | null
  /** When true, `providers` is already pre-filtered RGE server-side. Passed down from page URL `?rge=1`. */
  rgeOnly?: boolean
  /** Callback for RGE toggle — when provided, the filter is URL-driven (server-side). */
  onRgeToggle?: (next: boolean) => void
}

interface FilterState {
  verified: boolean
  rge: boolean
  minRating: number | null
  sortBy: 'rating' | 'name'
}

export default function ProviderList({
  providers,
  onProviderHover,
  isLoading = false,
  totalCount,
  searchQuery = '',
  sortOrder,
  highlightedProviderId,
  rgeOnly = false,
  onRgeToggle,
}: ProviderListProps) {
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    rge: false,
    minRating: null,
    sortBy: 'name',
  })
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Scroll to highlighted card when map pin is hovered
  useEffect(() => {
    if (!highlightedProviderId || !listRef.current) return
    const el = listRef.current.querySelector(`[data-provider-id="${highlightedProviderId}"]`)
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })
    }
  }, [highlightedProviderId, reducedMotion])

  // Merge external sortOrder prop into filters. Default to 'relevance'.
  const effectiveSortBy: 'relevance' | 'name' | 'rating' | 'reviews' =
    sortOrder === 'name'
      ? 'name'
      : sortOrder === 'rating'
        ? 'rating'
        : sortOrder === 'reviews'
          ? 'reviews'
          : sortOrder === 'relevance'
            ? 'relevance'
            : filters.sortBy

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // When RGE is URL-driven (server-side filter), skip the client-side re-filter
  // to avoid double work — data is already pre-filtered by the server.
  const rgeClientFilter = !onRgeToggle && filters.rge

  const displayedProviders = useMemo(() => {
    // Apply filters
    const filtered = providers.filter((p) => {
      if (filters.verified && !p.is_verified) return false
      if (rgeClientFilter) {
        // Certifié RGE actif uniquement (au moins une qualif + rge_valid_until >= aujourd'hui)
        const hasActiveRge =
          !!p.rge_qualifications &&
          p.rge_qualifications.length > 0 &&
          !!p.rge_valid_until &&
          p.rge_valid_until >= today
        if (!hasActiveRge) return false
      }
      if (filters.minRating !== null && (p.rating_average ?? 0) < filters.minRating) return false
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const nameMatch = p.name.toLowerCase().includes(q)
        const specialtyMatch = p.specialty?.toLowerCase().includes(q) ?? false
        const cityMatch = p.address_city?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !specialtyMatch && !cityMatch) return false
      }
      return true
    })

    // Apply sorting.
    // 'relevance' = composite score: RGE actif > claimed > verified > rating × log(reviews)
    // matches Google Maps / Booking.com pertinence heuristic.
    const relevanceScore = (p: Provider): number => {
      const hasRge =
        !!p.rge_qualifications &&
        p.rge_qualifications.length > 0 &&
        !!p.rge_valid_until &&
        p.rge_valid_until >= today
      const rgeBoost = hasRge ? 1000 : 0
      const claimedBoost = p.user_id ? 200 : 0
      const verifiedBoost = p.is_verified ? 100 : 0
      const rating = p.rating_average ?? 0
      const reviews = p.review_count ?? 0
      const reviewWeight = Math.log10(reviews + 1) * 20
      return rgeBoost + claimedBoost + verifiedBoost + rating * 10 + reviewWeight
    }
    return [...filtered].sort((a, b) => {
      switch (effectiveSortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return (b.rating_average ?? 0) - (a.rating_average ?? 0)
        case 'reviews':
          return (b.review_count ?? 0) - (a.review_count ?? 0)
        case 'relevance':
          return relevanceScore(b) - relevanceScore(a)
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [providers, filters, rgeClientFilter, searchQuery, effectiveSortBy, today])

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <SearchFilters
        onFilterChange={setFilters}
        totalResults={isLoading ? 0 : (totalCount ?? displayedProviders.length)}
        controlledRge={onRgeToggle ? rgeOnly : undefined}
        onControlledRgeChange={onRgeToggle}
      />

      {/* Provider list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="region"
        aria-label="Liste des artisans"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <ProviderListSkeleton count={5} />
        ) : displayedProviders.length > 0 ? (
          <ul className="space-y-4" role="list">
            {displayedProviders.map((provider) => (
              <li
                key={provider.id}
                data-provider-id={provider.id}
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
                  isHovered={hoveredId === provider.id || highlightedProviderId === provider.id}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="text-charcoal-500 text-lg">Aucun artisan trouvé</p>
            <p className="text-charcoal-400 text-sm mt-2">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  )
}
