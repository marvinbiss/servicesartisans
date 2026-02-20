'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, List, Map as MapIcon, Search, ChevronDown } from 'lucide-react'
import { Provider, Service, Location } from '@/types'
import ProviderList from '@/components/ProviderList'

const PAGE_SIZE = 50

// Import GeographicMap (world-class version) dynamically to avoid SSR issues with Leaflet
const GeographicMap = dynamic(() => import('@/components/maps/GeographicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-gray-500 font-medium">Chargement de la carte...</span>
      </div>
    </div>
  ),
})

interface ServiceLocationPageClientProps {
  service: Service
  location: Location
  providers: Provider[]
  h1Text?: string
  totalCount?: number
  serviceSlug?: string
  locationSlug?: string
}

export default function ServiceLocationPageClient({
  service,
  location,
  providers: initialProviders,
  h1Text,
  totalCount = 0,
  serviceSlug,
  locationSlug,
}: ServiceLocationPageClientProps) {
  const [allProviders, setAllProviders] = useState<Provider[]>(initialProviders)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [_isMobile, setIsMobile] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'default' | 'name' | 'rating'>('default')

  const hasMore = allProviders.length < totalCount

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !serviceSlug || !locationSlug) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(
        `/api/providers/listing?service=${serviceSlug}&location=${locationSlug}&offset=${allProviders.length}&limit=${PAGE_SIZE}`
      )
      if (!res.ok) throw new Error('fetch error')
      const data = await res.json()
      if (data.providers?.length) {
        setAllProviders(prev => [...prev, ...data.providers])
      }
    } catch {
      // silently fail — user can retry by clicking again
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, serviceSlug, locationSlug, allProviders.length])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Default center (France) or location coordinates
  const mapCenter: [number, number] = [
    location.latitude || 46.603354,
    location.longitude || 1.888334,
  ]
  const mapZoom = location.latitude ? 12 : 6

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b md:sticky md:top-[60px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Title & View toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-gray-900">
                {h1Text || `${service.name} à ${location.name}`}
              </h1>
              {(location.department_name || location.postal_code) && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {location.department_name
                    ? `${location.department_name}${location.department_code ? ` (${location.department_code})` : ''}`
                    : location.postal_code}
                </p>
              )}
            </div>

            {/* View toggle - Desktop */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Les deux
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Carte
              </button>
            </div>

            {/* View toggle - Mobile */}
            <div className="flex md:hidden items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky search/filter bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm py-2 px-4 border-b border-gray-100 flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="flex items-center gap-2 flex-1 px-3 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-500 min-h-[44px] active:bg-gray-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Rechercher un artisan...</span>
        </button>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'default' | 'name' | 'rating')}
          className="px-3 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 font-medium min-h-[44px] border-0 focus:ring-2 focus:ring-blue-500"
          aria-label="Trier les résultats"
        >
          <option value="default">Trier</option>
          <option value="name">Nom A-Z</option>
          <option value="rating">Avis</option>
        </select>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              viewMode !== 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
            aria-label="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
            aria-label="Vue carte"
          >
            <MapIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      {mobileSearchOpen && (
        <div className="bg-white border-b border-gray-100 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Nom, spécialité, adresse..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none min-h-[40px]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="text-xs text-blue-600 font-semibold whitespace-nowrap px-2 py-1"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Main content - Zillow style split view */}
      <div
        className="flex flex-col md:flex-row md:h-[calc(100vh-180px)]"
      >
        {/* Provider List */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`bg-white border-r border-gray-200 max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-y-auto ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-2/5' : 'w-full'
            }`}
          >
            <ProviderList
              providers={allProviders}
              onProviderHover={setSelectedProvider}
              totalCount={totalCount || allProviders.length}
            />
            {hasMore && (
              <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  {isLoadingMore ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isLoadingMore
                    ? 'Chargement...'
                    : `Afficher plus (${allProviders.length} / ${totalCount.toLocaleString('fr-FR')})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`min-h-[400px] ${
              viewMode === 'split'
                ? 'hidden md:block md:w-1/2 lg:w-3/5'
                : 'w-full'
            }`}
          >
            <GeographicMap
              centerLat={mapCenter[0]}
              centerLng={mapCenter[1]}
              zoom={mapZoom}
              providers={allProviders.map(p => ({
                id: p.id,
                name: p.name || '',
                stable_id: p.stable_id ?? undefined,
                slug: p.slug,
                latitude: p.latitude || 0,
                longitude: p.longitude || 0,
                rating_average: p.rating_average,
                review_count: p.review_count,
                specialty: p.specialty,
                address_city: p.address_city,
                is_verified: p.is_verified || false,
                phone: p.phone,
                address_street: p.address_street,
                address_postal_code: p.address_postal_code
              }))}
              highlightedProviderId={selectedProvider?.id}
              locationName={location.name}
              height="100%"
              className="h-full"
            />
          </div>
        )}
      </div>

    </div>
  )
}
