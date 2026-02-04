'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, List, Map as MapIcon } from 'lucide-react'
import { Provider, Service, Location } from '@/types'
import ProviderList from '@/components/ProviderList'
import Breadcrumb from '@/components/Breadcrumb'

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
}

export default function ServiceLocationPageClient({
  service,
  location,
  providers,
}: ServiceLocationPageClientProps) {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split')
  const [_isMobile, setIsMobile] = useState(false)

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
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Services', href: '/services' },
              { label: service.name, href: `/services/${service.slug}` },
              { label: location.name },
            ]}
            className="mb-2"
          />

          {/* Title & View toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {service.name} à {location.name}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {location.department_name} ({location.department_code})
              </p>
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

      {/* Main content - Zillow style split view */}
      <div
        className="flex"
        style={{ height: 'calc(100vh - 180px)' }}
      >
        {/* Provider List */}
        {(viewMode === 'split' || viewMode === 'list') && (
          <div
            className={`bg-white border-r border-gray-200 overflow-hidden ${
              viewMode === 'split' ? 'w-full md:w-1/2 lg:w-2/5' : 'w-full'
            }`}
          >
            <ProviderList
              providers={providers}
              serviceSlug={service.slug}
              locationSlug={location.slug}
              onProviderHover={setSelectedProvider}
            />
          </div>
        )}

        {/* Map */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`${
              viewMode === 'split'
                ? 'hidden md:block md:w-1/2 lg:w-3/5'
                : 'w-full'
            }`}
          >
            <GeographicMap
              centerLat={mapCenter[0]}
              centerLng={mapCenter[1]}
              zoom={mapZoom}
              providers={providers.map(p => ({
                id: p.id,
                name: p.business_name || p.name || '',
                slug: p.slug,
                latitude: p.latitude || 0,
                longitude: p.longitude || 0,
                rating_average: p.rating_average,
                review_count: p.review_count,
                specialty: p.specialty,
                address_city: p.address_city,
                is_verified: p.is_verified || false,
                is_premium: p.is_premium || false,
                phone: p.phone,
                address_street: p.address_street,
                address_postal_code: p.address_postal_code
              }))}
              locationName={location.name}
              height="100%"
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* SEO Content - Hidden on mobile in map view */}
      {viewMode !== 'map' && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-gray max-w-none">
              <h2>
                Trouver un {service.name.toLowerCase()} à {location.name}
              </h2>
              <p>
                Vous recherchez un {service.name.toLowerCase()} à {location.name} (
                {location.postal_code}) ? ServicesArtisans vous propose une sélection de{' '}
                {providers.length} professionnels qualifiés dans votre ville.
              </p>
              <p>
                Comparez les {service.name.toLowerCase()}s de {location.name}, consultez
                leurs avis clients et demandez des devis gratuits pour vos travaux.
              </p>

              <h3>Pourquoi choisir un {service.name.toLowerCase()} local ?</h3>
              <ul>
                <li>Intervention rapide en cas d&apos;urgence</li>
                <li>Connaissance des spécificités locales</li>
                <li>Frais de déplacement réduits</li>
                <li>Service de proximité et réactivité</li>
              </ul>

              <h3>
                Les quartiers de {location.name} où nous intervenons
              </h3>
              <p>
                Nos {service.name.toLowerCase()}s interviennent dans toute la ville de{' '}
                {location.name} et ses environs, y compris{' '}
                {location.department_name && `dans tout le département ${location.department_name}`}.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
