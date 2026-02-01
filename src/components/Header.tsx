'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, Menu, X, ChevronDown, MapPin, Wrench, Zap, Key, Flame,
  PaintBucket, Home, Hammer, HardHat, Wind, Droplets, TreeDeciduous,
  ShieldCheck, Sparkles, Star, Clock, Phone, ArrowRight, Users, Award,
  ChefHat, Layers, Brush, Navigation, History
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import { services as allServices } from '@/lib/data/france'
import { autocompleteVille, reverseGeocode, type AdresseSuggestion } from '@/lib/api/adresse'

// Services populaires organisés par catégorie
const serviceCategories = [
  {
    category: 'Urgences 24h/24',
    color: 'red',
    icon: Clock,
    services: [
      { name: 'Plombier', slug: 'plombier', icon: Wrench, description: 'Fuites, débouchage, installation', urgent: true },
      { name: 'Serrurier', slug: 'serrurier', icon: Key, description: 'Ouverture de porte, serrure', urgent: true },
      { name: 'Électricien', slug: 'electricien', icon: Zap, description: 'Panne, dépannage électrique', urgent: true },
    ]
  },
  {
    category: 'Chauffage & Clim',
    color: 'orange',
    icon: Flame,
    services: [
      { name: 'Chauffagiste', slug: 'chauffagiste', icon: Flame, description: 'Chaudière, pompe à chaleur' },
      { name: 'Climaticien', slug: 'climaticien', icon: Wind, description: 'Installation, entretien clim' },
    ]
  },
  {
    category: 'Bâtiment',
    color: 'blue',
    icon: HardHat,
    services: [
      { name: 'Maçon', slug: 'macon', icon: HardHat, description: 'Construction, rénovation' },
      { name: 'Couvreur', slug: 'couvreur', icon: Home, description: 'Toiture, zinguerie' },
      { name: 'Menuisier', slug: 'menuisier', icon: Hammer, description: 'Fenêtres, portes, escaliers' },
    ]
  },
  {
    category: 'Finitions',
    color: 'green',
    icon: PaintBucket,
    services: [
      { name: 'Peintre', slug: 'peintre-en-batiment', icon: PaintBucket, description: 'Peinture int. et ext.' },
      { name: 'Carreleur', slug: 'carreleur', icon: Sparkles, description: 'Carrelage, faïence' },
      { name: 'Solier', slug: 'solier', icon: Layers, description: 'Parquet, moquette, lino' },
    ]
  },
  {
    category: 'Aménagement',
    color: 'pink',
    icon: ChefHat,
    services: [
      { name: 'Cuisiniste', slug: 'cuisiniste', icon: ChefHat, description: 'Cuisines sur mesure' },
      { name: 'Nettoyage', slug: 'nettoyage', icon: Brush, description: 'Ménage professionnel' },
    ]
  },
  {
    category: 'Extérieur',
    color: 'emerald',
    icon: TreeDeciduous,
    services: [
      { name: 'Paysagiste', slug: 'paysagiste', icon: TreeDeciduous, description: 'Jardin, aménagement' },
      { name: 'Pisciniste', slug: 'pisciniste', icon: Droplets, description: 'Piscine, entretien' },
    ]
  },
]

// Villes populaires
const popularCities = [
  { name: 'Paris', slug: 'paris', population: '2.1M', region: 'Île-de-France' },
  { name: 'Lyon', slug: 'lyon', population: '522K', region: 'Auvergne-Rhône-Alpes' },
  { name: 'Marseille', slug: 'marseille', population: '870K', region: 'PACA' },
  { name: 'Toulouse', slug: 'toulouse', population: '493K', region: 'Occitanie' },
  { name: 'Bordeaux', slug: 'bordeaux', population: '260K', region: 'Nouvelle-Aquitaine' },
  { name: 'Lille', slug: 'lille', population: '236K', region: 'Hauts-de-France' },
  { name: 'Nantes', slug: 'nantes', population: '320K', region: 'Pays de la Loire' },
  { name: 'Strasbourg', slug: 'strasbourg', population: '287K', region: 'Grand Est' },
  { name: 'Nice', slug: 'nice', population: '342K', region: 'PACA' },
  { name: 'Montpellier', slug: 'montpellier', population: '295K', region: 'Occitanie' },
  { name: 'Rennes', slug: 'rennes', population: '222K', region: 'Bretagne' },
  { name: 'Grenoble', slug: 'grenoble', population: '158K', region: 'Auvergne-Rhône-Alpes' },
]

