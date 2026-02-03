import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Leaflet
const MapSearch = dynamic(
  () => import('@/components/maps/MapSearch'),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
)

export const metadata: Metadata = {
  title: 'Recherche sur carte - Trouvez un artisan près de chez vous | ServicesArtisans',
  description: 'Trouvez les meilleurs artisans autour de vous grâce à notre carte interactive. Filtrez par service, note, et disponibilité pour trouver l\'artisan idéal.',
  keywords: [
    'carte artisans',
    'trouver artisan proche',
    'artisan près de moi',
    'recherche géographique artisan',
    'carte interactive services',
  ],
  openGraph: {
    title: 'Recherche sur carte - Artisans près de chez vous',
    description: 'Trouvez facilement un artisan qualifié dans votre zone géographique',
    type: 'website',
  },
}

export default function CartePage() {
  return <MapSearch />
}
