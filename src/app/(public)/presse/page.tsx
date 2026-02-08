import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Espace presse | ServicesArtisans',
  description: 'Espace presse de ServicesArtisans.',
  robots: { index: false, follow: true },
}

export default function PressePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Presse</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Espace presse
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600">
            Espace presse en cours de préparation.
          </p>
          <p className="text-gray-500 mt-4">
            Pour toute demande presse, contactez-nous à{' '}
            <a href="mailto:presse@servicesartisans.fr" className="text-blue-600 hover:underline">
              presse@servicesartisans.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
