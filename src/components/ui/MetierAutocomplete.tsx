'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search, X, Wrench, Zap, Key, Flame, Hammer, Home, Wind } from 'lucide-react'
import { services } from '@/lib/data/france-light'

interface ServiceItem {
  slug: string
  name: string
  icon: string
  color: string
}

interface MetierAutocompleteProps {
  value?: string
  placeholder?: string
  onSelect: (service: ServiceItem) => void
  onClear?: () => void
  /** Texte libre saisi (avant toute sélection) — permet de capturer une valeur non listée */
  onQueryChange?: (query: string) => void
  showIcon?: boolean
  showAllOnFocus?: boolean
  className?: string
  inputClassName?: string
  disabled?: boolean
  maxSuggestions?: number
}

// Icon mapping for Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Zap,
  Key,
  Flame,
  Hammer,
  Home,
  Wind,
  // Fallback for icons we don't have imported
}

// Get icon component by name
function getIcon(iconName: string): React.ComponentType<{ className?: string }> {
  return iconMap[iconName] || Wrench
}

// Normalize text for search (remove accents, lowercase)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
}

// Fuzzy match score (higher is better)
function fuzzyMatch(query: string, target: string): number {
  const normalizedQuery = normalizeText(query)
  const normalizedTarget = normalizeText(target)

  // Exact match
  if (normalizedTarget === normalizedQuery) return 100

  // Starts with
  if (normalizedTarget.startsWith(normalizedQuery)) return 90

  // Contains
  if (normalizedTarget.includes(normalizedQuery)) return 70

  // Fuzzy character match
  let score = 0
  let queryIndex = 0

  for (let i = 0; i < normalizedTarget.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedTarget[i] === normalizedQuery[queryIndex]) {
      score += 10
      queryIndex++
    }
  }

  // Check if all query characters were found
  if (queryIndex === normalizedQuery.length) {
    return Math.min(60, score)
  }

  return 0
}

// Popular services for quick access
const popularServices = [
  'plombier',
  'electricien',
  'serrurier',
  'chauffagiste',
  'peintre-en-batiment',
]

export function MetierAutocomplete({
  value = '',
  placeholder = "Quel type d'artisan cherchez-vous ?",
  onSelect,
  onClear,
  onQueryChange,
  showIcon = true,
  showAllOnFocus = true,
  className = '',
  inputClassName = '',
  disabled = false,
  maxSuggestions = 8,
}: MetierAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value
  useEffect(() => {
    setQuery(value)
    if (value) {
      const found = services.find((s) => s.name === value || s.slug === value)
      if (found) setSelectedService(found)
    }
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter and sort services
  const filteredServices = useMemo(() => {
    if (!query.trim()) {
      // Show popular services when empty
      if (showAllOnFocus) {
        const popular = services.filter((s) => popularServices.includes(s.slug))
        const others = services.filter((s) => !popularServices.includes(s.slug))
        return [...popular, ...others].slice(0, maxSuggestions)
      }
      return []
    }

    // Score and sort by relevance
    const scored = services
      .map((service) => ({
        service,
        score: Math.max(fuzzyMatch(query, service.name), fuzzyMatch(query, service.slug)),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)

    return scored.map((item) => item.service)
  }, [query, maxSuggestions, showAllOnFocus])

  // Handle selection
  const handleSelect = useCallback(
    (service: ServiceItem) => {
      setQuery(service.name)
      setSelectedService(service)
      setIsOpen(false)
      setHighlightedIndex(-1)
      onSelect(service)
    },
    [onSelect]
  )

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredServices.length === 0) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filteredServices.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredServices.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredServices.length) {
          handleSelect(filteredServices[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('')
    setSelectedService(null)
    setIsOpen(false)
    inputRef.current?.focus()
    onClear?.()
  }, [onClear])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setSelectedService(null)
    setIsOpen(true)
    setHighlightedIndex(-1)
    onQueryChange?.(newValue)
  }

  // Handle focus
  const handleFocus = () => {
    if (showAllOnFocus || query.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-10 pr-12 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 ${selectedService ? 'border-green-500' : ''} ${inputClassName} `}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Left Icon */}
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {selectedService ? (
              <div className={`rounded-lg bg-gradient-to-br p-1 ${selectedService.color} `}>
                {(() => {
                  const IconComponent = getIcon(selectedService.icon)
                  return <IconComponent className="h-4 w-4 text-white" />
                })()}
              </div>
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
              aria-label="Effacer"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && filteredServices.length > 0 && (
        <ul
          className="animate-in fade-in slide-in-from-top-2 absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl duration-200"
          role="listbox"
        >
          {/* Header when showing all */}
          {!query && showAllOnFocus && (
            <li className="border-b bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Services populaires
            </li>
          )}

          {filteredServices.map((service, index) => {
            const IconComponent = getIcon(service.icon)
            const isPopular = popularServices.includes(service.slug)

            return (
              <li
                key={service.slug}
                onClick={() => handleSelect(service)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                  index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${index === 0 && query ? 'rounded-t-xl' : ''} ${index === filteredServices.length - 1 ? 'rounded-b-xl' : ''} `}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {/* Icon with gradient background */}
                <div className={`rounded-lg bg-gradient-to-br p-2 ${service.color} shadow-sm`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>

                {/* Service info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${index === highlightedIndex ? 'text-blue-900' : 'text-gray-900'} `}
                    >
                      {service.name}
                    </span>
                    {isPopular && !query && (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        Populaire
                      </span>
                    )}
                  </div>
                </div>

                {/* Keyboard hint on highlighted */}
                {index === highlightedIndex && (
                  <span className="hidden text-xs text-gray-400 sm:block">Entrée ↵</span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* No results message */}
      {isOpen && query && filteredServices.length === 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 text-center shadow-lg">
          <div className="text-gray-500">Aucun métier trouvé pour "{query}"</div>
          <div className="mt-2 text-sm text-gray-400">
            Essayez : plombier, électricien, serrurier...
          </div>
        </div>
      )}
    </div>
  )
}
