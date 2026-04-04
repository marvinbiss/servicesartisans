'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, FileText, Shield, Clock, Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'

const SESSION_KEY = 'sa:exit-intent-shown'
const STORAGE_KEY = 'sa:devis-draft'

/**
 * ExitIntentModal — Desktop exit-intent overlay.
 *
 * Triggers when the mouse leaves the viewport towards the top (desktop only).
 * Shows once per session (sessionStorage). Fully accessible with focus trap,
 * aria-modal, Escape to close, click-outside to close.
 *
 * AUTONOMOUS: does not modify DevisForm.
 */
export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [contextInfo, setContextInfo] = useState({ service: '', ville: '' })

  // Read context from saved draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setContextInfo({
          service: parsed.formData?.service || '',
          ville: parsed.formData?.ville || '',
        })
      }
    } catch {}
  }, [])

  // Check if already shown this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setHasTriggered(true)
      }
    } catch {}
  }, [])

  // Exit intent listener (desktop only: mouseleave toward top)
  useEffect(() => {
    if (hasTriggered) return

    // Only on desktop — no hover capability = mobile
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return

    // Wait a bit before arming (don't trigger on page load)
    let armed = false
    const armTimer = setTimeout(() => {
      armed = true
    }, 30_000) // 30s minimum — visitors < 30s aren't qualified

    const handleMouseLeave = (e: MouseEvent) => {
      if (!armed) return
      // Only trigger when mouse exits toward top of viewport
      if (e.clientY > 5) return

      setHasTriggered(true)
      setIsOpen(true)
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {}
    }

    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      clearTimeout(armTimer)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasTriggered])

  // Focus trap & escape key
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement

    // Focus the modal
    const timer = setTimeout(() => {
      modalRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Prevent body scroll
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    // Restore focus
    setTimeout(() => {
      previousFocusRef.current?.focus()
    }, 100)
  }, [])

  const handleResume = useCallback(() => {
    close()
    // Scroll to the form if present, otherwise redirect to /devis
    const form = document.getElementById('devis')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.location.href = '/devis'
    }
  }, [close])

  if (!isOpen) return null

  const serviceName = contextInfo.service
    ? contextInfo.service.charAt(0).toUpperCase() + contextInfo.service.slice(1) + 's'
    : 'artisans'
  const villeName = contextInfo.ville || 'votre ville'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-3xl shadow-premium border border-sand-200 max-w-md w-full p-8 animate-scale-in-bounce outline-none max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-sand-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-primary-500" />
          </div>

          <h2
            id="exit-intent-title"
            className="font-heading text-xl sm:text-2xl font-bold text-charcoal-900 mb-2"
          >
            Avant de partir...
          </h2>
          <p className="text-charcoal-600 mb-6">
            Recevez 3 devis gratuits d&apos;artisans vérifiés près de chez vous — en 30 secondes, sans engagement
          </p>

          {/* What they lose */}
          <div className="bg-sand-50 rounded-2xl border border-sand-200 p-4 mb-6 text-left">
            <p className="text-xs font-heading font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
              Ce que vous allez manquer
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  <strong>3 devis gratuits</strong> de {serviceName} à {villeName}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  Artisans <strong>vérifiés et qualifiés</strong>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  Réponse <strong>sous 24 heures</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleResume}
            className="w-full bg-primary-400 hover:bg-primary-500 text-white font-heading font-bold text-base px-6 py-3.5 rounded-xl shadow-cta hover:shadow-cta-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            Obtenir mes devis gratuits
          </button>

          {/* Phone alternative */}
          <a
            href={PHONE_TEL}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 border-2 border-accent-200 bg-accent-50 text-accent-700 font-semibold px-6 py-3 rounded-xl hover:bg-accent-100 hover:border-accent-300 transition-all duration-200"
            aria-label="Appeler ServicesArtisans"
          >
            <Phone className="w-5 h-5" />
            Préférez appeler ? {PHONE_NUMBER}
          </a>

          <button
            type="button"
            onClick={close}
            className="mt-3 text-sm text-charcoal-400 hover:text-charcoal-600 transition-colors"
          >
            Non merci, je quitte la page
          </button>
        </div>
      </div>

      {/* Inline animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
