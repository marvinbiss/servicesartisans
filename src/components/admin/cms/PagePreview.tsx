'use client'

import { useState, useEffect } from 'react'
import { Eye, X, Loader2 } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'

interface PagePreviewProps {
  pageId: string
  onClose: () => void
}

interface PreviewData {
  title: string
  content: string
}

export function PagePreview({ pageId, onClose }: PagePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PreviewData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/cms/${pageId}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const json = await res.json()
        const page = json.data || json
        setData({ title: page.title || '', content: page.content_html || '' })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [pageId])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Aperçu</h2>
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : data ? (
              <>
                {/* Page title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">{data.title}</h1>

                {/* Rendered HTML */}
                {data.content ? (
                  <div
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content) }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Aucun contenu à afficher. Commencez à rédiger dans l&apos;éditeur.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
