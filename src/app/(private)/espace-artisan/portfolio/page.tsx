'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Image as ImageIcon,
  Video,
  Layers,
  Loader2,
  AlertCircle,
  Filter,
  X,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import { PortfolioCard } from '@/components/portfolio'
import Button from '@/components/ui/Button'
import type { PortfolioItem, MediaType } from '@/types/portfolio'
import dynamic from 'next/dynamic'
import AddPortfolioModal from './AddPortfolioModal'
import { logger } from '@/lib/logger'

const PortfolioLightbox = dynamic(() => import('./PortfolioLightbox'), {
  ssr: false,
})

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [filteredItems, setFilteredItems] = useState<PortfolioItem[]>([])
  const [filter, setFilter] = useState<MediaType | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/portfolio')
      const data = await response.json()

      if (response.ok) {
        setItems(data.items || [])
      } else if (response.status === 401) {
        window.location.href = '/connexion?redirect=/espace-artisan/portfolio'
        return
      } else {
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch (err) {
      logger.error('Error fetching portfolio', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredItems(items)
    } else {
      setFilteredItems(items.filter((item) => item.media_type === filter))
    }
  }, [items, filter])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément du portfolio ?')) return

    // Optimistic: remove from list immediately
    const previousItems = items
    setItems((prev) => prev.filter((item) => item.id !== id))

    try {
      const response = await fetch(`/api/portfolio/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        // Rollback on error
        setItems(previousItems)
        const data = await response.json().catch(() => ({}))
        setActionError(data.error || 'Erreur lors de la suppression')
        setTimeout(() => setActionError(null), 5000)
      }
    } catch (err) {
      logger.error('Error deleting item', err)
      // Rollback on network error
      setItems(previousItems)
      setActionError('Erreur lors de la suppression')
      setTimeout(() => setActionError(null), 5000)
    }
  }

  const handleToggleVisibility = async (item: PortfolioItem) => {
    // Optimistic: toggle visibility immediately
    const previousItems = items
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_visible: !i.is_visible } : i))
    )

    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !item.is_visible }),
      })
      if (response.ok) {
        // Sync with server response for any additional fields
        const data = await response.json()
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? data.item : i))
        )
      } else {
        // Rollback on error
        setItems(previousItems)
        setActionError('Impossible de modifier la visibilité. Veuillez réessayer.')
        setTimeout(() => setActionError(null), 5000)
      }
    } catch (err) {
      logger.error('Error toggling visibility', err)
      // Rollback on network error
      setItems(previousItems)
      setActionError('Erreur de connexion. Veuillez réessayer.')
      setTimeout(() => setActionError(null), 5000)
    }
  }

  const handleToggleFeatured = async (item: PortfolioItem) => {
    // Optimistic: toggle featured immediately
    const previousItems = items
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_featured: !i.is_featured } : i))
    )

    try {
      const response = await fetch(`/api/portfolio/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !item.is_featured }),
      })
      if (response.ok) {
        // Sync with server response for any additional fields
        const data = await response.json()
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? data.item : i))
        )
      } else {
        // Rollback on error
        setItems(previousItems)
        setActionError('Impossible de modifier la mise en avant. Veuillez réessayer.')
        setTimeout(() => setActionError(null), 5000)
      }
    } catch (err) {
      logger.error('Error toggling featured', err)
      // Rollback on network error
      setItems(previousItems)
      setActionError('Erreur de connexion. Veuillez réessayer.')
      setTimeout(() => setActionError(null), 5000)
    }
  }

  const handleItemCreated = (newItem: PortfolioItem) => {
    setItems((prev) => [newItem, ...prev])
    setShowAddModal(false)
  }

  const handleItemUpdated = (updatedItem: PortfolioItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    )
    setEditingItem(null)
  }

  const stats = {
    total: items.length,
    images: items.filter((i) => i.media_type === 'image').length,
    videos: items.filter((i) => i.media_type === 'video').length,
    beforeAfter: items.filter((i) => i.media_type === 'before_after').length,
    featured: items.filter((i) => i.is_featured).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <ArtisanSidebar activePage="portfolio" />
            <div className="lg:col-span-3 flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <ArtisanSidebar activePage="portfolio" />
            <div className="lg:col-span-3 flex items-center justify-center py-20">
              <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true)
                    fetchPortfolio()
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action error toast */}
      {actionError && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-red-600 text-white text-sm font-medium transition-all">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Portfolio' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mon Portfolio</h1>
              <p className="text-blue-100">
                Gérez vos réalisations et mettez en valeur votre travail
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => setShowAddModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar activePage="portfolio" />

          {/* Main content */}
          <main id="main-content" className="lg:col-span-3 space-y-6">
            {/* Stats summary */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h4 className="font-medium text-gray-900 mb-3">Statistiques</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total</span>
                  <span className="font-medium text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Images</span>
                  <span className="font-medium text-gray-900">{stats.images}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Vidéos</span>
                  <span className="font-medium text-gray-900">{stats.videos}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Avant/Après</span>
                  <span className="font-medium text-gray-900">{stats.beforeAfter}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Mis en avant</span>
                  <span className="font-medium text-amber-600">{stats.featured}</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                Tout ({items.length})
              </button>
              <button
                onClick={() => setFilter('image')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Images ({stats.images})
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Video className="w-4 h-4" />
                Vidéos ({stats.videos})
              </button>
              <button
                onClick={() => setFilter('before_after')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'before_after'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Avant/Après ({stats.beforeAfter})
              </button>
            </div>

            {/* Portfolio grid */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {items.length === 0
                    ? 'Aucune réalisation'
                    : 'Aucun résultat pour ce filtre'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {items.length === 0
                    ? 'Ajoutez vos premières réalisations pour les mettre en valeur sur votre profil.'
                    : 'Essayez un autre filtre.'}
                </p>
                {items.length === 0 && (
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-5 h-5" />}
                    onClick={() => setShowAddModal(true)}
                  >
                    Ajouter ma première réalisation
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    showActions
                    onClick={() => setLightboxIndex(index)}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDelete(item.id)}
                    onToggleVisibility={() => handleToggleVisibility(item)}
                    onToggleFeatured={() => handleToggleFeatured(item)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddPortfolioModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleItemCreated}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <AddPortfolioModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onCreated={handleItemUpdated}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PortfolioLightbox
          items={filteredItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
