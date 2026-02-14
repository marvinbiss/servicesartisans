'use client'

import { useState } from 'react'
import {
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Calendar,
} from 'lucide-react'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { useAdminFetch } from '@/hooks/admin/useAdminFetch'

interface Subscription {
  id: string
  provider_id: string
  provider_name: string
  plan: 'free' | 'basic' | 'premium'
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  amount: number
  payment_method?: string
  created_at: string
}

interface SubscriptionStats {
  totalRevenue: number
  activeSubscriptions: number
  premiumCount: number
  basicCount: number
  freeCount: number
  churnRate: number
}

interface SubscriptionsResponse {
  subscriptions: Subscription[]
  stats: SubscriptionStats | null
  totalPages: number
}

export default function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled' | 'past_due'>('all')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({
    page: String(page),
    limit: '20',
    filter,
  })

  const { data, isLoading, error, mutate } = useAdminFetch<SubscriptionsResponse>(
    `/api/admin/subscriptions?${params}`
  )

  const subscriptions = data?.subscriptions || []
  const stats = data?.stats || null
  const totalPages = data?.totalPages || 1

  const emptyStats: SubscriptionStats = {
    totalRevenue: 0,
    activeSubscriptions: 0,
    premiumCount: 0,
    basicCount: 0,
    freeCount: 0,
    churnRate: 0,
  }

  const displayStats = stats || emptyStats

  const planLabels: Record<string, string> = {
    'free': 'Gratuit',
    'basic': 'Basique',
    'premium': 'Premium',
    'pro': 'Pro',
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-blue-100 text-blue-700',
      basic: 'bg-blue-100 text-blue-700',
      free: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || colors.free}`}>
        {planLabels[plan] || plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-700', label: 'Actif' },
      canceled: { color: 'bg-gray-100 text-gray-700', label: 'Annulé' },
      past_due: { color: 'bg-red-100 text-red-700', label: 'Impayé' },
      trialing: { color: 'bg-amber-100 text-amber-700', label: 'Essai' },
    }
    const config = configs[status] || configs.active
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h1>
          <p className="text-gray-500 mt-1">Suivi des abonnements et revenus de la plateforme</p>
        </div>

        {/* Error Banner */}
        {error && <ErrorBanner message={error.message} onRetry={() => mutate()} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(displayStats.totalRevenue / 100).toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-gray-500 mt-1">Revenus ce mois</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{displayStats.activeSubscriptions}</p>
            <p className="text-sm text-gray-500 mt-1">Abonnements actifs</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xl font-bold text-blue-600">{displayStats.premiumCount}</p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{displayStats.basicCount}</p>
                <p className="text-xs text-gray-500">Basique</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <RefreshCw className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{displayStats.churnRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Taux de désabonnement</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'past_due', 'canceled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tous' :
                 f === 'active' ? 'Actifs' :
                 f === 'past_due' ? 'Impayés' : 'Annulés'}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]" aria-label="Liste des abonnements">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artisan
                      </th>
                      <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th scope="col" className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          Aucun abonnement disponible
                        </td>
                      </tr>
                    ) : subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{sub.provider_name}</p>
                          {sub.payment_method && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {sub.payment_method}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">{getPlanBadge(sub.plan)}</td>
                        <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(sub.current_period_end).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{(sub.amount / 100).toFixed(2)} €</span>
                          <span className="text-gray-500 text-sm">/mois</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Voir les détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} sur {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
