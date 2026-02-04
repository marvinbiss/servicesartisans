'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Star } from 'lucide-react'
import Link from 'next/link'
import { getArtisanUrl } from '@/lib/utils'

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
  address_city?: string
}

interface GeographicMapProps {
  centerLat: number
  centerLng: number
  zoom?: number
  providers?: Provider[]
  locationName?: string
  height?: string
  className?: string
}

export default function GeographicMap({
  centerLat,
  centerLng,
  zoom = 12,
  providers = [],
  locationName: _locationName,
  height = '400px',
  className = ''
}: GeographicMapProps) {
  const [mapReady, setMapReady] = useState(false)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)

  useEffect(() => {
    // Import Leaflet and its CSS on client side
    import('leaflet').then((leaflet) => {
      // @ts-ignore - CSS import
      import('leaflet/dist/leaflet.css')
      setL(leaflet.default)
      setMapReady(true)
    })
  }, [])

  // Create custom marker icon
  const createMarkerIcon = (isHighlighted = false) => {
    if (!L) return undefined

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="${isHighlighted ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded-full p-2 shadow-lg transform ${isHighlighted ? 'scale-125' : ''} transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })
  }

  if (!mapReady) {
    return (
      <div
        className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.latitude, provider.longitude]}
            icon={createMarkerIcon()}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                {provider.specialty && (
                  <p className="text-sm text-gray-500 mb-2">{provider.specialty}</p>
                )}
                {provider.rating_average && provider.rating_average > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{provider.rating_average.toFixed(1)}</span>
                    {provider.review_count && provider.review_count > 0 && (
                      <span className="text-gray-400 text-sm">({provider.review_count} avis)</span>
                    )}
                  </div>
                )}
                <Link
                  href={getArtisanUrl({ id: provider.id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city, business_name: provider.name })}
                  className="inline-block bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Voir le profil
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
