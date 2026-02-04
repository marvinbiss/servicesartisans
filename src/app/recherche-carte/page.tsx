import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { Metadata } from 'next'

const MapWithList = dynamic(
  () => import('@/components/maps/MapWithList'),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de la carte interactive...</p>
        </div>
      </div>
    )
  }
)

export const metadata: Metadata = {
  title: 'Recherche sur Carte - Trouvez votre Artisan | Services Artisans',
  description: 'Trouvez les meilleurs artisans près de chez vous avec notre carte interactive. GPS précis, filtres avancés, et interaction en temps réel.',
}

export default function RechercheCartePage({
  searchParams
}: {
  searchParams: { q?: string; ville?: string; lat?: string; lng?: string }
}) {
  // Extraire les paramètres
  const searchQuery = searchParams.q || 'artisan'
  const locationName = searchParams.ville || ''
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : 48.8566
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : 2.3522

  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <MapWithList
        initialCenter={[lat, lng]}
        initialZoom={13}
        searchQuery={searchQuery}
        locationName={locationName}
      />
    </Suspense>
  )
}
