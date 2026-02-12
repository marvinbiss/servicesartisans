'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Star, Award } from 'lucide-react'
import Link from 'next/link'
import ProviderCard from '@/components/ProviderCard'
import type { LegacyProvider } from '@/types/legacy'
import { getArtisanUrl } from '@/lib/utils'

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })

interface CarteAvecListeProps {
  initialCenter?: [number, number]
  initialZoom?: number
  service?: string
  location?: string
}

type MapProvider = LegacyProvider & {
  latitude: number
  longitude: number
  slug: string
  stable_id?: string
}

export default function CarteAvecListe({
  initialCenter = [48.8566, 2.3522],
  initialZoom = 11,
  service: _service,
  location: _location
}: CarteAvecListeProps) {
  const [mapReady, setMapReady] = useState(false)
  const [L, setL] = useState<any>(null)
  const [providers, setProviders] = useState<MapProvider[]>([])
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
          const validProviders = data.providers.filter(
            (p: LegacyProvider): p is MapProvider =>
              typeof p.latitude === 'number' &&
              typeof p.longitude === 'number' &&
              typeof p.slug === 'string' &&
              p.slug.length > 0
          )
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

  const createMarkerIcon = useCallback((provider: LegacyProvider, isHovered: boolean) => {
    if (!L) return undefined

    const isPremium =
      provider.is_premium ||
      provider.trust_badge === 'gold' ||
      provider.trust_badge === 'platinum'
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

            return (
              <div
                key={provider.id}
                onMouseEnter={() => handleHover(provider.id)}
                onMouseLeave={() => handleHover(null)}
                className="mb-4"
              >
                <ProviderCard
                  provider={provider}
                  isHovered={isHovered}
                />
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
                <div className="p-4 min-w-[260px]">
                  {(provider.is_premium || provider.trust_badge === 'gold' || provider.trust_badge === 'platinum') && (
                    <div
                      className="inline-flex items-center gap-2 text-amber-900 text-xs font-black mb-2 px-3 py-1.5 rounded-full"
                      style={{
                        letterSpacing: '0.5px',
                        background: 'linear-gradient(90deg, #fde68a 0%, #fff7d1 100%)',
                        border: '1px solid #f59e0b'
                      }}
                    >
                      <Award className="w-3 h-3" />
                      PREMIUM
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-base">{provider.name}</h3>
                    {provider.rating_average && provider.review_count && provider.review_count > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-bold">{provider.rating_average.toFixed(1)}</span>
                        </div>
                        <div className="text-xs text-gray-500">{provider.review_count} avis</div>
                      </div>
                    )}
                  </div>
                  {provider.address_city && (
                    <p className="text-sm text-gray-600 mb-3">{provider.address_city}</p>
                  )}
                  <Link
                    href={getArtisanUrl({ stable_id: provider.stable_id, slug: provider.slug, specialty: provider.specialty, city: provider.address_city })}
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
