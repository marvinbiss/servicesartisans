'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { RichTextEditor } from '@/components/admin/cms/RichTextEditor'
import { StructuredFieldsEditor } from '@/components/admin/cms/StructuredFieldsEditor'
import { SEOPanel } from '@/components/admin/cms/SEOPanel'

const PAGE_TYPE_OPTIONS = [
  { value: 'static', label: 'Statique' },
  { value: 'blog', label: 'Blog' },
  { value: 'service', label: 'Service' },
  { value: 'location', label: 'Localisation' },
  { value: 'homepage', label: 'Accueil' },
  { value: 'faq', label: 'FAQ' },
]

const BLOG_CATEGORIES = ['Tarifs', 'Conseils', 'Guides', 'Projets', 'Réglementation']

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminNouveauContenuPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [pageType, setPageType] = useState('static')
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

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setIsDirty(true)
    if (!slugManuallyEdited) {
      setSlug(generateSlug(newTitle))
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setSlugManuallyEdited(true)
    setSlug(newSlug)
    setIsDirty(true)
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      showToast('Le titre est requis', 'error')
      return
    }

    try {
      setSaving(true)
      const payload = buildPayload()
      payload.status = 'draft'

      const response = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsDirty(false)
        showToast('Page enregistrée comme brouillon', 'success')
        setTimeout(() => router.push('/admin/contenu'), 500)
      } else {
        const err = await response.json().catch(() => ({}))
        showToast(err.error || 'Erreur lors de la sauvegarde', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      showToast('Le titre est requis', 'error')
      return
    }

    try {
      setSaving(true)
      const payload = buildPayload()
      payload.status = 'draft'

      const response = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        const pageId = data.data?.id || data.id
        const publishResponse = await fetch(`/api/admin/cms/${pageId}/publish`, {
          method: 'POST',
          credentials: 'include',
        })

        if (publishResponse.ok) {
          setIsDirty(false)
          showToast('Page publiée avec succès', 'success')
          setTimeout(() => router.push('/admin/contenu'), 500)
        } else {
          showToast('Page créée mais la publication a échoué', 'error')
        }
      } else {
        const err = await response.json().catch(() => ({}))
        showToast(err.error || 'Erreur lors de la création', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showToast('Erreur lors de la publication', 'error')
    } finally {
      setSaving(false)
    }
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle page</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Enregistrer comme brouillon
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Publier
            </button>
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
                  onChange={(e) => handleSlugChange(e.target.value)}
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Brouillon
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
          </div>
        </div>
      </div>
    </div>
  )
}
