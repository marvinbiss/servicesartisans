import Link from 'next/link'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

export default function CommuneNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PageHeroH1 size="article" className="mb-4">
          Commune introuvable
        </PageHeroH1>
        <p className="text-charcoal-600 mb-8">
          Cette commune ne figure pas dans notre référentiel INSEE actuel. Essayez la liste
          départementale ou la recherche par grande ville.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/communes"
            className="bg-primary-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Toutes les communes
          </Link>
          <Link
            href="/villes"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-primary-700 border border-primary-300 bg-white hover:bg-primary-50 transition-colors"
          >
            Grandes villes
          </Link>
          <Link
            href="/departements"
            className="inline-flex items-center px-5 py-2.5 rounded-lg font-semibold text-charcoal-700 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Par département
          </Link>
        </div>
      </div>
    </div>
  )
}
