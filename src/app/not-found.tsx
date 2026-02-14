import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-600 opacity-20">404</div>
          <div className="text-6xl -mt-20 mb-4">🔧</div>
        </div>

        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          Oups ! Il semble que cette page n'existe pas ou a été déplacée.
          Nos artisans sont peut-être en train de la réparer...
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Trouver un artisan
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Vous cherchez peut-être :
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/services/plombier" className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors">
              Plombier
            </Link>
            <Link href="/services/electricien" className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors">
              Électricien
            </Link>
            <Link href="/services/serrurier" className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors">
              Serrurier
            </Link>
            <Link href="/devis" className="text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1.5 rounded-full transition-colors">
              Demande de devis
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
