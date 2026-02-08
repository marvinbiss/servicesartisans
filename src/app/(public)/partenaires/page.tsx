import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nos partenaires | ServicesArtisans',
  description: 'Programme partenaires de ServicesArtisans.',
  robots: { index: false, follow: true },
}

export default function PartenairesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Partenaires</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Nos partenaires
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600">
            Programme partenaires en cours de développement.
          </p>
          <p className="text-gray-500 mt-4">
            Pour toute demande de partenariat, contactez-nous à{' '}
            <a href="mailto:partenaires@servicesartisans.fr" className="text-blue-600 hover:underline">
              partenaires@servicesartisans.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
