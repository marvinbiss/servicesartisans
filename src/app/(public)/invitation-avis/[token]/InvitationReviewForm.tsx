'use client'

import { useState, type FormEvent } from 'react'

type Props = {
  token: string
  clientName: string | null
  serviceName: string | null
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string }

export default function InvitationReviewForm({ token, clientName, serviceName }: Props) {
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [comment, setComment] = useState<string>('')
  const [authorName, setAuthorName] = useState<string>(clientName ?? '')
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  const canSubmit =
    rating >= 1 && rating <= 5 && authorName.trim().length >= 2 && state.status !== 'submitting'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return

    setState({ status: 'submitting' })

    try {
      const response = await fetch(`/api/reviews/submit-invitation/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          wouldRecommend,
          comment: comment.trim() || null,
          authorName: authorName.trim(),
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }

      if (!response.ok) {
        setState({
          status: 'error',
          message: data.error ?? 'Une erreur est survenue. Reessayez dans quelques instants.',
        })
        return
      }

      setState({ status: 'success' })
    } catch {
      setState({
        status: 'error',
        message: 'Impossible d&apos;envoyer votre avis. Verifiez votre connexion.',
      })
    }
  }

  if (state.status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="w-8 h-8 text-accent-600"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-2">Merci !</h2>
        <p className="text-charcoal-600">
          Votre avis est enregistre et sera publie apres une verification rapide.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 md:p-8 space-y-6"
    >
      {/* Note */}
      <div>
        <label className="block font-semibold text-charcoal-900 mb-3">
          Votre note {serviceName ? `pour ${serviceName}` : ''}
        </label>
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Note sur 5 etoiles">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hover || rating) >= value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHover(value)}
                onMouseLeave={() => setHover(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={active ? '#F59E0B' : 'none'}
                  stroke={active ? '#F59E0B' : '#CBD5E1'}
                  strokeWidth="1.5"
                  className="w-10 h-10 transition"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            )
          })}
        </div>
        {rating === 0 && (
          <p className="text-sm text-charcoal-500 mt-2">Touchez une etoile pour noter</p>
        )}
      </div>

      {/* Recommandation */}
      <div>
        <label className="block font-semibold text-charcoal-900 mb-3">
          Recommanderiez-vous cet artisan ?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition ${
              wouldRecommend === true
                ? 'border-accent-500 bg-accent-50 text-accent-800'
                : 'border-sand-300 bg-white text-charcoal-700 hover:border-sand-400'
            }`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition ${
              wouldRecommend === false
                ? 'border-rose-500 bg-rose-50 text-rose-800'
                : 'border-sand-300 bg-white text-charcoal-700 hover:border-sand-400'
            }`}
          >
            Non
          </button>
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label htmlFor="review-comment" className="block font-semibold text-charcoal-900 mb-3">
          Votre retour (optionnel)
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1200}
          placeholder="Ponctualite, qualite du travail, rapport qualite/prix..."
          className="w-full rounded-xl border border-sand-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 p-3 text-charcoal-900 resize-none"
        />
        <p className="text-xs text-charcoal-500 mt-1 text-right">{comment.length}/1200</p>
      </div>

      {/* Prenom */}
      <div>
        <label htmlFor="review-author" className="block font-semibold text-charcoal-900 mb-3">
          Votre prenom
        </label>
        <input
          id="review-author"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          minLength={2}
          maxLength={60}
          className="w-full rounded-xl border border-sand-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 p-3 text-charcoal-900"
        />
      </div>

      {/* Error */}
      {state.status === 'error' && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-4 rounded-xl bg-primary-500 text-white font-bold text-lg hover:bg-primary-600 disabled:bg-sand-300 disabled:text-charcoal-500 transition"
      >
        {state.status === 'submitting' ? 'Envoi...' : 'Envoyer mon avis'}
      </button>

      <p className="text-xs text-charcoal-500 text-center">
        Votre avis sera publie apres verification. Nous ne publions pas les contenus haineux,
        diffamatoires ou sans lien avec la prestation.
      </p>
    </form>
  )
}
