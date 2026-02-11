'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { services, villes } from '@/lib/data/france'

interface SearchBarProps {
  size?: 'compact' | 'large'
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function SearchBar({ size = 'compact' }: SearchBarProps) {
  const router = useRouter()

  const [selectedService, setSelectedService] = useState('')
  const [serviceSlug, setServiceSlug] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [cityQuery, setCityQuery] = useState('')
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [highlightedServiceIndex, setHighlightedServiceIndex] = useState(-1)
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const serviceButtonRef = useRef<HTMLButtonElement>(null)
  const serviceFilterRef = useRef<HTMLInputElement>(null)
  const cityInputRef = useRef<HTMLInputElement>(null)

  // Filter services based on inline filter text
  const filteredServices = useMemo(() => {
    if (!serviceFilter.trim()) return services
    const normalized = normalizeText(serviceFilter)
    return services.filter(s =>
      normalizeText(s.name).includes(normalized) ||
      normalizeText(s.slug).includes(normalized)
    )
  }, [serviceFilter])

  // Filter cities based on query using useMemo
  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return []
    const normalized = normalizeText(cityQuery)
    return villes
      .filter(v =>
        normalizeText(v.name).includes(normalized) ||
        v.codePostal.startsWith(cityQuery.trim())
      )
      .slice(0, 6)
  }, [cityQuery])

  // Reset highlighted indices when lists change
  useEffect(() => {
    setHighlightedServiceIndex(-1)
  }, [filteredServices.length])

  useEffect(() => {
    setHighlightedCityIndex(-1)
  }, [filteredCities.length])

  // Focus filter input when dropdown opens
  useEffect(() => {
    if (showServiceDropdown && serviceFilterRef.current) {
      serviceFilterRef.current.focus()
    }
  }, [showServiceDropdown])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowServiceDropdown(false)
        setShowCityDropdown(false)
        setServiceFilter('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectService = useCallback((service: typeof services[0]) => {
    setSelectedService(service.name)
    setServiceSlug(service.slug)
    setShowServiceDropdown(false)
    setServiceFilter('')
    setHighlightedServiceIndex(-1)
    // Auto-focus city input
    setTimeout(() => cityInputRef.current?.focus(), 50)
  }, [])

  const handleSelectCity = useCallback((city: typeof villes[0]) => {
    setCityQuery(city.name)
    setShowCityDropdown(false)
    setHighlightedCityIndex(-1)
  }, [])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    if (!serviceSlug || !cityQuery.trim()) return

    const cityMatch = villes.find(
      v => normalizeText(v.name) === normalizeText(cityQuery.trim())
    )
    const citySlugValue = cityMatch ? cityMatch.slug : cityQuery.trim().toLowerCase()

    router.push(`/services/${serviceSlug}/${citySlugValue}`)
    setShowServiceDropdown(false)
    setShowCityDropdown(false)
    setServiceFilter('')
  }, [serviceSlug, cityQuery, router])

  // Keyboard navigation for service dropdown
  const handleServiceKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showServiceDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setShowServiceDropdown(true)
        return
      }
      return
    }

    const items = filteredServices
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedServiceIndex(prev => prev < items.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedServiceIndex(prev => prev > 0 ? prev - 1 : items.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedServiceIndex >= 0 && items[highlightedServiceIndex]) {
          handleSelectService(items[highlightedServiceIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowServiceDropdown(false)
        setServiceFilter('')
        serviceButtonRef.current?.focus()
        break
      case 'Tab':
        setShowServiceDropdown(false)
        setServiceFilter('')
        break
    }
  }, [showServiceDropdown, filteredServices, highlightedServiceIndex, handleSelectService])

  // Keyboard navigation for city dropdown
  const handleCityKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showCityDropdown || filteredCities.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedCityIndex(prev => prev < filteredCities.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedCityIndex(prev => prev > 0 ? prev - 1 : filteredCities.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedCityIndex >= 0 && filteredCities[highlightedCityIndex]) {
          handleSelectCity(filteredCities[highlightedCityIndex])
        } else {
          handleSubmit()
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowCityDropdown(false)
        break
    }
  }, [showCityDropdown, filteredCities, highlightedCityIndex, handleSelectCity, handleSubmit])

  const isLarge = size === 'large'

  return (
    <div ref={containerRef} className={`w-full ${isLarge ? 'max-w-3xl mx-auto' : ''}`}>
      <form onSubmit={handleSubmit} role="search" aria-label="Rechercher un artisan">
        <div
          className={`
            flex bg-white
            ${isLarge
              ? 'flex-col sm:flex-row rounded-2xl p-2 gap-2 shadow-lg'
              : 'flex-row rounded-full p-1 gap-1 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 focus-within:border-blue-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-blue-100 transition-all'
            }
          `}
        >
          {/* Service Dropdown */}
          <div className={`relative ${isLarge ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <button
              ref={serviceButtonRef}
              type="button"
              onClick={() => {
                setShowServiceDropdown(!showServiceDropdown)
                setShowCityDropdown(false)
              }}
              onKeyDown={handleServiceKeyDown}
              aria-label="Choisir un service"
              aria-expanded={showServiceDropdown}
              aria-haspopup="listbox"
              className={`
                w-full flex items-center gap-2 text-left transition-all
                ${isLarge
                  ? 'rounded-xl px-4 py-4 text-base border border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'rounded-l-full pl-4 pr-2 py-2 text-sm bg-transparent hover:bg-gray-50'
                }
              `}
            >
              <Search className={`text-gray-400 flex-shrink-0 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
              <span className={`truncate ${selectedService ? 'text-gray-900 font-medium' : 'text-gray-400'} ${isLarge ? '' : 'text-sm'}`}>
                {selectedService || 'Service ?'}
              </span>
              <ChevronDown className={`ml-auto text-gray-400 flex-shrink-0 transition-transform duration-200 ${showServiceDropdown ? 'rotate-180' : ''} ${isLarge ? 'w-5 h-5' : 'w-3.5 h-3.5'}`} />
            </button>

            {/* Service Dropdown List */}
            {showServiceDropdown && (
              <div className={`absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden ${
                isLarge ? 'right-0 p-2' : 'w-64 p-1.5'
              }`}>
                {/* Inline filter */}
                <div className={`px-2 pb-1.5 ${isLarge ? 'pt-1' : 'pt-0.5'}`}>
                  <input
                    ref={serviceFilterRef}
                    type="text"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    onKeyDown={handleServiceKeyDown}
                    placeholder="Filtrer..."
                    autoComplete="off"
                    className={`w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-gray-900 placeholder:text-gray-400 ${
                      isLarge ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-xs'
                    }`}
                  />
                </div>
                <div className={`max-h-56 overflow-y-auto ${isLarge ? '' : 'max-h-48'}`}>
                  {filteredServices.length === 0 && (
                    <div className="px-3 py-4 text-center text-gray-400 text-xs">
                      Aucun service trouvé
                    </div>
                  )}
                  {filteredServices.map((service, idx) => {
                    const isHighlighted = idx === highlightedServiceIndex
                    return (
                      <button
                        key={service.slug}
                        type="button"
                        onClick={() => handleSelectService(service)}
                        onMouseEnter={() => setHighlightedServiceIndex(idx)}
                        className={`
                          w-full text-left rounded-lg transition-all duration-100
                          ${isHighlighted
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : serviceSlug === service.slug
                              ? 'bg-blue-50/50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }
                          ${isLarge ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'}
                        `}
                      >
                        {service.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Separator (compact mode only) */}
          {!isLarge && (
            <div className="w-px h-6 bg-gray-200 flex-shrink-0 self-center" />
          )}

          {/* City Autocomplete */}
          <div className={`relative ${isLarge ? 'flex-1' : 'flex-1 min-w-0'}`}>
            <div className="relative">
              <MapPin className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${isLarge ? 'left-4 w-5 h-5' : 'left-3 w-4 h-4'}`} />
              <input
                ref={cityInputRef}
                type="text"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value)
                  setShowCityDropdown(true)
                  setShowServiceDropdown(false)
                }}
                onFocus={() => {
                  if (cityQuery.trim().length > 0) {
                    setShowCityDropdown(true)
                  }
                  setShowServiceDropdown(false)
                }}
                onKeyDown={handleCityKeyDown}
                placeholder={isLarge ? 'Où ? (ville)' : 'Ville...'}
                autoComplete="off"
                aria-label="Ville ou code postal"
                className={`
                  w-full transition-all outline-none text-gray-900 placeholder:text-gray-400
                  ${isLarge
                    ? 'rounded-xl pl-11 pr-4 py-4 text-base border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                    : 'rounded-none pl-9 pr-3 py-2 text-sm bg-transparent'
                  }
                `}
              />
            </div>

            {/* City Suggestions Dropdown */}
            {showCityDropdown && filteredCities.length > 0 && (
              <div className={`absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-56 overflow-y-auto ${
                isLarge ? 'right-0 p-2' : 'w-64 right-0 p-1.5'
              }`}>
                {filteredCities.map((city, idx) => {
                  const isHighlighted = idx === highlightedCityIndex
                  return (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      onMouseEnter={() => setHighlightedCityIndex(idx)}
                      className={`
                        w-full text-left rounded-lg transition-all duration-100
                        ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        ${isLarge ? 'px-4 py-3' : 'px-3 py-2'}
                      `}
                    >
                      <div className={`font-medium ${isHighlighted ? 'text-blue-700' : 'text-gray-900'} ${isLarge ? 'text-base' : 'text-sm'}`}>
                        {city.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {city.departement} ({city.departementCode}) - {city.region}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className={`
              bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all flex items-center justify-center gap-2 flex-shrink-0
              ${isLarge
                ? 'rounded-xl px-8 py-4 text-base shadow-md hover:shadow-lg'
                : 'rounded-full w-9 h-9 m-0.5 shadow-sm hover:shadow-md hover:scale-105'
              }
            `}
          >
            <Search className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
            {isLarge && <span>Rechercher</span>}
          </button>
        </div>
      </form>
    </div>
  )
}
