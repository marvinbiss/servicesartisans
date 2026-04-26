import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, MapPin, Award, ShieldCheck, Star } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_URL } from '@/lib/seo/config'
import { searchProvidersByName } from '@/lib/search/providers-search'
import { getArtisanUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

export const metadata: Metadata = {
  title: 'Résultats de recherche — Artisans',
  description: "Résultats de recherche par nom d'entreprise ou d'artisan sur ServicesArtisans.",
  alternates: { canonical: `${SITE_URL}/recherche/artisans` },
  // Page volatile dépendant d'une query user → ne pas indexer.
  robots: { index: false, follow: true },
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function ArtisanSearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const rawQuery = (params.q ?? '').trim()
  if (!rawQuery) {
    redirect('/recherche')
  }

  const page = Math.max(parseInt(params.page ?? '1', 10) || 1, 1)
  const offset = (page - 1) * PAGE_SIZE

  // Trick limit + 1 pour calculer hasMore proprement sans re-query.
  // Évite d'afficher "Page suivante" sur une page qui se trouve être pleine
  // mais qui n'a pas de successeur (audit UI 2026-04-26).
  const { results: resultsRaw, truncatedQuery } = await searchProvidersByName({
    query: rawQuery,
    limit: PAGE_SIZE + 1,
    offset,
  })
  const hasMore = resultsRaw.length > PAGE_SIZE
  const results = resultsRaw.slice(0, PAGE_SIZE)

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[
              { label: 'Recherche', href: '/recherche' },
              { label: `Résultats pour « ${truncatedQuery} »` },
            ]}
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-charcoal-900 via-primary-800 to-charcoal-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
            Résultats pour «&nbsp;{truncatedQuery}&nbsp;»
          </h1>
          <p className="text-primary-100/80">
            {results.length === 0
              ? 'Aucun artisan trouvé.'
              : `${results.length} artisan${results.length > 1 ? 's' : ''} trouvé${results.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {results.length === 0 ? (
          <NoResults query={truncatedQuery} />
        ) : (
          <>
            <ul className="space-y-4">
              {results.map((r) => {
                const url = getArtisanUrl({
                  stable_id: r.stable_id,
                  slug: r.slug,
                  specialty: r.specialty,
                  city: r.address_city,
                })
                if (!url) return null
                return (
                  <li
                    key={r.id}
                    className="bg-white rounded-xl border border-sand-300 p-5 hover:shadow-md hover:border-primary-300 transition-all"
                  >
                    <Link href={url} className="block">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="font-heading text-lg font-semibold text-charcoal-900 truncate">
                            {r.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-charcoal-500">
                            {r.specialty && <span className="capitalize">{r.specialty}</span>}
                            {r.address_city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {r.address_city}
                                {r.address_region ? ` · ${r.address_region}` : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {r.is_verified && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                Vérifié
                              </span>
                            )}
                            {r.claimed_at && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                                Fiche revendiquée
                              </span>
                            )}
                            {Array.isArray(r.rge_qualifications) &&
                              r.rge_qualifications.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  <Award className="w-3 h-3" />
                                  RGE
                                </span>
                              )}
                            {r.rating_average !== null && (r.review_count ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-charcoal-700 bg-sand-100 px-2 py-0.5 rounded-full">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                {Number(r.rating_average).toFixed(1)} ({r.review_count})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Link
                  href={`/recherche/artisans?q=${encodeURIComponent(truncatedQuery)}&page=${page + 1}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-colors"
                >
                  Page suivante
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="bg-white rounded-xl border border-sand-300 p-10 text-center">
      <Search className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
      <h2 className="font-heading text-xl font-semibold text-charcoal-900 mb-2">
        Aucun artisan trouvé pour «&nbsp;{query}&nbsp;»
      </h2>
      <p className="text-charcoal-500 mb-6 max-w-md mx-auto">
        Essayez de chercher par métier (plombier, électricien, couvreur…) et ville, ou consultez
        l&apos;annuaire complet.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/recherche"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-colors"
        >
          Recherche par métier + ville
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-sand-50 text-charcoal-700 border border-sand-300 rounded-full font-medium transition-colors"
        >
          Tous les services
        </Link>
      </div>
    </div>
  )
}
