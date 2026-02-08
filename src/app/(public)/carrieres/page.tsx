import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function CarrieresPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Carrières</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Carrières
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600">
            Aucune offre disponible pour le moment.
          </p>
          <p className="text-gray-500 mt-4">
            Pour toute candidature spontanée, contactez-nous à{' '}
            <a href="mailto:careers@servicesartisans.fr" className="text-blue-600 hover:underline">
              careers@servicesartisans.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
