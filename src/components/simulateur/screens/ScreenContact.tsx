'use client'

import { useState } from 'react'
import { CONSENT_TEXTS, CONSENT_VERSION_CURRENT } from '@/lib/simulateur/consent-texts'
import ScreenTitle from './ScreenTitle'

const CONSENT = CONSENT_TEXTS[CONSENT_VERSION_CURRENT]

interface Props {
  prenom: string
  telephone: string
  email: string
  consentRgpd: boolean
  consentMajorite: boolean
  consentDemarchage: boolean
  submitting: boolean
  onChangePrenom: (v: string) => void
  onChangeTelephone: (v: string) => void
  onChangeEmail: (v: string) => void
  onChangeConsent: (rgpd: boolean, majorite: boolean) => void
  onChangeDemarchage: (v: boolean) => void
  onSubmit: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEL_FR_RE = /^(?:\+33|0)[1-9]\d{8}$/

export default function ScreenContact({
  prenom,
  telephone,
  email,
  consentRgpd,
  consentMajorite,
  consentDemarchage,
  submitting,
  onChangePrenom,
  onChangeTelephone,
  onChangeEmail,
  onChangeConsent,
  onChangeDemarchage,
  onSubmit,
}: Props) {
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prenom.trim()) {
      setError('Votre prénom est requis')
      return
    }
    if (!TEL_FR_RE.test(telephone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide (format français attendu)')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setError('Adresse email invalide')
      return
    }
    if (!consentRgpd || !consentMajorite) {
      setError('Veuillez accepter les conditions')
      return
    }
    setError(null)
    onSubmit()
  }

  return (
    <div>
      <ScreenTitle subtitle="Pour recevoir votre estimation détaillée et être mis en relation avec un artisan RGE">
        Dernière étape
      </ScreenTitle>

      <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4" noValidate>
        <div>
          <input
            type="text"
            autoComplete="given-name"
            autoFocus
            placeholder="Votre prénom"
            value={prenom}
            onChange={(e) => onChangePrenom(e.target.value)}
            className="w-full rounded-xl border-2 border-charcoal-200 px-4 py-3.5 text-base text-charcoal-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />
        </div>
        <div>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="Votre téléphone"
            value={telephone}
            onChange={(e) => onChangeTelephone(e.target.value)}
            className="w-full rounded-xl border-2 border-charcoal-200 px-4 py-3.5 text-base text-charcoal-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />
        </div>
        <div>
          <input
            type="email"
            autoComplete="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-charcoal-200 px-4 py-3.5 text-base text-charcoal-900 transition focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-200"
          />
        </div>

        <div className="space-y-2.5 rounded-lg bg-charcoal-50 p-3">
          <label className="flex items-start gap-2.5 text-xs text-charcoal-700">
            <input
              type="checkbox"
              checked={consentRgpd}
              onChange={(e) => onChangeConsent(e.target.checked, consentMajorite)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded"
              required
            />
            <span>{CONSENT.rgpd}</span>
          </label>
          <label className="flex items-start gap-2.5 text-xs text-charcoal-700">
            <input
              type="checkbox"
              checked={consentMajorite}
              onChange={(e) => onChangeConsent(consentRgpd, e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded"
              required
            />
            <span>{CONSENT.majorite}</span>
          </label>
          <label className="flex items-start gap-2.5 text-xs text-charcoal-500">
            <input
              type="checkbox"
              checked={consentDemarchage}
              onChange={(e) => onChangeDemarchage(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded"
            />
            <span>{CONSENT.demarchage}</span>
          </label>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-accent-700 disabled:opacity-60"
        >
          {submitting ? 'Envoi en cours…' : 'Obtenir mon estimation gratuite'}
        </button>
        <p className="text-center text-xs text-charcoal-400">
          Gratuit et sans engagement — vos données sont protégées
        </p>
      </form>
    </div>
  )
}
