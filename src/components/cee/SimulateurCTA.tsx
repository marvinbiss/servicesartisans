'use client'

import Link from 'next/link'
import { Calculator, ArrowRight, Sparkles } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'

export type SimulateurCtaVariant = 'card' | 'banner' | 'inline' | 'sticky-bottom'

interface SimulateurCtaProps {
  serviceSlug?: string
  city?: string
  variant?: SimulateurCtaVariant
  className?: string
}

const SIMULATEUR_PATH = '/simulateur-aides-renovation'

function buildHref(serviceSlug?: string, city?: string): string {
  const params = new URLSearchParams()
  if (serviceSlug) params.set('service', serviceSlug)
  if (city) params.set('ville', city)
  params.set('source', 'cta')
  const qs = params.toString()
  return `${SIMULATEUR_PATH}${qs ? `?${qs}` : ''}`
}

export default function SimulateurCTA({
  serviceSlug,
  city,
  variant = 'card',
  className,
}: SimulateurCtaProps) {
  const href = buildHref(serviceSlug, city)

  const handleClick = () => {
    trackEvent('simulateur_cta_click', {
      variant,
      serviceSlug: serviceSlug ?? null,
      city: city ?? null,
    })
  }

  if (variant === 'sticky-bottom') {
    return (
      <div
        role="complementary"
        aria-label="Simulateur aides rénovation"
        className={[
          'fixed bottom-0 inset-x-0 z-40 md:hidden bg-accent-700 border-t border-accent-600 px-4 py-3 shadow-lg',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Link
          href={href}
          onClick={handleClick}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-accent-800 font-semibold text-sm hover:bg-accent-50 transition"
        >
          <Calculator className="w-4 h-4" aria-hidden="true" />
          Simuler mes aides rénovation
        </Link>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <section
        className={[
          'rounded-2xl border-2 border-accent-200 bg-gradient-to-r from-accent-50 to-accent-100/60 px-6 py-6 md:px-8 md:py-7',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-600 flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg md:text-xl font-bold text-charcoal-900 mb-1">
                Combien touchez-vous vraiment ? Simulez en 2 minutes
              </h3>
              <p className="text-sm md:text-base text-charcoal-600 leading-relaxed">
                MaPrimeRénov{"'"} + CEE + Coup de pouce + TVA réduite cumulés.
                {city ? (
                  <>
                    {' '}
                    Barèmes à jour pour <strong>{city}</strong>.
                  </>
                ) : null}{' '}
                Gratuit, sans engagement.
              </p>
            </div>
          </div>
          <Link
            href={href}
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent-600 text-white font-semibold shadow-md hover:bg-accent-700 transition whitespace-nowrap"
          >
            Simuler mes aides
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={[
          'inline-flex items-center gap-1.5 text-accent-700 font-semibold hover:text-accent-800 hover:underline underline-offset-4 transition',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Calculator className="w-4 h-4" aria-hidden="true" />
        Simuler toutes mes aides rénovation
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    )
  }

  // variant === 'card' (default, hero)
  return (
    <section
      className={[
        'rounded-2xl border-2 border-accent-200 bg-gradient-to-br from-accent-50 via-white to-accent-50/40 p-6 md:p-8',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-xl md:text-2xl font-extrabold text-charcoal-900 mb-2">
            Estimez toutes vos aides rénovation gratuitement
          </h2>
          <p className="text-charcoal-600 leading-relaxed">
            MaPrimeRénov{"'"}, CEE, Coup de pouce, TVA 5,5 %. Un seul simulateur, barèmes 2026 à
            jour, résultat détaillé en 2 minutes.
            {city ? (
              <>
                {' '}
                Plafonds et artisans RGE disponibles à <strong>{city}</strong>.
              </>
            ) : null}
          </p>
        </div>
      </div>
      <ul className="space-y-2 mb-6 text-sm text-charcoal-700">
        <li className="flex items-start gap-2">
          <span className="text-accent-600 font-bold mt-0.5">✓</span>
          <span>Cumul automatique des 4 aides nationales + locales</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent-600 font-bold mt-0.5">✓</span>
          <span>Reste à charge et mensualité éco-PTZ affichés</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-accent-600 font-bold mt-0.5">✓</span>
          <span>Sans création de compte, résultat immédiat</span>
        </li>
      </ul>
      <Link
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-600 text-white font-semibold shadow-lg hover:bg-accent-700 transition"
      >
        <Calculator className="w-5 h-5" aria-hidden="true" />
        Lancer la simulation
        <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
