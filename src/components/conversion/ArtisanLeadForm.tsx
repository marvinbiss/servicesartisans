'use client'

import { useState } from 'react'
import { Loader2, ArrowRight, AlertCircle, CheckCircle2, PhoneCall } from 'lucide-react'
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
  const [prenom, setPrenom] = useState('')
  const [metier, setMetier] = useState(initialMetier)
  const [ville, setVille] = useState(initialVille)
  const [codePostal, setCodePostal] = useState(initialCodePostal)
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!prenom.trim() || !metier.trim() || !ville.trim() || !telephone.trim()) {
      setError('Merci de renseigner votre prénom, votre métier, votre zone et votre téléphone.')
      return
    }

    setIsLoading(true)
    const utm = readUtm()

    try {
      // Capture du lead (notif équipe + confirmation). Best-effort.
      await fetch('/api/artisan-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, metier, ville, codePostal, telephone, email, ...utm }),
      }).catch(() => null)

      // Conversion Meta Pixel + Google
      trackLead({ content_name: metier, content_category: ville, variant })

      setIsSubmitted(true)
    } catch {
      setError('Une erreur est survenue. Réessayez ou appelez-nous.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div
        id="lead-form"
        className="scroll-mt-24 rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-charcoal-100 sm:p-8"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100">
          <CheckCircle2 className="h-8 w-8 text-accent-600" />
        </div>
        <h2 className="mt-5 font-heading text-xl font-bold text-charcoal-900">
          Merci{prenom ? ` ${prenom}` : ''} ! Demande bien reçue.
        </h2>
        <p className="mt-3 text-charcoal-600">
          Un conseiller vous rappelle très vite
          {telephone ? ` au ${telephone}` : ''} pour activer votre profil et vous envoyer vos
          premières demandes.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-sand-100 px-4 py-2 text-sm text-charcoal-600">
          <PhoneCall className="h-4 w-4 text-primary-600" />
          Gardez votre téléphone à portée de main
        </div>
        <p className="mt-4 text-xs text-charcoal-400">Inscription gratuite · sans engagement</p>
      </div>
    )
  }

  return (
    <form
      id="lead-form"
      onSubmit={handleSubmit}
      className="scroll-mt-24 space-y-4 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-charcoal-100 sm:p-8"
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
          <label htmlFor="lead-prenom" className="mb-1 block text-sm font-medium text-charcoal-700">
            Votre prénom
          </label>
          <input
            id="lead-prenom"
            type="text"
            autoComplete="given-name"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Karim"
            className="w-full rounded-xl border border-charcoal-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal-700">Votre métier</label>
          <MetierAutocomplete
            value={metier}
            placeholder="Plombier, électricien, maçon…"
            onSelect={(service) => setMetier(service.name)}
            onQueryChange={setMetier}
            onClear={() => setMetier('')}
            inputClassName="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal-700">
            Votre zone d&apos;intervention
          </label>
          <VilleAutocomplete
            value={ville}
            placeholder="Ville ou code postal"
            onSelect={(v, cp) => {
              setVille(v)
              setCodePostal(cp)
            }}
            onQueryChange={(q) => {
              setVille(q)
              setCodePostal('')
            }}
            onClear={() => {
              setVille('')
              setCodePostal('')
            }}
            inputClassName="w-full px-4 py-3 rounded-xl border border-charcoal-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
        </div>

        <div>
          <label htmlFor="lead-tel" className="mb-1 block text-sm font-medium text-charcoal-700">
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
            className="w-full rounded-xl border border-charcoal-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label htmlFor="lead-email" className="mb-1 block text-sm font-medium text-charcoal-700">
            Email <span className="font-normal text-charcoal-400">(facultatif)</span>
          </label>
          <input
            id="lead-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@email.fr"
            className="w-full rounded-xl border border-charcoal-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <p className="mt-1 text-xs text-charcoal-400">
            Perso ou pro, peu importe — facultatif. On vous rappelle au téléphone.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Un instant…
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-charcoal-400">
        En continuant, vous acceptez notre{' '}
        <a href="/confidentialite" className="underline hover:text-charcoal-600">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  )
}
