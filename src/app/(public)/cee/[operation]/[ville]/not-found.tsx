import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

// Bug Next.js 14.2 vercel/next.js#69103 — voir commentaire détaillé dans
// /services/[service]/[location]/not-found.tsx. Robots noindex/nofollow
// explicite pour neutraliser l'inheritance `robots: { index: true }` du
// layout racine quand ce composant est servi avec HTTP 200 par l'ISR.
export const metadata: Metadata = {
  title: 'Opération CEE indisponible pour cette ville',
  robots: { index: false, follow: false },
}

export default function CeeOperationVilleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PageHeroH1 size="article" className="mb-4">
          Opération CEE indisponible pour cette ville
        </PageHeroH1>
        <p className="text-charcoal-600 mb-8">
          Cette combinaison opération CEE / ville n&apos;est pas active actuellement. Consultez la
          fiche nationale de l&apos;opération ou explorez les autres aides éligibles.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/cee"
            className="bg-accent-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
          >
            Toutes les opérations CEE
          </Link>
          <Link
            href="/aides"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-accent-700 border border-accent-300 bg-white hover:bg-accent-50 transition-colors"
          >
            Aides rénovation 2026
          </Link>
          <Link
            href="/simulateur-aides-renovation"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-charcoal-700 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Simulateur d&apos;aides
          </Link>
        </div>
      </div>
    </div>
  )
}
