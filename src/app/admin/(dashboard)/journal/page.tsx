'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  user_id: string | null
  resource_type: string | null
  resource_id: string | null
  new_value: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export default function AdminJournalPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 50

  const fetchJournal = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/journal?page=${page}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotal(data.total || 0)
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
    fetchJournal()
  }, [fetchJournal])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const actionColor = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return 'text-green-700 bg-green-100'
    if (action.includes('update') || action.includes('edit')) return 'text-blue-700 bg-blue-100'
    if (action.includes('delete') || action.includes('remove')) return 'text-red-700 bg-red-100'
    if (action.includes('dispatch') || action.includes('assign')) return 'text-indigo-700 bg-indigo-100'
    if (action.includes('verify') || action.includes('approve')) return 'text-green-700 bg-green-100'
    return 'text-gray-700 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-gray-400" />
              Journal Admin
            </h1>
            <p className="text-gray-500 mt-1">
              Journal immuable — {total} entrées au total
            </p>
          </div>
          <button
            onClick={fetchJournal}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Rafraîchir
          </button>
        </div>

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
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune entrée dans le journal</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Ressource</th>
                      <th className="px-4 py-3 font-medium">Admin</th>
                      <th className="px-4 py-3 font-medium">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(log.created_at).toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {log.resource_type && (
                            <span>
                              {log.resource_type}
                              {log.resource_id && (
                                <span className="text-gray-400 ml-1">
                                  ({log.resource_id.slice(0, 8)}...)
                                </span>
                              )}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {log.user_id ? log.user_id.slice(0, 8) + '...' : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">
                          {log.new_value
                            ? JSON.stringify(log.new_value).slice(0, 80)
                            : '—'}
                        </td>
                      </tr>
                    ))}
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
                <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border disabled:opacity-40"
                >
                  Suiv. <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
