'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { X, FileText, Shield, Users, Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER, ADVISORS_COUNT } from '@/lib/seo/config'
import type { LegacyArtisan } from '@/types/legacy'
import { getDisplayName } from '@/components/artisan/types'
import { trackEvent } from '@/lib/analytics/tracking'
import { buildDevisHref } from '@/lib/utils'

// Clé unique pour les fiches artisans — ne bloque pas les exit intents des autres pages
const SESSION_KEY = 'sa:exit-artisan'
// Desktop : 15s minimum avant d'armer (visiteur qualifié)
const ARMING_DELAY_MS = 15_000
// Mobile : 90s d'inactivité (lecture longue = engagé, pas à interrompre)
const MOBILE_IDLE_MS = 90_000

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface ArtisanExitIntentProps {
  artisan: LegacyArtisan
  isClaimed?: boolean
}

export function ArtisanExitIntent({ artisan, isClaimed = false }: ArtisanExitIntentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const specialty = artisan.specialty || 'artisan'
  const city = artisan.city || ''
  const displayName = getDisplayName(artisan)
  const specialtyLower = specialty.toLowerCase()
  // 2026-06-06 — fix : l'ancien `/devis/[s]/[v]` (2 segments) n'existe plus
  // (301 → listing /services, ou 410 si specialty hors canon). buildDevisHref
  // pointe le formulaire /devis avec préfill query.
  const devisUrl = buildDevisHref(slugify(specialty), city)

  // Vérifier si déjà affiché cette session
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setHasTriggered(true)
      }
    } catch {
      // sessionStorage indisponible (mode privé / SSR) — on laisse hasTriggered false
    }
  }, [])

  const show = useCallback(() => {
    if (hasTriggered) return
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // sessionStorage indisponible — on continue le flow d'affichage
    }
    if (document.body.hasAttribute('data-estimation-open')) return

    setHasTriggered(true)
    setIsOpen(true)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // sessionStorage indisponible — pas de persistance, l'exit intent pourra se réafficher
    }

    trackEvent('exit_intent_shown', {
      source: 'artisan_page',
      isClaimed: String(isClaimed),
      specialty,
      city,
    })
  }, [hasTriggered, isClaimed, specialty, city])

  const close = useCallback(() => {
    setIsOpen(false)
    setTimeout(() => {
      previousFocusRef.current?.focus()
    }, 100)
  }, [])

  const handleDevisCTA = useCallback(() => {
    trackEvent('exit_intent_devis_click', {
      source: 'artisan_page',
      isClaimed: String(isClaimed),
      specialty,
      city,
    })
    close()
    window.location.href = devisUrl
  }, [close, isClaimed, specialty, city, devisUrl])

  // Desktop : mouseleave haut du viewport avec arming delay
  useEffect(() => {
    if (hasTriggered) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return

    let armed = false
    const armTimer = setTimeout(() => {
      armed = true
    }, ARMING_DELAY_MS)

    const handler = (e: MouseEvent) => {
      if (!armed) return
      if (e.clientY > 5) return
      show()
    }

    document.documentElement.addEventListener('mouseleave', handler)
    return () => {
      clearTimeout(armTimer)
      document.documentElement.removeEventListener('mouseleave', handler)
    }
  }, [hasTriggered, show])

  // Mobile : idle timer 90s, reset au scroll/touch
  useEffect(() => {
    if (hasTriggered) return
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
  }, [hasTriggered, show])

  // Focus trap, Escape, body scroll lock
  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement
    const timer = setTimeout(() => {
      modalRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        return
      }
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
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-skip-link flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
        style={{ animation: 'eiOverlayIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-3xl shadow-2xl border border-sand-200 max-w-md w-full p-8 outline-none max-h-[90vh] overflow-y-auto"
        style={{ animation: 'eiModalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={close}
          className="absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-sand-100 transition-colors flex items-center justify-center"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>

          {/* Titre contextuel */}
          <h2
            id="exit-intent-title"
            className="font-heading text-xl sm:text-2xl font-bold text-charcoal-900 mb-2 pr-6"
          >
            {isClaimed
              ? `Votre devis ${specialtyLower} vous attend`
              : 'Ne partez pas sans votre devis'}
          </h2>
          <p className="text-charcoal-600 mb-6">
            {isClaimed
              ? `${displayName} peut vous répondre rapidement`
              : `On vous trouve un ${specialtyLower} à ${city} — gratuit et sans engagement`}
          </p>

          {/* Loss aversion — ce que l'utilisateur perd en partant */}
          <div className="bg-sand-50 rounded-2xl border border-sand-200 p-4 mb-6 text-left">
            <p className="text-xs font-heading font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
              Ce que vous allez manquer
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  <strong>Devis gratuit</strong>
                  {city ? ` de ${specialtyLower}s à ${city}` : ` de ${specialtyLower}s`}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  <strong>
                    {ADVISORS_COUNT} {ADVISORS_COUNT === 1 ? 'conseiller' : 'conseillers'}
                  </strong>{' '}
                  à votre écoute
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span className="text-sm text-charcoal-700">
                  Artisans <strong>vérifiés SIRET</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* CTA principal — formulaire */}
          <button
            type="button"
            onClick={handleDevisCTA}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-heading font-bold text-base px-6 py-3.5 rounded-xl shadow-lg shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            Devis gratuit en 2 min
          </button>

          {/* CTA secondaire — téléphone (2 vrais conseillers) */}
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent('exit_intent_phone_click', {
                source: 'artisan_page',
                isClaimed: String(isClaimed),
                specialty,
                city,
              })
            }}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 border-2 border-accent-200 bg-accent-50 text-accent-700 font-semibold px-6 py-3 rounded-xl hover:bg-accent-100 hover:border-accent-300 transition-all duration-200"
            aria-label={`Appeler ServicesArtisans au ${PHONE_NUMBER}`}
          >
            <Phone className="w-5 h-5" />
            Parler à un conseiller · {PHONE_NUMBER}
          </a>

          {/* Dismiss explicite */}
          <button
            type="button"
            onClick={close}
            className="mt-4 text-sm text-charcoal-400 hover:text-charcoal-600 transition-colors"
          >
            Non merci, je continue ma visite
          </button>
        </div>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes eiOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes eiModalIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
