'use client'

import 'leaflet/dist/leaflet.css'
import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Loader2, MapPin, Filter, Users, ChevronDown, X } from 'lucide-react'
import {
  cityMarkers,
  mapRegions,
  getMarkerColor,
  getMarkerRadius,
} from '@/lib/data/map-coverage'
import { services } from '@/lib/data/france'

// Dynamic imports for Leaflet (SSR-incompatible)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
)

// France metropolitan center
const FRANCE_CENTER: [number, number] = [46.603354, 1.888334]
const FRANCE_ZOOM = 6

export default function CarteClient() {
  const [mapReady, setMapReady] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)

  useEffect(() => {
    // Ensure Leaflet is loaded client-side
    import('leaflet').then((L) => {
      leafletRef.current = L
      setMapReady(true)
    })
  }, [])

  // Deduplicate city markers (remove duplicate slugs)
  const uniqueMarkers = useMemo(() => {
    const seen = new Set<string>()
    return cityMarkers.filter((m) => {
      if (seen.has(m.slug)) return false
      seen.add(m.slug)
      return true
    })
  }, [])

  // Filter markers by region
  const filteredMarkers = useMemo(() => {
    if (!selectedRegion) return uniqueMarkers
    return uniqueMarkers.filter((m) => m.region === selectedRegion)
  }, [uniqueMarkers, selectedRegion])

  // Total artisans in filtered zone
  const totalArtisans = useMemo(() => {
    return filteredMarkers.reduce((sum, m) => sum + m.providerCount, 0)
  }, [filteredMarkers])

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    // Zoom to the first city in the region or reset to France
    if (!region) {
      mapRef.current?.setView(FRANCE_CENTER, FRANCE_ZOOM, { animate: true })
    } else {
      const regionCities = uniqueMarkers.filter((m) => m.region === region)
      if (regionCities.length > 0 && mapRef.current && leafletRef.current) {
        const bounds = leafletRef.current.latLngBounds(
          regionCities.map((c) => [c.lat, c.lng] as [number, number])
        )
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 })
      }
    }
  }

  const clearFilters = () => {
    setSelectedRegion('')
    setSelectedService('')
    mapRef.current?.setView(FRANCE_CENTER, FRANCE_ZOOM, { animate: true })
  }

  if (!mapReady) {
    return (
      <div className="bg-gray-100 rounded-xl flex items-center justify-center" style={{ height: '600px' }}>
        <div className="text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
        {/* Stats card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-blue-100">
                {selectedRegion ? `Artisans en ${selectedRegion}` : 'Total artisans r\u00E9f\u00E9renc\u00E9s'}
              </p>
              <p className="text-2xl font-bold">
                {selectedRegion
                  ? totalArtisans.toLocaleString('fr-FR')
                  : '350\u00A0000+'}
              </p>
            </div>
          </div>
          <p className="text-sm text-blue-200">
            {filteredMarkers.length} villes affich\u00E9es sur la carte
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl mb-4"
        >
          <span className="flex items-center gap-2 font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            Filtres
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filters */}
        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Region filter */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label htmlFor="region-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrer par r\u00E9gion
            </label>
            <select
              id="region-filter"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Toute la France</option>
              {mapRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Service filter */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label htmlFor="service-filter" className="block text-sm font-semibold text-gray-700 mb-2">
              Filtrer par m\u00E9tier
            </label>
            <select
              id="service-filter"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Tous les m\u00E9tiers</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {(selectedRegion || selectedService) && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
              R\u00E9initialiser les filtres
            </button>
          )}

          {/* Legend */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">L\u00E9gende</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-600" />
                <span className="text-sm text-gray-600">Forte couverture (3\u00A0000+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-sm text-gray-600">Couverture moyenne (1\u00A0000-3\u00A0000)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Couverture limit\u00E9e (&lt; 1\u00A0000)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 order-1 lg:order-2">
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '600px' }}>
          <MapContainer
            ref={mapRef}
            center={FRANCE_CENTER}
            zoom={FRANCE_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            minZoom={5}
            maxZoom={13}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredMarkers.map((city) => {
              const color = getMarkerColor(city.providerCount)
              const radius = getMarkerRadius(city.providerCount)

              return (
                <CircleMarker
                  key={city.slug}
                  center={[city.lat, city.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.7,
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -radius]}>
                    <span className="font-medium">{city.name}</span>
                    <br />
                    <span className="text-xs">{city.providerCount.toLocaleString('fr-FR')} artisans</span>
                  </Tooltip>
                  <Popup maxWidth={280}>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-base mb-1">{city.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{city.departement} &middot; {city.region}</p>
                      <p className="text-sm font-medium text-blue-700 mb-3">
                        {city.providerCount.toLocaleString('fr-FR')} artisans r\u00E9f\u00E9renc\u00E9s
                      </p>

                      <div className="flex gap-2">
                        <Link
                          href={selectedService ? `/services/${selectedService}/${city.slug}` : `/villes/${city.slug}`}
                          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {selectedService ? 'Voir les artisans' : 'Voir la ville'}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
