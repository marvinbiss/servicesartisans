'use client'

import React, { memo, useEffect, useRef } from 'react'
import { Phone, Check, Loader2, Clock, ShieldCheck } from 'lucide-react'
import type { EstimationContext } from './utils'
import type { UseLeadSubmitReturn } from './hooks/useLeadSubmit'

interface CallbackPanelProps {
  context: EstimationContext
  lead: UseLeadSubmitReturn
}

/** Fire canvas-confetti from the bottom of the widget */
async function fireConfetti() {
  try {
    const confetti = (await import('canvas-confetti')).default
    // Burst from bottom-center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.9 },
      colors: ['#E86B4B', '#f2b523', '#3D8B68', '#C24B2A', '#f2b523'],
      startVelocity: 30,
      gravity: 1.2,
      ticks: 120,
      disableForReducedMotion: true,
    })
  } catch {
    // Silently fail — confetti is non-critical
  }
}

export const CallbackPanel = memo(function CallbackPanel({ context, lead }: CallbackPanelProps) {
  const confettiFired = useRef(false)

  // Fire confetti once on successful submission
  useEffect(() => {
    if (lead.callbackSubmitted && !confettiFired.current) {
      confettiFired.current = true
      fireConfetti()
    }
  }, [lead.callbackSubmitted])

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      {!lead.callbackSubmitted ? (
        <div className="animate-fade-in-up w-full max-w-sm text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <Phone className="h-7 w-7 text-primary-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-charcoal-900">
              {context.artisan ? `Être rappelé par ${context.artisan.name}` : 'Demande de rappel'}
            </p>
            <p className="mt-1 text-sm text-charcoal-600">
              {context.artisan ? (
                <>
                  <strong>{context.artisan.name}</strong> vous rappelle dans les meilleurs délais
                </>
              ) : (
                <>
                  Un <strong>{context.metier.toLowerCase()}</strong> vérifié à{' '}
                  <strong>{context.ville}</strong> vous rappelle dans les meilleurs délais
                </>
              )}
            </p>
          </div>
          <form onSubmit={lead.handleCallbackSubmit} className="space-y-3">
            <div>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="06 12 34 56 78"
                value={lead.callbackPhone}
                onChange={(e) => {
                  lead.setCallbackPhone(e.target.value)
                }}
                className={
                  'w-full rounded-lg border px-4 py-3 text-center text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-1 ' +
                  (lead.callbackPhoneError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : 'border-sand-300 focus:border-primary-400 focus:ring-primary-400')
                }
                style={{ fontSize: '16px' }}
              />
              {lead.callbackPhoneError && (
                <p className="text-xs text-red-600 mt-1 text-center">{lead.callbackPhoneError}</p>
              )}
            </div>
            {/* RGPD consent */}
            <label className="flex items-start gap-2 text-xs text-charcoal-500 text-left">
              <input
                type="checkbox"
                checked={lead.rgpdCallbackConsent}
                onChange={(e) => lead.setRgpdCallbackConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                J&apos;accepte que mes données soient utilisées pour traiter ma demande et me mettre
                en relation avec des artisans partenaires. Voir notre{' '}
                <a href="/confidentialite" target="_blank" className="underline">
                  politique de confidentialité
                </a>
                .
              </span>
            </label>
            {lead.callbackError && (
              <p className="text-xs text-red-600 text-center">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            )}
            <button
              type="submit"
              disabled={
                lead.callbackLoading || !lead.callbackPhone.trim() || !lead.rgpdCallbackConsent
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50 shadow-cta"
            >
              {lead.callbackLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Phone className="h-4 w-4" />
                  Demander un rappel
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="animate-fade-in-scale w-full max-w-sm text-center space-y-5">
          {/* Animated checkmark */}
          <div
            className="animate-fade-in-scale mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-50"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="animate-fade-in-scale" style={{ animationDelay: '0.25s' }}>
              <Check className="h-8 w-8 text-accent-600" />
            </div>
          </div>

          <div>
            <p
              className="animate-fade-in-up text-base font-semibold text-charcoal-900"
              style={{ animationDelay: '0.3s' }}
            >
              Demande envoyée !
            </p>
            <p
              className="animate-fade-in-up mt-1 text-sm text-charcoal-600"
              style={{ animationDelay: '0.4s' }}
            >
              Votre demande a été envoyée ! Un conseiller vous rappelle rapidement.
            </p>
          </div>

          {/* Reassurance stats */}
          <div
            className="animate-fade-in-up flex items-center justify-center gap-4 text-xs text-charcoal-500"
            style={{ animationDelay: '0.55s' }}
          >
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-accent-500" />
              Réponse rapide
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-500" />
              Artisan vérifié
            </span>
          </div>

          {/* Subtle satisfaction message */}
          <p
            className="animate-fade-in text-xs text-charcoal-400"
            style={{ animationDelay: '0.7s' }}
          >
            98% de nos clients sont recontactés en moins de 2h
          </p>
        </div>
      )}
    </div>
  )
})
