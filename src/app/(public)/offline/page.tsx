'use client'

import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-primary-500" />
          </div>
        </div>

        <h1 className="font-heading text-3xl font-bold text-charcoal-900 mb-4 tracking-tight">
          Hors connexion
        </h1>
        <p className="text-charcoal-600 mb-8">
          Vous semblez ne pas avoir de connexion internet. Vérifiez votre connexion et réessayez.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
