'use client'

import { useState } from 'react'
import {
  Star,
  Flag,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Calendar,
} from 'lucide-react'
import { ConfirmationModal } from '@/components/admin/ConfirmationModal'
import { ErrorBanner } from '@/components/admin/ErrorBanner'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'

interface Review {
  id: string
  author_name: string
  author_email: string
  provider_name: string
  provider_id: string
  rating: number
  comment: string
  response?: string
  moderation_status: 'pending' | 'approved' | 'rejected'
  is_visible: boolean
  is_flagged: boolean
  created_at: string
}

interface ReviewsResponse {
  reviews: Review[]
  totalPages: number
}

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'approved' | 'rejected'>('pending')
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)

  const url = `/api/admin/reviews?page=${page}&limit=20&filter=${filter}`
  const { data, isLoading, error, mutate } = useAdminFetch<ReviewsResponse>(url)

  const reviews = data?.reviews || []
  const totalPages = data?.totalPages || 1

  const [moderationModal, setModerationModal] = useState<{
    open: boolean
    reviewId: string
    status: 'approved' | 'rejected'
  }>({ open: false, reviewId: '', status: 'approved' })

  const confirmModeration = async () => {
    try {
      setActionError(null)
      await adminMutate(`/api/admin/reviews/${moderationModal.reviewId}`, {
        method: 'PATCH',
        body: {
          moderation_status: moderationModal.status,
          is_visible: moderationModal.status === 'approved',
        },
      })
      setModerationModal({ open: false, reviewId: '', status: 'approved' })
      mutate()
    } catch {
      setActionError('Erreur lors de la modération de l\'avis')
    }
  }

  const handleModeration = (reviewId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      setModerationModal({ open: true, reviewId, status })
      return
    }
    // Approve directly
    setModerationModal({ open: false, reviewId: '', status: 'approved' })
    ;(async () => {
      try {
        setActionError(null)
        await adminMutate(`/api/admin/reviews/${reviewId}`, {
          method: 'PATCH',
          body: {
            moderation_status: status,
            is_visible: true,
          },
        })
        mutate()
      } catch {
        setActionError('Erreur lors de la modération de l\'avis')
      }
    })()
  }

  const displayReviews = reviews

  const displayError = actionError || (error ? error.message : null)

  const getStatusBadge = (review: Review) => {
    if (review.is_flagged) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><Flag className="w-3 h-3" /> Signalé</span>
    }
    switch (review.moderation_status) {
      case 'pending':
        return <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs">En attente</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Approuvé</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Rejeté</span>
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-secondary-400 text-secondary-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Modération des Avis</h1>
          <p className="text-gray-500 mt-1">Vérifiez et modérez les avis clients</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'flagged', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Tous' :
                 f === 'pending' ? 'En attente' :
                 f === 'flagged' ? 'Signalés' :
                 f === 'approved' ? 'Approuvés' : 'Rejetés'}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {displayError && <ErrorBanner message={displayError} onDismiss={() => setActionError(null)} onRetry={() => mutate()} />}

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : displayReviews.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun avis à afficher</p>
            </div>
          ) : (
            displayReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{review.author_name}</h3>
                        {getStatusBadge(review)}
                      </div>
                      <p className="text-sm text-gray-500">{review.author_email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Pour</p>
                    <p className="font-medium text-primary-600">{review.provider_name}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>

                {review.response && (
                  <div className="bg-primary-50 rounded-lg p-4 mb-4 ml-8">
                    <p className="text-sm text-primary-600 font-medium mb-1">Réponse de l'artisan :</p>
                    <p className="text-gray-700">{review.response}</p>
                  </div>
                )}

                {review.moderation_status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleModeration(review.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleModeration(review.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} sur {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Reject Review Confirmation Modal */}
      <ConfirmationModal
        isOpen={moderationModal.open}
        onClose={() => setModerationModal({ open: false, reviewId: '', status: 'approved' })}
        onConfirm={confirmModeration}
        title="Rejeter l'avis"
        message="Êtes-vous sûr de vouloir rejeter cet avis ? Il ne sera plus visible publiquement."
        confirmText="Rejeter"
        variant="danger"
      />
    </div>
  )
}
