import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const CarteAvecListe = dynamic(
  () => import('@/components/maps/CarteAvecListe'),
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
}

export default function CartePage() {
  return <CarteAvecListe />
}
