'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: 'admin_dashboard_error' },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900 mb-3 tracking-tight">
          Erreur dans le tableau de bord
        </h1>
        <p className="text-charcoal-600 mb-8">
          Impossible de charger cette section. Réessayez ou revenez au tableau de bord principal.
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
            href="/admin"
            className="inline-flex items-center justify-center gap-2 bg-white border border-sand-300 text-charcoal-700 px-6 py-3 rounded-lg font-semibold hover:bg-sand-50 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-sm text-charcoal-400">Code erreur : {error.digest}</p>
        )}
      </div>
    </div>
  )
}
