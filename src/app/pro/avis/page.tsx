'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Flag,
  User,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Review {
  id: string
  clientName: string
  clientAvatar?: string
  rating: number
  comment: string
  service: string
  date: Date
  reply?: string
  replyDate?: Date
  helpful: number
  verified: boolean
}

// Mock reviews
const mockReviews: Review[] = [
  {
    id: '1',
    clientName: 'Marie Martin',
    rating: 5,
    comment: 'Excellent travail ! Intervention rapide et efficace. Le plombier était très professionnel et a résolu mon problème de fuite en moins d\'une heure. Je recommande vivement.',
    service: 'Réparation fuite',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    reply: 'Merci beaucoup Marie pour votre confiance ! C\'était un plaisir de vous aider.',
    replyDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    helpful: 5,
    verified: true,
  },
  {
    id: '2',
    clientName: 'Pierre Durand',
    rating: 4,
    comment: 'Très bon service. Ponctuel et travail soigné. Juste un petit bémol sur le temps d\'attente pour le devis.',
    service: 'Installation sanitaire',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    helpful: 3,
    verified: true,
  },
  {
    id: '3',
    clientName: 'Sophie Lefebvre',
    rating: 5,
    comment: 'Parfait ! Rénovation complète de ma salle de bain réalisée dans les temps et le budget. Résultat magnifique.',
    service: 'Rénovation salle de bain',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    helpful: 8,
    verified: true,
  },
  {
    id: '4',
    clientName: 'François Blanc',
    rating: 5,
    comment: 'Intervention d\'urgence un dimanche matin. Très réactif et efficace. Prix raisonnable malgré le weekend.',
    service: 'Dépannage urgent',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
    reply: 'Merci François ! Content d\'avoir pu vous dépanner rapidement.',
    replyDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    helpful: 12,
    verified: true,
  },
  {
    id: '5',
    clientName: 'Claire Moreau',
    rating: 3,
    comment: 'Le travail est correct mais j\'aurais aimé plus de communication sur l\'avancement.',
    service: 'Débouchage canalisation',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    helpful: 2,
    verified: false,
  },
]

type FilterRating = 'all' | 1 | 2 | 3 | 4 | 5
type SortBy = 'recent' | 'rating' | 'helpful'

export default function ProReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [filterRating, setFilterRating] = useState<FilterRating>('all')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((r) => filterRating === 'all' || r.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'helpful':
          return b.helpful - a.helpful
        case 'recent':
        default:
          return b.date.getTime() - a.date.getTime()
      }
    })

  // Stats
  const stats = {
    total: reviews.length,
    average: (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1),
    distribution: [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((r) => r.rating === rating).length,
      percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
    })),
  }

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText.trim()) return

    setReviews(
      reviews.map((r) =>
        r.id === reviewId
          ? { ...r, reply: replyText, replyDate: new Date() }
          : r
      )
    )
    setReplyingTo(null)
    setReplyText('')
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Avis Clients</h1>
          <p className="text-slate-500">
            Gérez vos avis et votre réputation en ligne
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Average Rating Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900">{stats.average}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(stats.average))
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {stats.total} avis au total
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Répartition des notes</h3>
          <div className="space-y-2">
            {stats.distribution.map((d) => (
              <div key={d.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-slate-600">{d.rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-slate-500 w-12 text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Rating Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterRating('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterRating === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating as FilterRating)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium transition-all ${
                  filterRating === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rating}
                <Star className={`w-4 h-4 ${filterRating === rating ? 'fill-white' : 'fill-yellow-400 text-yellow-400'}`} />
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 bg-slate-100 rounded-xl font-medium text-slate-600 cursor-pointer"
            >
              <option value="recent">Plus récents</option>
              <option value="rating">Meilleure note</option>
              <option value="helpful">Plus utiles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-5">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {review.clientName}
                      </span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Vérifié
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {review.service} •{' '}
                      {formatDistanceToNow(review.date, { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-slate-700 mb-4">{review.comment}</p>

              {/* Reply */}
              {review.reply && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Votre réponse
                    </span>
                    <span className="text-xs text-blue-400">
                      {review.replyDate &&
                        formatDistanceToNow(review.replyDate, {
                          addSuffix: true,
                          locale: fr,
                        })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{review.reply}</p>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="mb-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Rédigez votre réponse..."
                    className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText('')
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                  <ThumbsUp className="w-4 h-4" />
                  Utile ({review.helpful})
                </button>
                {!review.reply && (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Répondre
                  </button>
                )}
                <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 ml-auto">
                  <Flag className="w-4 h-4" />
                  Signaler
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
