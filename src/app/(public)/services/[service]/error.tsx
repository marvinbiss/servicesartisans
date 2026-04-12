'use client'

import Link from 'next/link'

export default function ServiceDetailError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-orange-50 flex items-center justify-center">
          <span className="text-2xl text-orange-600">!</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900 mb-2">
          Service temporairement indisponible
        </h1>
        <p className="text-charcoal-500 mb-8">
          Nous rencontrons un problème technique. Veuillez réessayer dans quelques instants.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/services"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-primary-500 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Voir tous les services
          </Link>
        </div>
      </div>
    </div>
  )
}
