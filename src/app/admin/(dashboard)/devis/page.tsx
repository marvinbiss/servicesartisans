'use client'

import { useState } from 'react'
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { useAdminFetch } from '@/hooks/admin/useAdminFetch'

interface Quote {
  id: string
  client_id: string | null
  service_id: string | null
  service_name: string
  postal_code: string
  description: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  urgency: 'normal' | 'urgent' | 'tres_urgent'
  created_at: string
}

interface QuotesResponse {
  quotes: Quote[]
  totalPages: number
  total: number
}

export default function AdminDevisPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'expired'>('all')
  const [page, setPage] = useState(1)

  const url = `/api/admin/quotes?page=${page}&limit=20&status=${status}&search=${encodeURIComponent(search)}`
  const { data, isLoading, error, mutate } = useAdminFetch<QuotesResponse>(url)

  const quotes = data?.quotes || []
  const totalPages = data?.totalPages || 1
  const total = data?.total || 0

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'error',
      expired: 'default',
    }
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré',
    }
    return <StatusBadge variant={variants[status] || 'default'}>{labels[status] || status}</StatusBadge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const config: Record<string, { variant: 'error' | 'warning' | 'default'; label: string }> = {
      tres_urgent: { variant: 'error', label: 'Très urgent' },
      urgent: { variant: 'warning', label: 'Urgent' },
      normal: { variant: 'default', label: 'Normal' },
    }
    const { variant, label } = config[urgency] || config.normal
    return <StatusBadge variant={variant}>{label}</StatusBadge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Devis</h1>
          <p className="text-gray-500 mt-1">{total} demandes de devis</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par service, code postal..."
                aria-label="Rechercher un devis"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'accepted', 'rejected', 'expired'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s)
                    setPage(1)
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Tous' :
                   s === 'pending' ? 'En attente' :
                   s === 'accepted' ? 'Acceptés' :
                   s === 'rejected' ? 'Refusés' : 'Expirés'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && <ErrorBanner message={error.message} onDismiss={() => {}} onRetry={() => mutate()} />}

        {/* Quotes List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun devis trouvé</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{quote.service_name}</h3>
                          {getStatusBadge(quote.status)}
                          {getUrgencyBadge(quote.urgency)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {quote.postal_code}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(quote.created_at)}
                          </span>
                        </div>

                        {quote.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {quote.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {quote.urgency !== 'normal' && (
                          <AlertCircle className={`w-5 h-5 ${
                            quote.urgency === 'tres_urgent' ? 'text-red-500' : 'text-amber-500'
                          }`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
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
