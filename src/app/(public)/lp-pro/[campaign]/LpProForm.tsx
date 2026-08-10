'use client'

import { useCallback, useState } from 'react'
import { ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react'
import { isValidFrenchPhone, cleanPhone } from '@/lib/validation/phone'
import { trackLead } from '@/lib/analytics/track'
import { captureAdsAttribution } from '@/lib/ads/click-ids'

type LpProFormProps = {
  campaignSlug: string
  serviceSlug: string
  trade: string
  ctaLabel: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function LpProForm({ campaignSlug, serviceSlug, trade, ctaLabel }: LpProFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (state === 'submitting') return

      const phone = cleanPhone(telephone)
      if (!isValidFrenchPhone(phone)) {
        setErrorMsg('Numéro de téléphone français invalide.')
        setState('error')
        return
      }

      setState('submitting')
      setErrorMsg(null)

      try {
        const res = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: serviceSlug,
            urgency: 'mois',
            nom: name.trim() || undefined,
            email: email.trim() || undefined,
            telephone: phone,
            codePostal: postalCode.trim() || undefined,
            description: `Demande LP Pro ${campaignSlug}`,
            source: `lppro_${campaignSlug}`,
            // Mig 551 — click-ID Google Ads pour l'Offline Conversion Import.
            ...captureAdsAttribution(),
          }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || 'Erreur serveur')
        }

        setState('success')
        trackLead({ content_name: campaignSlug, content_category: serviceSlug })
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur réseau')
        setState('error')
      }
    },
    [state, telephone, name, email, postalCode, serviceSlug, campaignSlug]
  )

  if (state === 'success') {
    return (
      <div className="bg-accent-50 border-2 border-accent-300 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-accent-500 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-heading text-xl font-extrabold text-charcoal-900 mb-2">
          Demande reçue !
        </h3>
        <p className="text-charcoal-700">
          Un artisan vérifié va vous rappeler sous 24h pour votre projet et établir un devis
          gratuit. Aucun engagement.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-charcoal-200 shadow-soft p-6 md:p-8 space-y-4"
      aria-label={`Formulaire devis ${trade.toLowerCase()}`}
    >
      <div>
        <label htmlFor="lppro-name" className="block text-sm font-semibold text-charcoal-700 mb-1">
          Prénom et nom
        </label>
        <input
          id="lppro-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jean Dupont"
          className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-charcoal-900 placeholder:text-charcoal-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
          autoComplete="name"
          required
          minLength={2}
        />
      </div>

      <div>
        <label
          htmlFor="lppro-telephone"
          className="block text-sm font-semibold text-charcoal-700 mb-1"
        >
          Téléphone
        </label>
        <input
          id="lppro-telephone"
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="06 12 34 56 78"
          className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-charcoal-900 placeholder:text-charcoal-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
          autoComplete="tel"
          required
          inputMode="tel"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lppro-email"
            className="block text-sm font-semibold text-charcoal-700 mb-1"
          >
            Email
          </label>
          <input
            id="lppro-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-charcoal-900 placeholder:text-charcoal-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lppro-postal"
            className="block text-sm font-semibold text-charcoal-700 mb-1"
          >
            Code postal
          </label>
          <input
            id="lppro-postal"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="75015"
            className="w-full px-4 py-3 rounded-xl border border-charcoal-300 text-charcoal-900 placeholder:text-charcoal-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none"
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent-600 text-white font-semibold hover:bg-accent-700 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md"
      >
        {state === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Envoi en cours…
          </>
        ) : (
          <>
            {ctaLabel}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </>
        )}
      </button>

      {errorMsg && (
        <p
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          {errorMsg}
        </p>
      )}

      <p className="flex items-start gap-2 text-xs text-charcoal-500 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
        Vos données sont confidentielles, transmises uniquement à un artisan vérifié près de chez
        vous. Aucun engagement, devis gratuit.
      </p>
    </form>
  )
}
