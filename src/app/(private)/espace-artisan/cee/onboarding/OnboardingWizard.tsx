'use client'

/**
 * OnboardingWizard — 5-step CEE partner onboarding state machine.
 *
 * Steps: welcome → iban → convention → training → activate
 * URL query ?step=X for deep-linking.
 *
 * WCAG 2.1 AA:
 * - aria-live="polite" on step announcements
 * - focus trap + auto-focus first interactive element per step
 * - visible focus ring on all interactive elements
 *
 * Light-only. No dark:* classes.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Circle } from 'lucide-react'
import { clsx } from 'clsx'
import type { CeePartnerData } from './page'
import Welcome from './steps/Welcome'
import Iban from './steps/Iban'
import Convention from './steps/Convention'
import Training from './steps/Training'
import Activate from './steps/Activate'

export type WizardStep = 'welcome' | 'iban' | 'convention' | 'training' | 'activate'

const STEPS: { id: WizardStep; label: string; index: number }[] = [
  { id: 'welcome', label: 'Bienvenue', index: 0 },
  { id: 'iban', label: 'Coordonnées bancaires', index: 1 },
  { id: 'convention', label: 'Convention', index: 2 },
  { id: 'training', label: 'Formation', index: 3 },
  { id: 'activate', label: 'Activation', index: 4 },
]

function resolveInitialStep(
  partner: CeePartnerData | null,
  searchParam: string | null
): WizardStep {
  // Deep-link via ?step=X
  const validSteps = STEPS.map((s) => s.id)
  if (searchParam && validSteps.includes(searchParam as WizardStep)) {
    return searchParam as WizardStep
  }
  // Resume from partner status
  if (!partner) return 'welcome'
  const status = partner.status
  if (status === 'convention_signed' || status === 'training' || status === 'certified') {
    return 'training'
  }
  if (status === 'convention_sent') return 'convention'
  if (partner.iban_last4) return 'convention'
  if (status === 'invited' || status === 'onboarding') return 'iban'
  return 'welcome'
}

interface OnboardingWizardProps {
  initialPartner: CeePartnerData | null
}

export default function OnboardingWizard({ initialPartner }: OnboardingWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [partner, setPartner] = useState<CeePartnerData | null>(initialPartner)
  const [currentStep, setCurrentStep] = useState<WizardStep>(() =>
    resolveInitialStep(initialPartner, searchParams.get('step'))
  )
  const [stepAnnouncement, setStepAnnouncement] = useState('')

  // Ref for first-focusable-element auto-focus per step
  const stepContentRef = useRef<HTMLDivElement>(null)

  const currentIndex = STEPS.find((s) => s.id === currentStep)?.index ?? 0

  // Sync URL query param on step change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', currentStep)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [currentStep, router, searchParams])

  // Auto-focus first focusable element in step container on step change
  useEffect(() => {
    if (!stepContentRef.current) return
    const focusable = stepContentRef.current.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable) {
      // Small delay to allow transition to settle
      const id = setTimeout(() => focusable.focus(), 80)
      return () => clearTimeout(id)
    }
  }, [currentStep])

  const goTo = useCallback(
    (step: WizardStep) => {
      const label = STEPS.find((s) => s.id === step)?.label ?? step
      setStepAnnouncement(`Étape : ${label}`)
      setCurrentStep(step)
    },
    []
  )

  const goNext = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep)
    if (idx < STEPS.length - 1) {
      goTo(STEPS[idx + 1].id)
    }
  }, [currentStep, goTo])

  // Shared partner refresh — called after each step mutation
  const refreshPartner = useCallback(async () => {
    try {
      const res = await fetch('/api/cee/partners/me', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setPartner(json.data ?? null)
      }
    } catch {
      // Fail-silent — partner state is used only for display
    }
  }, [])

  const renderStep = () => {
    const commonProps = {
      partner,
      onNext: goNext,
      onPartnerRefresh: refreshPartner,
    }

    switch (currentStep) {
      case 'welcome':
        return <Welcome {...commonProps} />
      case 'iban':
        return <Iban {...commonProps} />
      case 'convention':
        return <Convention {...commonProps} />
      case 'training':
        return <Training {...commonProps} />
      case 'activate':
        return <Activate partner={partner} onPartnerRefresh={refreshPartner} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Screen-reader step announcement */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {stepAnnouncement}
      </div>

      {/* Progress stepper */}
      <nav aria-label="Étapes d'onboarding CEE">
        <ol className="flex items-center gap-0" role="list">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex
            const isCurrent = step.id === currentStep
            const isLast = idx === STEPS.length - 1

            return (
              <li
                key={step.id}
                className={clsx('flex items-center', !isLast && 'flex-1')}
              >
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Only allow navigating to completed steps
                      if (isCompleted) goTo(step.id)
                    }}
                    disabled={!isCompleted && !isCurrent}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={`${step.label}${isCompleted ? ' (complété)' : isCurrent ? ' (étape actuelle)' : ' (à venir)'}`}
                    className={clsx(
                      'flex h-11 w-11 items-center justify-center rounded-full border-2',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
                      isCompleted
                        ? 'border-accent-500 bg-accent-500 text-white cursor-pointer hover:bg-accent-600'
                        : isCurrent
                          ? 'border-primary-500 bg-primary-500 text-white cursor-default'
                          : 'border-sand-300 bg-white text-charcoal-400 cursor-not-allowed',
                      (!isCompleted && !isCurrent) && 'opacity-60',
                      'motion-safe:transition-all motion-safe:duration-200'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" aria-hidden="true" />
                    ) : isCurrent ? (
                      <span aria-hidden="true" className="text-sm font-bold">{idx + 1}</span>
                    ) : (
                      <Circle className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <span
                    className={clsx(
                      'mt-1 hidden text-xs font-medium sm:block',
                      isCurrent
                        ? 'text-primary-600'
                        : isCompleted
                          ? 'text-accent-600'
                          : 'text-charcoal-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={clsx(
                      'mx-1 mb-4 h-0.5 flex-1 motion-safe:transition-colors motion-safe:duration-200 sm:mx-2',
                      idx < currentIndex ? 'bg-accent-400' : 'bg-sand-300'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div
        ref={stepContentRef}
        className="rounded-2xl border border-sand-300 bg-white shadow-soft"
        data-testid="wizard-step-content"
      >
        {renderStep()}
      </div>
    </div>
  )
}
