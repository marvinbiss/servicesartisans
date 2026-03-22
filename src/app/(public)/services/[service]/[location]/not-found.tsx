import Link from 'next/link'

export default function ServiceLocationNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl font-bold text-charcoal-900 mb-4">
          Page non trouvée
        </h1>
        <p className="text-gray-500 mb-8">
          Cette combinaison service/ville n&apos;existe pas dans notre annuaire.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/services"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Voir tous les services
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-blue-600 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
