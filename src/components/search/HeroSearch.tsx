'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, TrendingUp, Zap, Wrench, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous, Navigation, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { slugify } from '@/lib/utils'
import { villes } from '@/lib/data/france'

// Map des icones
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench, Zap, Key, Flame, PaintBucket, Hammer, Grid3X3, Home, TreeDeciduous
}

// Services avec icones premium
const services = [
  { name: 'Plombier', slug: 'plombier', icon: 'Wrench', color: 'from-blue-500 to-blue-600', searches: '15k/mois', urgent: true },
  { name: 'Électricien', slug: 'electricien', icon: 'Zap', color: 'from-amber-500 to-amber-600', searches: '12k/mois', urgent: true },
  { name: 'Serrurier', slug: 'serrurier', icon: 'Key', color: 'from-slate-600 to-slate-700', searches: '9k/mois', urgent: true },
  { name: 'Chauffagiste', slug: 'chauffagiste', icon: 'Flame', color: 'from-orange-500 to-orange-600', searches: '7k/mois', urgent: false },
  { name: 'Peintre', slug: 'peintre-en-batiment', icon: 'PaintBucket', color: 'from-purple-500 to-purple-600', searches: '6k/mois', urgent: false },
  { name: 'Menuisier', slug: 'menuisier', icon: 'Hammer', color: 'from-amber-600 to-amber-700', searches: '5k/mois', urgent: false },
  { name: 'Carreleur', slug: 'carreleur', icon: 'Grid3X3', color: 'from-teal-500 to-teal-600', searches: '4k/mois', urgent: false },
  { name: 'Couvreur', slug: 'couvreur', icon: 'Home', color: 'from-red-500 to-red-600', searches: '4k/mois', urgent: false },
  { name: 'Maçon', slug: 'macon', icon: 'Wrench', color: 'from-stone-500 to-stone-600', searches: '3k/mois', urgent: false },
  { name: 'Jardinier', slug: 'jardinier', icon: 'TreeDeciduous', color: 'from-green-500 to-green-600', searches: '3k/mois', urgent: false },
]

