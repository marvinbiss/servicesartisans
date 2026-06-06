'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/tracking'
import { slugify } from '@/lib/utils'

interface CeeCtaProps {
  serviceSlug?: string
  ville?: string
  operationCode?: string
  variant?: 'inline' | 'hero' | 'sticky-bottom'
}

function buildCeeDevisHref(serviceSlug?: string, operationCode?: string, ville?: string): string {
  const params = new URLSearchParams()
  if (serviceSlug) params.set('service', serviceSlug)
  if (operationCode) params.set('operation', operationCode)
  // 2026-06-06 — la ville était reçue en prop mais jamais transmise au
  // formulaire /devis (qui consomme `?ville=` depuis 2026-05-07).
  if (ville) params.set('ville', slugify(ville))
  params.set('source', 'cee')
  const qs = params.toString()
  return `/devis${qs ? `?${qs}` : ''}`
}

export default function CeeCTA({
  serviceSlug,
  ville,
  operationCode,
  variant = 'inline',
}: CeeCtaProps) {
  const href = buildCeeDevisHref(serviceSlug, operationCode, ville)

  const handleClick = () => {
    trackEvent('cee_cta_clicked', {
      variant,
      serviceSlug: serviceSlug ?? null,
      operationCode: operationCode ?? null,
    })
  }

  if (variant === 'sticky-bottom') {
    return (
      <div
        role="complementary"
        aria-label="Aide CEE disponible"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-accent-700 border-t border-accent-600 px-4 py-3 shadow-lg"
      >
        <Link
          href={href}
          onClick={handleClick}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-accent-800 font-semibold text-sm hover:bg-accent-50 transition"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Prime CEE disponible — Estimez la vôtre
        </Link>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <section className="bg-gradient-to-r from-accent-50 to-accent-100/60 border-2 border-accent-200 rounded-2xl p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-accent-600 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-extrabold text-charcoal-900 mb-2">
              Estimez votre prime CEE gratuitement
            </h2>
            <p className="text-charcoal-600 leading-relaxed max-w-2xl">
              Recevez jusqu{"'"}à plusieurs milliers d{"'"}euros de primes énergie pour vos travaux
              de rénovation. Devis gratuit, sans engagement, auprès d{"'"}artisans RGE vérifiés.
              {ville ? (
                <>
                  {' '}
                  Artisans disponibles à <strong>{ville}</strong>.
                </>
              ) : null}
            </p>
          </div>
          <Link
            href={href}
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-600 text-white font-semibold shadow-lg hover:bg-accent-700 transition whitespace-nowrap"
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  // variant === 'inline' (default)
  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-50 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-1">
            Estimez votre prime CEE gratuitement
          </h3>
          <p className="text-sm text-charcoal-600 leading-relaxed mb-4">
            Comparez les devis d{"'"}artisans RGE certifiés et sécurisez votre prime énergie dès la
            signature.
            {ville ? (
              <>
                {' '}
                Professionnels disponibles à <strong>{ville}</strong>.
              </>
            ) : null}{' '}
            100 % gratuit, sans engagement.
          </p>
          <Link
            href={href}
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white font-semibold text-sm hover:bg-accent-700 transition"
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
