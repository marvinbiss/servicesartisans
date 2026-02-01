'use client'

import { useState, useEffect } from 'react'
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

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled' | 'past_due'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [page, filter])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        filter,
      })
      const response = await fetch(`/api/admin/subscriptions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
        setStats(data.stats || null)
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockStats: SubscriptionStats = {
    totalRevenue: 45680,
    activeSubscriptions: 234,
    premiumCount: 89,
    basicCount: 145,
    freeCount: 1560,
    churnRate: 2.3,
  }

  const mockSubscriptions: Subscription[] = [
    {
      id: 'sub_1',
      provider_id: 'p1',
      provider_name: 'Plomberie Pro Paris',
      plan: 'premium',
      status: 'active',
      current_period_start: '2024-03-01',
      current_period_end: '2024-04-01',
      amount: 4900,
      payment_method: '**** 4242',
      created_at: '2024-01-15',
    },
    {
      id: 'sub_2',
      provider_id: 'p2',
      provider_name: 'Électricité Express',
      plan: 'basic',
      status: 'active',
      current_period_start: '2024-03-01',
      current_period_end: '2024-04-01',
      amount: 1900,
      payment_method: '**** 5555',
      created_at: '2024-02-20',
    },
    {
      id: 'sub_3',
      provider_id: 'p3',
      provider_name: 'Serrurerie 24/7',
      plan: 'basic',
      status: 'past_due',
      current_period_start: '2024-02-15',
      current_period_end: '2024-03-15',
      amount: 1900,
      created_at: '2024-01-10',
    },
  ]

  const displayStats = stats || mockStats
  const displaySubscriptions = subscriptions.length > 0 ? subscriptions : mockSubscriptions

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-violet-100 text-violet-700',
      basic: 'bg-blue-100 text-blue-700',
      free: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || colors.free}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
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
              <div className="p-3 rounded-lg bg-violet-100 text-violet-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xl font-bold text-violet-600">{displayStats.premiumCount}</p>
                <p className="text-xs text-gray-500">Premium</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{displayStats.basicCount}</p>
                <p className="text-xs text-gray-500">Basic</p>
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
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artisan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displaySubscriptions.map((sub) => (
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
