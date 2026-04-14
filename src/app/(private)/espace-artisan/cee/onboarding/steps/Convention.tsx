'use client'

/**
 * Convention step — Trigger POST /api/cee/partners/convention → iframe Yousign.
 *
 * Flow:
 * 1. User clicks "Signer la convention"
 * 2. POST /api/cee/partners/convention → { signerUrl }
 * 3. signerUrl displayed in iframe; polling every 5s for convention_signed status
 * 4. On signed: onNext()
 *
 * States: default, hover, focus, active, disabled, loading, error, success
 * WCAG: iframe title, aria-live on status updates, focus management
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, CheckCircle, RefreshCw, ChevronRight, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { CeePartnerData } from '../page'

interface ConventionProps {
  partner: CeePartnerData | null
  onNext: () => void
  onPartnerRefresh: () => Promise<void>
}

type ConventionState = 'idle' | 'loading' | 'signing' | 'polling' | 'signed' | 'error'

export default function Convention({ partner, onNext, onPartnerRefresh }: ConventionProps) {
  const isAlreadySigned = Boolean(partner?.convention_signed_at)

  const [state, setState] = useState<ConventionState>(isAlreadySigned ? 'signed' : 'idle')
  const [signerUrl, setSignerUrl] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const MAX_POLLS = 60 // 5 min max at 5s intervals

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  // Poll partner status until convention_signed.
  // Does NOT change state — callers set the appropriate state before calling.
  const startPolling = useCallback(() => {
    stopPolling()
    pollCountRef.current = 0
    setStatusMessage('En attente de votre signature…')

    pollIntervalRef.current = setInterval(async () => {
      pollCountRef.current += 1
      if (pollCountRef.current > MAX_POLLS) {
        stopPolling()
        setState('error')
        setErrorMessage(
          "Délai d'attente dépassé. Actualisez la page pour vérifier le statut de votre signature."
        )
        return
      }

      try {
        const res = await fetch('/api/cee/partners/me', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const p: CeePartnerData | null = json.data ?? null

        if (p?.convention_signed_at) {
          stopPolling()
          setState('signed')
          setStatusMessage('Convention signée avec succès.')
          await onPartnerRefresh()
        }
      } catch {
        // Ignore transient network errors during poll
      }
    }, 5_000)
  }, [stopPolling, onPartnerRefresh])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const handleTriggerConvention = async () => {
    setState('loading')
    setErrorMessage('')
    setStatusMessage('')

    try {
      const res = await fetch('/api/cee/partners/convention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const json = await res.json().catch(() => ({}))

      if (res.status === 409) {
        // IBAN_REQUIRED
        setErrorMessage(
          json?.error?.message || "Veuillez d'abord renseigner votre IBAN (étape précédente)."
        )
        setState('error')
        return
      }
      if (!res.ok) {
        setErrorMessage(
          json?.error?.message ||
            'Impossible de créer la convention. Réessayez dans quelques instants.'
        )
        setState('error')
        return
      }

      const url: string = json?.data?.signerUrl ?? ''
      if (url) {
        setSignerUrl(url)
        setState('signing')
        startPolling()
      } else {
        // No iframe URL (sandbox/mock mode) — start polling anyway
        setState('polling')
        setStatusMessage('Convention créée. En attente de confirmation de votre signature.')
        startPolling()
      }
    } catch {
      setState('error')
      setErrorMessage('Erreur réseau. Vérifiez votre connexion et réessayez.')
    }
  }

  const handleContinue = () => {
    stopPolling()
    onNext()
  }

  return (
    <section
      className="p-6 sm:p-8"
      aria-labelledby="convention-heading"
      data-testid="step-convention"
    >
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center rounded-full bg-primary-50 px-3 py-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-600">
            Étape 3 sur 5
          </span>
        </div>
        <h2 id="convention-heading" className="font-heading text-2xl font-bold text-charcoal-900">
          Convention de partenariat
        </h2>
        <p className="mt-2 text-charcoal-500">
          Signez électroniquement votre convention mandataire CEE conforme à l&apos;arrêté du 2
          novembre 2023.
        </p>
      </header>

      {/* Status announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {statusMessage}
      </div>

      {/* Signed state */}
      {(state === 'signed' || isAlreadySigned) && (
        <div
          role="status"
          className="mb-6 flex items-center gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" />
          <div>
            <p className="font-semibold text-accent-700">Convention signée</p>
            {partner?.convention_signed_at && (
              <p className="text-sm text-accent-600">
                Signée le{' '}
                {new Date(partner.convention_signed_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-semibold">Erreur</p>
          <p className="mt-0.5">{errorMessage}</p>
        </div>
      )}

      {/* Yousign iframe */}
      {state === 'signing' && signerUrl && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-charcoal-700">
            Signez directement dans la fenêtre ci-dessous :
          </p>
          <div className="overflow-hidden rounded-xl border border-sand-300 bg-sand-50">
            <iframe
              src={signerUrl}
              title="Interface de signature Yousign — Convention CEE"
              className="h-[500px] w-full"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="strict-origin"
            />
          </div>
          <p className="mt-2 text-xs text-charcoal-400">
            Problème avec l&apos;interface ?{' '}
            <a
              href={signerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1 rounded"
            >
              Ouvrir dans un nouvel onglet
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </p>
        </div>
      )}

      {/* Polling progress */}
      {state === 'polling' && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-sand-200 bg-sand-50 p-4">
          <RefreshCw
            className="h-5 w-5 shrink-0 motion-safe:animate-spin text-primary-400"
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-charcoal-700">En attente de votre signature…</p>
            <p className="text-sm text-charcoal-500">
              Cette fenêtre se mettra à jour automatiquement après la signature.
            </p>
          </div>
        </div>
      )}

      {/* Idle state — document preview + trigger */}
      {state === 'idle' && (
        <div className="mb-6">
          <div className="mb-4 flex items-start gap-4 rounded-xl border border-sand-200 bg-sand-50 p-4">
            <FileText className="mt-0.5 h-8 w-8 shrink-0 text-primary-400" aria-hidden="true" />
            <div>
              <p className="font-semibold text-charcoal-900">
                Convention mandataire CEE — SA Energy
              </p>
              <p className="mt-0.5 text-sm text-charcoal-500">
                6 mentions obligatoires — arrêté du 2 novembre 2023 (R.221-1) : identification des
                parties, périmètre des opérations, obligations du mandataire, conditions de
                rémunération, durée et résiliation, dispositions CEE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {(state === 'signed' || isAlreadySigned) && (
          <Button
            type="button"
            variant="primary"
            rightIcon={<ChevronRight className="h-5 w-5" aria-hidden="true" />}
            onClick={handleContinue}
            data-testid="convention-continue-btn"
          >
            Continuer
          </Button>
        )}

        {(state === 'idle' || state === 'error') && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={false}
            onClick={handleTriggerConvention}
            data-testid="convention-sign-btn"
          >
            Signer la convention
          </Button>
        )}

        {state === 'loading' && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={true}
            disabled
            data-testid="convention-loading-btn"
          >
            Génération en cours…
          </Button>
        )}
      </div>
    </section>
  )
}
