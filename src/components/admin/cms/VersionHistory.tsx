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
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)

  const fetchVersions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/cms/${pageId}/versions`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erreur lors du chargement des versions')
      const json = (await res.json()) as { success: boolean; data: VersionData[] }
      setVersions(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [pageId])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmRestore) setConfirmRestore(null)
        else onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, confirmRestore])

  const handleRestore = async (versionId: string) => {
    setRestoringId(versionId)
    setConfirmRestore(null)
    try {
      const res = await fetch(`/api/admin/cms/${pageId}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_id: versionId }),
      })
      if (res.ok) {
        onRestore()
      } else {
        const json = await res.json().catch(() => null)
        setError(json?.error?.message || 'Erreur lors de la restauration')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la restauration')
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
        return { text: 'Brouillon', className: 'bg-sand-100 text-charcoal-700' }
      case 'archived':
        return { text: 'Archivé', className: 'bg-amber-100 text-amber-700' }
      default:
        return { text: status, className: 'bg-sand-100 text-charcoal-700' }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Historique des versions"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-start justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-charcoal-500" />
              <h2 className="text-lg font-semibold text-charcoal-900">Historique des versions</h2>
              {!loading && (
                <span className="text-xs text-charcoal-400">
                  {versions.length} version{versions.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="p-1.5 text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-charcoal-600" />
              </div>
            ) : error ? (
              <div>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchVersions}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-800"
                >
                  Réessayer
                </button>
              </div>
            ) : versions.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-4">
                Aucune version précédente enregistrée.
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-px bg-sand-200" />

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
                              ? 'bg-primary-500 border-charcoal-400'
                              : 'bg-white border-sand-300'
                          }`}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-charcoal-900">
                                v{version.version_number}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}
                              >
                                {badge.text}
                              </span>
                              {isLatest && (
                                <span className="text-xs text-charcoal-600 font-medium">
                                  Actuelle
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-charcoal-500 mt-0.5">
                              {formatDate(version.created_at)}
                            </p>
                            {version.change_summary && (
                              <p className="text-sm text-charcoal-600 mt-1">
                                {version.change_summary}
                              </p>
                            )}
                          </div>

                          {!isLatest && (
                            <button
                              type="button"
                              onClick={() => setConfirmRestore(version.id)}
                              disabled={restoringId === version.id}
                              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs text-primary-600 hover:text-primary-800 hover:bg-sand-100 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Restore confirmation modal */}
      {confirmRestore && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmer la restauration"
          className="fixed inset-0 z-over-modal overflow-y-auto"
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmRestore(null)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                Restaurer cette version ?
              </h3>
              <p className="text-charcoal-600 mb-6">
                Le contenu actuel sera remplacé par cette version. Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRestore(null)}
                  className="flex-1 px-4 py-2 text-charcoal-700 bg-sand-100 rounded-lg hover:bg-sand-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleRestore(confirmRestore)}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Restaurer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
