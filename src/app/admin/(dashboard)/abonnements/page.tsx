'use client'

import { CreditCard } from 'lucide-react'

export default function AdminSubscriptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h1>
          <p className="text-gray-500 mt-1">Suivi des plans d&apos;abonnement des utilisateurs</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Fonctionnalité abonnements non disponible
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            La gestion des abonnements n&apos;est pas encore configurée pour cette plateforme.
            Revenez plus tard ou contactez l&apos;équipe technique.
          </p>
        </div>
      </div>
    </div>
  )
}
