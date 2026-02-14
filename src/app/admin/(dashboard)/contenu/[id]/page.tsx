'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Upload,
  Eye,
  History,
  Trash2,
  Pencil,
  ArrowDownCircle,
  Loader2,
} from 'lucide-react'
import { RichTextEditor } from '@/components/admin/cms/RichTextEditor'
import { StructuredFieldsEditor } from '@/components/admin/cms/StructuredFieldsEditor'
import { SEOPanel } from '@/components/admin/cms/SEOPanel'
import { PagePreview } from '@/components/admin/cms/PagePreview'
import { VersionHistory } from '@/components/admin/cms/VersionHistory'

interface CMSPageData {
  id: string
  title: string
  slug: string
  page_type: string
  status: string
  content_html: string
  content_json: Record<string, unknown>
  structured_data: Record<string, unknown>
  meta_title: string
  meta_description: string
  author: string
  category: string
  tags: string[]
  excerpt: string
  featured_image: string
  updated_at: string
  created_at: string
}

const PAGE_TYPE_OPTIONS = [
  { value: 'static', label: 'Statique' },
  { value: 'blog', label: 'Blog' },
  { value: 'service', label: 'Service' },
  { value: 'location', label: 'Localisation' },
  { value: 'homepage', label: 'Accueil' },
  { value: 'faq', label: 'FAQ' },
]

const BLOG_CATEGORIES = ['Tarifs', 'Conseils', 'Guides', 'Projets', 'Réglementation']

export default function AdminEditContenuPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [pageType, setPageType] = useState('static')
  const [status, setStatus] = useState('draft')
  const [content, setContent] = useState('')
  const [contentJson, setContentJson] = useState<Record<string, unknown>>({})
  const [structuredData, setStructuredData] = useState<Record<string, unknown>>({})

  // Blog-specific fields
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/cms/${id}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        if (response.status === 404) {
          setError('Page non trouvée')
        } else {
          setError('Erreur lors du chargement')
        }
        return
      }
      const json = await response.json()
      const data: CMSPageData = json.data || json

      setTitle(data.title || '')
      setSlug(data.slug || '')
      setPageType(data.page_type || 'static')
      setStatus(data.status || 'draft')
      setContent(data.content_html || '')
      setContentJson(data.content_json || {})
      setStructuredData(data.structured_data || {})
      setSeoTitle(data.meta_title || '')
      setSeoDescription(data.meta_description || '')
      setAuthor(data.author || '')
      setCategory(data.category || '')
      setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
      setExcerpt(data.excerpt || '')
      setFeaturedImage(data.featured_image || '')
      setIsDirty(false)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors du chargement de la page')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  const usesRichTextEditor = pageType === 'static' || pageType === 'blog'
  const usesStructuredEditor = pageType === 'service' || pageType === 'faq' || pageType === 'homepage'

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      title,
      slug,
      page_type: pageType,
      meta_title: seoTitle,
      meta_description: seoDescription,
    }

    if (usesRichTextEditor) {
      payload.content_html = content
      payload.content_json = contentJson
    } else {
      payload.structured_data = structuredData
    }

    if (pageType === 'blog') {
      payload.author = author
      payload.category = category
      payload.tags = tags.split(',').map((t) => t.trim()).filter(Boolean)
      payload.excerpt = excerpt
      payload.featured_image = featuredImage
    }

    return payload
  }

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Le titre est requis', 'error')
      return
    }

    try {
      setSaving(true)
      const payload = buildPayload()

      const response = await fetch(`/api/admin/cms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsDirty(false)
        showToast('Page enregistrée', 'success')
      } else {
        const err = await response.json().catch(() => ({}))
        showToast(err.error || 'Erreur lors de la sauvegarde', 'error')
      }
    } catch (err) {
      console.error('Erreur:', err)
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/cms/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setStatus('published')
        setIsDirty(false)
        showToast('Page publiée', 'success')
      } else {
        showToast('Erreur lors de la publication', 'error')
      }
    } catch (err) {
      console.error('Erreur:', err)
      showToast('Erreur lors de la publication', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUnpublish = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/cms/${id}/publish`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setStatus('draft')
        showToast('Page dépubliée', 'success')
      } else {
        showToast('Erreur lors de la dépublication', 'error')
      }
    } catch (err) {
      console.error('Erreur:', err)
      showToast('Erreur lors de la dépublication', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/cms/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        showToast('Page supprimée', 'success')
        setTimeout(() => router.push('/admin/contenu'), 500)
      } else {
        showToast('Erreur lors de la suppression', 'error')
      }
    } catch (err) {
      console.error('Erreur:', err)
      showToast('Erreur lors de la suppression', 'error')
    } finally {
      setSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  const statusBadge = () => {
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Chargement de la page...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <Link
            href="/admin/contenu"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    )
  }

  const sb = statusBadge()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transition-all ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/contenu"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <Pencil className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Prévisualiser
            </button>
            <button
              onClick={() => setShowVersions(true)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4" />
              Versions
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
            {status === 'draft' ? (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Publier
              </button>
            ) : status === 'published' ? (
              <button
                onClick={handleUnpublish}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Dépublier
              </button>
            ) : null}
          </div>
        </div>

        {/* Main layout: 2/3 editor + 1/3 sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Editor area (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true) }}
                placeholder="Titre de la page"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Slug input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setIsDirty(true) }}
                  placeholder="slug-de-la-page"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Blog-specific fields */}
            {pageType === 'blog' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Champs blog</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => { setAuthor(e.target.value); setIsDirty(true) }}
                      placeholder="Nom de l'auteur"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setIsDirty(true) }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Sélectionner...</option>
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => { setTags(e.target.value); setIsDirty(true) }}
                    placeholder="rénovation, plomberie, conseils"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extrait</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => { setExcerpt(e.target.value); setIsDirty(true) }}
                    rows={3}
                    placeholder="Court résumé de l'article..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image mise en avant (URL)</label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => { setFeaturedImage(e.target.value); setIsDirty(true) }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Contenu</label>
              {usesRichTextEditor && (
                <RichTextEditor
                  value={content}
                  onChange={(html, json) => {
                    setContent(html)
                    setContentJson(json)
                    setIsDirty(true)
                  }}
                />
              )}
              {usesStructuredEditor && (
                <StructuredFieldsEditor
                  pageType={pageType}
                  value={structuredData}
                  onChange={(data) => {
                    setStructuredData(data)
                    setIsDirty(true)
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Page settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Paramètres</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de page</label>
                  <select
                    value={pageType}
                    onChange={(e) => { setPageType(e.target.value); setIsDirty(true) }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    {PAGE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.classes}`}
                  >
                    {sb.label}
                  </span>
                </div>
              </div>
            </div>

            {/* SEO Panel */}
            <SEOPanel
              seoTitle={seoTitle}
              onSeoTitleChange={(v) => { setSeoTitle(v); setIsDirty(true) }}
              seoDescription={seoDescription}
              onSeoDescriptionChange={(v) => { setSeoDescription(v); setIsDirty(true) }}
            />

            {/* Danger zone */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <h3 className="font-medium text-red-600 mb-4">Zone de danger</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer cette page
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer la page
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer la page &quot;{title}&quot; ? Cette action est
                irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <PagePreview
          pageId={id}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Version history modal */}
      {showVersions && (
        <VersionHistory
          pageId={id}
          onClose={() => setShowVersions(false)}
          onRestore={() => {
            setShowVersions(false)
            fetchPage()
          }}
        />
      )}
    </div>
  )
}
