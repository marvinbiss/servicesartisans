'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [newsletterConsent, setNewsletterConsent] = useState(false)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!newsletterConsent) {
      setError('Veuillez accepter la politique de confidentialité pour vous inscrire.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription")
      }

      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl font-bold text-white mb-4">Restez informé</h2>
        <p className="text-xl text-primary-100 mb-8">
          Recevez nos derniers articles et conseils directement dans votre boîte mail
        </p>
        {isSubscribed ? (
          <div className="max-w-md mx-auto bg-white/20 rounded-lg p-6 flex items-center justify-center gap-3 text-white">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Merci ! Vous êtes inscrit à notre newsletter.</span>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                required
                className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-primary-200"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-white text-primary-500 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "S'inscrire"}
              </button>
            </div>
            <label className="flex items-start gap-2 mt-4 text-left">
              <input
                type="checkbox"
                checked={newsletterConsent}
                onChange={(e) => setNewsletterConsent(e.target.checked)}
                className="mt-1 rounded border-primary-300 text-primary-500 focus:ring-primary-200"
              />
              <span className="text-sm text-primary-100">
                J&apos;accepte que mes données soient utilisées pour recevoir la newsletter.
                Consultez notre{' '}
                <Link href="/confidentialite" className="underline hover:text-white">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>
            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-200">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  )
}
