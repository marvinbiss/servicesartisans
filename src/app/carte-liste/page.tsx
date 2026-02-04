'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Star, Phone, Clock, Users, Award } from 'lucide-react'

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

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
              response_time: idx % 3 === 0 ? '< 1h' : '< 2h',
              experience_years: Math.floor(Math.random() * 15) + 4,
              employee_count: Math.floor(Math.random() * 8) + 2
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
    const size = isHovered ? 42 : 36
    const color = isPremium ? '#f59e0b' : '#2563eb'

    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 ${isHovered ? 6 : 3}px ${isHovered ? 16 : 10}px rgba(0,0,0,${isHovered ? 0.35 : 0.25});
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          ${isPremium 
            ? `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
                 <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
               </svg>`
            : `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
                 <circle cx="12" cy="12" r="8"/>
               </svg>`
          }
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
        mapRef.current.setView([provider.latitude, provider.longitude], 13, {
          animate: true,
          duration: 0.5
        })
      }
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
            
            return (
              <div
                key={provider.id}
                onMouseEnter={() => handleHover(provider.id)}
                onMouseLeave={() => handleHover(null)}
                className={`
                  p-6 rounded-2xl cursor-pointer transition-all duration-200
                  ${provider.is_premium 
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-4 border-amber-400 shadow-md' 
                    : 'bg-white border-2 border-gray-200'
                  }
                  ${isHovered && 'shadow-xl scale-[1.02]'}
                `}
              >
                {/* Badge Premium */}
                {provider.is_premium && (
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-black mb-4 uppercase">
                    <Award className="w-4 h-4" />
                    ARTISAN PREMIUM
                  </div>
                )}

                {/* Nom */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {provider.name}
                  {provider.is_verified && (
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </h3>

                {/* Adresse */}
                {provider.address_street && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{provider.address_street}, {provider.address_postal_code} {provider.address_city}</span>
                  </div>
                )}

                {/* Rating */}
                {provider.rating_average && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-2xl font-bold text-gray-900">{provider.rating_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">{provider.review_count} avis</span>
                  </div>
                )}

                {/* Infos avec icônes colorées */}
                <div className="flex flex-wrap gap-3 mb-5">
                  {provider.response_time && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Répond en {provider.response_time}</span>
                    </div>
                  )}
                  {provider.experience_years && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
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
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Appeler
                    </a>
                  )}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
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
          zoom={11}
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
              icon={createMarkerIcon(provider, hoveredId === provider.id)}
              eventHandlers={{
                mouseover: () => handleHover(provider.id),
                mouseout: () => handleHover(null)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[240px]">
                  {provider.is_premium && (
                    <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold mb-2 bg-amber-100 px-2 py-1 rounded-full w-fit">
                      <Award className="w-3 h-3" />
                      PREMIUM
                    </div>
                  )}
                  <h3 className="font-bold text-base mb-2">{provider.name}</h3>
                  {provider.rating_average && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{provider.rating_average.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({provider.review_count} avis)</span>
                    </div>
                  )}
                  {provider.address_city && (
                    <p className="text-sm text-gray-600 mb-3">{provider.address_city}</p>
                  )}
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                    Voir le profil
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
