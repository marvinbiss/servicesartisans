'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { MetierAutocomplete } from '@/components/ui/MetierAutocomplete'
import { VilleAutocomplete } from '@/components/ui/VilleAutocomplete'
import { trackLead } from '@/lib/analytics/track'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function readUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utm: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) utm[key] = value
  }
  return utm
}

interface ArtisanLeadFormProps {
  /** Pré-remplissage depuis l'ad (message-match) */
  initialMetier?: string
  initialVille?: string
  initialCodePostal?: string
  /** Libellé du bouton (A/B test) */
  ctaLabel?: string
  /** Variante A/B, propagée à l'analytics */
  variant?: string
}

export function ArtisanLeadForm({
  initialMetier = '',
  initialVille = '',
  initialCodePostal = '',
  ctaLabel = 'Je veux des clients',
  variant,
}: ArtisanLeadFormProps = {}) {
  const router = useRouter()
  const [metier, setMetier] = useState(initialMetier)
  const [ville, setVille] = useState(initialVille)
  const [codePostal, setCodePostal] = useState(initialCodePostal)
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!metier.trim() || !ville.trim() || !telephone.trim()) {
      setError('Merci de renseigner votre métier, votre zone et votre téléphone.')
      return
    }

    setIsLoading(true)
    const utm = readUtm()

    try {
      // Best-effort : on capture le lead, mais on n'empêche jamais la redirection
      await fetch('/api/artisan-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metier, ville, codePostal, telephone, email, ...utm }),
      }).catch(() => null)

      // Conversion Meta Pixel + Google
      trackLead({ content_name: metier, content_category: ville, variant })

      const query = new URLSearchParams({
        metier,
        ville,
        codePostal,
        tel: telephone,
        email,
        ...utm,
        ...(variant ? { v: variant } : {}),
      })
      router.push(`/inscription-artisan?${query.toString()}`)
    } catch {
      setError("Une erreur est survenue. Réessayez ou appelez-nous.")
      setIsLoading(false)
    }
  }

  return (
    <form
      id="lead-form"
      onSubmit={handleSubmit}
      className="scroll-mt-24 bg-white rounded-2xl shadow-xl ring-1 ring-charcoal-100 p-6 sm:p-8 space-y-4"
    >
      <div>
        <h2 className="font-heading text-xl font-bold text-charcoal-900">
          Recevez vos premières demandes
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Inscription gratuite · 2 minutes · sans engagement
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">
            Votre métier
          </label>
          <MetierAutocomplete
            value={metier}
            placeholder="Plombier, électricien, maçon…"
            onSelect={(service) => setMetier(service.name)}
            onClear={() => setMetier('')}
            inputClassName="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">
            Votre zone d&apos;intervention
          </label>
          <VilleAutocomplete
            value={ville}
            placeholder="Ville ou code postal"
            onSelect={(v, cp) => {
              setVille(v)
              setCodePostal(cp)
            }}
            onClear={() => {
              setVille('')
              setCodePostal('')
            }}
            inputClassName="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        <div>
          <label htmlFor="lead-tel" className="block text-sm font-medium text-charcoal-700 mb-1">
            Téléphone
          </label>
          <input
            id="lead-tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="06 12 34 56 78"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="block text-sm font-medium text-charcoal-700 mb-1">
            Email <span className="font-normal text-charcoal-400">(facultatif)</span>
          </label>
          <input
            id="lead-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.fr"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
          <p className="mt-1 text-xs text-charcoal-400">Perso ou pro, peu importe — facultatif. On vous rappelle au téléphone.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Un instant…
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-xs text-charcoal-400 text-center">
        En continuant, vous acceptez notre{' '}
        <a href="/confidentialite" className="underline hover:text-charcoal-600">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  )
}
