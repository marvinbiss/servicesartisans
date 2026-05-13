import Link from 'next/link'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

export default function RgeServiceVilleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PageHeroH1 size="article" className="mb-4">
          Aucun artisan RGE pour cette combinaison
        </PageHeroH1>
        <p className="text-charcoal-600 mb-8">
          Cette combinaison service / ville n&apos;est pas couverte dans la base ADEME synchronisée.
          Essayez un service voisin ou une ville proche.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/rge"
            className="bg-accent-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-accent-700 transition-colors"
          >
            Annuaire RGE national
          </Link>
          <Link
            href="/aides/maprimerenov"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-accent-700 border border-accent-300 bg-white hover:bg-accent-50 transition-colors"
          >
            MaPrimeRénov&apos; 2026
          </Link>
          <Link
            href="/cee"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-charcoal-700 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Opérations CEE
          </Link>
        </div>
      </div>
    </div>
  )
}