// Flat list of services
const services = serviceCategories.flatMap(cat => cat.services)

// Normalize text for search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
}

// Get recent searches from localStorage
function getRecentSearches(): Array<{ service: string; location: string }> {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('recentSearches')
    return stored ? JSON.parse(stored).slice(0, 5) : []
  } catch {
    return []
  }
}

// Save search to localStorage
function saveRecentSearch(service: string, location: string) {
  if (typeof window === 'undefined' || (!service && !location)) return
  try {
    const searches = getRecentSearches()
    const newSearch = { service, location }
    const filtered = searches.filter(
      s => s.service !== service || s.location !== location
    )
    const updated = [newSearch, ...filtered].slice(0, 5)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { isMenuOpen, setIsMenuOpen } = useMobileMenu()

  // Search state
  const [serviceQuery, setServiceQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [serviceSuggestions, setServiceSuggestions] = useState<typeof allServices>([])
  const [locationSuggestions, setLocationSuggestions] = useState<AdresseSuggestion[]>([])
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [highlightedServiceIndex, setHighlightedServiceIndex] = useState(-1)
  const [highlightedLocationIndex, setHighlightedLocationIndex] = useState(-1)
  const [isLocating, setIsLocating] = useState(false)
  const [recentSearches, setRecentSearches] = useState<Array<{ service: string; location: string }>>([])

  const [mounted, setMounted] = useState(false)
  const [openMenu, setOpenMenu] = useState<'services' | 'villes' | null>(null)

  const serviceInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true)
    setRecentSearches(getRecentSearches())
  }, [])

  // Filter services based on query
  useEffect(() => {
    if (!serviceQuery.trim()) {
      setServiceSuggestions([])
      return
    }

    const normalized = normalizeText(serviceQuery)
    const filtered = allServices.filter(s =>
      normalizeText(s.name).includes(normalized) ||
      normalizeText(s.slug).includes(normalized)
    ).slice(0, 6)

    setServiceSuggestions(filtered)
    setHighlightedServiceIndex(-1)
  }, [serviceQuery])

  // Debounced location search
  useEffect(() => {
    if (locationQuery.length < 2) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const results = await autocompleteVille(locationQuery, 6)
        setLocationSuggestions(results)
        setHighlightedLocationIndex(-1)
      } catch {
        setLocationSuggestions([])
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [locationQuery])

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!mounted) return

    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowServiceDropdown(false)
        setShowLocationDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mounted])

  // Close all menus on route change
  useEffect(() => {
    setOpenMenu(null)
    setIsMenuOpen(false)
  }, [pathname, setIsMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    if (!mounted) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-menu-trigger]') && !target.closest('[data-menu-content]')) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [mounted])

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (serviceQuery.trim()) params.set('q', serviceQuery.trim())
    if (locationQuery.trim()) params.set('location', locationQuery.trim())

    if (params.toString()) {
      saveRecentSearch(serviceQuery.trim(), locationQuery.trim())
      setRecentSearches(getRecentSearches())
      router.push(`/recherche?${params.toString()}`)
      setShowServiceDropdown(false)
      setShowLocationDropdown(false)
    }
  }, [serviceQuery, locationQuery, router])

  // Handle service selection
  const selectService = useCallback((service: typeof allServices[0]) => {
    setServiceQuery(service.name)
    setShowServiceDropdown(false)
    setServiceSuggestions([])
    locationInputRef.current?.focus()
  }, [])

  // Handle location selection
  const selectLocation = useCallback((location: AdresseSuggestion) => {
    setLocationQuery(location.city)
    setShowLocationDropdown(false)
    setLocationSuggestions([])
    // Auto-submit after location selection
    setTimeout(() => {
      const params = new URLSearchParams()
      if (serviceQuery.trim()) params.set('q', serviceQuery.trim())
      params.set('location', location.city)
      saveRecentSearch(serviceQuery.trim(), location.city)
      setRecentSearches(getRecentSearches())
      router.push(`/recherche?${params.toString()}`)
    }, 100)
  }, [serviceQuery, router])

  // Handle geolocation
  const handleGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return
    }

    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocode(
            position.coords.longitude,
            position.coords.latitude
          )
          if (result) {
            setLocationQuery(result.city)
            // Auto-submit if we have a service
            if (serviceQuery.trim()) {
              setTimeout(() => {
                handleSearch()
              }, 100)
            }
          }
        } catch {
          // Ignore errors
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [serviceQuery, handleSearch])

  // Handle keyboard navigation for service input
  const handleServiceKeyDown = (e: React.KeyboardEvent) => {
    const suggestions = serviceSuggestions.length > 0 ? serviceSuggestions : []

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedServiceIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedServiceIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedServiceIndex >= 0 && suggestions[highlightedServiceIndex]) {
          selectService(suggestions[highlightedServiceIndex])
        } else if (!showServiceDropdown || suggestions.length === 0) {
          handleSearch()
        }
        break
      case 'Escape':
        setShowServiceDropdown(false)
        break
      case 'Tab':
        setShowServiceDropdown(false)
        break
    }
  }

  // Handle keyboard navigation for location input
  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedLocationIndex(prev =>
          prev < locationSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedLocationIndex(prev =>
          prev > 0 ? prev - 1 : locationSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedLocationIndex >= 0 && locationSuggestions[highlightedLocationIndex]) {
          selectLocation(locationSuggestions[highlightedLocationIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowLocationDropdown(false)
        break
    }
  }

  // Apply recent search
  const applyRecentSearch = useCallback((search: { service: string; location: string }) => {
    setServiceQuery(search.service)
    setLocationQuery(search.location)
    const params = new URLSearchParams()
    if (search.service) params.set('q', search.service)
    if (search.location) params.set('location', search.location)
    router.push(`/recherche?${params.toString()}`)
    setShowServiceDropdown(false)
    setShowLocationDropdown(false)
  }, [router])

  const toggleMenu = (menu: 'services' | 'villes') => {
    setOpenMenu(current => current === menu ? null : menu)
  }

  const openMenuOnHover = (menu: 'services' | 'villes') => {
    setOpenMenu(menu)
  }

  const closeMenus = () => {
    setOpenMenu(null)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-[9999] shadow-sm">
      {/* Top bar premium */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-white/90">120 000+ artisans vérifiés</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-white/90">4.8/5 satisfaction</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/inscription-artisan" className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Espace Pro</span>
            </Link>
            <Link href="/urgence" className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full hover:bg-red-500/30 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-300 font-medium">Urgences 24h</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">SA</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                Services<span className="text-blue-600">Artisans</span>
              </span>
            </div>
          </Link>

          {/* Search Bar - Dual Field (Service + Location) - Style Doctolib */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 focus-within:border-blue-500 focus-within:shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">

                {/* Service Input */}
                <div className="relative flex-[1.2]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={serviceInputRef}
                    type="text"
                    placeholder="Service..."
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    onFocus={() => setShowServiceDropdown(true)}
                    onKeyDown={handleServiceKeyDown}
                    className="w-full h-12 pl-11 pr-2 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none rounded-l-full"
                    autoComplete="off"
                  />
                </div>

                {/* Separator */}
                <div className="w-px h-7 bg-gray-200 flex-shrink-0" />

                {/* Location Input */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Ville..."
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value)
                      setShowLocationDropdown(true)
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onKeyDown={handleLocationKeyDown}
                    className="w-full h-12 pl-9 pr-9 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    autoComplete="off"
                  />

                  {/* Geolocation Button */}
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={isLocating}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Ma position"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-600' : 'text-gray-400 hover:text-blue-600'}`} />
                  </button>

                  {/* Location Dropdown - inside the input container */}
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 w-72 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]">
                      {locationSuggestions.length > 0 ? (
                        <div className="p-2 max-h-64 overflow-y-auto">
                          {locationSuggestions.map((location, idx) => (
                            <button
                              key={location.label}
                              type="button"
                              onClick={() => selectLocation(location)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                idx === highlightedLocationIndex ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                idx === highlightedLocationIndex ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <MapPin className={`w-4 h-4 ${idx === highlightedLocationIndex ? 'text-blue-600' : 'text-gray-500'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium truncate ${idx === highlightedLocationIndex ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {location.city}
                                </div>
                                <div className="text-xs text-gray-400 truncate">{location.context}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Villes populaires</div>
                          <div className="grid grid-cols-2 gap-1">
                            {popularCities.slice(0, 8).map((city) => (
                              <button
                                key={city.slug}
                                type="button"
                                onClick={() => {
                                  setLocationQuery(city.name)
                                  setShowLocationDropdown(false)
                                  setTimeout(() => {
                                    const params = new URLSearchParams()
                                    if (serviceQuery.trim()) params.set('q', serviceQuery.trim())
                                    params.set('location', city.name)
                                    saveRecentSearch(serviceQuery.trim(), city.name)
                                    setRecentSearches(getRecentSearches())
                                    router.push(`/recherche?${params.toString()}`)
                                  }, 100)
                                }}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-xl text-left transition-colors"
                              >
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-gray-700">{city.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="flex-shrink-0 m-1.5 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105"
                  aria-label="Rechercher"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {/* Service Dropdown */}
              {showServiceDropdown && (
                <div className="absolute top-full left-0 w-72 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]">
                  {recentSearches.length > 0 && !serviceQuery && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        <History className="w-3 h-3" />
                        Récent
                      </div>
                      {recentSearches.slice(0, 3).map((search, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyRecentSearch(search)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-xl text-left transition-colors"
                        >
                          <Clock className="w-4 h-4 text-gray-300" />
                          <span className="text-sm text-gray-700 truncate">
                            {search.service || 'Tous'}{search.location && ` · ${search.location}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {serviceSuggestions.length > 0 ? (
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {serviceSuggestions.map((service, idx) => (
                        <button
                          key={service.slug}
                          type="button"
                          onClick={() => selectService(service)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                            idx === highlightedServiceIndex ? 'bg-blue-50 shadow-sm' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            idx === highlightedServiceIndex ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Wrench className={`w-4 h-4 ${idx === highlightedServiceIndex ? 'text-blue-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium truncate ${idx === highlightedServiceIndex ? 'text-blue-700' : 'text-gray-900'}`}>
                              {service.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : !serviceQuery && recentSearches.length === 0 && (
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Populaires</div>
                      <div className="space-y-1">
                        {services.slice(0, 5).map((service) => {
                          const Icon = service.icon
                          return (
                            <button
                              key={service.slug}
                              type="button"
                              onClick={() => {
                                setServiceQuery(service.name)
                                setShowServiceDropdown(false)
                                locationInputRef.current?.focus()
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-xl text-left transition-colors"
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                                <Icon className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm text-gray-700">{service.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openMenuOnHover('services')}
              onMouseLeave={closeMenus}
            >
              <button
                type="button"
                data-menu-trigger="services"
                onClick={() => toggleMenu('services')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all ${
                  openMenu === 'services'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenu === 'services' ? 'rotate-180' : ''}`} />
              </button>

              {/* Services Megamenu */}
              {mounted && openMenu === 'services' && (
                <div
                  data-menu-content="services"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[900px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                  style={{ zIndex: 9999 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">Nos services artisans</h3>
                      <p className="text-slate-300 text-sm">Plus de 50 métiers disponibles</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Users className="w-4 h-4 text-amber-400" />
                      120 000+ artisans
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-5 gap-4">
                      {serviceCategories.map((cat) => {
                        const CatIcon = cat.icon
                        const isUrgent = cat.color === 'red'
                        return (
                          <div key={cat.category} className="space-y-3">
                            <div className={`flex items-center gap-2 pb-2 border-b ${isUrgent ? 'border-red-200' : 'border-gray-100'}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-100' : 'bg-blue-50'}`}>
                                <CatIcon className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
                              </div>
                              <span className={`font-semibold text-sm ${isUrgent ? 'text-red-700' : 'text-gray-900'}`}>
                                {cat.category}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {cat.services.map((service) => {
                                const Icon = service.icon
                                return (
                                  <Link
                                    key={service.slug}
                                    href={`/services/${service.slug}`}
                                    onClick={closeMenus}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors group/link ${
                                      isUrgent ? 'hover:bg-red-50' : 'hover:bg-blue-50'
                                    }`}
                                  >
                                    <Icon className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-gray-400 group-hover/link:text-blue-600'}`} />
                                    <div className="flex-1">
                                      <div className={`text-sm font-medium ${
                                        isUrgent ? 'text-gray-900 group-hover/link:text-red-700' : 'text-gray-700 group-hover/link:text-blue-700'
                                      }`}>
                                        {service.name}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">{service.description}</div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/services"
                        onClick={closeMenus}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Voir tous les services
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/urgence"
                        onClick={closeMenus}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Urgence ? Artisan disponible maintenant
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Villes Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openMenuOnHover('villes')}
              onMouseLeave={closeMenus}
            >
              <button
                type="button"
                data-menu-trigger="villes"
                onClick={() => toggleMenu('villes')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all ${
                  openMenu === 'villes'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Villes
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenu === 'villes' ? 'rotate-180' : ''}`} />
              </button>

              {/* Villes Megamenu */}
              {mounted && openMenu === 'villes' && (
                <div
                  data-menu-content="villes"
                  className="absolute top-full right-0 mt-1 w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                  style={{ zIndex: 9999 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-blue-900 px-6 py-4">
                    <h3 className="text-white font-semibold text-lg">Trouvez un artisan par ville</h3>
                    <p className="text-slate-300 text-sm">35 000+ communes couvertes en France</p>
                  </div>

                  <div className="p-6">
                    {/* Quick links */}
                    <div className="flex gap-3 mb-6">
                      <Link
                        href="/regions"
                        onClick={closeMenus}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                      >
                        <MapPin className="w-4 h-4" />
                        Par région
                      </Link>
                      <Link
                        href="/departements"
                        onClick={closeMenus}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                      >
                        <MapPin className="w-4 h-4" />
                        Par département
                      </Link>
                    </div>

                    {/* Popular cities */}
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Villes populaires
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {popularCities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/villes/${city.slug}`}
                          onClick={closeMenus}
                          className="group/city flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <div>
                            <div className="font-medium text-gray-900 group-hover/city:text-blue-700">{city.name}</div>
                            <div className="text-xs text-gray-500">{city.region}</div>
                          </div>
                          <div className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full">{city.population}</div>
                        </Link>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        href="/villes"
                        onClick={closeMenus}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Toutes les villes
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Artisans vérifiés dans chaque ville
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/connexion"
              className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Connexion
            </Link>

            <Link
              href="/devis"
              className="ml-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all duration-300"
            >
              Devis gratuit
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            className="lg:hidden flex items-center justify-center w-12 h-12 -mr-2 rounded-xl active:bg-gray-200 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Search Mobile - Dual Field */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                {/* Service Input Mobile */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Service..."
                    value={serviceQuery}
                    onChange={(e) => setServiceQuery(e.target.value)}
                    className="w-full h-12 pl-9 pr-2 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
                  />
                </div>

                {/* Separator */}
                <div className="w-px h-7 bg-gray-200" />

                {/* Location Input Mobile */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ville..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full h-12 pl-9 pr-10 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm"
                  />
                  {/* Geolocation Button Mobile */}
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={isLocating}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    title="Ma position"
                  >
                    <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-600' : 'text-gray-400'}`} />
                  </button>
                </div>

                {/* Search Button Mobile */}
                <button
                  type="submit"
                  className="flex-shrink-0 m-1.5 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all flex items-center justify-center"
                  aria-label="Rechercher"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            <nav className="space-y-4">
              {/* Services Mobile */}
              <div>
                <div className="font-semibold text-gray-900 mb-3 px-1">Services populaires</div>
                <div className="grid grid-cols-2 gap-2">
                  {services.slice(0, 6).map((service) => {
                    const Icon = service.icon
                    return (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">{service.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <Link
                  href="/services"
                  className="text-blue-600 text-sm font-medium mt-3 block px-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tous les services →
                </Link>
              </div>

              {/* Villes Mobile */}
              <div className="pt-4 border-t border-gray-100">
                <div className="font-semibold text-gray-900 mb-3 px-1">Villes populaires</div>
                <div className="flex flex-wrap gap-2">
                  {popularCities.slice(0, 8).map((city) => (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link
                  href="/urgence"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-600 text-white rounded-xl font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Phone className="w-5 h-5" />
                  Urgences 24h/24
                </Link>
                <div className="flex gap-3">
                  <Link
                    href="/connexion"
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/devis"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-xl font-semibold text-center shadow-lg shadow-amber-500/25"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Devis gratuit
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
