import Link from 'next/link'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

export default function ServiceLocationNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <PageHeroH1 size="article" className="mb-4">
          Page non trouvée
        </PageHeroH1>
        <p className="text-charcoal-500 mb-8">
          Cette combinaison service/ville n&apos;existe pas dans notre annuaire.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/services"
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Voir tous les services
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-primary-500 border border-sand-300 bg-white hover:bg-sand-50 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
