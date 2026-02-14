'use client'

import { useState, useEffect, useCallback } from 'react'
import { History, RotateCcw, Loader2, X } from 'lucide-react'

interface VersionData {
  id: string
  version_number: number
  title: string
  status: string
  created_at: string
  change_summary: string | null
}

interface VersionHistoryProps {
  pageId: string
  onClose: () => void
  onRestore: () => void
}

export function VersionHistory({ pageId, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const fetchVersions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/cms/${pageId}/versions`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erreur lors du chargement des versions')
      const data = await res.json() as VersionData[]
      setVersions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const handleRestore = async (version: VersionData) => {
    setRestoringId(version.id)
    try {
      const res = await fetch(`/api/admin/cms/${pageId}/versions/${version.id}/restore`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        onRestore()
      }
    } catch (err) {
      console.error('Erreur lors de la restauration:', err)
    } finally {
      setRestoringId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return { text: 'Publié', className: 'bg-green-100 text-green-700' }
      case 'draft':
        return { text: 'Brouillon', className: 'bg-gray-100 text-gray-700' }
      case 'archived':
        return { text: 'Archivé', className: 'bg-amber-100 text-amber-700' }
      default:
        return { text: status, className: 'bg-gray-100 text-gray-700' }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Historique des versions
              </h2>
              {!loading && (
                <span className="text-xs text-gray-400">
                  {versions.length} version{versions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchVersions}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Réessayer
                </button>
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune version précédente enregistrée.
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

                <div className="space-y-4">
                  {versions.map((version, index) => {
                    const badge = statusLabel(version.status)
                    const isLatest = index === 0

                    return (
                      <div key={version.id} className="relative pl-8">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-1.5 top-2 w-3 h-3 rounded-full border-2 ${
                            isLatest
                              ? 'bg-blue-600 border-blue-600'
                              : 'bg-white border-gray-300'
                          }`}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">
                                v{version.version_number}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}
                              >
                                {badge.text}
                              </span>
                              {isLatest && (
                                <span className="text-xs text-blue-600 font-medium">
                                  Actuelle
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(version.created_at)}
                            </p>
                            {version.change_summary && (
                              <p className="text-sm text-gray-600 mt-1">
                                {version.change_summary}
                              </p>
                            )}
                          </div>

                          {!isLatest && (
                            <button
                              type="button"
                              onClick={() => handleRestore(version)}
                              disabled={restoringId === version.id}
                              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Restaurer cette version"
                            >
                              {restoringId === version.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5" />
                              )}
                              Restaurer
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
