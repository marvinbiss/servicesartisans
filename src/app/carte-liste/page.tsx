'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Star, Phone, Loader2 } from 'lucide-react'
import Link from 'next/link'

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
  address_city?: string
  address_postal_code?: string
  phone?: string
  is_premium?: boolean
  is_verified?: boolean
}

export default function CarteListePage() {
  const [mapReady, setMapReady] = useState(false)
  const [L, setL] = useState<any>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const mapRef = useRef<any>(null)
  const markerRefs = useRef<Map<string, any>>(new Map())

  // Charger Leaflet
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet)
      setMapReady(true)
    })
  }, [])

  // Charger les providers
  useEffect(() => {
    if (!mapReady) return

    const loadProviders = async () => {
      try {
        const bounds = {
          north: 48.90,
          south: 48.80,
          east: 2.45,
          west: 2.25
        }

        const params = new URLSearchParams({
          north: bounds.north.toString(),
          south: bounds.south.toString(),
          east: bounds.east.toString(),
          west: bounds.west.toString(),
          limit: '30'
        })

        const response = await fetch(`/api/search/map?${params}`)
        const data = await response.json()

        if (data.success && data.providers) {
          setProviders(data.providers.filter((p: Provider) => p.latitude && p.longitude))
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [mapReady])

  // Créer marqueur simple
  const createMarkerIcon = useCallback((isHovered: boolean) => {
    if (!L) return undefined

    const size = isHovered ? 40 : 32
    const color = isHovered ? '#2563eb' : '#3b82f6'

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 ${isHovered ? 4 : 2}px ${isHovered ? 12 : 8}px rgba(0,0,0,${isHovered ? 0.3 : 0.2});
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    })
  }, [L])

  // Gérer le hover
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

  if (!mapReady || loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Liste à gauche */}
      <div className="w-2/5 bg-white overflow-y-auto border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Artisans près de vous</h1>
          
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onMouseEnter={() => handleHover(provider.id)}
                onMouseLeave={() => handleHover(null)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${hoveredId === provider.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <h3 className="font-semibold text-lg mb-2">{provider.name}</h3>
                
                {provider.rating_average && (
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{provider.rating_average.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({provider.review_count} avis)</span>
                  </div>
                )}
                
                {provider.address_city && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.address_postal_code} {provider.address_city}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Appeler
                    </a>
                  )}
                  <Link
                    href={`/services/${provider.specialty?.toLowerCase()}/${provider.address_city?.toLowerCase()}/${provider.slug}`}
                    className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {providers.map((provider) => (
            <Marker
              key={provider.id}
              position={[provider.latitude, provider.longitude]}
              icon={createMarkerIcon(hoveredId === provider.id)}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current.set(provider.id, ref)
                }
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold mb-1">{provider.name}</h3>
                  {provider.rating_average && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{provider.rating_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Badge résultats */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 border">
          <p className="text-sm font-semibold">{providers.length} artisans</p>
        </div>
      </div>
    </div>
  )
}
