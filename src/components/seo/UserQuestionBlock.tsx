/**
 * UserQuestionBlock — Formulaire UGC permettant aux visiteurs de poser une question
 * sur un service dans leur ville.
 *
 * Client Component — gère l'état du formulaire côté client.
 * Pas d'appel API pour l'instant, affiche un message de confirmation.
 */

'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserQuestionBlockProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  villeSlug: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function UserQuestionBlock({ serviceName, villeName }: UserQuestionBlockProps) {
  const [question, setQuestion] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    // Pas d'appel API pour l'instant — affichage du message de confirmation
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="rounded-xl bg-sand-50 border border-sand-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-charcoal-800 text-sm">Merci pour votre question !</p>
            <p className="text-sm text-charcoal-600">Notre équipe vous répondra sous 48h.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl bg-sand-50 border border-sand-200 px-6 py-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-primary-100 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-primary-600" />
        </div>
        <h4 className="text-sm font-bold text-charcoal-800">
          Une question sur {serviceName} à {villeName} ?
        </h4>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex : Quel est le délai moyen pour une intervention ?"
          rows={3}
          required
          className="w-full px-3 py-2 text-sm border border-sand-300 rounded-lg bg-white placeholder-charcoal-400 text-charcoal-800 focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email (optionnel, pour recevoir la réponse)"
          className="w-full px-3 py-2 text-sm border border-sand-300 rounded-lg bg-white placeholder-charcoal-400 text-charcoal-800 focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={!question.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Poser ma question
        </button>
      </form>
    </section>
  )
}
