'use client'

/**
 * Welcome step — Présentation du rôle SA Energy et recueil du consentement.
 *
 * States handled: default, hover, focus, active, disabled, loading (consent submit)
 * WCAG 2.1 AA: semantic heading, checkbox label, aria-live on consent error
 */

import { useState } from 'react'
import { CheckCircle, Shield, Zap, FileText, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import Button from '@/components/ui/Button'
import type { CeePartnerData } from '../page'

interface WelcomeProps {
  partner: CeePartnerData | null
  onNext: () => void
  onPartnerRefresh: () => Promise<void>
}

const BENEFITS = [
  {
    icon: Zap,
    title: 'Revenus additionnels',
    description:
      "Percevez une prime CEE sur chaque dossier éligible déposé via ServicesArtisans Energy.",
  },
  {
    icon: Shield,
    title: 'Zéro démarche administrative',
    description:
      'SA Energy gère la conformité PNCEE, les dépôts et le suivi des dossiers à votre place.',
  },
  {
    icon: FileText,
    title: 'Convention mandataire',
    description:
      "Encadré par l'arrêté du 2 novembre 2023 (R.221-1). Votre rôle, vos droits et obligations clairement définis.",
  },
  {
    icon: CheckCircle,
    title: 'Leads exclusifs',
    description:
      "Chaque lead est transmis à un seul artisan. Jamais partagé — c'est votre différenciateur.",
  },
]

export default function Welcome({ onNext, onPartnerRefresh }: WelcomeProps) {
  const [consented, setConsented] = useState(false)
  const [consentError, setConsentError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!consented) {
      setConsentError(
        'Vous devez accepter les conditions pour continuer.'
      )
      return
    }
    setConsentError('')
    setIsLoading(true)

    try {
      await onPartnerRefresh()
    } finally {
      setIsLoading(false)
      onNext()
    }
  }

  return (
    <section
      className="p-6 sm:p-8"
      aria-labelledby="welcome-heading"
      data-testid="step-welcome"
    >
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Étape 1 sur 5
          </span>
        </div>
        <h2
          id="welcome-heading"
          className="font-heading text-2xl font-bold text-charcoal-900"
        >
          Bienvenue chez SA Energy
        </h2>
        <p className="mt-2 text-charcoal-500">
          Rejoignez le réseau de mandataires CEE de ServicesArtisans Energy et
          valorisez chaque chantier éligible.
        </p>
      </header>

      {/* Benefits grid */}
      <ul className="mb-8 grid gap-4 sm:grid-cols-2" role="list">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon
          return (
            <li
              key={benefit.title}
              className="flex gap-4 rounded-xl border border-sand-200 bg-sand-50 p-4"
            >
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50"
                aria-hidden="true"
              >
                <Icon className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">{benefit.title}</h3>
                <p className="mt-0.5 text-sm text-charcoal-500">
                  {benefit.description}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Legal notice */}
      <div className="mb-6 rounded-xl border border-sand-300 bg-sand-50 p-4 text-sm text-charcoal-500">
        <p>
          <strong className="text-charcoal-700">Base légale :</strong> Ce
          partenariat est encadré par l&apos;arrêté du 2 novembre 2023 relatif
          aux obligations d&apos;économies d&apos;énergie (R.221-1 du Code de
          l&apos;énergie). SA Energy agit en tant que mandataire auprès du
          délégataire CEE.
        </p>
      </div>

      {/* Consent checkbox */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={consented}
            onChange={(e) => {
              setConsented(e.target.checked)
              if (e.target.checked) setConsentError('')
            }}
            aria-describedby={consentError ? 'consent-error' : undefined}
            className={clsx(
              'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 text-primary-500',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
              'transition-colors duration-200',
              consentError ? 'border-red-500' : 'border-sand-400'
            )}
          />
          <label
            htmlFor="consent-checkbox"
            className="cursor-pointer text-sm text-charcoal-700"
          >
            Je comprends le rôle de mandataire CEE de SA Energy et j&apos;accepte
            d&apos;entamer la procédure d&apos;adhésion, incluant la signature
            d&apos;une convention et la validation d&apos;un quiz de formation.
          </label>
        </div>
        {consentError && (
          <p
            id="consent-error"
            role="alert"
            aria-live="polite"
            className="mt-2 text-sm text-red-600"
          >
            {consentError}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          onClick={handleContinue}
          rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
          data-testid="welcome-continue-btn"
        >
          Commencer
        </Button>
      </div>
    </section>
  )
}
