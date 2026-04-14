'use client'

import { useState } from 'react'
import {
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  User,
  Calendar,
  Mail,
  FileText,
} from 'lucide-react'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'

interface RemovalRequest {
  id: string
  provider_id: string
  requester_name: string
  requester_email: string
  requester_siret: string | null
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  processed_at: string | null
  processed_by: string | null
  created_at: string
  provider: {
    id: string
    name: string
    slug: string | null
    stable_id: string
    specialty: string | null
    address_city: string | null
  } | null
}

interface RemovalRequestsResponse {
  data: RemovalRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminRemovalRequestsPage() {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const url = `/api/admin/removal-requests?page=${page}&limit=20&status=${filter}`
  const { data, isLoading, error, mutate } = useAdminFetch<RemovalRequestsResponse>(url)

  const requests = data?.data || []
  const totalPages = data?.pagination?.totalPages || 1

  const [actionModal, setActionModal] = useState<{
    open: boolean
    requestId: string
    action: 'approve' | 'reject'
    providerName: string
    requesterName: string
  }>({ open: false, requestId: '', action: 'approve', providerName: '', requesterName: '' })

  const [adminNotes, setAdminNotes] = useState('')

  const confirmAction = async () => {
    try {
      setActionError(null)
      setActionSuccess(null)

      if (actionModal.action === 'reject' && !adminNotes.trim()) {
        setActionError('Le motif de rejet est obligatoire')
        return
      }

      const result = await adminMutate<{ success: boolean; message?: string }>(
        '/api/admin/removal-requests',
        {
          method: 'PATCH',
          body: {
            requestId: actionModal.requestId,
            action: actionModal.action,
            ...(adminNotes.trim() ? { adminNotes: adminNotes.trim() } : {}),
          },
        }
      )
      setActionModal({
        open: false,
        requestId: '',
        action: 'approve',
        providerName: '',
        requesterName: '',
      })
      setAdminNotes('')
      if (result?.message) setActionSuccess(result.message)
      mutate()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors du traitement')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> En attente
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> Approuvée
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Rejetée
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-7 h-7 text-red-500" />
            Demandes de suppression
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les demandes de suppression de fiches artisan (RGPD)
          </p>
        </div>
      </div>

      {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}

      {actionSuccess && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'pending' as const, label: 'En attente' },
          { value: 'approved' as const, label: 'Approuvées' },
          { value: 'rejected' as const, label: 'Rejetées' },
          { value: 'all' as const, label: 'Toutes' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setFilter(value)
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-72 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-56 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorBanner message="Erreur lors du chargement des demandes" />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Aucune demande{' '}
            {filter !== 'all'
              ? `${filter === 'pending' ? 'en attente' : filter === 'approved' ? 'approuvée' : 'rejetée'}`
              : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  {/* Provider info */}
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {req.provider?.name || 'Artisan inconnu'}
                    </span>
                    {req.provider?.address_city && (
                      <span className="text-gray-500 text-sm">— {req.provider.address_city}</span>
                    )}
                    {req.provider?.specialty && (
                      <span className="text-gray-400 text-xs">({req.provider.specialty})</span>
                    )}
                  </div>

                  {/* Requester info */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{req.requester_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${req.requester_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {req.requester_email}
                      </a>
                    </div>
                    {req.requester_siret && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">SIRET :</span>
                        <span className="font-mono font-medium text-gray-900">
                          {req.requester_siret}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-gray-500 font-medium">Motif :</span>{' '}
                      <span className="text-gray-700">{req.reason}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(req.created_at)}
                  </div>

                  {/* Admin notes (for processed requests) */}
                  {req.admin_notes && (
                    <p className="text-sm rounded-lg p-2 text-red-600 bg-red-50">
                      Notes admin : {req.admin_notes}
                    </p>
                  )}

                  {/* Processed date */}
                  {req.processed_at && (
                    <div className="text-xs text-gray-400">
                      Traitée le {formatDate(req.processed_at)}
                    </div>
                  )}
                </div>

                {/* Status + Actions */}
                <div className="flex flex-col items-end gap-3 ml-4">
                  {statusBadge(req.status)}

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setActionModal({
                            open: true,
                            requestId: req.id,
                            action: 'approve',
                            providerName: req.provider?.name || 'Artisan',
                            requesterName: req.requester_name,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approuver
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({
                            open: true,
                            requestId: req.id,
                            action: 'reject',
                            providerName: req.provider?.name || 'Artisan',
                            requesterName: req.requester_name,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={actionModal.open}
        onClose={() => {
          setActionModal({ ...actionModal, open: false })
          setAdminNotes('')
        }}
        onConfirm={confirmAction}
        title={actionModal.action === 'approve' ? 'Approuver la suppression' : 'Rejeter la demande'}
        message={
          actionModal.action === 'approve'
            ? `Approuver la suppression de la fiche "${actionModal.providerName}" demandée par ${actionModal.requesterName} ? La fiche sera désactivée et mise en noindex.`
            : `Rejeter la demande de suppression de "${actionModal.providerName}" par ${actionModal.requesterName} ?`
        }
        confirmText={actionModal.action === 'approve' ? 'Approuver la suppression' : 'Rejeter'}
        variant={actionModal.action === 'approve' ? 'danger' : 'warning'}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {actionModal.action === 'reject'
              ? 'Motif du rejet (obligatoire)'
              : 'Notes admin (optionnel)'}
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={
              actionModal.action === 'reject'
                ? 'Expliquez pourquoi la demande est rejetée...'
                : 'Notes internes sur cette décision...'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            maxLength={1000}
          />
          {actionModal.action === 'reject' && (
            <p className="text-xs text-gray-400 mt-1">
              Le motif sera conservé dans le dossier de la demande.
            </p>
          )}
        </div>
      </ConfirmationModal>
    </div>
  )
}
