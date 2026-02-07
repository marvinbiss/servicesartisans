'use client'

import Link from 'next/link'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'

export default function PrivateError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isAuthError =
    error.message?.includes('authentifi') ||
    error.message?.includes('auth') ||
    error.message?.includes('session')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isAuthError ? 'Session expirée' : 'Erreur de chargement'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isAuthError
            ? 'Votre session a expiré. Veuillez vous reconnecter.'
            : 'Une erreur est survenue lors du chargement de cette page.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthError ? (
            <Link
              href="/connexion"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Se reconnecter
            </Link>
          ) : (
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
