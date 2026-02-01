'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Clock, TrendingUp, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  variant?: 'hero' | 'header' | 'page'
  className?: string
  onSearch?: (query: string, location: string) => void
}

// Services populaires pour suggestions
const popularServices = [
  { name: 'Plombier', slug: 'plombier', searches: '12k recherches/mois' },
  { name: 'Électricien', slug: 'electricien', searches: '9k recherches/mois' },
  { name: 'Serrurier', slug: 'serrurier', searches: '7k recherches/mois' },
  { name: 'Chauffagiste', slug: 'chauffagiste', searches: '5k recherches/mois' },
  { name: 'Menuisier', slug: 'menuisier', searches: '4k recherches/mois' },
  { name: 'Peintre', slug: 'peintre-en-batiment', searches: '4k recherches/mois' },
]

// Villes populaires
const popularCities = [
  { name: 'Paris', slug: 'paris' },
  { name: 'Lyon', slug: 'lyon' },
  { name: 'Marseille', slug: 'marseille' },
  { name: 'Toulouse', slug: 'toulouse' },
  { name: 'Bordeaux', slug: 'bordeaux' },
  { name: 'Nantes', slug: 'nantes' },
]

// Recherches récentes (simulées)
const recentSearches = [
  { service: 'Plombier', location: 'Paris 15e' },
  { service: 'Électricien', location: 'Lyon' },
]

export function SearchBar({ variant = 'hero', className = '', onSearch }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const serviceInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowServiceSuggestions(false)
        setShowLocationSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrer les services
  const filteredServices = popularServices.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  // Géolocalisation
  const handleGeolocate = () => {
    if (!navigator.geolocation) return

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding (simplified - in production use a proper API)
          const { latitude, longitude } = position.coords
          // For demo, just set "Ma position"
          setLocation('Ma position')
        } catch {
          setLocation('Paris') // Fallback
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      }
    )
  }

  // Soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (onSearch) {
      onSearch(query, location)
    } else {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (location) params.set('location', location)
      router.push(`/recherche?${params.toString()}`)
    }
  }

  // Sélection d'un service
  const selectService = (service: typeof popularServices[0]) => {
    setQuery(service.name)
    setShowServiceSuggestions(false)
    locationInputRef.current?.focus()
  }

  // Sélection d'une ville
  const selectCity = (city: typeof popularCities[0]) => {
    setLocation(city.name)
    setShowLocationSuggestions(false)
  }

  const isHero = variant === 'hero'
  const isHeader = variant === 'header'

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className={`
          ${isHero ? 'bg-white rounded-2xl shadow-2xl p-3 md:p-4' : ''}
          ${isHeader ? 'bg-slate-100 rounded-xl p-1' : ''}
          ${variant === 'page' ? 'bg-white rounded-xl shadow-lg p-4 border border-slate-200' : ''}
        `}>
          <div className={`flex ${isHeader ? 'flex-row' : 'flex-col md:flex-row'} gap-3`}>
            {/* Champ service */}
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isHero ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                ref={serviceInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowServiceSuggestions(true)}
                placeholder="Quel service recherchez-vous ?"
                className={`
                  w-full pl-12 pr-4 py-4 border-0 rounded-xl
                  ${isHero ? 'bg-slate-50 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white' : ''}
                  ${isHeader ? 'bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 py-3' : ''}
                  transition-all
                `}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions services */}
              <AnimatePresence>
                {showServiceSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  >
                    {/* Recherches récentes */}
                    {recentSearches.length > 0 && !query && (
                      <div className="p-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                          <Clock className="w-3 h-3" />
                          Recherches récentes
                        </div>
                        {recentSearches.map((search, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setQuery(search.service)
                              setLocation(search.location)
                              setShowServiceSuggestions(false)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700"
                          >
                            {search.service} à {search.location}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Services populaires/filtrés */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <TrendingUp className="w-3 h-3" />
                        {query ? 'Résultats' : 'Services populaires'}
                      </div>
                      {(query ? filteredServices : popularServices).map((service) => (
                        <button
                          key={service.slug}
                          type="button"
                          onClick={() => selectService(service)}
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50 rounded-lg flex items-center justify-between group"
                        >
                          <span className="font-medium text-slate-900 group-hover:text-blue-600">
                            {service.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {service.searches}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Champ localisation */}
            <div className="flex-1 relative">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isHero ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                placeholder="Ville ou code postal"
                className={`
                  w-full pl-12 pr-12 py-4 border-0 rounded-xl
                  ${isHero ? 'bg-slate-50 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:bg-white' : ''}
                  ${isHeader ? 'bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 py-3' : ''}
                  transition-all
                `}
              />

              {/* Bouton géolocalisation */}
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={isLocating}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:text-slate-300"
                title="Utiliser ma position"
              >
                {isLocating ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              {/* Suggestions villes */}
              <AnimatePresence>
                {showLocationSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        Villes populaires
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {popularCities.map((city) => (
                          <button
                            key={city.slug}
                            type="button"
                            onClick={() => selectCity(city)}
                            className="text-left px-3 py-2 hover:bg-blue-50 rounded-lg text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bouton rechercher */}
            <button
              type="submit"
              className={`
                bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                text-white px-8 py-4 rounded-xl font-semibold transition-all
                shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40
                flex items-center justify-center gap-2
                ${isHeader ? 'px-6 py-3' : ''}
              `}
            >
              {isHeader ? (
                <Search className="w-5 h-5" />
              ) : (
                <>
                  Rechercher
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
