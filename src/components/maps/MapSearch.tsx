'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MapPin, Star, Phone, ChevronDown, ChevronUp,
  Loader2, Navigation, Layers, X, Shield, Award, Zap, Heart, ExternalLink,
  List, Map as MapIcon
} from 'lucide-react'
import Link from 'next/link'
import { getArtisanUrl } from '@/lib/utils'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useMapSearchCache } from '@/hooks/useMapSearchCache'
import './map-styles.css'

// Dynamic imports for Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const MapBoundsHandler = dynamic(
  () => import('./MapBoundsHandler'),
  { ssr: false }
)
const MapPerformanceIndicator = dynamic(
  () => import('./MapPerformanceIndicator'),
  { ssr: false }
)
const MapViewController = dynamic(
  () => import('./MapViewController'),
  { ssr: false }
)

interface Provider {
  id: string
  name: string
  stable_id?: string
  slug: string
  latitude: number
  longitude: number
  rating_average: number
  review_count: number
  address_city: string
  phone?: string
  services: string[]
  specialty?: string
  is_verified: boolean
  is_premium: boolean
  hourly_rate_min?: number
  avatar_url?: string
}

interface Filters {
  service: string
  minRating: number
  verified: boolean
  premium: boolean
  emergency: boolean
}

const SERVICES = [
  { value: 'plombier', label: 'Plombier', icon: '🔧' },
  { value: 'electricien', label: 'Électricien', icon: '⚡' },
  { value: 'chauffagiste', label: 'Chauffagiste', icon: '🔥' },
  { value: 'serrurier', label: 'Serrurier', icon: '🔑' },
  { value: 'peintre', label: 'Peintre', icon: '🎨' },
  { value: 'menuisier', label: 'Menuisier', icon: '🪚' },
  { value: 'maçon', label: 'Maçon', icon: '🧱' },
  { value: 'carreleur', label: 'Carreleur', icon: '🔲' },
  { value: 'couvreur', label: 'Couvreur', icon: '🏠' },
  { value: 'jardinier', label: 'Jardinier', icon: '🌱' },
]

const MAP_STYLES = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  }
}

