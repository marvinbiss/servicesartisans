'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

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
    total: number
  }
  page: number
  pageSize: number
}

export default function AdminDispatchPage() {
  const [data, setData] = useState<DispatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/dispatch?page=${page}`)
      if (res.ok) {
        setData(await res.json())
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleReplay = async (assignmentId: string) => {
    setActionLoading(assignmentId)
    try {
      const res = await fetch('/api/admin/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'replay', assignmentId }),
      })
      if (res.ok) {
        fetchData()
      } else {
        const err = await res.json()
        setError(err.error || 'Erreur')
      }
    } catch {
      setError('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const statusBadge = (s: string) => {
    if (s === 'pending') return { text: 'En attente', cls: 'bg-yellow-100 text-yellow-700' }
    if (s === 'viewed') return { text: 'Vu', cls: 'bg-blue-100 text-blue-700' }
    if (s === 'quoted') return { text: 'Devis', cls: 'bg-green-100 text-green-700' }
    if (s === 'declined') return { text: 'Décliné', cls: 'bg-gray-100 text-gray-600' }
    return { text: s, cls: 'bg-gray-100 text-gray-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitoring Dispatch</h1>
        <p className="text-gray-500 mb-8">Suivi des assignations en temps réel</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{data.stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-700">{data.stats.pending}</p>
                <p className="text-xs text-yellow-600 mt-1">En attente</p>
              </div>
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{data.stats.viewed}</p>
                <p className="text-xs text-blue-600 mt-1">Vus</p>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{data.stats.quoted}</p>
                <p className="text-xs text-green-600 mt-1">Devis envoyés</p>
              </div>
            </div>

            {/* Assignments table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Assignations récentes</h2>
                <button
                  onClick={fetchData}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Rafraîchir
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Lead</th>
                      <th className="px-4 py-3 font-medium">Artisan</th>
                      <th className="px-4 py-3 font-medium">Statut</th>
                      <th className="px-4 py-3 font-medium">Assigné le</th>
                      <th className="px-4 py-3 font-medium">Vu le</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.assignments.map((a) => {
                      const st = statusBadge(a.status)
                      return (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">
                              {a.lead?.service_name || '—'}
                            </span>
                            <br />
                            <span className="text-xs text-gray-400">{a.lead?.city || ''}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {a.provider?.name || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                              {st.text}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(a.assigned_at).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {a.viewed_at
                              ? new Date(a.viewed_at).toLocaleString('fr-FR')
                              : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {a.status === 'pending' && (
                              <button
                                onClick={() => handleReplay(a.id)}
                                disabled={actionLoading === a.id}
                                className="text-xs text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1"
                              >
                                {actionLoading === a.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3 h-3" />
                                )}
                                Replay
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Préc.
                </button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.assignments.length < data.pageSize}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40"
                >
                  Suiv. <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
