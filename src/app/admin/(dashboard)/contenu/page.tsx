'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileEdit, ChevronLeft, ChevronRight } from 'lucide-react'

interface CMSPage {
  id: string
  title: string
  slug: string
  page_type: string
  status: string
  updated_at: string
}

interface CMSResponse {
  success: boolean
  data: CMSPage[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const PAGE_TYPES = [
  { value: '', label: 'Tout' },
  { value: 'static', label: 'Statiques' },
  { value: 'blog', label: 'Blog' },
  { value: 'service', label: 'Services' },
  { value: 'location', label: 'Localisation' },
  { value: 'homepage', label: 'Accueil' },
  { value: 'faq', label: 'FAQ' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'archived', label: 'Archivé' },
]

const statusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Brouillon', classes: 'bg-yellow-100 text-yellow-800' }
    case 'published':
      return { label: 'Publié', classes: 'bg-green-100 text-green-800' }
    case 'archived':
      return { label: 'Archivé', classes: 'bg-gray-100 text-gray-800' }
    default:
      return { label: status, classes: 'bg-gray-100 text-gray-600' }
  }
}

const typeBadge = (type: string) => {
  switch (type) {
    case 'static':
      return { label: 'Statique', classes: 'bg-blue-100 text-blue-800' }
    case 'blog':
      return { label: 'Blog', classes: 'bg-purple-100 text-purple-800' }
    case 'service':
      return { label: 'Service', classes: 'bg-green-100 text-green-800' }
    case 'location':
      return { label: 'Localisation', classes: 'bg-orange-100 text-orange-800' }
    case 'homepage':
      return { label: 'Accueil', classes: 'bg-red-100 text-red-800' }
    case 'faq':
      return { label: 'FAQ', classes: 'bg-teal-100 text-teal-800' }
    default:
      return { label: type, classes: 'bg-gray-100 text-gray-600' }
  }
}

export default function AdminContenuPage() {
  const router = useRouter()
  const [pages, setPages] = useState<CMSPage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageType, setPageType] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>()
  const pageSize = 20

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(value)
      setCurrentPage(1)
    }, 300)
  }

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(pageSize),
      })
      if (pageType) params.set('page_type', pageType)
      if (status) params.set('status', status)
      if (search) params.set('search', search)

      const response = await fetch(`/api/admin/cms?${params}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: CMSResponse = await response.json()
        setPages(data.data || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageType, status, search])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageType, status])

  const totalPages = Math.ceil(total / pageSize)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion du contenu</h1>
            <p className="text-gray-500 mt-1">{total} page{total !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/admin/contenu/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle page
          </Link>
        </div>

        {/* Tab filters for page_type */}
        <div className="flex flex-wrap gap-1 mb-4">
          {PAGE_TYPES.map((pt) => (
            <button
              key={pt.value}
              onClick={() => setPageType(pt.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pageType === pt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {pt.label}
            </button>
          ))}
        </div>

        {/* Search and status filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une page..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileEdit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune page trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière modification
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pages.map((page) => {
                      const sb = statusBadge(page.status)
                      const tb = typeBadge(page.page_type)
                      return (
                        <tr
                          key={page.id}
                          onClick={() => router.push(`/admin/contenu/${page.id}`)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{page.title}</p>
                              <p className="text-sm text-gray-500">/{page.slug}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tb.classes}`}
                            >
                              {tb.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.classes}`}
                            >
                              {sb.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(page.updated_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/contenu/${page.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Modifier
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} sur {totalPages} ({total} résultats)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
