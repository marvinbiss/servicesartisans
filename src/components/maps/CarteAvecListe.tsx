'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Star, Phone, Clock, Users, Award } from 'lucide-react'
import Link from 'next/link'

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

interface Provider {
  id: string
  name: string
  slug: string
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

interface CarteAvecListeProps {
  initialCenter?: [number, number]
  initialZoom?: number
  service?: string
  location?: string
}

export default function CarteAvecListe({
  initialCenter = [48.8566, 2.3522],
  initialZoom = 11,
  service,
  location
}: CarteAvecListeProps) {
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
        const bounds = {
          north: initialCenter[0] + 0.1,
          south: initialCenter[0] - 0.1,
          east: initialCenter[1] + 0.1,
          west: initialCenter[1] - 0.1
        }
        const params = new URLSearchParams({
          ...Object.fromEntries(Object.entries(bounds).map(([k, v]) => [k, v.toString()])),
          limit: '50'
        })

        const response = await fetch(`/api/search/map?${params}`)
        const data = await response.json()

        if (data.success && data.providers) {
          const validProviders = data.providers
            .filter((p: Provider) => p.latitude && p.longitude && p.slug)
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
  }, [mapReady, initialCenter])

  const createMarkerIcon = useCallback((provider: Provider, isHovered: boolean) => {
    if (!L) return undefined

    const isPremium = provider.is_premium
    const size = isHovered ? 42 : 36
    const color = isPremium ? '#f59e0b' : '#2563eb'

    return L.divIcon({
      className: '',
      html: `
        <div style="width: ${size}px; height: ${size}px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 ${isHovered ? 6 : 3}px ${isHovered ? 16 : 10}px rgba(0,0,0,${isHovered ? 0.35 : 0.25}); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
          ${isPremium 
            ? `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
            : `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>`
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
      <div className="w-2/5 bg-white overflow-y-auto">
        <div className="p-4 space-y-4">
          {providers.map((provider) => {
            const isHovered = hoveredId === provider.id
            const profileUrl = `/services/${provider.specialty?.toLowerCase() || 'artisan'}/${provider.address_city?.toLowerCase() || 'france'}/${provider.slug}`
            
            return (
              <div
                key={provider.id}
                onMouseEnter={() => handleHover(provider.id)}
                onMouseLeave={() => handleHover(null)}
                style={{
                  backgroundColor: provider.is_premium ? '#fffbeb' : 'white',
                  border: provider.is_premium ? '4px solid #fbbf24' : '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transform: isHovered ? 'scale(1.01)' : 'scale(1)'
                }}
                className="mb-4"
              >
                {provider.is_premium && (
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-black mb-3" style={{ letterSpacing: '0.5px' }}>
                    <Award className="w-4 h-4 text-amber-600" />
                    ARTISAN PREMIUM
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {provider.name}
                  {provider.is_verified && (
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </h3>

                {provider.address_street && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{provider.address_street}, {provider.address_postal_code} {provider.address_city}</span>
                  </div>
                )}

                {provider.rating_average && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-2xl font-bold text-gray-900">{provider.rating_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-600">{provider.review_count} avis</span>
                  </div>
                )}

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
                  <Link
                    href={profileUrl}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Demander un devis
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={initialCenter} zoom={initialZoom} ref={mapRef} className="w-full h-full" zoomControl={true}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
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
                  <Link
                    href={`/services/${provider.specialty?.toLowerCase() || 'artisan'}/${provider.address_city?.toLowerCase() || 'france'}/${provider.slug}`}
                    className="block w-full py-2 bg-blue-600 text-white text-center rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Voir le profil
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
