'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2, Navigation, X } from 'lucide-react'

// Simple client-side city autocomplete
interface CitySuggestion {
  id: string
  city: string
  context: string
  label: string
  postcode: string
  coordinates: [number, number]
}

async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=8&autocomplete=1`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return (
      data.features?.map(
        (f: {
          properties: { id: string; city: string; context: string; label: string; postcode: string }
          geometry: { coordinates: [number, number] }
        }) => ({
          id: f.properties.id,
          city: f.properties.city || f.properties.label,
          context: f.properties.context,
          label: f.properties.label,
          postcode: f.properties.postcode,
          coordinates: f.geometry.coordinates,
        })
      ) || []
    )
  } catch {
    return []
  }
}

async function getLocationFromCoords(lon: number, lat: number): Promise<CitySuggestion | null> {
  try {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`
    const response = await fetch(url)
    if (!response.ok) return null
    const data = await response.json()
    const f = data.features?.[0]
    if (!f) return null
    return {
      id: f.properties.id,
      city: f.properties.city || f.properties.label,
      context: f.properties.context,
      label: f.properties.label,
      postcode: f.properties.postcode,
      coordinates: f.geometry.coordinates,
    }
  } catch {
    return null
  }
}

interface VilleAutocompleteProps {
  value?: string
  placeholder?: string
  onSelect: (ville: string, codePostal: string, coords?: [number, number]) => void
  onClear?: () => void
  /** Texte libre saisi (avant toute sélection) — permet de capturer une valeur non listée */
  onQueryChange?: (query: string) => void
  showGeolocation?: boolean
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function VilleAutocomplete({
  value = '',
  placeholder = 'Ville ou code postal...',
  onSelect,
  onClear,
  onQueryChange,
  showGeolocation = true,
  className = '',
  inputClassName = '',
  disabled = false,
}: VilleAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with external value
  useEffect(() => {
    setQuery(value)
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

  // Debounced search - direct API call
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      const results = await searchCities(query)
      setSuggestions(results)
      setIsOpen(results.length > 0)
      setHighlightedIndex(-1)
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Handle selection
  const handleSelect = useCallback(
    (suggestion: CitySuggestion) => {
      setQuery(suggestion.city)
      setIsOpen(false)
      setSuggestions([])
      onSelect(suggestion.city, suggestion.postcode, suggestion.coordinates)
    },
    [onSelect]
  )

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  // Geolocation
  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      alert("La geolocalisation n'est pas supportee par votre navigateur")
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await getLocationFromCoords(
            position.coords.longitude,
            position.coords.latitude
          )

          if (result) {
            setQuery(result.city)
            onSelect(result.city, result.postcode, result.coordinates)
          }
        } catch {
          // Ignore errors
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
        alert("Impossible d'obtenir votre position")
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Clear input
  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
    onClear?.()
  }

  // Popular cities for quick selection
  const popularCities = [
    { name: 'Paris', postcode: '75001' },
    { name: 'Lyon', postcode: '69001' },
    { name: 'Marseille', postcode: '13001' },
    { name: 'Toulouse', postcode: '31000' },
    { name: 'Bordeaux', postcode: '33000' },
    { name: 'Nantes', postcode: '44000' },
  ]

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (e.target.value.length >= 2) setIsOpen(true)
            onQueryChange?.(e.target.value)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLocating}
          className={`w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-20 text-gray-900 transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 ${inputClassName} `}
          autoComplete="off"
        />

        {/* Left icon */}
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

        {/* Right actions */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {/* Loading indicator */}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}

          {/* Clear button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
              aria-label="Effacer"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}

          {/* Geolocation button */}
          {showGeolocation && (
            <button
              type="button"
              onClick={handleGeolocation}
              disabled={isLocating || disabled}
              className="rounded-lg p-1.5 transition-colors hover:bg-blue-50 disabled:opacity-50"
              aria-label="Utiliser ma position"
              title="Utiliser ma position"
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <Navigation className="h-4 w-4 text-blue-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
          role="listbox"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
                  index === highlightedIndex
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-900 hover:bg-gray-50'
                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''} `}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <MapPin
                  className={`h-4 w-4 flex-shrink-0 ${
                    index === highlightedIndex ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{suggestion.city}</div>
                  <div className="truncate text-sm text-gray-500">
                    {suggestion.postcode} - {suggestion.context}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <div className="p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Villes populaires
              </div>
              <div className="grid grid-cols-2 gap-1">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      setQuery(city.name)
                      setIsOpen(false)
                      onSelect(city.name, city.postcode)
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
                  >
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </ul>
      )}
    </div>
  )
}
