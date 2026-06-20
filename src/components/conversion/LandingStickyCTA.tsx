'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * Barre CTA fixe mobile pour la landing d'acquisition.
 * Apparaît après le 1er scroll, ramène au formulaire (#lead-form).
 * Masquée quand le formulaire est déjà visible (évite la redondance).
 */
export function LandingStickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const form = document.getElementById('lead-form')

    // Cache la barre tant que le formulaire est à l'écran
    let formInView = true
    const observer = form
      ? new IntersectionObserver(
          ([entry]) => {
            formInView = entry?.isIntersecting ?? false
            setVisible(window.scrollY > 400 && !formInView)
          },
          { threshold: 0.2 },
        )
      : null
    if (form && observer) observer.observe(form)

    const onScroll = () => setVisible(window.scrollY > 400 && !formInView)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [])

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="m-3 rounded-2xl bg-white shadow-2xl ring-1 ring-charcoal-100 p-3 flex items-center gap-3">
        <div className="leading-tight">
          <div className="text-sm font-semibold text-charcoal-900">Inscription gratuite</div>
          <div className="text-xs text-charcoal-500">2 min · sans engagement</div>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="ml-auto flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Je veux des clients
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
