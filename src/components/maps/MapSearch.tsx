'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Search, Filter, MapPin, Star, Phone, Calendar, ChevronDown, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Dynamic import to avoid SSR issues with Leaflet
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

interface Provider {
  id: string
  name: string
  slug: string
  latitude: number
  longitude: number
  rating_average: number
  review_count: number
  address_city: string
  phone?: string
  services: string[]
  is_verified: boolean
  is_premium: boolean
  hourly_rate_min?: number
  hourly_rate_max?: number
  avatar_url?: string
}

interface MapSearchProps {
  initialProviders?: Provider[]
  initialCenter?: [number, number]
  initialZoom?: number
  serviceFilter?: string
}

interface Filters {
  service: string
  minRating: number
  verified: boolean
  premium: boolean
  priceRange: [number, number]
  availability: string
}

export default function MapSearch({
  initialProviders = [],
  initialCenter = [46.603354, 1.888334], // France center
  initialZoom = 6
}: MapSearchProps) {
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [currentBounds, setCurrentBounds] = useState<any>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout>()

  const [filters, setFilters] = useState<Filters>({
    service: '',
    minRating: 0,
    verified: false,
    premium: false,
    priceRange: [0, 500],
    availability: ''
  })

  // Search in current map bounds
  const searchInBounds = useCallback(async (bounds: any, query?: string) => {
    if (!bounds) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
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
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Handle bounds change with debounce
  const handleBoundsChange = useCallback((bounds: any) => {
    setCurrentBounds(bounds)

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(() => {
      searchInBounds(bounds, searchQuery)
    }, 500)
  }, [searchInBounds, searchQuery])

  // Search button click
  const handleSearchInArea = () => {
    if (currentBounds) {
      searchInBounds(currentBounds, searchQuery)
    }
  }

  // Custom marker icon
  const createMarkerIcon = (provider: Provider) => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')

    const color = provider.is_premium ? '#f59e0b' : provider.is_verified ? '#22c55e' : '#3b82f6'

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">${provider.rating_average?.toFixed(1) || '-'}</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    })
  }

  useEffect(() => {
    setMapReady(true)
  }, [])

  const services = [
    'Plomberie', 'Electricité', 'Chauffage', 'Climatisation',
    'Menuiserie', 'Peinture', 'Maçonnerie', 'Carrelage',
    'Serrurerie', 'Vitrerie', 'Couverture', 'Jardinage'
  ]

  return (
    <div className="h-screen flex flex-col">
      {/* Search Header */}
      <div className="bg-white border-b shadow-sm z-20 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un artisan, un service..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtres
              {(filters.verified || filters.premium || filters.minRating > 0) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {[filters.verified, filters.premium, filters.minRating > 0].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Search in Area Button */}
            <button
              onClick={handleSearchInArea}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
              Rechercher ici
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Service Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={filters.service}
                    onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les services</option>
                    {services.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note minimum</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Toutes les notes</option>
                    <option value={3}>3+ étoiles</option>
                    <option value={4}>4+ étoiles</option>
                    <option value={4.5}>4.5+ étoiles</option>
                  </select>
                </div>

                {/* Verified Filter */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Artisans vérifiés</span>
                  </label>
                </div>

                {/* Premium Filter */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.premium}
                      onChange={(e) => setFilters({ ...filters, premium: e.target.checked })}
                      className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">Artisans Premium</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      service: '',
                      minRating: 0,
                      verified: false,
                      premium: false,
                      priceRange: [0, 500],
                      availability: ''
                    })}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map and Results */}
      <div className="flex-1 flex">
        {/* Results List */}
        <div className="w-96 bg-white border-r overflow-y-auto hidden lg:block">
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{providers.length}</span> artisans trouvés
              {loading && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </p>
          </div>

          <div className="divide-y">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${
                  selectedProvider?.id === provider.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
                onClick={() => setSelectedProvider(provider)}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {provider.avatar_url ? (
                      <img src={provider.avatar_url} alt={provider.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {provider.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
                      {provider.is_verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Vérifié</span>
                      )}
                      {provider.is_premium && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">Premium</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{provider.rating_average?.toFixed(1) || '-'}</span>
                      </div>
                      <span className="text-sm text-gray-500">({provider.review_count} avis)</span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {provider.address_city}
                    </p>

                    {provider.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.services.slice(0, 3).map((service) => (
                          <span key={service} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="text-xs text-gray-400">+{provider.services.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/services/artisan/${provider.slug || provider.id}`}
                    className="flex-1 text-center py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Voir profil
                  </Link>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}

            {providers.length === 0 && !loading && (
              <div className="p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun artisan trouvé dans cette zone</p>
                <p className="text-sm text-gray-400 mt-1">Essayez de zoomer ou de déplacer la carte</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {mapReady && (
            <MapContainer
              center={initialCenter}
              zoom={initialZoom}
              className="w-full h-full z-10"
              style={{ height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapBoundsHandler onBoundsChange={handleBoundsChange} />

              {providers.map((provider) => (
                provider.latitude && provider.longitude && (
                  <Marker
                    key={provider.id}
                    position={[provider.latitude, provider.longitude]}
                    icon={createMarkerIcon(provider)}
                    eventHandlers={{
                      click: () => setSelectedProvider(provider)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{provider.rating_average?.toFixed(1)}</span>
                          <span className="text-gray-500">({provider.review_count} avis)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{provider.address_city}</p>
                        <Link
                          href={`/services/artisan/${provider.slug || provider.id}`}
                          className="block mt-2 text-center py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Voir le profil
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Recherche en cours...</span>
              </div>
            </div>
          )}

          {/* Mobile Results Toggle */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
            <button
              onClick={() => {/* Toggle mobile results */}}
              className="w-full bg-white shadow-lg rounded-xl py-3 px-4 flex items-center justify-between"
            >
              <span className="font-medium">{providers.length} artisans trouvés</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
