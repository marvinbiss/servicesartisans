'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2, X, Home } from 'lucide-react'
import { autocompleteAdresse, type AdresseSuggestion } from '@/lib/api/adresse'

interface AdresseAutocompleteProps {
  value?: string
  placeholder?: string
  onSelect: (adresse: {
    label: string
    rue: string
    codePostal: string
    ville: string
    coords: [number, number]
  }) => void
  onClear?: () => void
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function AdresseAutocomplete({
  value = '',
  placeholder = 'Entrez votre adresse...',
  onSelect,
  onClear,
  className = '',
  inputClassName = '',
  disabled = false
}: AdresseAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<AdresseSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await autocompleteAdresse(query, { limit: 6 })
        setSuggestions(results)
        setIsOpen(results.length > 0)
        setHighlightedIndex(-1)
      } catch (error) {
        console.error('Erreur autocomplete:', error)
      } finally {
        setIsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Handle selection
  const handleSelect = useCallback((suggestion: AdresseSuggestion) => {
    setQuery(suggestion.label)
    setIsOpen(false)
    setSuggestions([])
    onSelect({
      label: suggestion.label,
      rue: suggestion.name,
      codePostal: suggestion.postcode,
      ville: suggestion.city,
      coords: suggestion.coordinates
    })
  }, [onSelect])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
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

  // Clear input
  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setIsOpen(false)
    inputRef.current?.focus()
    onClear?.()
  }

  // Get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'housenumber':
        return <Home className="w-4 h-4" />
      case 'street':
        return <MapPin className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-12 py-3
            bg-white border border-gray-200 rounded-xl
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            placeholder:text-gray-400 text-gray-900
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all
            ${inputClassName}
          `}
          autoComplete="off"
        />

        {/* Left icon */}
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        {/* Right actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Effacer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          className="
            absolute z-50 w-full mt-1
            bg-white border border-gray-200 rounded-xl
            shadow-lg max-h-72 overflow-y-auto
          "
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-4 py-3 cursor-pointer
                flex items-start gap-3
                transition-colors
                ${index === highlightedIndex
                  ? 'bg-primary-50 text-primary-900'
                  : 'hover:bg-gray-50 text-gray-900'
                }
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
              `}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <span className={`mt-0.5 flex-shrink-0 ${
                index === highlightedIndex ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {getTypeIcon(suggestion.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {suggestion.label}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.context}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
