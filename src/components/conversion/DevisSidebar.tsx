'use client'

import { Shield, Clock, CheckCircle, Search, FileText, ChevronDown, Phone } from 'lucide-react'
import { PHONE_TEL, PHONE_NUMBER } from '@/lib/seo/config'
import { trackEvent } from '@/lib/analytics/tracking'

// ---------------------------------------------------------------------------
// Sidebar de réassurance pour les pages /devis (pattern Lemonade/Wise)
// Desktop: colonne droite sticky. Mobile: section dépliable.
// ---------------------------------------------------------------------------

interface DevisSidebarProps {
  /** Service name for contextual testimonial, e.g. "Plombier" */
  serviceName?: string
  /** Extra FAQ items to display */
  faqItems?: { question: string; answer: string }[]
  /** Show pricing badge */
  priceRange?: { min: number; max: number; unit: string }
}

const defaultFaq = [
  {
    question: 'Le service est-il vraiment gratuit ?',
    answer:
      'Oui, la demande de devis est 100 % gratuite et sans engagement. Vous ne payez rien pour recevoir les propositions des artisans.',
  },
  {
    question: 'Combien de devis vais-je recevoir ?',
    answer:
      "Vous recevez des devis personnalisés d'artisans disponibles dans votre zone. Le nombre dépend de la disponibilité locale.",
  },
  {
    question: 'En combien de temps suis-je contacté ?',
    answer:
      "Un conseiller vous rappelle rapidement. En cas d'urgence, précisez-le dans le formulaire.",
  },
]

export default function DevisSidebar({ serviceName, faqItems, priceRange }: DevisSidebarProps) {
  const faq = faqItems && faqItems.length > 0 ? faqItems.slice(0, 3) : defaultFaq

  return (
    <aside className="space-y-6">
      {/* ─── Process Timeline ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-soft">
        <h3 className="font-heading text-base font-bold text-charcoal-900 mb-5">
          Comment ça marche
        </h3>
        <div className="space-y-5">
          {[
            { icon: Search, step: '1', label: 'Décrivez votre projet', sub: '2 min' },
            { icon: FileText, step: '2', label: 'Recevez vos devis', sub: 'Sous 24 h' },
            { icon: CheckCircle, step: '3', label: 'Choisissez librement', sub: 'Sans engagement' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={item.step} className="flex items-start gap-3.5 relative">
                {/* Vertical connector line */}
                {i < 2 && (
                  <div className="absolute left-[15px] top-[32px] w-px h-[calc(100%+4px)] bg-sand-200" />
                )}
                <div className="relative z-10 w-[30px] h-[30px] bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{item.label}</p>
                  <p className="text-xs text-charcoal-400">{item.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Trust Badges ────────────────────────────────── */}
      <div className="bg-accent-50 rounded-2xl border border-accent-100 p-5">
        <div className="space-y-3">
          {[
            { icon: Shield, text: 'Artisans RGE certifiés' },
            { icon: Clock, text: '100 % gratuit et sans engagement' },
            { icon: CheckCircle, text: 'Réponse rapide' },
          ].map((badge) => {
            const Icon = badge.icon
            return (
              <div key={badge.text} className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-accent-600 flex-shrink-0" />
                <span className="text-sm text-accent-800 font-medium">{badge.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Phone CTA ────────────────────────────────────── */}
      <a
        href={PHONE_TEL}
        aria-label="Appeler ServicesArtisans"
        onClick={() => trackEvent('phone_click', { source: 'devis_sidebar', service: serviceName })}
        className="flex items-center justify-center gap-2.5 w-full bg-accent-500 hover:bg-accent-600 text-white rounded-xl py-3.5 px-4 font-semibold text-sm transition-colors shadow-soft"
      >
        <Phone className="w-5 h-5 text-white" />
        {PHONE_NUMBER}
      </a>

      {/* ─── Price Range (optional) ──────────────────────── */}
      {priceRange && (
        <div className="bg-secondary-50 rounded-lg border border-secondary-100 px-4 py-3 text-center">
          <p className="text-sm font-medium text-secondary-400">
            Budget moyen : {priceRange.min} – {priceRange.max} {priceRange.unit}
          </p>
        </div>
      )}

      {/* ─── Mini FAQ ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-soft">
        <h3 className="font-heading text-base font-bold text-charcoal-900 mb-4">
          Questions fréquentes
        </h3>
        <div className="space-y-2">
          {faq.map((item) => (
            <details key={item.question} className="group border-b border-sand-100 last:border-0">
              <summary className="flex items-center justify-between cursor-pointer py-3 text-left [&::-webkit-details-marker]:hidden">
                <span className="text-sm font-medium text-charcoal-800 pr-3">{item.question}</span>
                <ChevronDown className="w-4 h-4 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
              </summary>
              <div className="pb-3 text-xs text-charcoal-500 leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </aside>
  )
}