// Normalize text for accent-insensitive search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Popular cities for quick access (subset)
const popularCities = [
  { name: 'Paris', slug: 'paris', departement: 'Paris (75)', pop: '2.1M' },
  { name: 'Marseille', slug: 'marseille', departement: 'Bouches-du-Rhone (13)', pop: '870k' },
  { name: 'Lyon', slug: 'lyon', departement: 'Rhone (69)', pop: '522k' },
  { name: 'Toulouse', slug: 'toulouse', departement: 'Haute-Garonne (31)', pop: '493k' },
  { name: 'Nice', slug: 'nice', departement: 'Alpes-Maritimes (06)', pop: '342k' },
  { name: 'Nantes', slug: 'nantes', departement: 'Loire-Atlantique (44)', pop: '320k' },
  { name: 'Bordeaux', slug: 'bordeaux', departement: 'Gironde (33)', pop: '260k' },
  { name: 'Lille', slug: 'lille', departement: 'Nord (59)', pop: '236k' },
]

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [activeField, setActiveField] = useState<'service' | 'location' | null>(null)
  const [highlightedServiceIndex, setHighlightedServiceIndex] = useState(-1)
  const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const serviceInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const serviceListRef = useRef<HTMLDivElement>(null)

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Filtrer services with accent-insensitive matching
  const filteredServices = useMemo(() => {
    if (!query) return services
    const normalized = normalizeText(query)
    return services.filter(s => normalizeText(s.name).includes(normalized))
  }, [query])

  // Filtrer villes from france.ts data with accent-insensitive matching
  const filteredCities = useMemo(() => {
    if (!location.trim()) return []
    const normalized = normalizeText(location)
    return villes
      .filter(v =>
        normalizeText(v.name).includes(normalized) ||
        v.codePostal.startsWith(location.trim()) ||
        normalizeText(v.departement).includes(normalized)
      )
      .slice(0, 8)
  }, [location])

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedServiceIndex(-1)
  }, [filteredServices.length])

  useEffect(() => {
    setHighlightedCityIndex(-1)
  }, [filteredCities.length])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedServiceIndex >= 0 && serviceListRef.current) {
      const items = serviceListRef.current.querySelectorAll('[data-service-item]')
      items[highlightedServiceIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedServiceIndex])

  // Geolocalisation
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${position.coords.longitude}&lat=${position.coords.latitude}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            const city = data.features?.[0]?.properties?.city
            if (city) {
              setLocation(city)
              setActiveField(null)
            } else {
              setLocation('Autour de moi')
              setActiveField(null)
            }
          }
        } catch {
          setLocation('Autour de moi')
          setActiveField(null)
        } finally {
          setIsLocating(false)
        }
      },
      () => setIsLocating(false),
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  // Submit
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const serviceSlug = services.find(s => normalizeText(s.name) === normalizeText(query))?.slug || slugify(query)
    const cityMatch = villes.find(v => normalizeText(v.name) === normalizeText(location))
    const citySlug = cityMatch?.slug || slugify(location)

    if (query && location) {
      router.push(`/services/${serviceSlug}/${citySlug}`)
    } else if (query) {
      router.push(`/services/${serviceSlug}`)
    } else {
      router.push(`/recherche?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
    }
  }, [query, location, router])

  const selectService = useCallback((service: typeof services[0]) => {
    setQuery(service.name)
    setActiveField('location')
    setHighlightedServiceIndex(-1)
    // Focus the location input after a brief delay
    setTimeout(() => locationInputRef.current?.focus(), 50)
  }, [])

  const selectCity = useCallback((cityName: string) => {
    setLocation(cityName)
    setActiveField(null)
    setHighlightedCityIndex(-1)
  }, [])

  // Keyboard nav for services
  const handleServiceKeyDown = useCallback((e: React.KeyboardEvent) => {
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
          selectService(items[highlightedServiceIndex])
        } else if (query) {
          // Move to location field
          setActiveField('location')
          setTimeout(() => locationInputRef.current?.focus(), 50)
        }
        break
      case 'Escape':
        setActiveField(null)
        serviceInputRef.current?.blur()
        break
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault()
          setActiveField('location')
          locationInputRef.current?.focus()
        }
        break
    }
  }, [filteredServices, highlightedServiceIndex, query, selectService])

  // Keyboard nav for cities
  const handleLocationKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = filteredCities.length > 0 ? filteredCities : popularCities
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedCityIndex(prev => prev < items.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedCityIndex(prev => prev > 0 ? prev - 1 : items.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedCityIndex >= 0 && items[highlightedCityIndex]) {
          selectCity(items[highlightedCityIndex].name)
        } else {
          handleSubmit()
        }
        break
      case 'Escape':
        setActiveField(null)
        locationInputRef.current?.blur()
        break
      case 'Tab':
        if (e.shiftKey) {
          e.preventDefault()
          setActiveField('service')
          serviceInputRef.current?.focus()
        } else {
          setActiveField(null)
        }
        break
    }
  }, [filteredCities, highlightedCityIndex, selectCity, handleSubmit])

  // Show location suggestions (either filtered or popular)
  const showCitySuggestions = activeField === 'location'
  const cityItems = filteredCities.length > 0 ? filteredCities : []
  const showPopularCities = showCitySuggestions && cityItems.length === 0

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 overflow-visible relative"
      >
        <form onSubmit={handleSubmit} role="search" aria-label="Rechercher un artisan">
          <div className="flex flex-col md:flex-row">
            {/* Service Field */}
            <div className="flex-1 relative">
              <div
                className={`p-4 md:p-5 cursor-text border-b md:border-b-0 md:border-r transition-all duration-200 ${
                  activeField === 'service'
                    ? 'bg-slate-50 border-blue-200'
                    : 'hover:bg-slate-50/50 border-slate-200'
                }`}
                onClick={() => {
                  setActiveField('service')
                  serviceInputRef.current?.focus()
                }}
              >
                <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase">
                  Quel service ?
                </label>
                <div className="flex items-center gap-3">
                  <Search className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    activeField === 'service' ? 'text-blue-500' : 'text-slate-400'
                  }`} />
                  <input
                    ref={serviceInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setActiveField('service')}
                    onKeyDown={handleServiceKeyDown}
                    placeholder="Plombier, électricien, peintre..."
                    aria-label="Type de service recherché"
                    autoComplete="off"
                    className="w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setQuery('')
                        serviceInputRef.current?.focus()
                      }}
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                    >
                      <span className="text-slate-500 text-xs font-bold">x</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Service Suggestions */}
              <AnimatePresence>
                {activeField === 'service' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 right-0 md:left-0 md:right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden max-h-[420px] overflow-y-auto"
                  >
                    {/* Urgence Banner */}
                    <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium text-sm">Urgence 24h/24 ?</span>
                        <button
                          type="button"
                          onClick={() => router.push('/urgence')}
                          className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors backdrop-blur-sm"
                        >
                          Trouver maintenant
                          <ChevronRight className="w-3 h-3 inline ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Services List */}
                    <div className="p-2" ref={serviceListRef}>
                      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {query ? `Résultats pour "${query}"` : 'Services populaires'}
                      </div>
                      {filteredServices.length === 0 && (
                        <div className="px-3 py-6 text-center text-slate-400 text-sm">
                          Aucun service trouvé. Essayez un autre terme.
                        </div>
                      )}
                      {filteredServices.map((service, idx) => {
                        const IconComponent = iconMap[service.icon] || Wrench
                        const isHighlighted = idx === highlightedServiceIndex
                        return (
                          <button
                            key={service.slug}
                            type="button"
                            data-service-item
                            onClick={() => selectService(service)}
                            onMouseEnter={() => setHighlightedServiceIndex(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 group ${
                              isHighlighted
                                ? 'bg-blue-50 shadow-sm'
                                : 'hover:bg-blue-50/60'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center shadow-sm transition-transform duration-150 ${
                              isHighlighted ? 'scale-110' : 'group-hover:scale-105'
                            }`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`font-medium transition-colors duration-150 ${
                                isHighlighted ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'
                              }`}>
                                {service.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {service.searches} recherches
                              </div>
                            </div>
                            {service.urgent && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                Urgence 24h
                              </span>
                            )}
                            <ChevronRight className={`w-4 h-4 transition-all duration-150 ${
                              isHighlighted ? 'text-blue-400 translate-x-0.5' : 'text-slate-300'
                            }`} />
                          </button>
                        )
                      })}
                    </div>

                    {/* Keyboard hint */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">Flèches</kbd>
                        naviguer
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">Entrée</kbd>
                        valider
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">Échap</kbd>
                        fermer
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location Field */}
            <div className="flex-1 relative">
              <div
                className={`p-4 md:p-5 cursor-text transition-all duration-200 ${
                  activeField === 'location'
                    ? 'bg-slate-50 border-blue-200'
                    : 'hover:bg-slate-50/50'
                }`}
                onClick={() => {
                  setActiveField('location')
                  locationInputRef.current?.focus()
                }}
              >
                <label className="block text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase">
                  Où ?
                </label>
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                    activeField === 'location' ? 'text-blue-500' : 'text-slate-400'
                  }`} />
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setActiveField('location')}
                    onKeyDown={handleLocationKeyDown}
                    placeholder="Ville, code postal..."
                    aria-label="Ville ou code postal"
                    autoComplete="off"
                    className="w-full bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  {location && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLocation('')
                        locationInputRef.current?.focus()
                      }}
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
                    >
                      <span className="text-slate-500 text-xs font-bold">x</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Location Suggestions */}
              <AnimatePresence>
                {showCitySuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 right-0 md:left-0 md:right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden"
                  >
                    {/* Geolocation */}
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={isLocating}
                      className="w-full flex items-center gap-3 p-4 hover:bg-blue-50 border-b border-slate-100 transition-all duration-150"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isLocating ? 'bg-blue-200' : 'bg-blue-100'
                      }`}>
                        {isLocating ? (
                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Navigation className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-slate-900">
                          {isLocating ? 'Localisation en cours...' : 'Utiliser ma position'}
                        </div>
                        <div className="text-sm text-slate-500">
                          Artisans autour de vous
                        </div>
                      </div>
                    </button>

                    {/* Filtered cities from france.ts */}
                    {cityItems.length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-slate-500 font-medium">
                          {cityItems.length} ville{cityItems.length > 1 ? 's' : ''} trouvée{cityItems.length > 1 ? 's' : ''}
                        </div>
                        {cityItems.map((city, idx) => {
                          const isHighlighted = idx === highlightedCityIndex
                          return (
                            <button
                              key={city.slug}
                              type="button"
                              onClick={() => selectCity(city.name)}
                              onMouseEnter={() => setHighlightedCityIndex(idx)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                                isHighlighted
                                  ? 'bg-blue-50 shadow-sm'
                                  : 'hover:bg-blue-50/60'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                isHighlighted ? 'bg-blue-100' : 'bg-slate-100'
                              }`}>
                                <MapPin className={`w-4 h-4 ${isHighlighted ? 'text-blue-600' : 'text-slate-400'}`} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className={`font-medium transition-colors ${
                                  isHighlighted ? 'text-blue-700' : 'text-slate-900'
                                }`}>
                                  {city.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {city.departement} ({city.departementCode}) - {city.region}
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {city.codePostal}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Popular cities */}
                    {showPopularCities && (
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs text-slate-500 font-medium">
                          Villes populaires
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {popularCities.map((city, idx) => {
                            const isHighlighted = idx === highlightedCityIndex
                            return (
                              <button
                                key={city.slug}
                                type="button"
                                onClick={() => selectCity(city.name)}
                                onMouseEnter={() => setHighlightedCityIndex(idx)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                                  isHighlighted
                                    ? 'bg-blue-50 shadow-sm'
                                    : 'hover:bg-blue-50/60'
                                }`}
                              >
                                <div className="text-left">
                                  <span className={`font-medium transition-colors ${
                                    isHighlighted ? 'text-blue-700' : 'text-slate-900'
                                  }`}>{city.name}</span>
                                  <div className="text-[11px] text-slate-400">{city.departement}</div>
                                </div>
                                <span className="text-xs text-slate-400">{city.pop}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Keyboard hint */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">Flèches</kbd>
                        naviguer
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 font-mono text-[10px]">Entrée</kbd>
                        valider
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <div className="p-3 md:p-2 md:pr-3 flex items-center">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Rechercher"
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="md:hidden lg:inline">Rechercher</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-wrap items-center justify-center gap-3"
      >
        <span className="text-sm text-white/60">Populaire :</span>
        {services.slice(0, 4).map((service) => {
          const IconComponent = iconMap[service.icon] || Wrench
          return (
            <button
              key={service.slug}
              onClick={() => {
                setQuery(service.name)
                setActiveField('location')
                setTimeout(() => locationInputRef.current?.focus(), 50)
              }}
              className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 backdrop-blur-sm"
            >
              <IconComponent className="w-3.5 h-3.5" />
              {service.name}
            </button>
          )
        })}
      </motion.div>
    </div>
  )
}
