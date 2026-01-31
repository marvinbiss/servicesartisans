'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, Check, Crown, Zap, CreditCard, Download, Calendar } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

const plans = [
  {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    description: 'Pour démarrer',
    features: [
      'Profil basique',
      '5 demandes/mois',
      'Messagerie',
      'Support email',
    ],
    notIncluded: [
      'Badge vérifié',
      'Position prioritaire',
      'Statistiques avancées',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    description: 'Pour les professionnels',
    popular: true,
    features: [
      'Profil complet',
      '30 demandes/mois',
      'Messagerie prioritaire',
      'Badge vérifié',
      'Statistiques de base',
      'Support prioritaire',
    ],
    notIncluded: [
      'Position n°1',
      'Statistiques avancées',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'Visibilité maximale',
    features: [
      'Profil premium',
      'Demandes illimitées',
      'Messagerie prioritaire',
      'Badge Premium',
      'Position prioritaire',
      'Statistiques avancées',
      'Support dédié 24/7',
      'Formation gratuite',
    ],
    notIncluded: [],
  },
]

const factures = [
  { id: 1, date: '2024-01-01', montant: 49, status: 'payé' },
  { id: 2, date: '2023-12-01', montant: 49, status: 'payé' },
  { id: 3, date: '2023-11-01', montant: 49, status: 'payé' },
]

export default function AbonnementArtisanPage() {
  const [currentPlan] = useState('pro')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const openUpgradeModal = (planId: string) => {
    setSelectedPlan(planId)
    setShowUpgradeModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Abonnement</h1>
              <p className="text-blue-100">Gérez votre abonnement et facturation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <Link
                href="/espace-artisan"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-5 h-5" />
                Tableau de bord
              </Link>
              <Link
                href="/espace-artisan/demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Demandes
              </Link>
              <Link
                href="/espace-artisan/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
              </Link>
              <Link
                href="/espace-artisan/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Avis clients
              </Link>
              <Link
                href="/espace-artisan/profil"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                href="/espace-artisan/abonnement"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <Euro className="w-5 h-5" />
                Abonnement
              </Link>
              <LogoutButton />
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Current plan */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm font-medium text-blue-200">Abonnement actuel</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Pro</h2>
                  <p className="text-blue-200">49€/mois • Renouvelé le 1er février 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-200 mb-2">Demandes restantes ce mois</p>
                  <div className="text-3xl font-bold">24/30</div>
                </div>
              </div>
            </div>

            {/* Plans */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Changer d'offre</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-xl shadow-sm p-6 relative ${
                      plan.popular ? 'ring-2 ring-blue-600' : ''
                    } ${currentPlan === plan.id ? 'bg-blue-50' : ''}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                        Populaire
                      </span>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-gray-500 text-sm">{plan.description}</p>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-gray-500">/mois</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="w-5 h-5 flex items-center justify-center">—</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {currentPlan === plan.id ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-medium"
                      >
                        Offre actuelle
                      </button>
                    ) : (
                      <button
                        onClick={() => openUpgradeModal(plan.id)}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          plan.id === 'premium'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {plan.price > plans.find(p => p.id === currentPlan)!.price ? (
                          <span className="flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Passer à {plan.name}
                          </span>
                        ) : (
                          'Changer'
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Mode de paiement
              </h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expire 12/25</p>
                  </div>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">
                  Modifier
                </button>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Historique des factures
              </h2>
              <div className="space-y-3">
                {factures.map((facture) => (
                  <div
                    key={facture.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Facture {new Date(facture.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-500">{facture.montant}€</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {facture.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel */}
            <div className="text-center">
              <button className="text-gray-500 text-sm hover:text-red-600">
                Annuler mon abonnement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Confirmer le changement
            </h2>
            <p className="text-gray-600 mb-6">
              Vous allez passer à l'offre <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> à {plans.find(p => p.id === selectedPlan)?.price}€/mois.
              Le changement sera effectif immédiatement.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
