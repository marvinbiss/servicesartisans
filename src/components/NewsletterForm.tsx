'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

type NewsletterFormProps = {
  source?: string
  variant?: 'dark' | 'light'
  successMessage?: string
  helperText?: string
}

export default function NewsletterForm({
  source = 'footer',
  variant = 'dark',
  successMessage = 'Merci pour votre inscription !',
  helperText = 'Recevez nos guides travaux et bons plans chaque semaine. Désinscription en un clic.',
}: NewsletterFormProps = {}) {
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
        body: JSON.stringify({ email, source }),
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

  const isLight = variant === 'light'
  const inputClass = isLight
    ? 'w-full px-5 py-3.5 bg-white border border-charcoal-200 rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50'
    : 'w-full px-5 py-3.5 bg-charcoal-800/50 border border-charcoal-700 rounded-xl text-white placeholder:text-charcoal-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all disabled:opacity-50'
  const consentClass = isLight
    ? 'text-sm text-charcoal-700 leading-relaxed'
    : 'text-sm text-charcoal-400 leading-relaxed'
  const helperClass = isLight ? 'text-charcoal-500 text-xs mt-2' : 'text-white/50 text-xs mt-2'
  const consentLinkClass = isLight
    ? 'underline hover:text-primary-600 text-primary-500'
    : 'underline hover:text-white text-sand-500'
  const successClass = isLight
    ? 'flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 rounded-xl'
    : 'flex items-center gap-3 px-5 py-3.5 bg-green-500/20 border border-green-500/30 rounded-xl'
  const successTextClass = isLight ? 'text-green-700 font-medium' : 'text-green-400 font-medium'
  const successIconClass = isLight ? 'w-5 h-5 text-green-600' : 'w-5 h-5 text-green-400'
  const errorClass = isLight ? 'text-red-600 text-sm mt-1' : 'text-red-400 text-sm mt-1'
  const checkboxClass = isLight
    ? 'mt-1 rounded border-charcoal-300 text-primary-500 focus:ring-primary-500 bg-white flex-shrink-0'
    : 'mt-1 rounded border-charcoal-600 text-primary-500 focus:ring-primary-400 bg-charcoal-800/50 flex-shrink-0'

  if (isSubmitted) {
    return (
      <div className={successClass}>
        <CheckCircle className={successIconClass} />
        <span className={successTextClass}>{successMessage}</span>
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
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
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
          className={checkboxClass}
        />
        <span className={consentClass}>
          J&apos;accepte que mes données soient utilisées pour recevoir la newsletter. Consultez
          notre{' '}
          <Link href="/confidentialite" className={consentLinkClass}>
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <p className={helperClass}>{helperText}</p>
    </form>
  )
}
