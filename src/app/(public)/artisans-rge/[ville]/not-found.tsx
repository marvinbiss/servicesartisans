import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

// Bug Next.js 14.2 vercel/next.js#69103 — voir commentaire détaillé dans
// /services/[service]/[location]/not-found.tsx. Robots noindex/nofollow
// explicite pour neutraliser l'inheritance `robots: { index: true }` du
// layout racine quand ce composant est servi avec HTTP 200 par l'ISR.
export const metadata: Metadata = {
  title: 'Ville inconnue dans la base ADEME',
  robots: { index: false, follow: false },
}

export default function ArtisansRgeVilleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PageHeroH1 size="article" className="mb-4">
          Ville inconnue dans la base ADEME
        </PageHeroH1>
        <p className="text-charcoal-600 mb-8">
          Cette ville n&apos;est pas référencée dans notre annuaire d&apos;artisans RGE. Recherchez
          une grande ville voisine ou consultez le vérificateur officiel.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/rge"
            className="bg-accent-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
          >
            Annuaire RGE national
          </Link>
          <Link
            href="/verifier-artisan"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-accent-700 border border-accent-300 bg-white hover:bg-accent-50 transition-colors"
          >
            Vérifier un artisan
          </Link>
          <Link
            href="/villes"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-charcoal-700 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Toutes les villes
          </Link>
        </div>
      </div>
    </div>
  )
}