export default function MapSearch() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [hoveredProvider, setHoveredProvider] = useState<Provider | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const [mapStyle, setMapStyle] = useState<'street' | 'light' | 'dark'>('light')
  const [showStylePicker, setShowStylePicker] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split')
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [responseTime, setResponseTime] = useState<number | undefined>()
  const [showPerformance, setShowPerformance] = useState(false)

  const searchDebounceRef = useRef<NodeJS.Timeout>()
  
  // World-class geolocation hook
  const geolocation = useGeolocation({ enableHighAccuracy: true })
  const userLocation: [number, number] | null = geolocation.latitude && geolocation.longitude 
    ? [geolocation.latitude, geolocation.longitude] 
    : null

  // World-class caching system
  const searchCache = useMapSearchCache<Provider[]>()
  const listRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<Filters>({
    service: '',
    minRating: 0,
    verified: false,
    premium: false,
    emergency: false
  })

  const [mapCenter, setMapCenter] = useState<[number, number]>([46.603354, 1.888334])
  const [mapZoom, setMapZoom] = useState(6)

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      filters.service,
      filters.minRating > 0,
      filters.verified,
      filters.premium,
      filters.emergency
    ].filter(Boolean).length
  }, [filters])

  // World-class search with caching and performance monitoring
  const searchInBounds = useCallback(async (bounds: any, query?: string) => {
    if (!bounds) return

    // Check cache first
    const cacheKey = { ...filters, query }
    const cachedData = searchCache.get(bounds, cacheKey)
    
    if (cachedData) {
      setProviders(cachedData)
      setShowPerformance(true)
      return
    }

    setLoading(true)
    const startTime = performance.now()
    
    try {
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        limit: '100',
        ...(query && { q: query }),
        ...(filters.service && { service: filters.service }),
        ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        ...(filters.verified && { verified: 'true' }),
        ...(filters.premium && { premium: 'true' }),
      })

      const response = await fetch(`/api/search/map?${params}`)
      const data = await response.json()

      if (data.success && data.providers) {
        setProviders(data.providers)
        // Cache the results
        searchCache.set(bounds, data.providers, cacheKey)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))
      setShowPerformance(true)
      setLoading(false)
    }
  }, [filters, searchCache])

  // Handle bounds change with debounce
  const handleBoundsChange = useCallback((bounds: any) => {
    setCurrentBounds(bounds)

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(() => {
      searchInBounds(bounds, searchQuery)
    }, 300)
  }, [searchInBounds, searchQuery])

  // World-class user location with better error handling
  const getUserLocation = useCallback(() => {
    geolocation.getLocation()
  }, [])

  // Update map when geolocation changes
  useEffect(() => {
    if (geolocation.latitude && geolocation.longitude) {
      setMapCenter([geolocation.latitude, geolocation.longitude])
      setMapZoom(13)
    }
  }, [geolocation.latitude, geolocation.longitude])

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Custom marker icon
  const createMarkerIcon = useCallback((provider: Provider, isHovered: boolean, isSelected: boolean) => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')

    const isHighlighted = isHovered || isSelected
    const size = isHighlighted ? 48 : 38
    const zIndex = isHighlighted ? 1000 : provider.is_premium ? 500 : 1

    let bgColor = '#3b82f6' // blue default
    if (provider.is_premium) bgColor = '#f59e0b' // amber
    else if (provider.is_verified) bgColor = '#22c55e' // green

    // World-class: pulse animation for selected
    const pulseAnimation = isSelected ? `
      @keyframes pulse {
        0%, 100% { transform: rotate(-45deg) scale(1); }
        50% { transform: rotate(-45deg) scale(1.05); }
      }
    ` : ''

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <style>${pulseAnimation}</style>
        <div style="
          background: ${bgColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          display: flex;
          align-items: center;
          justify-content: center;
          border: ${isHighlighted ? '4px' : '3px'} solid white;
          box-shadow: ${isHighlighted ? '0 6px 20px rgba(0,0,0,0.45)' : '0 3px 12px rgba(0,0,0,0.35)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: ${isSelected ? 'pulse 2s ease-in-out infinite' : 'none'};
          z-index: ${zIndex};
          cursor: pointer;
          position: relative;
        ">
          ${provider.is_premium ? `
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              width: 18px;
              height: 18px;
              background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transform: rotate(45deg);
              z-index: 10;
            ">
              <span style="
                transform: rotate(-45deg);
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">★</span>
            </div>
          ` : ''}
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: ${isHighlighted ? '15px' : '13px'};
            text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ">${provider.rating_average?.toFixed(1) || '—'}</span>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size]
    })
  }, [])

  // Scroll to provider in list
  const scrollToProvider = (providerId: string) => {
    const element = document.getElementById(`provider-${providerId}`)
    if (element && listRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useEffect(() => {
    setMapReady(true)
  }, [])

  // Initial load
  useEffect(() => {
    if (mapReady && currentBounds) {
      searchInBounds(currentBounds)
    }
  }, [mapReady, filters])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Search Header */}
      <div className="bg-white border-b shadow-sm z-30 relative">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo/Back */}
            <Link href="/" className="flex-shrink-0 hidden md:block">
              <span className="text-xl font-bold text-blue-600">ServicesArtisans</span>
            </Link>

            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (currentBounds) {
                    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                    searchDebounceRef.current = setTimeout(() => {
                      searchInBounds(currentBounds, e.target.value)
                    }, 500)
                  }
                }}
                placeholder="Rechercher un artisan, une spécialité..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
            </div>

            {/* Quick Service Filters */}
            <div className="hidden lg:flex items-center gap-2">
              {SERVICES.slice(0, 5).map((service) => (
                <button
                  key={service.value}
                  onClick={() => setFilters(f => ({
                    ...f,
                    service: f.service === service.value ? '' : service.value
                  }))}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.service === service.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{service.icon}</span>
                  {service.label}
                </button>
              ))}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-full transition-all ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-50 border-blue-500 text-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle (Desktop) */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-full transition-colors ${viewMode === 'split' ? 'bg-white shadow' : ''}`}
                title="Vue mixte"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-colors ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                title="Liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-full transition-colors ${viewMode === 'map' ? 'bg-white shadow' : ''}`}
                title="Carte"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2">
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* Service Dropdown */}
                    <select
                      value={filters.service}
                      onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Tous les services</option>
                      {SERVICES.map((service) => (
                        <option key={service.value} value={service.value}>
                          {service.icon} {service.label}
                        </option>
                      ))}
                    </select>

                    {/* Rating Filter */}
                    <select
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value={0}>Toutes notes</option>
                      <option value={3}>⭐ 3+</option>
                      <option value={4}>⭐ 4+</option>
                      <option value={4.5}>⭐ 4.5+</option>
                    </select>

                    {/* Toggle Filters */}
                    <button
                      onClick={() => setFilters(f => ({ ...f, verified: !f.verified }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        filters.verified
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Vérifiés
                    </button>

                    <button
                      onClick={() => setFilters(f => ({ ...f, premium: !f.premium }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        filters.premium
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      Premium
                    </button>

                    <button
                      onClick={() => setFilters(f => ({ ...f, emergency: !f.emergency }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                        filters.emergency
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      Urgence 24/7
                    </button>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setFilters({
                          service: '',
                          minRating: 0,
                          verified: false,
                          premium: false,
                          emergency: false
                        })}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Results List */}
        <AnimatePresence>
          {(viewMode === 'split' || viewMode === 'list') && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: viewMode === 'list' ? '100%' : '420px', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-r overflow-hidden hidden md:flex flex-col"
            >
              {/* Results Header */}
              <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {providers.length} artisans
                  </p>
                  <p className="text-sm text-gray-500">dans cette zone</p>
                </div>
                {loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                )}
              </div>

              {/* Results List */}
              <div ref={listRef} className="flex-1 overflow-y-auto">
                {providers.map((provider) => (
                  <motion.div
                    key={provider.id}
                    id={`provider-${provider.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onMouseEnter={() => setHoveredProvider(provider)}
                    onMouseLeave={() => setHoveredProvider(null)}
                    onClick={() => {
                      setSelectedProvider(provider)
                      setMapCenter([provider.latitude, provider.longitude])
                      setMapZoom(15)
                    }}
                    className={`p-4 border-b cursor-pointer transition-all ${
                      selectedProvider?.id === provider.id
                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                        : hoveredProvider?.id === provider.id
                        ? 'bg-gray-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                          {provider.avatar_url ? (
                            <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <span className="text-3xl font-bold text-gray-400">
                              {provider.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        {provider.is_premium && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full">
                            <Award className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {provider.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(provider.id)
                            }}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100"
                          >
                            <Heart
                              className={`w-5 h-5 transition-colors ${
                                favorites.has(provider.id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-gray-400'
                              }`}
                            />
                          </button>
                        </div>

                        <p className="text-sm text-blue-600 font-medium">
                          {provider.specialty || 'Artisan'}
                        </p>

                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-sm">
                              {provider.rating_average?.toFixed(1)}
                            </span>
                            <span className="text-gray-400 text-sm">
                              ({provider.review_count})
                            </span>
                          </div>
                          {provider.is_verified && (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <Shield className="w-3 h-3" />
                              Vérifié
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {provider.address_city}
                        </p>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-center py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Voir profil
                          </Link>
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Phone className="w-4 h-4 text-gray-600" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {providers.length === 0 && !loading && (
                  <div className="p-8 text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Aucun artisan trouvé</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Déplacez la carte ou modifiez vos filtres
                    </p>
                  </div>
                )}

                {/* Loading Skeletons */}
                {loading && providers.length === 0 && (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <div className={`flex-1 relative ${viewMode === 'list' ? 'hidden md:block' : ''}`}>
          {mapReady && (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="w-full h-full z-10"
              style={{ height: '100%' }}
            >
              <TileLayer
                attribution={MAP_STYLES[mapStyle].attribution}
                url={MAP_STYLES[mapStyle].url}
              />

              <MapBoundsHandler onBoundsChange={handleBoundsChange} />
              <MapViewController selectedProvider={selectedProvider} providers={providers} />

              {providers
                .filter(p => 
                  p.latitude && 
                  p.longitude && 
                  !isNaN(p.latitude) && 
                  !isNaN(p.longitude) &&
                  p.latitude >= -90 && 
                  p.latitude <= 90 &&
                  p.longitude >= -180 && 
                  p.longitude <= 180
                )
                .map((provider) => (
                  <Marker
                    key={provider.id}
                    position={[provider.latitude, provider.longitude]}
                    icon={createMarkerIcon(
                      provider,
                      hoveredProvider?.id === provider.id,
                      selectedProvider?.id === provider.id
                    )}
                    eventHandlers={{
                      click: () => {
                        setSelectedProvider(provider)
                        scrollToProvider(provider.id)
                      },
                      mouseover: () => setHoveredProvider(provider),
                      mouseout: () => setHoveredProvider(null)
                    }}
                  >
                    <Popup className="custom-popup" maxWidth={340} minWidth={300}>
                      <div className="p-2">
                        {/* Premium Badge - World Class */}
                        {provider.is_premium && (
                          <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold mb-3 bg-gradient-to-r from-amber-100 to-yellow-100 w-fit px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                            <Award className="w-3.5 h-3.5" />
                            <span>ARTISAN PREMIUM</span>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {/* Avatar with premium ring */}
                          <div className={`relative flex-shrink-0 ${provider.is_premium ? 'ring-2 ring-amber-400 ring-offset-2' : ''} rounded-xl`}>
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                              {provider.avatar_url ? (
                                <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover" loading="lazy" />
                              ) : (
                                <span className="text-3xl font-bold text-gray-400">
                                  {provider.name.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            {/* Name and verification */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-base leading-tight">{provider.name}</h3>
                              {provider.is_verified && (
                                <span title="Artisan vérifié">
                                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </span>
                              )}
                            </div>

                            {/* Specialty */}
                            <p className="text-sm text-blue-600 font-medium mb-2">{provider.specialty || 'Artisan'}</p>

                            {/* Rating - Enhanced */}
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-bold text-gray-900 text-sm">{provider.rating_average?.toFixed(1)}</span>
                              </div>
                              <span className="text-gray-500 text-sm">({provider.review_count} avis)</span>
                            </div>

                            {/* Location */}
                            <p className="text-sm text-gray-600 mt-1.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {provider.address_city}
                            </p>

                            {/* Hourly rate if available */}
                            {provider.hourly_rate_min && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                À partir de {provider.hourly_rate_min}€/h
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions - World Class Design */}
                        <div className="flex gap-2 mt-4">
                          <Link
                            href={getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}
                            className="flex-1 text-center py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                          >
                            Voir le profil
                          </Link>
                          {provider.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                              title="Appeler maintenant"
                            >
                              <Phone className="w-4 h-4" />
                              Appeler
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))
              }

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={(() => {
                    if (typeof window === 'undefined') return undefined
                    const L = require('leaflet')
                    return L.divIcon({
                      className: 'user-location-marker',
                      html: `
                        <div style="
                          width: 20px;
                          height: 20px;
                          background: #3b82f6;
                          border: 4px solid white;
                          border-radius: 50%;
                          box-shadow: 0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3);
                        "></div>
                      `,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })
                  })()}
                />
              )}
            </MapContainer>
          )}

          {/* World-class Performance Indicator */}
          <MapPerformanceIndicator
            cacheStats={searchCache.stats}
            responseTime={responseTime}
            resultsCount={providers.length}
            show={showPerformance}
          />

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {/* Geolocation - World Class */}
            <button
              onClick={getUserLocation}
              disabled={geolocation.loading}
              className={`p-3 bg-white rounded-xl shadow-lg transition-colors disabled:opacity-50 ${
                geolocation.error ? 'border-2 border-red-400' : 'hover:bg-gray-50'
              } ${userLocation ? 'bg-blue-50 border-2 border-blue-400' : ''}`}
              title={geolocation.error || (userLocation ? 'Position détectée' : 'Ma position')}
            >
              {geolocation.loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <Navigation className={`w-5 h-5 ${userLocation ? 'text-blue-600' : 'text-gray-700'}`} />
              )}
            </button>

            {/* Map Style */}
            <div className="relative">
              <button
                onClick={() => setShowStylePicker(!showStylePicker)}
                className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                title="Style de carte"
              >
                <Layers className="w-5 h-5 text-gray-700" />
              </button>

              <AnimatePresence>
                {showStylePicker && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-full mr-2 top-0 bg-white rounded-xl shadow-lg p-2 min-w-[120px]"
                  >
                    {(['street', 'light', 'dark'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setMapStyle(style)
                          setShowStylePicker(false)
                        }}
                        className={`w-full px-3 py-2 text-left rounded-lg text-sm capitalize transition-colors ${
                          mapStyle === style ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        {style === 'street' ? 'Standard' : style === 'light' ? 'Clair' : 'Sombre'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
              >
                <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium">Recherche...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hovered Provider Card */}
          <AnimatePresence>
            {hoveredProvider && viewMode === 'map' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 z-20"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {hoveredProvider.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{hoveredProvider.name}</h3>
                      <p className="text-sm text-blue-600">{hoveredProvider.specialty}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium">{hoveredProvider.rating_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Results Toggle */}
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="w-full bg-white shadow-lg rounded-2xl py-4 px-6 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-lg">{providers.length}</span>
                <span className="text-gray-600 ml-1">artisans trouvés</span>
              </div>
              {mobileDrawerOpen ? (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="md:hidden fixed inset-x-0 bottom-0 h-[70vh] bg-white rounded-t-3xl shadow-2xl z-40"
          >
            <div className="p-4 border-b">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg">{providers.length} artisans</h2>
                <button onClick={() => setMobileDrawerOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(70vh-80px)]">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}
                  className="flex gap-4 p-4 border-b hover:bg-gray-50"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-gray-400">
                      {provider.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-blue-600">{provider.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium text-sm">{provider.rating_average?.toFixed(1)}</span>
                      <span className="text-gray-400 text-sm">• {provider.address_city}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 self-center" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
