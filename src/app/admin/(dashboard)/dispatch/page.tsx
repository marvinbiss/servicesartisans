'use client'

import { useState, useEffect } from 'react'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Clock,
  Eye,
  Send,
  Inbox,
  Trash2,
  UserPlus,
  Search,
  X,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusTabs } from '@/components/dashboard/StatusTabs'
import { Pagination } from '@/components/dashboard/Pagination'
import { STATUS_META } from '@/types/leads'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'

interface DispatchAssignment {
  id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  lead: {
    id: string
    service_name: string
    city: string
    urgency: string
    status: string
    created_at: string
  } | null
  provider: {
    id: string
    name: string
    specialty: string
    address_city: string
  } | null
}

interface DispatchData {
  assignments: DispatchAssignment[]
  stats: {
    pending: number
    viewed: number
    quoted: number
    declined?: number
    total: number
  }
  page: number
  pageSize: number
}

type StatusFilter = 'all' | 'pending' | 'viewed' | 'quoted' | 'declined'

interface PickerProvider {
  id: string
  name: string
  specialty: string | null
  address_city: string | null
  is_active: boolean
}

function ProviderPicker({
  selected,
  onSelect,
}: {
  selected: PickerProvider | null
  onSelect: (p: PickerProvider | null) => void
}) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading } = useAdminFetch<{ providers: PickerProvider[] }>(
    debounced.length >= 2
      ? `/api/admin/providers?search=${encodeURIComponent(debounced)}&limit=8`
      : null
  )

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-sand-100 border border-sand-300 rounded-lg">
        <div>
          <span className="font-medium text-charcoal-900">{selected.name}</span>
          {selected.address_city && (
            <span className="text-xs text-charcoal-500 ml-2">{selected.address_city}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="p-1 text-charcoal-400 hover:text-charcoal-600"
          aria-label="Changer d'artisan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un artisan (nom, ville, SIRET…)"
          className="w-full pl-9 pr-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      {debounced.length >= 2 && (
        <div className="mt-1 border border-sand-200 rounded-lg divide-y divide-sand-100 max-h-56 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="px-3 py-3 text-sm text-charcoal-400 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Recherche…
            </div>
          ) : (data?.providers || []).length === 0 ? (
            <div className="px-3 py-3 text-sm text-charcoal-400">Aucun artisan trouvé</div>
          ) : (
            (data?.providers || []).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                disabled={!p.is_active}
                className="w-full text-left px-3 py-2 hover:bg-sand-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium text-charcoal-900">{p.name}</span>
                <span className="text-xs text-charcoal-500 ml-2">
                  {[p.specialty, p.address_city].filter(Boolean).join(' · ')}
                  {!p.is_active && ' — inactif'}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const MANUAL_LEAD_INITIAL = {
  serviceName: '',
  city: '',
  postalCode: '',
  description: '',
  urgency: 'semaine',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
}

function ManualLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState(MANUAL_LEAD_INITIAL)
  const [provider, setProvider] = useState<PickerProvider | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set =
    (key: keyof typeof MANUAL_LEAD_INITIAL) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!provider) {
      setError('Sélectionnez un artisan')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await adminMutate('/api/admin/leads', {
        method: 'POST',
        body: { ...form, providerId: provider.id, notify: true },
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Envoyer un lead manuel"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100">
          <h2 className="font-semibold text-charcoal-900">Envoyer un lead à un artisan</h2>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-600"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              Artisan destinataire
            </label>
            <ProviderPicker selected={provider} onSelect={setProvider} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Service</label>
              <input
                required
                value={form.serviceName}
                onChange={set('serviceName')}
                placeholder="Plomberie, PAC…"
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Urgence</label>
              <select
                value={form.urgency}
                onChange={set('urgency')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm bg-white"
              >
                <option value="urgent">Urgent</option>
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Ville</label>
              <input
                required
                value={form.city}
                onChange={set('city')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Code postal
              </label>
              <input
                required
                pattern="\d{5}"
                value={form.postalCode}
                onChange={set('postalCode')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              Description des travaux
            </label>
            <textarea
              required
              minLength={5}
              rows={3}
              value={form.description}
              onChange={set('description')}
              className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Nom client</label>
              <input
                required
                value={form.clientName}
                onChange={set('clientName')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Téléphone client
              </label>
              <input
                required
                value={form.clientPhone}
                onChange={set('clientPhone')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Email client
              </label>
              <input
                required
                type="email"
                value={form.clientEmail}
                onChange={set('clientEmail')}
                className="w-full px-3 py-2 border border-sand-200 rounded-lg text-sm"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-charcoal-600 bg-sand-100 rounded-lg hover:bg-sand-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !provider}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer le lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReassignModal({
  assignment,
  onClose,
  onDone,
}: {
  assignment: DispatchAssignment
  onClose: () => void
  onDone: () => void
}) {
  const [provider, setProvider] = useState<PickerProvider | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!provider) return
    setSubmitting(true)
    setError(null)
    try {
      await adminMutate('/api/admin/dispatch', {
        method: 'POST',
        body: { action: 'reassign', assignmentId: assignment.id, newProviderId: provider.id },
      })
      onDone()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Réassigner le lead"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100">
          <h2 className="font-semibold text-charcoal-900">Réassigner le lead</h2>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-600"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-charcoal-600">
            <span className="font-medium">{assignment.lead?.service_name || 'Lead'}</span>
            {assignment.lead?.city && ` à ${assignment.lead.city}`} — actuellement chez{' '}
            <span className="font-medium">{assignment.provider?.name || '—'}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">
              Nouvel artisan
            </label>
            <ProviderPicker selected={provider} onSelect={setProvider} />
          </div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-charcoal-600 bg-sand-100 rounded-lg hover:bg-sand-200"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || !provider}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Réassigner et notifier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDispatchPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [showManualModal, setShowManualModal] = useState(false)
  const [reassignTarget, setReassignTarget] = useState<DispatchAssignment | null>(null)

  const params = new URLSearchParams({ page: String(page) })
  if (statusFilter !== 'all') params.set('status', statusFilter)

  const {
    data,
    isLoading,
    error: fetchError,
    mutate,
  } = useAdminFetch<DispatchData>(`/api/admin/dispatch?${params}`)

  const error = fetchError || (mutationError ? new Error(mutationError) : undefined)

  const handleReplay = async (assignmentId: string) => {
    setActionLoading(assignmentId)
    try {
      setMutationError(null)
      await adminMutate('/api/admin/dispatch', {
        method: 'POST',
        body: { action: 'replay', assignmentId },
      })
      mutate()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(id)
    try {
      setMutationError(null)
      await adminMutate('/api/admin/dispatch', {
        method: 'DELETE',
        body: { id },
      })
      setConfirmDeleteId(null)
      mutate()
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const statusTabs = [
    { key: 'all', label: 'Tous', count: data?.stats.total || 0 },
    { key: 'pending', label: 'En attente', count: data?.stats.pending || 0 },
    { key: 'viewed', label: 'Vus', count: data?.stats.viewed || 0 },
    { key: 'quoted', label: 'Devis', count: data?.stats.quoted || 0 },
    { key: 'declined', label: 'Déclinés', count: data?.stats.declined || 0 },
  ]

  const responseRate =
    data && data.stats.total > 0
      ? Math.round(((data.stats.viewed + data.stats.quoted) / data.stats.total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Suivi de la répartition</h1>
            <p className="text-charcoal-500 mt-1">Suivi des assignations en temps réel</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Envoyer un lead
            </button>
            <button
              onClick={() => mutate()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-600 hover:text-charcoal-900 border border-sand-200 rounded-lg hover:bg-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard
            title="Total assignations"
            value={data?.stats.total || 0}
            icon={<Inbox className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="En attente"
            value={data?.stats.pending || 0}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatCard
            title="Devis envoyés"
            value={data?.stats.quoted || 0}
            icon={<Send className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            title="Taux réponse"
            value={`${responseRate}%`}
            icon={<Eye className="w-5 h-5" />}
            color="blue"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {/* Status filter */}
        <div className="mb-6">
          <StatusTabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onTabChange={(k) => {
              setStatusFilter(k as StatusFilter)
              setPage(1)
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-charcoal-600" />
          </div>
        ) : data ? (
          <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[400px] sm:min-w-[700px] text-sm"
                aria-label="Liste des assignations de dispatch"
              >
                <thead>
                  <tr className="border-b border-sand-100 bg-sand-50/50">
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Lead
                    </th>
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Artisan
                    </th>
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Assigné le
                    </th>
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Vu le
                    </th>
                    <th
                      scope="col"
                      className="text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider px-4 py-3"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {data.assignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-charcoal-500">
                        <ArrowRight className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
                        Aucune assignation
                      </td>
                    </tr>
                  ) : (
                    data.assignments.map((a) => {
                      const st = STATUS_META[a.status] || STATUS_META.pending
                      return (
                        <tr key={a.id} className="hover:bg-sand-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-medium text-charcoal-900">
                              {a.lead?.service_name || '—'}
                            </span>
                            {a.lead?.city && (
                              <p className="text-xs text-charcoal-400 mt-0.5">{a.lead.city}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-charcoal-700">{a.provider?.name || '—'}</span>
                            {a.provider?.specialty && (
                              <p className="text-xs text-charcoal-400 mt-0.5">
                                {a.provider.specialty}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-charcoal-500 text-xs whitespace-nowrap">
                            {new Date(a.assigned_at).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 text-charcoal-500 text-xs whitespace-nowrap">
                            {a.viewed_at ? (
                              new Date(a.viewed_at).toLocaleString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            ) : (
                              <span className="text-charcoal-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {a.status === 'pending' && (
                                <button
                                  onClick={() => handleReplay(a.id)}
                                  disabled={actionLoading === a.id}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-charcoal-600 bg-sand-100 rounded-lg hover:bg-sand-200 disabled:opacity-50 transition-colors"
                                >
                                  {actionLoading === a.id && confirmDeleteId !== a.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-3 h-3" />
                                  )}
                                  Relancer
                                </button>
                              )}
                              {a.status !== 'quoted' && (
                                <button
                                  onClick={() => setReassignTarget(a)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  Réassigner
                                </button>
                              )}
                              {confirmDeleteId === a.id ? (
                                <>
                                  <button
                                    onClick={() => handleDelete(a.id)}
                                    disabled={actionLoading === a.id}
                                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                  >
                                    {actionLoading === a.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1.5 text-xs font-medium text-charcoal-600 bg-sand-100 rounded-lg hover:bg-sand-200 transition-colors"
                                  >
                                    Annuler
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(a.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {data.assignments.length >= data.pageSize && (
              <Pagination
                page={page}
                totalPages={Math.ceil((data.stats.total || 1) / data.pageSize)}
                onPageChange={setPage}
              />
            )}
          </div>
        ) : null}

        {showManualModal && (
          <ManualLeadModal onClose={() => setShowManualModal(false)} onCreated={() => mutate()} />
        )}
        {reassignTarget && (
          <ReassignModal
            assignment={reassignTarget}
            onClose={() => setReassignTarget(null)}
            onDone={() => mutate()}
          />
        )}
      </div>
    </div>
  )
}
