'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, Star, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { getArtisanUrl } from '@/lib/utils'
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
  is_verified?: boolean
  phone?: string
  address_street?: string
  address_postal_code?: string
}

interface GeographicMapProps {
  centerLat: number
  centerLng: number
  zoom?: number
  providers?: Provider[]
  highlightedProviderId?: string
  locationName?: string
  height?: string
  className?: string
}

export default function GeographicMap({
  centerLat,
  centerLng,
  zoom = 12,
  providers = [],
  highlightedProviderId,
  locationName: _locationName,
  height = '400px',
  className = ''
}: GeographicMapProps) {
  const [mapReady, setMapReady] = useState(false)
  const [_L, setL] = useState<typeof import('leaflet') | null>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    // Import Leaflet and its CSS on client side
    import('leaflet').then((leaflet) => {
      // @ts-ignore - CSS import
      import('leaflet/dist/leaflet.css')
      setL(leaflet.default)
      setMapReady(true)
    })
  }, [])

  // World-class marker icon with animations
  // Marqueurs simples et propres
  const createMarkerIcon = (provider?: Provider, isHighlighted = false) => {
    if (!_L) return undefined

    const size = isHighlighted ? 40 : 32
    const isVerified = provider?.is_verified
    const color = isVerified ? '#2563eb' : '#6b7280'

    return _L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
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

  useEffect(() => {
    if (!highlightedProviderId || !mapRef.current) return
    const target = providers.find((p) => p.id === highlightedProviderId)
    if (target) {
      mapRef.current.setView([target.latitude, target.longitude], Math.max(zoom, 13), {
        animate: true,
        duration: 0.4,
      })
    }
  }, [highlightedProviderId, providers, zoom])

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        // @ts-expect-error whenReady typing mismatch with react-leaflet
        whenReady={(event: any) => {
          mapRef.current = event.target
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
          .map((provider) => {
            const isHighlighted = provider.id === highlightedProviderId
            return (
          <Marker
            key={provider.id}
            position={[provider.latitude, provider.longitude]}
            icon={createMarkerIcon(provider, isHighlighted)}
          >
            <Popup className="custom-popup" maxWidth={320} minWidth={280}>
              <div className="p-4">
                {/* Name and verification */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{provider.name}</h3>
                  </div>
                  {provider.is_verified && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#1877f2' }}
                      aria-label="Artisan vérifié"
                      title="Artisan vérifié"
                    >
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </span>
                  )}
                </div>

                {/* Specialty */}
                {provider.specialty && (
                  <p className="text-sm text-blue-600 font-medium mb-2">{provider.specialty}</p>
                )}

                {/* Rating */}
                {provider.rating_average && provider.rating_average > 0 && provider.review_count && provider.review_count > 0 && (
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-gray-900 text-sm">{provider.rating_average.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-500">{provider.review_count} avis</div>
                  </div>
                )}

                {/* Address */}
                {(provider.address_street || provider.address_city) && (
                  <p className="text-sm text-gray-600 mb-3 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>
                      {provider.address_street && `${provider.address_street}, `}
                      {provider.address_postal_code} {provider.address_city}
                    </span>
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      title="Appeler"
                    >
                      <Phone className="w-4 h-4" />
                      Appeler
                    </a>
                  )}
                  <Link
                    href={getArtisanUrl({ id: provider.id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city, business_name: provider.name })}
                    className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        )
        })}
      </MapContainer>
    </div>
  )
}
