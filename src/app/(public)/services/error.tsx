'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function ServicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: 'services_list_error' },
      extra: { digest: error.digest },
    })
  }, [error])
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
        <button
          onClick={reset}
          className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
