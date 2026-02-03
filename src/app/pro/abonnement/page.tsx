'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Crown,
  Zap,
  Check,
  Star,
  Users,
  TrendingUp,
  Shield,
  MessageSquare,
  BarChart3,
  Headphones,
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  description: string
  features: string[]
  highlighted?: boolean
  icon: typeof Crown
  color: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    interval: 'month',
    description: 'Pour démarrer et tester la plateforme',
    icon: Zap,
    color: 'slate',
    features: [
      '5 leads par mois',
      'Profil basique',
      'Messagerie limitée',
      'Support email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    interval: 'month',
    description: 'Pour les artisans qui veulent développer leur activité',
    icon: Star,
    color: 'blue',
    highlighted: true,
    features: [
      'Leads illimités',
      'Profil premium avec photos',
      'Mise en avant dans les recherches',
      'Messagerie illimitée',
      'Statistiques avancées',
      'Badge vérifié',
      'Support prioritaire',
      'Devis en ligne',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    interval: 'month',
    description: 'Pour les professionnels qui veulent dominer leur marché',
    icon: Crown,
    color: 'amber',
    features: [
      'Tout le plan Pro',
      'Position #1 dans les résultats',
      'Publicité sur la plateforme',
      'Gestion multi-employés',
      'API & intégrations',
      'Account manager dédié',
      'Formation personnalisée',
      'Garantie satisfaction',
    ],
  },
]

export default function ProAbonnementPage() {
  const [currentPlan] = useState('pro')
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  const getPrice = (plan: Plan) => {
    if (billingInterval === 'year') {
      return Math.round(plan.price * 10) // 2 mois gratuits
    }
    return plan.price
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Choisissez votre formule
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Développez votre activité avec les outils qui font la différence
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={billingInterval === 'month' ? 'font-semibold text-slate-900' : 'text-slate-500'}>
            Mensuel
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="relative w-14 h-7 bg-blue-600 rounded-full transition-colors"
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingInterval === 'year' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={billingInterval === 'year' ? 'font-semibold text-slate-900' : 'text-slate-500'}>
            Annuel
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              -17%
            </span>
          </span>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Vous êtes actuellement sur le plan Pro</div>
            <div className="text-sm text-slate-600">Prochain renouvellement le 15 février 2024</div>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          Gérer l'abonnement
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = plan.id === currentPlan
          const price = getPrice(plan)

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`
                relative bg-white rounded-2xl border-2 overflow-hidden
                ${plan.highlighted ? 'border-blue-500 shadow-xl shadow-blue-500/10' : 'border-slate-200'}
                ${isCurrentPlan ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
              `}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center text-sm font-medium py-1">
                  Le plus populaire
                </div>
              )}

              <div className={`p-6 ${plan.highlighted ? 'pt-10' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.color === 'blue' ? 'bg-blue-100' :
                  plan.color === 'amber' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    plan.color === 'blue' ? 'text-blue-600' :
                    plan.color === 'amber' ? 'text-amber-600' : 'text-slate-600'
                  }`} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{price}€</span>
                  <span className="text-slate-500">/{billingInterval === 'year' ? 'an' : 'mois'}</span>
                </div>

                <button
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors mb-6 ${
                    isCurrentPlan
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isCurrentPlan ? 'Plan actuel' : 'Choisir ce plan'}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${
                        plan.color === 'blue' ? 'text-blue-600' :
                        plan.color === 'amber' ? 'text-amber-600' : 'text-green-600'
                      }`} />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Ce que vous obtenez avec Pro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: 'Plus de clients', desc: 'Accès à tous les leads de votre zone' },
            { icon: TrendingUp, title: 'Visibilité accrue', desc: 'Apparaissez en haut des résultats' },
            { icon: Shield, title: 'Badge vérifié', desc: 'Inspirez confiance aux clients' },
            { icon: BarChart3, title: 'Statistiques', desc: 'Analysez vos performances' },
            { icon: MessageSquare, title: 'Chat illimité', desc: 'Communiquez sans limite' },
            { icon: Headphones, title: 'Support prioritaire', desc: 'Réponse sous 24h garantie' },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-slate-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Questions fréquentes
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez passer à un plan supérieur ou inférieur quand vous le souhaitez. Le changement prend effet immédiatement.' },
            { q: 'Y a-t-il un engagement ?', a: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.' },
            { q: 'Comment fonctionne la facturation ?', a: 'Vous êtes facturé au début de chaque période (mois ou année). Les factures sont disponibles dans votre espace.' },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
