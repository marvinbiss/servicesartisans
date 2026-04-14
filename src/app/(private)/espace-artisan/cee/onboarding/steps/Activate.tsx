'use client'

/**
 * Activate step — Recap + CTA POST /api/cee/partners/activate + redirect.
 *
 * Shows summary: IBAN last4, convention signed, quiz passed.
 * On activate: POST /api/cee/partners/activate → redirect /espace-artisan/cee
 *
 * States: default, hover, focus, active, disabled, loading, error, success
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  CreditCard,
  FileText,
  Award,
  Rocket,
  AlertCircle,
} from 'lucide-react'
import { clsx } from 'clsx'
import Button from '@/components/ui/Button'
import { QUIZ_QUESTIONS, PASS_THRESHOLD } from '@/lib/cee/quiz-questions'
import type { CeePartnerData } from '../page'

interface ActivateProps {
  partner: CeePartnerData | null
  onPartnerRefresh: () => Promise<void>
}

interface ChecklistItem {
  id: string
  icon: typeof CheckCircle
  label: string
  detail: string | null
  complete: boolean
}

export default function Activate({ partner, onPartnerRefresh }: ActivateProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const checklist: ChecklistItem[] = [
    {
      id: 'iban',
      icon: CreditCard,
      label: 'Coordonnées bancaires',
      detail: partner?.iban_last4
        ? `Compte se terminant par ···· ${partner.iban_last4}`
        : null,
      complete: Boolean(partner?.iban_last4),
    },
    {
      id: 'convention',
      icon: FileText,
      label: 'Convention mandataire signée',
      detail: partner?.convention_signed_at
        ? `Signée le ${new Date(partner.convention_signed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : null,
      complete: Boolean(partner?.convention_signed_at),
    },
    {
      id: 'quiz',
      icon: Award,
      label: 'Quiz de formation validé',
      detail:
        partner?.certification_score !== null &&
        partner?.certification_score !== undefined
          ? `Score : ${partner.certification_score}/${QUIZ_QUESTIONS.length} (seuil : ${PASS_THRESHOLD})`
          : null,
      complete: Boolean(partner?.certified_at),
    },
  ]

  const allComplete = checklist.every((item) => item.complete)

  const handleActivate = async () => {
    setIsLoading(true)
    setApiError('')

    try {
      const res = await fetch('/api/cee/partners/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setApiError(
          json?.error?.message ||
            'Activation impossible. Vérifiez que les étapes précédentes sont complètes.'
        )
        return
      }

      setSuccess(true)
      await onPartnerRefresh()
      // Short delay for success animation before redirect
      setTimeout(() => {
        router.push('/espace-artisan/cee')
      }, 1000)
    } catch {
      setApiError('Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section
      className="p-6 sm:p-8"
      aria-labelledby="activate-heading"
      data-testid="step-activate"
    >
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Étape 5 sur 5
          </span>
        </div>
        <h2
          id="activate-heading"
          className="font-heading text-2xl font-bold text-charcoal-900"
        >
          Activation de votre compte partenaire
        </h2>
        <p className="mt-2 text-charcoal-500">
          Vérifiez le récapitulatif ci-dessous, puis activez votre compte pour
          commencer à déposer des dossiers CEE.
        </p>
      </header>

      {/* Checklist */}
      <ul
        className="mb-6 space-y-3"
        role="list"
        aria-label="Récapitulatif des étapes"
      >
        {checklist.map((item) => {
          const Icon = item.icon
          return (
            <li
              key={item.id}
              className={clsx(
                'flex items-center gap-4 rounded-xl border p-4',
                item.complete
                  ? 'border-accent-200 bg-accent-50'
                  : 'border-red-200 bg-red-50'
              )}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  item.complete ? 'bg-accent-100' : 'bg-red-100'
                )}
                aria-hidden="true"
              >
                <Icon
                  className={clsx(
                    'h-5 w-5',
                    item.complete ? 'text-accent-600' : 'text-red-500'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={clsx(
                      'font-semibold',
                      item.complete ? 'text-accent-800' : 'text-red-800'
                    )}
                  >
                    {item.label}
                  </p>
                  {item.complete ? (
                    <CheckCircle
                      className="h-4 w-4 shrink-0 text-accent-500"
                      aria-label="Complété"
                    />
                  ) : (
                    <AlertCircle
                      className="h-4 w-4 shrink-0 text-red-500"
                      aria-label="Incomplet"
                    />
                  )}
                </div>
                {item.detail && (
                  <p
                    className={clsx(
                      'text-sm',
                      item.complete ? 'text-accent-600' : 'text-red-600'
                    )}
                  >
                    {item.detail}
                  </p>
                )}
                {!item.complete && (
                  <p className="text-sm text-red-600">
                    Non complété — revenez en arrière pour finaliser cette étape.
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* Incomplete warning */}
      {!allComplete && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <p className="font-semibold">Étapes incomplètes</p>
          <p className="mt-0.5">
            Toutes les étapes doivent être validées avant l&apos;activation.
            Revenez aux étapes précédentes.
          </p>
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-700"
        >
          <CheckCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Compte activé ! Redirection en cours…
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="xl"
          isLoading={isLoading}
          disabled={!allComplete || isLoading || success}
          onClick={handleActivate}
          rightIcon={<Rocket className="h-5 w-5" aria-hidden="true" />}
          data-testid="activate-btn"
          aria-describedby={!allComplete ? 'activate-incomplete-msg' : undefined}
        >
          Activer mon compte partenaire
        </Button>
      </div>
      {!allComplete && (
        <p
          id="activate-incomplete-msg"
          className="mt-2 text-right text-sm text-charcoal-400"
        >
          Complétez toutes les étapes pour activer votre compte.
        </p>
      )}
    </section>
  )
}
