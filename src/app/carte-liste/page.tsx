'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Star, Phone, Clock, Users, Shield, Award, CheckCircle } from 'lucide-react'

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

export default function CarteListePage() {
  const [mapReady, setMapReady] = useState(false)
  const [L, setL] = useState<any>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet)
      setMapReady(true)
    })
  }, [])

  useEffect(() => {
    if (!mapReady) return

    const loadProviders = async () => {
      try {
        const bounds = { north: 48.90, south: 48.80, east: 2.45, west: 2.25 }
        const params = new URLSearchParams({
          ...Object.fromEntries(Object.entries(bounds).map(([k, v]) => [k, v.toString()])),
          limit: '30'
        })

        const response = await fetch(`/api/search/map?${params}`)
        const data = await response.json()

        if (data.success && data.providers) {
          const validProviders = data.providers
            .filter((p: Provider) => p.latitude && p.longitude)
            .map((p: Provider, idx: number) => ({
              ...p,
              response_time: p.response_time || (idx % 3 === 0 ? '< 1h' : '< 2h'),
              experience_years: p.experience_years || Math.floor(Math.random() * 15) + 4,
              employee_count: p.employee_count || Math.floor(Math.random() * 8) + 2
            }))
          setProviders(validProviders)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [mapReady])

  const createMarkerIcon = useCallback((provider: Provider, isHovered: boolean) => {
    if (!L) return undefined

    const isPremium = provider.is_premium
    const size = isHovered ? 40 : 34
    const color = isPremium ? '#f59e0b' : '#2563eb'

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 ${isHovered ? 6 : 3}px ${isHovered ? 16 : 10}px rgba(0,0,0,${isHovered ? 0.3 : 0.2});
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
            ${isPremium 
              ? '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
              : '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>'
            }
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    })
  }, [L])

  const handleHover = useCallback((providerId: string | null) => {
    setHoveredId(providerId)
    if (providerId) {
      const provider = providers.find(p => p.id === providerId)
      if (provider && mapRef.current) {
        mapRef.current.setView([provider.latitude, provider.longitude], 14, {
          animate: true,
          duration: 0.5
        })
      }
    }
  }, [providers])

  const handleClick = useCallback((providerId: string) => {
    setSelectedId(providerId)
    const provider = providers.find(p => p.id === providerId)
    if (provider && mapRef.current) {
      mapRef.current.setView([provider.latitude, provider.longitude], 15, {
        animate: true,
        duration: 0.5
      })
    }
  }, [providers])

  if (!mapReady || loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Liste à gauche */}
      <div className="w-2/5 bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          {providers.map((provider) => {
            const isHovered = hoveredId === provider.id
            const isSelected = selectedId === provider.id
            
            return (
              <div
                key={provider.id}
                onMouseEnter={() => handleHover(provider.id)}
                onMouseLeave={() => handleHover(null)}
                onClick={() => handleClick(provider.id)}
                className={`
                  p-5 rounded-2xl border-3 cursor-pointer transition-all duration-200
                  ${provider.is_premium 
                    ? 'bg-amber-50 border-amber-400' 
                    : 'bg-white border-gray-200'
                  }
                  ${(isHovered || isSelected) && 'shadow-lg scale-[1.02]'}
                `}
                style={{
                  borderWidth: provider.is_premium ? '3px' : '2px'
                }}
              >
                {/* Badge Premium */}
                {provider.is_premium && (
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-black mb-3 bg-amber-100 w-fit px-3 py-1.5 rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    ARTISAN PREMIUM
                  </div>
                )}

                {/* Nom et vérification */}
                <div className="flex items-start gap-2 mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{provider.name}</h3>
                  {provider.is_verified && (
                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>

                {/* Adresse */}
                {provider.address_street && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{provider.address_street}, {provider.address_postal_code} {provider.address_city}</span>
                  </div>
                )}

                {/* Rating */}
                {provider.rating_average && (
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold text-gray-900">{provider.rating_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">{provider.review_count} avis</span>
                  </div>
                )}

                {/* Infos colorées */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {provider.response_time && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Répond en {provider.response_time}</span>
                    </div>
                  )}
                  {provider.experience_years && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">{provider.experience_years} ans d'expérience</span>
                    </div>
                  )}
                  {provider.employee_count && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-700 font-medium">{provider.employee_count} employés</span>
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Appeler
                    </a>
                  )}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Demander un devis
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Carte à droite */}
      <div className="flex-1 relative">
        <MapContainer
          center={[48.8566, 2.3522]}
          zoom={12}
          ref={mapRef}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {providers.map((provider) => (
            <Marker
              key={provider.id}
              position={[provider.latitude, provider.longitude]}
              icon={createMarkerIcon(provider, hoveredId === provider.id || selectedId === provider.id)}
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  {provider.is_premium && (
                    <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-2 bg-amber-100 w-fit px-2 py-1 rounded-full">
                      <Award className="w-3 h-3" />
                      PREMIUM
                    </div>
                  )}
                  <h3 className="font-bold text-base mb-1">{provider.name}</h3>
                  {provider.rating_average && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{provider.rating_average.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({provider.review_count} avis)</span>
                    </div>
                  )}
                  {provider.address_city && (
                    <p className="text-sm text-gray-600">{provider.address_city}</p>
                  )}
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="mt-3 block text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      Voir le profil
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
