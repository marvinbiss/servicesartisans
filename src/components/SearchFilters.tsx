'use client'

import { useState } from 'react'
import { Filter, ChevronDown, X, BadgeCheck, Award, Star } from 'lucide-react'

interface FilterState {
  verified: boolean
  premium: boolean
  minRating: number | null
  sortBy: 'relevance' | 'rating' | 'name'
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
  totalResults: number
}

export default function SearchFilters({ onFilterChange, totalResults }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    premium: false,
    minRating: null,
    sortBy: 'relevance',
  })
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      verified: false,
      premium: false,
      minRating: null,
      sortBy: 'relevance',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFiltersCount = [
    filters.verified,
    filters.premium,
    filters.minRating !== null,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="flex items-center justify-between gap-4">
        {/* Results count */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalResults}</span> artisan{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="relevance">Pertinence</option>
              <option value="rating">Meilleures notes</option>
              <option value="name">Nom A-Z</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            {/* Verified filter */}
            <button
              onClick={() => updateFilter('verified', !filters.verified)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filters.verified
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              <span>Vérifié</span>
            </button>

            {/* Premium filter */}
            <button
              onClick={() => updateFilter('premium', !filters.premium)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filters.premium
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Premium</span>
            </button>

            {/* Rating filter */}
            <div className="flex items-center gap-1">
              {[4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    updateFilter('minRating', filters.minRating === rating ? null : rating)
                  }
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    filters.minRating === rating
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>{rating}+</span>
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
