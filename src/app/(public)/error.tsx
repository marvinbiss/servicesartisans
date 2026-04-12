'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Error is already captured by Next.js error reporting
  }, [error])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Oups ! Une erreur est survenue
        </h1>
        <p className="text-charcoal-600 mb-8">
          Nous nous excusons pour ce désagrément. Notre équipe technique a été notifiée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-sand-400 text-charcoal-700 px-6 py-3 rounded-lg font-semibold hover:bg-sand-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-sm text-charcoal-400">Code erreur : {error.digest}</p>
        )}
      </div>
    </div>
  )
}
