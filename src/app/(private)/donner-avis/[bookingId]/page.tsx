'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Star, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface BookingInfo {
  artisanName: string
  serviceName: string
  date: string
  alreadyReviewed: boolean
}

export default function ReviewPage() {
  const params = useParams()
  const bookingId = params.bookingId as string

  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Review form state
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [reviewToken, setReviewToken] = useState<string | null>(null)

  // Fetch booking info
  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        const response = await fetch(`/api/reviews?bookingId=${bookingId}`)
        if (!response.ok) {
          throw new Error('Réservation non trouvée')
        }
        const data = await response.json()
        setBookingInfo(data.data ?? data)
        if (data.data?.reviewToken) {
          setReviewToken(data.data.reviewToken)
        } else if (data.reviewToken) {
          setReviewToken(data.reviewToken)
        }
        if ((data.data ?? data).alreadyReviewed) {
          setSubmitted(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingInfo()
    }
  }, [bookingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Veuillez sélectionner une note')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
          wouldRecommend,
          reviewToken,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error?.message || data.error || "Erreur lors de l'envoi")
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingLabels = ['Très mauvais', 'Mauvais', 'Moyen', 'Bien', 'Excellent']

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error && !bookingInfo) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-charcoal-900 mb-2">Lien invalide</h1>
          <p className="text-charcoal-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900 mb-2">Merci pour votre avis !</h1>
          <p className="text-charcoal-600 mb-6">
            Votre retour aide {bookingInfo?.artisanName} à s'améliorer et aide d'autres clients à
            faire leur choix.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Découvrir d'autres artisans
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-2">Donnez votre avis</h1>
          <p className="text-charcoal-600">Comment s'est passé votre rendez-vous ?</p>
        </div>

        {/* Booking info card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {bookingInfo?.artisanName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-charcoal-900">{bookingInfo?.artisanName}</h2>
              <p className="text-sm text-charcoal-500">
                {bookingInfo?.serviceName} • {bookingInfo?.date}
              </p>
            </div>
          </div>
        </div>

        {/* Review form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          {/* Star rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-3">
              Note globale *
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-sand-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoveredRating || rating) > 0 && (
              <p className="text-center text-sm text-charcoal-600 mt-2">
                {ratingLabels[(hoveredRating || rating) - 1]}
              </p>
            )}
          </div>

          {/* Would recommend */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-3">
              Recommanderiez-vous cet artisan ?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition ${
                  wouldRecommend === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-sand-300 hover:border-sand-400 text-charcoal-600'
                }`}
              >
                👍 Oui
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition ${
                  wouldRecommend === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-sand-300 hover:border-sand-400 text-charcoal-600'
                }`}
              >
                👎 Non
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-charcoal-700 mb-2">
              Votre commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Partagez votre expérience..."
              className="w-full px-4 py-3 border border-sand-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-charcoal-500 mt-1">{comment.length}/500 caractères</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer mon avis
              </>
            )}
          </button>

          <p className="text-xs text-charcoal-500 text-center mt-4">
            Votre avis sera visible publiquement sur le profil de l'artisan
          </p>
        </form>
      </div>
    </div>
  )
}
