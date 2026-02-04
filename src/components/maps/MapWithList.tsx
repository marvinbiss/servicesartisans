'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MapPin, Star, Phone, Clock, Users, Shield,
  Loader2, ChevronDown
} from 'lucide-react'
import { createPremiumMarker } from '@/lib/maps/premium-markers'
import './premium-branding.css'

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

interface Provider {
  id: string
  name: string
  slug?: string
  latitude: number
  longitude: number
  rating_average?: number
  review_count?: number
  specialty?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  phone?: string
  is_premium?: boolean
  is_verified?: boolean
  response_time?: string
  experience_years?: number
  employee_count?: number
}

interface MapWithListProps {
  initialCenter?: [number, number]
  initialZoom?: number
  searchQuery?: string
  locationName?: string
}

export default function MapWithList({
  initialCenter = [48.8566, 2.3522], // Paris
  initialZoom = 12,
  searchQuery = '',
  locationName = ''
}: MapWithListProps) {
  const [mapReady, setMapReady] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    verified: false,
    premium: false,
    minRating: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const mapRef = useRef<any>(null)
  const markerRefs = useRef<Map<string, any>>(new Map())

  // Charger Leaflet côté client
  useEffect(() => {
    import('leaflet').then(() => {
      setMapReady(true)
    })
  }, [])

  // Charger les providers depuis l'API
  const loadProviders = useCallback(async () => {
    try {
      setLoading(true)
      const bounds = {
        north: initialCenter[0] + 0.05,
        south: initialCenter[0] - 0.05,
        east: initialCenter[1] + 0.05,
        west: initialCenter[1] - 0.05
      }

      const params = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        limit: '50'
      })

      if (filters.verified) params.append('verified', 'true')
      if (filters.premium) params.append('premium', 'true')
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString())

      const response = await fetch(`/api/search/map?${params}`)
      const data = await response.json()

      if (data.success && data.providers) {
        setProviders(data.providers.filter((p: Provider) => p.latitude && p.longitude))
      }
    } catch (error) {
      console.error('Erreur chargement providers:', error)
    } finally {
      setLoading(false)
    }
  }, [initialCenter, filters])

  useEffect(() => {
    if (mapReady) {
      loadProviders()
    }
  }, [mapReady, loadProviders])

  // Gérer le survol d'un artisan dans la liste
  const handleProviderHover = useCallback((providerId: string | null) => {
    setHoveredId(providerId)
    
    if (providerId && markerRefs.current.has(providerId)) {
      const marker = markerRefs.current.get(providerId)
      if (marker) {
        marker.openPopup()
      }
    }
  }, [])

  // Gérer le clic sur un artisan
  const handleProviderClick = useCallback((provider: Provider) => {
    setSelectedId(provider.id)
    
    if (mapRef.current && provider.latitude && provider.longitude) {
      mapRef.current.setView([provider.latitude, provider.longitude], 15, {
        animate: true
      })
    }
  }, [])

  if (!mapReady) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header avec recherche et filtres */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Rechercher ${searchQuery || 'un artisan'} ${locationName ? `à ${locationName}` : ''}`}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtres
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filtres déroulants */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 flex gap-4 overflow-hidden"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Artisans vérifiés</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.premium}
                    onChange={(e) => setFilters({ ...filters, premium: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">Premium uniquement</span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Contenu principal : Liste + Carte */}
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des artisans (gauche) */}
        <div className="w-2/5 overflow-y-auto bg-gray-50 border-r border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
              <MapPin className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Aucun artisan trouvé</p>
              <p className="text-sm text-center mt-2">Essayez de zoomer/dézoomer sur la carte</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {providers.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onMouseEnter={() => handleProviderHover(provider.id)}
                  onMouseLeave={() => handleProviderHover(null)}
                  onClick={() => handleProviderClick(provider)}
                  className={`
                    bg-white rounded-xl border-2 p-5 cursor-pointer transition-all
                    ${hoveredId === provider.id || selectedId === provider.id 
                      ? 'border-blue-500 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Badge Premium */}
                  {provider.is_premium && (
                    <div className="premium-badge mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      ARTISAN PREMIUM
                    </div>
                  )}

                  {/* Nom et vérification */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="artisan-title flex-1">{provider.name}</h3>
                    {provider.is_verified && (
                      <div className="verified-badge ml-2">
                        <Shield className="w-3.5 h-3.5" />
                        Vérifié
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {provider.rating_average && (
                    <div className="rating-container mb-3">
                      <Star className="rating-star" />
                      <span className="rating-value">{provider.rating_average.toFixed(1)}</span>
                      <span className="rating-count">({provider.review_count || 0} avis)</span>
                    </div>
                  )}

                  {/* Informations */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {provider.response_time && (
                      <div className="info-item info-item-primary">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">{provider.response_time}</span>
                      </div>
                    )}
                    {provider.experience_years && (
                      <div className="info-item info-item-success">
                        <Shield className="w-4 h-4" />
                        <span className="font-semibold">{provider.experience_years} ans d'expérience</span>
                      </div>
                    )}
                    {provider.employee_count && (
                      <div className="info-item">
                        <Users className="w-4 h-4" />
                        <span>{provider.employee_count} employés</span>
                      </div>
                    )}
                    {provider.address_city && (
                      <div className="info-item">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {provider.address_street && `${provider.address_street}, `}
                          {provider.address_postal_code} {provider.address_city}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-2 mt-4">
                    {provider.phone && (
                      <a
                        href={`tel:${provider.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-call flex-1"
                      >
                        <Phone className="w-4 h-4" />
                        Appeler
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Ouvrir modal devis
                      }}
                      className="btn-devis flex-1"
                    >
                      Demander un devis
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Carte (droite) */}
        <div className="flex-1 relative">
          <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            ref={mapRef}
            className="w-full h-full"
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {providers.map((provider) => (
              <Marker
                key={provider.id}
                position={[provider.latitude, provider.longitude]}
                icon={createPremiumMarker({
                  isPremium: provider.is_premium,
                  isHighlighted: hoveredId === provider.id || selectedId === provider.id,
                  size: 36
                })}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current.set(provider.id, ref)
                  }
                }}
                eventHandlers={{
                  mouseover: () => handleProviderHover(provider.id),
                  mouseout: () => handleProviderHover(null),
                  click: () => handleProviderClick(provider)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    {provider.is_premium && (
                      <div className="premium-badge mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ARTISAN PREMIUM
                      </div>
                    )}
                    <h3 className="artisan-title">{provider.name}</h3>
                    {provider.rating_average && (
                      <div className="rating-container mt-2">
                        <Star className="rating-star" />
                        <span className="rating-value">{provider.rating_average.toFixed(1)}</span>
                        <span className="rating-count">({provider.review_count || 0} avis)</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Compteur de résultats */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">
              {providers.length} artisan{providers.length > 1 ? 's' : ''} trouvé{providers.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
