'use client'

import { useState, useEffect, useCallback } from 'react'
import { RotateCcw, X } from 'lucide-react'

const STORAGE_KEY = 'sa:devis-draft'
const AUTO_DISMISS_MS = 10_000

interface SavedDraft {
  formData: {
    service?: string
    ville?: string
  }
  step?: number
}

/**
 * FormRecoveryBanner — Shopify-style form progress recovery.
 *
 * Displays a slide-down banner when the user returns to /devis
 * and a saved draft exists in localStorage.
 *
 * AUTONOMOUS: does NOT modify DevisForm. Emits a custom event
 * that DevisForm can optionally listen to.
 */
export default function FormRecoveryBanner() {
  const [draft, setDraft] = useState<SavedDraft | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: SavedDraft = JSON.parse(raw)
      // Only show if user had actually started (at least service picked)
      if (parsed.formData?.service) {
        setDraft(parsed)
        // Small delay for the slide-down animation
        requestAnimationFrame(() => setVisible(true))
      }
    } catch {
      // Corrupted data — ignore
    }
  }, [])

  // Auto-dismiss after 10s
  useEffect(() => {
    if (!visible || dismissed) return
    const timer = setTimeout(() => {
      setDismissed(true)
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible, dismissed])

  const handleResume = useCallback(() => {
    // Dispatch custom event so DevisForm knows to restore
    window.dispatchEvent(new CustomEvent('sa:devis-resume'))
    setDismissed(true)
  }, [])

  const handleRestart = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage indisponible — l'event ci-dessous reset quand même le form en mémoire
    }
    // Dispatch custom event so DevisForm resets
    window.dispatchEvent(new CustomEvent('sa:devis-restart'))
    setDismissed(true)
  }, [])

  if (!draft || !visible) return null

  const serviceName = draft.formData.service
    ? draft.formData.service.charAt(0).toUpperCase() + draft.formData.service.slice(1)
    : ''
  const villeName = draft.formData.ville || ''
  const summary = [serviceName, villeName].filter(Boolean).join(' à ')

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-4 overflow-hidden transition-all duration-500 ease-out ${
        dismissed ? 'max-h-0 opacity-0 -translate-y-2' : 'max-h-40 opacity-100 translate-y-0'
      }`}
    >
      <div className="relative bg-gradient-to-r from-primary-50 to-sand-100 border border-primary-200/60 rounded-2xl px-4 py-3.5 sm:px-6 sm:py-4">
        {/* Close button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-200 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pr-6">
          {/* Icon + text */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-sm text-charcoal-700">
              Vous aviez commencé une demande de devis
              {summary && (
                <>
                  {' '}
                  <span className="font-semibold text-charcoal-900">({summary})</span>
                </>
              )}
              . Reprendre ?
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleResume}
              className="inline-flex items-center gap-1.5 bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-charcoal-700 px-3 py-2 rounded-xl hover:bg-sand-200 transition-all duration-200"
            >
              Recommencer
            </button>
          </div>
        </div>

        {/* Auto-dismiss progress bar */}
        {!dismissed && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-100 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-primary-300 rounded-b-2xl"
              style={{
                animation: `shrink-bar ${AUTO_DISMISS_MS}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      {/* Inline keyframes for the progress bar */}
      <style jsx>{`
        @keyframes shrink-bar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
