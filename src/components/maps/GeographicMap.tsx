'use client'

import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef, useCallback } from 'react'
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

// Dynamic import for marker clustering
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet-cluster'),
  { ssr: false }
)

interface Provider {
  id: string
  name: string
  stable_id?: string
  slug?: string
  latitude: number
  longitude: number
  rating_average?: number
  review_count?: number
  specialty?: string
  address_city?: string
  is_verified?: boolean
  // GUARD: is_premium and trust_badge were dropped in v2 (100_v2_schema_cleanup.sql).
  // Do NOT add them back here.
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
  onMarkerHover?: (providerId: string | null) => void
  onSearchArea?: (bounds: import('leaflet').LatLngBounds) => void
}

export default function GeographicMap({
  centerLat,
  centerLng,
  zoom = 12,
  providers = [],
  highlightedProviderId,
  locationName: _locationName,
  height = '400px',
  className = '',
  onMarkerHover,
  onSearchArea
}: GeographicMapProps) {
  const [mapReady, setMapReady] = useState(false)
  const [_L, setL] = useState<typeof import('leaflet') | null>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const [mapMoved, setMapMoved] = useState(false)

  // Marker icon cache (TASK 5)
  const markerIconCache = useRef(new Map<string, import('leaflet').DivIcon>())

  useEffect(() => {
    // Import Leaflet on client side (CSS already imported statically at top of file)
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
      setMapReady(true)
    })
  }, [])

  // Attach moveend listener for "Rechercher dans cette zone" (TASK 4)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Skip the initial load — only fire after user interaction
    let isInitial = true
    const handler = () => {
      if (isInitial) {
        isInitial = false
        return
      }
      setMapMoved(true)
    }
    map.on('moveend', handler)
    return () => { map.off('moveend', handler) }
  }, [mapReady])

  // Pan to highlighted provider when it changes
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

  // Memoized marker icon factory (TASK 1 colors + TASK 5 cache)
  const createMarkerIcon = useCallback((isVerified: boolean, isHighlighted: boolean) => {
    if (!_L) return undefined

    const size = isHighlighted ? 40 : 32
    // Clay theme colors (TASK 1)
    const color = isHighlighted
      ? '#C4533A'  // clay-600 for highlighted
      : isVerified
        ? '#E86B4B'  // clay-400 for verified
        : '#78716c'  // stone-500 for unverified

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
          ${
            isVerified
              ? `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`
              : `<svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg>`
          }
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    })
  }, [_L])

  // Get cached marker icon (TASK 5)
  const getMarkerIcon = useCallback((isVerified: boolean, isHighlighted: boolean) => {
    const key = `${isVerified}-${isHighlighted}`
    if (!markerIconCache.current.has(key)) {
      const icon = createMarkerIcon(isVerified, isHighlighted)
      if (icon) {
        markerIconCache.current.set(key, icon)
      }
    }
    return markerIconCache.current.get(key)
  }, [createMarkerIcon])

  // Clear icon cache when _L changes (i.e., leaflet loads)
  useEffect(() => {
    markerIconCache.current.clear()
  }, [_L])

  // Handle "Rechercher dans cette zone" click (TASK 4)
  const handleSearchArea = useCallback(() => {
    if (mapRef.current && onSearchArea) {
      onSearchArea(mapRef.current.getBounds())
    }
    setMapMoved(false)
  }, [onSearchArea])

  // Cluster icon factory (TASK 2)
  const createClusterIcon = useCallback((cluster: { getChildCount: () => number }) => {
    if (!_L) return _L as unknown as import('leaflet').DivIcon
    const count = cluster.getChildCount()
    const size = count < 10 ? 'small' as const : count < 50 ? 'medium' as const : 'large' as const
    const sizes = { small: 36, medium: 44, large: 52 }
    return _L.divIcon({
      html: `<div style="
        width:${sizes[size]}px;height:${sizes[size]}px;
        background:#E86B4B;color:white;
        border-radius:50%;border:3px solid white;
        display:flex;align-items:center;justify-content:center;
        font-weight:bold;font-size:${size === 'large' ? '16' : '13'}px;
        box-shadow:0 2px 8px rgba(0,0,0,0.2);
      ">${count}</div>`,
      className: 'custom-cluster-icon',
      iconSize: _L.point(sizes[size], sizes[size]),
    })
  }, [_L])

  if (!mapReady) {
    return (
      <div
        className={`bg-gray-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-clay-400" />
          <p>Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  const validProviders = providers.filter(p =>
    p.latitude &&
    p.longitude &&
    !isNaN(p.latitude) &&
    !isNaN(p.longitude) &&
    p.latitude >= -90 &&
    p.latitude <= 90 &&
    p.longitude >= -180 &&
    p.longitude <= 180
  )

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        ref={mapRef}
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          iconCreateFunction={createClusterIcon}
        >
          {validProviders.map((provider) => {
            const isHighlighted = provider.id === highlightedProviderId
            const isVerified = provider.is_verified ?? false
            return (
              <Marker
                key={provider.id}
                position={[provider.latitude, provider.longitude]}
                icon={getMarkerIcon(isVerified, isHighlighted)}
                eventHandlers={{
                  mouseover: () => onMarkerHover?.(provider.id),
                  mouseout: () => onMarkerHover?.(null),
                }}
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
                          style={{ backgroundColor: '#E86B4B' }}
                          aria-label="Artisan référencé"
                          title="Artisan référencé"
                        >
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </span>
                      )}
                    </div>

                    {/* Specialty — clay color (TASK 1) */}
                    {provider.specialty && (
                      <p className="text-sm text-clay-400 font-medium mb-2">{provider.specialty}</p>
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
                          {provider.address_street
                            ? provider.address_postal_code && provider.address_street.includes(provider.address_postal_code)
                              ? provider.address_street
                              : `${provider.address_street}, ${provider.address_postal_code ?? ''} ${provider.address_city ?? ''}`.trim()
                            : `${provider.address_postal_code ?? ''} ${provider.address_city ?? ''}`.trim()}
                        </span>
                      </p>
                    )}

                    {/* Actions — clay theme buttons (TASK 1) */}
                    <div className="flex gap-2">
                      {provider.phone && (
                        <a
                          href={`tel:${provider.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-stone-700 to-stone-800 text-white rounded-lg text-sm font-semibold hover:from-stone-800 hover:to-stone-900 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                          title="Appeler"
                        >
                          <Phone className="w-4 h-4" />
                          Appeler
                        </a>
                      )}
                      <Link
                        href={getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}
                        className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-clay-400 to-clay-500 text-white rounded-lg text-sm font-semibold hover:from-clay-500 hover:to-clay-600 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* "Rechercher dans cette zone" button (TASK 4) */}
      {mapMoved && (
        <button
          onClick={handleSearchArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-clay-50 hover:text-clay-600 transition-all"
        >
          Rechercher dans cette zone
        </button>
      )}
    </div>
  )
}
