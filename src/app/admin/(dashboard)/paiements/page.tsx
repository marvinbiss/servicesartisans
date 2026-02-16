'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  ChevronRight,
  XCircle,
  CheckCircle,
  Clock,
  Euro,
} from 'lucide-react'
import { SubscriptionBadge, PaymentStatusBadge } from '@/components/admin/StatusBadge'
import { RefundModal } from '@/components/admin/RefundModal'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'

interface Stats {
  totalRevenue: number
  totalRefunded: number
  netRevenue: number
  chargesCount: number
  refundsCount: number
  activeSubscriptions: number
  totalUsers: number
  period: string
}

interface Subscription {
  id: string
  customerId: string
  customerEmail: string | null
  userId: string | null
  userName: string | null
  userEmail: string | null
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  amount: number
  interval: string
  priceId: string
  created: string
}

interface StatsResponse {
  stats: Stats
}

interface SubscriptionsResponse {
  subscriptions: Subscription[]
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled' | 'past_due'>('all')
  const [mutationError, setMutationError] = useState<string | null>(null)

  // Modal states
  const [refundModal, setRefundModal] = useState<{ open: boolean; paymentId: string; amount: number }>({
    open: false,
    paymentId: '',
    amount: 0,
  })
  const [cancelModal, setCancelModal] = useState<{ open: boolean; subId: string; userName: string }>({
    open: false,
    subId: '',
    userName: '',
  })

  const { data: statsData, error: statsError, mutate: mutateStats } = useAdminFetch<StatsResponse>(
    '/api/admin/payments?type=overview'
  )

  const { data: subsData, isLoading, error: subsError, mutate: mutateSubs } = useAdminFetch<SubscriptionsResponse>(
    `/api/admin/payments?type=subscriptions&status=${filter}`
  )

  const stats = statsData?.stats || null
  const subscriptions = subsData?.subscriptions || []
  const error = statsError || subsError || (mutationError ? new Error(mutationError) : undefined)

  const revalidateAll = () => {
    mutateStats()
    mutateSubs()
  }

  const handleRefund = async (amount: number, reason: string) => {
    try {
      setMutationError(null)
      await adminMutate(`/api/admin/payments/${refundModal.paymentId}/refund`, {
        method: 'POST',
        body: { amount, reason },
      })
      revalidateAll()
    } catch {
      setMutationError('Erreur lors du remboursement')
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setMutationError(null)
      await adminMutate(`/api/admin/subscriptions/${cancelModal.subId}/cancel`, {
        method: 'POST',
        body: { action: 'cancel', immediately: false },
      })
      setCancelModal({ open: false, subId: '', userName: '' })
      revalidateAll()
    } catch {
      setMutationError('Erreur lors de l\'annulation de l\'abonnement')
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'past_due':
        return <Clock className="w-4 h-4 text-amber-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
            <p className="text-gray-500 mt-1">Revenus, abonnements et remboursements</p>
          </div>
          <button
            onClick={revalidateAll}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Error Banner */}
        {error && <ErrorBanner message={error.message} onDismiss={mutationError ? () => setMutationError(null) : undefined} onRetry={revalidateAll} />}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Euro className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {stats.period}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.netRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Revenu net</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">{stats.chargesCount} paiements</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500 mt-1">Total encaissé</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">{stats.refundsCount} remboursements</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalRefunded)}</p>
              <p className="text-sm text-gray-500 mt-1">Total remboursé</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              <p className="text-sm text-gray-500 mt-1">Abonnements actifs</p>
            </div>
          </div>
        )}

        {/* Subscriptions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Abonnements</h2>
              <div className="flex gap-2">
                {(['all', 'active', 'canceled', 'past_due'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'Tous' :
                     f === 'active' ? 'Actifs' :
                     f === 'canceled' ? 'Annulés' : 'En retard'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun abonnement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]" aria-label="Liste des abonnements">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Client
                    </th>
                    <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                    <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Montant
                    </th>
                    <th scope="col" className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Période
                    </th>
                    <th scope="col" className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {sub.userName || 'Sans nom'}
                          </p>
                          <p className="text-sm text-gray-500">{sub.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <SubscriptionBadge
                          plan={sub.amount >= 9900 ? 'premium' : sub.amount >= 4900 ? 'pro' : 'gratuit'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status)}
                          <PaymentStatusBadge status={sub.status} />
                          {sub.cancelAtPeriodEnd && (
                            <span className="text-xs text-amber-600">(fin de période)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{formatAmount(sub.amount)}</p>
                        <p className="text-xs text-gray-500">/{sub.interval === 'month' ? 'mois' : 'an'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <p>Début: {formatDate(sub.currentPeriodStart)}</p>
                        <p>Fin: {formatDate(sub.currentPeriodEnd)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {sub.userId && (
                            <button
                              onClick={() => router.push(`/admin/utilisateurs/${sub.userId}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Voir l'utilisateur"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          )}
                          {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                            <button
                              onClick={() => setCancelModal({
                                open: true,
                                subId: sub.id,
                                userName: sub.userName || sub.userEmail || '',
                              })}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Annuler l'abonnement"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={refundModal.open}
        onClose={() => setRefundModal({ open: false, paymentId: '', amount: 0 })}
        onConfirm={handleRefund}
        paymentId={refundModal.paymentId}
        maxAmount={refundModal.amount}
      />

      {/* Cancel Subscription Modal */}
      <ConfirmationModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, subId: '', userName: '' })}
        onConfirm={handleCancelSubscription}
        title="Annuler l'abonnement"
        message={`Êtes-vous sûr de vouloir annuler l'abonnement de ${cancelModal.userName} ? L'accès sera maintenu jusqu'à la fin de la période en cours.`}
        confirmText="Annuler l'abonnement"
        variant="warning"
      />
    </div>
  )
}
