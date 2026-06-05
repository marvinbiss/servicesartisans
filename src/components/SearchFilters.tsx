'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Filter, ChevronDown, X, BadgeCheck, Star, Leaf } from 'lucide-react'

interface FilterState {
  verified: boolean
  rge: boolean
  minRating: number | null
  sortBy: 'rating' | 'name'
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
  totalResults: number
  /** When provided, the RGE button is controlled externally (URL-driven, server-side filter). */
  controlledRge?: boolean
  /** Called when the user toggles the RGE button while in controlled mode. */
  onControlledRgeChange?: (next: boolean) => void
}

export default function SearchFilters({
  onFilterChange,
  totalResults,
  controlledRge,
  onControlledRgeChange,
}: SearchFiltersProps) {
  const isRgeControlled = controlledRge !== undefined
  const [filters, setFilters] = useState<FilterState>({
    verified: false,
    rge: false,
    minRating: null,
    sortBy: 'name',
  })
  const rgeActive = isRgeControlled ? controlledRge : filters.rge
  const [isOpen, setIsOpen] = useState(false)
  const sortLabelId = useId()
  const filterPanelId = useId()

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      verified: false,
      rge: false,
      minRating: null,
      sortBy: 'name',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
    if (isRgeControlled && rgeActive) {
      onControlledRgeChange?.(false)
    }
  }

  const activeFiltersCount = [filters.verified, rgeActive, filters.minRating !== null].filter(
    Boolean
  ).length

  // Roving tabindex for the filter toolbar (WAI-ARIA toolbar pattern):
  // a single tab-stop enters the toolbar, arrow keys move focus between
  // toggles, Home/End jump to the extremities. The clear button is part of
  // the toolbar so it sits in the same focus ring.
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [activeToolbarIndex, setActiveToolbarIndex] = useState(0)

  // Snap activeToolbarIndex back to 0 whenever the panel re-opens so the
  // first toggle is always the entry point (avoids stale focus on a
  // button that just got hidden by Clear).
  useEffect(() => {
    if (isOpen) setActiveToolbarIndex(0)
  }, [isOpen])

  const handleToolbarKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!toolbarRef.current) return
    const items = Array.from(
      toolbarRef.current.querySelectorAll<HTMLElement>('[data-toolbar-item]')
    )
    if (items.length === 0) return
    const currentIndex = items.findIndex((el) => el === document.activeElement)
    const from = currentIndex === -1 ? 0 : currentIndex
    let next = from
    switch (e.key) {
      case 'ArrowRight':
        next = (from + 1) % items.length
        break
      case 'ArrowLeft':
        next = (from - 1 + items.length) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    setActiveToolbarIndex(next)
    items[next].focus()
  }, [])

  return (
    <div
      className="bg-white border-b border-sand-300 py-3 px-4"
      role="search"
      aria-label="Filtres de recherche"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Results count */}
        <div
          className="text-sm text-charcoal-600"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="font-bold text-charcoal-900">{totalResults}</span> artisan
          {totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
        </div>

        {/* Filter controls */}
        <div
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
          role="group"
          aria-label="Controles de tri et filtrage"
        >
          {/* Sort dropdown */}
          <div className="relative">
            <label id={sortLabelId} className="sr-only">
              Trier par
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
              aria-labelledby={sortLabelId}
              className="appearance-none bg-sand-100 border border-sand-300 rounded-lg px-3 py-2 pr-8 text-sm text-charcoal-700 focus:ring-2 focus:ring-primary-400 focus:border-transparent cursor-pointer transition-colors duration-200"
            >
              <option value="name">Nom A-Z</option>
              <option value="rating">Meilleures notes</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={filterPanelId}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
              activeFiltersCount > 0
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'bg-sand-100 border-sand-300 text-charcoal-700 hover:bg-sand-200'
            }`}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span
                className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                aria-label={`${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}`}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {isOpen && (
        <div
          id={filterPanelId}
          ref={toolbarRef}
          className="mt-4 pt-4 border-t border-sand-200"
          role="toolbar"
          aria-label="Options de filtrage"
          aria-orientation="horizontal"
          onKeyDown={handleToolbarKeyDown}
        >
          <div className="flex flex-wrap gap-3">
            {/* Verified filter */}
            <button
              data-toolbar-item
              tabIndex={activeToolbarIndex === 0 ? 0 : -1}
              onClick={() => updateFilter('verified', !filters.verified)}
              aria-pressed={filters.verified}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
                filters.verified
                  ? 'bg-accent-50 border-accent-200 text-accent-700'
                  : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-50'
              }`}
            >
              <BadgeCheck className="w-4 h-4" aria-hidden="true" />
              <span>Vérifié</span>
            </button>

            {/* RGE filter (ADEME — indispensable pour aides MaPrimeRénov', CEE, TVA 5,5%) */}
            <button
              data-toolbar-item
              tabIndex={activeToolbarIndex === 1 ? 0 : -1}
              onClick={() => {
                if (isRgeControlled) {
                  onControlledRgeChange?.(!rgeActive)
                } else {
                  updateFilter('rge', !filters.rge)
                }
              }}
              aria-pressed={rgeActive}
              title="Reconnu Garant de l'Environnement — requis pour MaPrimeRénov', CEE et TVA 5,5%"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
                rgeActive
                  ? 'bg-accent-50 border-accent-200 text-accent-700'
                  : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-50'
              }`}
            >
              <Leaf className="w-4 h-4" aria-hidden="true" />
              <span>Certifié RGE</span>
            </button>

            {/* Rating filter — both buttons are real toolbar items */}
            {[4, 4.5].map((rating, ratingIdx) => (
              <button
                key={rating}
                data-toolbar-item
                tabIndex={activeToolbarIndex === 2 + ratingIdx ? 0 : -1}
                onClick={() =>
                  updateFilter('minRating', filters.minRating === rating ? null : rating)
                }
                aria-pressed={filters.minRating === rating}
                aria-label={`Note minimum ${rating} étoiles`}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
                  filters.minRating === rating
                    ? 'bg-secondary-50 border-secondary-200 text-secondary-700'
                    : 'bg-white border-sand-300 text-charcoal-700 hover:bg-sand-50'
                }`}
              >
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>{rating}+</span>
              </button>
            ))}

            {/* Clear filters */}
            {activeFiltersCount > 0 && (
              <button
                data-toolbar-item
                tabIndex={activeToolbarIndex === 4 ? 0 : -1}
                onClick={clearFilters}
                aria-label="Effacer tous les filtres"
                className="flex items-center gap-1 px-3 py-2 text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-500 focus-visible:ring-offset-2 rounded-lg"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>Effacer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
