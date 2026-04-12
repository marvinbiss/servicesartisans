'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md w-full">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Une erreur est survenue</h2>
        <p className="text-charcoal-600 mb-8 text-sm">
          Le tableau de bord n'a pas pu être chargé. Cela peut être dû à un problème temporaire.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/espace-artisan"
            className="inline-flex items-center justify-center gap-2 text-charcoal-600 hover:text-charcoal-800 text-sm py-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Retour à l'espace artisan
          </Link>
        </div>
      </div>
    </div>
  )
}
