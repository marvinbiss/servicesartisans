'use client'

import { useEffect, useState, useCallback, useRef, useId } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

const AUTO_DISMISS_MS = 10_000
const MOBILE_IDLE_MS = 45_000

interface ExitIntentPopupProps {
  /** Unique session key to avoid showing twice */
  sessionKey?: string
  /** Title text */
  title?: string
  /** Subtitle/description */
  description?: string
  /** CTA button text */
  ctaText?: string
  /** CTA link href */
  ctaHref?: string
  /** Optional: CTA onClick handler (if no href) */
  onCtaClick?: () => void
}

export default function ExitIntentPopup({
  sessionKey = 'sa:exit-intent-shown',
  title = 'Avant de partir...',
  description = "Devis gratuit et sans engagement d'artisans RGE certifiés près de chez vous.",
  ctaText = 'Recevoir mes devis gratuits',
  ctaHref = '/devis',
  onCtaClick,
}: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  const shouldSuppress = useCallback(() => {
    if (typeof window === 'undefined') return true
    if (sessionStorage.getItem(sessionKey)) return true
    return false
  }, [sessionKey])

  const show = useCallback(() => {
    if (shouldSuppress()) return
    sessionStorage.setItem(sessionKey, '1')
    setVisible(true)
  }, [shouldSuppress, sessionKey])

  const close = useCallback(() => {
    setVisible(false)
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
  }, [])

  const handleCTA = useCallback(() => {
    close()
    if (onCtaClick) onCtaClick()
  }, [close, onCtaClick])

  // Auto-dismiss after 10s
  useEffect(() => {
    if (!visible) return
    dismissTimer.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    }
  }, [visible])

  // Escape + focus management. Non-modal dialog so we don't trap focus —
  // the page behind the popup stays interactive. We just send focus to
  // the close button on open so keyboard users can dismiss in one Tab,
  // and restore the prior focus when the popup unmounts.
  useEffect(() => {
    if (!visible) return
    previouslyFocusedRef.current = (document.activeElement as HTMLElement | null) ?? null
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const prior = previouslyFocusedRef.current
      if (prior && document.body.contains(prior)) prior.focus()
    }
  }, [visible, close])

  // Desktop: mouseleave at top of viewport
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (isMobile) return

    const handler = (e: MouseEvent) => {
      if (e.clientY < 10) show()
    }
    document.addEventListener('mouseleave', handler)
    return () => document.removeEventListener('mouseleave', handler)
  }, [show])

  // Mobile: 45s idle timer, reset on scroll/touch
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
    if (!isMobile) return

    const resetTimer = () => {
      if (mobileTimer.current) clearTimeout(mobileTimer.current)
      mobileTimer.current = setTimeout(show, MOBILE_IDLE_MS)
    }

    resetTimer()
    window.addEventListener('scroll', resetTimer, { passive: true })
    window.addEventListener('touchstart', resetTimer, { passive: true })

    return () => {
      if (mobileTimer.current) clearTimeout(mobileTimer.current)
      window.removeEventListener('scroll', resetTimer)
      window.removeEventListener('touchstart', resetTimer)
    }
  }, [show])

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-sand-300/60 p-5 relative">
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={close}
          className="absolute top-3 right-3 p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Content */}
        <p id={titleId} className="text-sm font-medium text-charcoal-900 mb-1">
          {title}
        </p>
        <p id={descriptionId} className="text-sm text-charcoal-600 mb-4 pr-6">
          {description}
        </p>

        {/* CTA */}
        {onCtaClick ? (
          <button
            onClick={handleCTA}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md"
          >
            {ctaText}
          </button>
        ) : (
          <Link
            href={ctaHref}
            onClick={close}
            className="block w-full py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md text-center"
          >
            {ctaText}
          </Link>
        )}

        <p className="text-[10px] text-charcoal-400 text-center mt-2">
          Gratuit · Sans engagement · Réponse rapide
        </p>
      </div>
    </div>
  )
}
