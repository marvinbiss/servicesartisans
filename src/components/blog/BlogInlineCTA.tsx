'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { trackEvent } from '@/lib/analytics/tracking'

const DevisBottomSheet = dynamic(() => import('@/components/conversion/DevisBottomSheet'), {
  ssr: false,
})

interface BlogInlineCTAProps {
  /** Service slug (e.g. "plombier") — pre-fills the devis form */
  service?: string
  /** Ville name — pre-fills the devis form */
  ville?: string
}

/**
 * CTA contextuel inséré après le contenu principal des articles de blog.
 * Redirige vers la page devis ou ouvre le DevisBottomSheet.
 */
export default function BlogInlineCTA({ service, ville }: BlogInlineCTAProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const devisHref = service ? `/devis/${service}` : '/devis'

  return (
    <>
      <div className="not-prose my-10 bg-amber-50 rounded-lg border-l-4 border-amber-400 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-charcoal-900 mb-1 flex items-center gap-2">
              <span aria-hidden="true" className="text-lg">
                💡
              </span>
              Besoin d&apos;un professionnel ?
            </p>
            <p className="text-sm text-charcoal-600">
              Devis gratuit et sans engagement d&apos;artisans vérifiés{ville ? ` à ${ville}` : ''}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={devisHref}
              onClick={() => {
                trackEvent('blog_cta_click', { service, ville })
              }}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm shadow-sm"
            >
              Obtenir 3 devis — 100% gratuit
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => {
                trackEvent('blog_cta_click', { service, ville })
                setSheetOpen(true)
              }}
              className="hidden sm:inline-flex items-center text-amber-700 hover:text-amber-900 text-sm font-medium underline underline-offset-2 transition-colors whitespace-nowrap"
            >
              Devis rapide
            </button>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <DevisBottomSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          prefilledService={service}
          prefilledCity={ville}
        />
      )}
    </>
  )
}
