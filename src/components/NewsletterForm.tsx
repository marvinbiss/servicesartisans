'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consentRgpd, setConsentRgpd] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    if (!consentRgpd) {
      setError('Veuillez accepter la politique de confidentialité pour vous inscrire.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      setIsSubmitted(true)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 bg-green-500/20 border border-green-500/30 rounded-xl">
        <CheckCircle className="w-5 h-5 text-green-400" />
        <span className="text-green-400 font-medium">Merci pour votre inscription !</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            aria-label="Adresse email pour la newsletter"
            required
            disabled={isLoading}
            className="w-full px-5 py-3.5 bg-charcoal-800/50 border border-charcoal-700 rounded-xl text-white placeholder:text-charcoal-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all disabled:opacity-50"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          aria-label="S'inscrire à la newsletter"
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-400 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-300 transition-all duration-300 shadow-lg shadow-primary-400/25 hover:shadow-xl hover:shadow-primary-400/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'inscrire"}
        </button>
      </div>
      <label className="flex items-start gap-2 mt-4 text-left cursor-pointer">
        <input
          type="checkbox"
          checked={consentRgpd}
          onChange={(e) => setConsentRgpd(e.target.checked)}
          className="mt-1 rounded border-charcoal-600 text-primary-500 focus:ring-primary-400 bg-charcoal-800/50 flex-shrink-0"
        />
        <span className="text-sm text-charcoal-400 leading-relaxed">
          J&apos;accepte que mes données soient utilisées pour recevoir la newsletter. Consultez
          notre{' '}
          <Link href="/confidentialite" className="underline hover:text-white text-sand-500">
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <p className="text-white/50 text-xs mt-2">
        Recevez nos guides travaux et bons plans chaque semaine. Désinscription en un clic.
      </p>
    </form>
  )
}
