import { Metadata } from 'next'
import Link from 'next/link'
import { services, villes, departements, regions, getQuartiersByVille } from '@/lib/data/france'
import { SITE_URL } from '@/lib/seo/config'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { tradeContent } from '@/lib/data/trade-content'

export const metadata: Metadata = {
  title: 'Plan du site — ServicesArtisans',
  description: 'Plan du site complet de ServicesArtisans. Accédez à tous nos services, villes, départements et régions.',
  alternates: { canonical: `${SITE_URL}/plan-du-site` },
}

export default function PlanDuSitePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Plan du site', url: '/plan-du-site' },
  ])

  // Group cities by department for structured display
  const citiesByDept = departements
    .map(dept => ({
      dept,
      cities: villes.filter(v => v.departementCode === dept.code),
    }))
    .filter(g => g.cities.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb items={[{ label: 'Plan du site' }]} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">Plan du site</h1>
        <p className="text-gray-500 mb-10">
          Retrouvez l&apos;ensemble des pages de ServicesArtisans pour trouver votre artisan.
        </p>

        {/* Services */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Services ({services.length})
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {services.map(s => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 py-1"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Régions */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Régions ({regions.length})
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {regions.map(r => (
              <Link
                key={r.slug}
                href={`/regions/${r.slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 py-1"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Départements avec villes */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Départements et villes ({departements.length} départements, {villes.length} villes)
          </h2>
          <div className="space-y-6">
            {citiesByDept.map(({ dept, cities }) => (
              <div key={dept.code}>
                <h3 className="font-semibold text-gray-900 mb-2">
                  <Link href={`/departements/${dept.slug}`} className="hover:text-blue-600 transition-colors">
                    {dept.name} ({dept.code})
                  </Link>
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 ml-4">
                  {cities.slice(0, 15).map(c => (
                    <Link
                      key={c.slug}
                      href={`/villes/${c.slug}`}
                      className="text-sm text-gray-600 hover:text-blue-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {cities.length > 15 && (
                    <Link
                      href={`/departements/${dept.slug}`}
                      className="text-sm text-blue-600 font-medium"
                    >
                      +{cities.length - 15} villes
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services par ville (matrice) */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Services par ville
          </h2>
          <div className="space-y-6">
            {services.map(s => (
              <div key={s.slug}>
                <h3 className="font-semibold text-gray-900 mb-2">{s.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 ml-4">
                  {villes.slice(0, 20).map(v => (
                    <Link
                      key={`${s.slug}-${v.slug}`}
                      href={`/services/${s.slug}/${v.slug}`}
                      className="text-sm text-gray-600 hover:text-blue-600"
                    >
                      {s.name} à {v.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Urgences par service */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Urgences par service
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.keys(tradeContent).filter(slug => tradeContent[slug].emergencyInfo).map(slug => (
              <Link
                key={slug}
                href={`/urgence/${slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 py-1"
              >
                {tradeContent[slug].name} urgence
              </Link>
            ))}
          </div>
        </section>

        {/* Tarifs par service */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Tarifs par service ({Object.keys(tradeContent).length})
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.values(tradeContent).map(trade => (
              <Link
                key={trade.slug}
                href={`/tarifs-artisans/${trade.slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 py-1"
              >
                Tarifs {trade.name.toLowerCase()}
              </Link>
            ))}
          </div>
        </section>

        {/* Quartiers des grandes villes */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Quartiers des grandes villes
          </h2>
          <div className="space-y-6">
            {villes.slice(0, 20).map(v => {
              const quartiers = getQuartiersByVille(v.slug)
              if (quartiers.length === 0) return null
              return (
                <div key={v.slug}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Link href={`/villes/${v.slug}`} className="hover:text-blue-600 transition-colors">
                      {v.name}
                    </Link>
                    {' '}({quartiers.length} quartiers)
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 ml-4">
                    {quartiers.map(q => (
                      <Link
                        key={q.slug}
                        href={`/villes/${v.slug}/${q.slug}`}
                        className="text-sm text-gray-600 hover:text-blue-600"
                      >
                        {q.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Pages utiles */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-amber-500 pl-4">
            Pages utiles
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { href: '/a-propos', label: 'À propos' },
              { href: '/contact', label: 'Contact' },
              { href: '/faq', label: 'FAQ' },
              { href: '/comment-ca-marche', label: 'Comment ça marche' },
              { href: '/devis', label: 'Demander un devis' },
              { href: '/urgence', label: 'Urgence 24h/24' },
              { href: '/blog', label: 'Blog' },
              { href: '/tarifs-artisans', label: 'Tarifs artisans' },
              { href: '/recherche', label: 'Recherche' },
              { href: '/notre-processus-de-verification', label: 'Processus de vérification' },
              { href: '/mentions-legales', label: 'Mentions légales' },
              { href: '/confidentialite', label: 'Confidentialité' },
              { href: '/cgv', label: 'CGV' },
              { href: '/accessibilite', label: 'Accessibilité' },
              { href: '/mediation', label: 'Médiation' },
            ].map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="text-sm text-blue-600 hover:text-blue-800 py-1"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
