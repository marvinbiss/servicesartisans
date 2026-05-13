'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SearchX, RotateCcw, ArrowRight, FileText } from 'lucide-react'
import { services } from '@/lib/data/france-light'
import { relatedServices } from '@/lib/constants/navigation'

type Props = {
  serviceSlug: string
  serviceName: string
  locationSlug: string
  locationName: string
  /** When true, the user landed on this state because filters wiped the list. */
  hasActiveFilters: boolean
  /** Pre-built devis href so we don't re-import buildDevisHref here. */
  devisHref: string
}

function findServiceLabel(slug: string): string | null {
  return services.find((s) => s.slug === slug)?.name ?? null
}

export function SmartEmptyState({
  serviceSlug,
  serviceName,
  locationSlug,
  locationName,
  hasActiveFilters,
  devisHref,
}: Props) {
  const router = useRouter()
  const related = (relatedServices[serviceSlug] ?? []).slice(0, 4)

  const resetFilters = useCallback(() => {
    router.replace(typeof window !== 'undefined' ? window.location.pathname : '', {
      scroll: false,
    })
  }, [router])

  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <div className="w-14 h-14 bg-sand-200 rounded-2xl flex items-center justify-center mb-4">
        <SearchX className="w-7 h-7 text-charcoal-400" aria-hidden="true" />
      </div>
      <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-1">
        {hasActiveFilters
          ? 'Aucun artisan ne correspond à ces filtres'
          : `Aucun ${serviceName.toLowerCase()} référencé à ${locationName}`}
      </h3>
      <p className="text-charcoal-500 text-sm max-w-sm mb-5">
        {hasActiveFilters
          ? 'Essayez de retirer un ou plusieurs filtres, ou explorez un métier proche.'
          : 'Demandez un devis — nous activons notre réseau et revenons vers vous sous 24-48h ouvrées.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 border-2 border-charcoal-300 text-charcoal-700 hover:bg-sand-100 font-semibold px-5 py-3 rounded-xl transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Réinitialiser les filtres
          </button>
        ) : null}
        <Link
          href={devisHref}
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl shadow-cta hover:shadow-cta-hover transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          Recevoir mes devis
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>

      {related.length > 0 && (
        <div className="w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-wide text-charcoal-400 mb-2">
            Métiers proches à {locationName}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {related.map((relSlug) => {
              const label = findServiceLabel(relSlug)
              if (!label) return null
              return (
                <Link
                  key={relSlug}
                  href={`/services/${relSlug}/${locationSlug}`}
                  className="inline-flex items-center px-3 py-1.5 bg-white hover:bg-primary-50 text-charcoal-800 hover:text-primary-700 text-xs font-medium rounded-full border border-sand-300 hover:border-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
