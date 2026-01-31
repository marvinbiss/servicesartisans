'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Vous êtes hors ligne
        </h1>

        <p className="text-gray-600 mb-8">
          Vérifiez votre connexion internet et réessayez.
          Certaines fonctionnalités sont disponibles hors ligne.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>

        <div className="mt-12 p-4 bg-white rounded-lg shadow-sm">
          <h2 className="font-medium text-gray-900 mb-3">
            Disponible hors ligne :
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>- Consulter vos réservations enregistrées</li>
            <li>- Voir les artisans récemment consultés</li>
            <li>- Accéder à vos informations de profil</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
