'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
} from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface AuditLog {
  id: string
  admin_id: string
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin?: {
    email: string
    full_name: string | null
  }
}

const ENTITY_TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'user', label: 'Utilisateurs' },
  { value: 'provider', label: 'Artisans' },
  { value: 'review', label: 'Avis' },
  { value: 'payment', label: 'Paiements' },
  { value: 'subscription', label: 'Abonnements' },
  { value: 'booking', label: 'Réservations' },
  { value: 'service', label: 'Services' },
  { value: 'report', label: 'Signalements' },
]

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [entityType, setEntityType] = useState('all')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [page, entityType, action, dateFrom, dateTo])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
        entityType,
        action,
        dateFrom,
        dateTo,
      })
      const response = await fetch(`/api/admin/audit?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionBadge = (action: string) => {
    if (action.includes('create')) return <StatusBadge variant="success">Création</StatusBadge>
    if (action.includes('update') || action.includes('change')) return <StatusBadge variant="info">Modification</StatusBadge>
    if (action.includes('delete') || action.includes('cancel')) return <StatusBadge variant="error">Suppression</StatusBadge>
    if (action.includes('ban')) return <StatusBadge variant="error">Ban</StatusBadge>
    if (action.includes('unban')) return <StatusBadge variant="success">Débannissement</StatusBadge>
    if (action.includes('refund')) return <StatusBadge variant="warning">Remboursement</StatusBadge>
    if (action.includes('resolve')) return <StatusBadge variant="success">Résolution</StatusBadge>
    if (action.includes('dismiss')) return <StatusBadge variant="default">Rejet</StatusBadge>
    return <StatusBadge variant="default">Action</StatusBadge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Logs d&apos;Audit</h1>
          <p className="text-gray-500 mt-1">{total} actions enregistrées</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d&apos;entité</label>
              <select
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <input
                type="text"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value)
                  setPage(1)
                }}
                placeholder="Ex: ban, refund..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun log d&apos;audit trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Admin
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Entité
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Détails
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(log.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {log.admin?.full_name || 'Admin'}
                              </p>
                              <p className="text-xs text-gray-500">{log.admin?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getActionBadge(log.action)}
                            <p className="text-xs text-gray-500 font-mono">{log.action}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-900 capitalize">{log.entity_type}</p>
                              {log.entity_id && (
                                <p className="text-xs text-gray-500 font-mono">
                                  {log.entity_id.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.new_data && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                                Voir les données
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-gray-600 overflow-x-auto max-w-xs">
                                {JSON.stringify(log.new_data, null, 2)}
                              </pre>
                            </details>
                          )}
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
