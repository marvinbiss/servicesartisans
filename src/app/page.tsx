import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { GeographicNavigation } from '@/components/InternalLinks'
import { GeographicSectionWrapper } from '@/components/home/GeographicSectionWrapper'
import { ClayHomePage } from '@/components/home/ClayHomePage'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { getSiteStats, getHomepageData, formatProviderCount } from '@/lib/data/stats'
import { getFAQSchema, getItemListSchema } from '@/lib/seo/jsonld'
import JsonLd from '@/components/JsonLd'
import { faqItems } from '@/lib/data/faq-data'
import { popularServices } from '@/lib/constants/navigation'
import { TOP_SERVICES, TOP_CITIES } from '@/lib/seo/top-pages'
import TrustBar from '@/components/conversion/TrustBar'
import SimulateurCTA from '@/components/cee/SimulateurCTA'
import dynamic from 'next/dynamic'

const SocialProofBanner = dynamic(() => import('@/components/SocialProofBanner'), { ssr: false })
const RecentSearches = dynamic(() => import('@/components/RecentSearches'), { ssr: false })
const StickyMobileCTA = dynamic(() => import('@/components/conversion/StickyMobileCTA'), {
  ssr: false,
})
const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentModal'), {
  ssr: false,
})

export const revalidate = 86400 // ISR : la homepage est revalidée toutes les 24h

export async function generateMetadata(): Promise<Metadata> {
  const { artisanCount: count } = await getSiteStats()
  const countStr = count > 0 ? `${formatProviderCount(count)}+` : "Des milliers d'"
  const absoluteTitle = `Artisans de France — ${countStr} Pros Vérifiés`
  const metaDescription = `Trouvez un artisan qualifié parmi ${countStr} professionnels vérifiés SIREN. Plombier, électricien, serrurier : 101 départements couverts. Devis gratuit.`
  return {
    title: { absolute: absoluteTitle },
    description: metaDescription,
    alternates: getAlternates('/'),
    openGraph: {
      title: absoluteTitle,
      description: metaDescription,
      type: 'website',
      url: SITE_URL,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'ServicesArtisans — Annuaire des artisans en France',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: absoluteTitle,
      description: metaDescription,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function HomePage() {
  const [cmsPage, homepageData] = await Promise.all([
    getPageContent('homepage', 'homepage'),
    getHomepageData(),
  ])

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen">
        <h1 className="sr-only">
          {cmsPage.title || "L'annuaire des artisans qualifiés en France"}
        </h1>
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <CmsContent html={cmsPage.content_html} />
          </div>
        </section>
        <StickyMobileCTA ctaText="Devis gratuit en 30s" />
        <ExitIntentPopup />
      </div>
    )
  }

  // JSON-LD structured data for homepage (WebSite already emitted by root layout)
  const faqSchema = getFAQSchema(faqItems)
  const itemListSchema = getItemListSchema({
    name: 'Services artisans populaires en France',
    description: 'Les métiers du bâtiment les plus recherchés sur ServicesArtisans',
    url: '/services',
    items: popularServices.map((s, i) => ({
      name: s.name,
      url: `/services/${s.slug}`,
      position: i + 1,
    })),
  })
  const aggregateRatingSchema =
    homepageData.reviewCount > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'ServicesArtisans',
          url: SITE_URL,
          description: "Annuaire d'artisans en France",
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: homepageData.avgRating,
            reviewCount: homepageData.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null

  return (
    <div className="min-h-screen">
      {/* Homepage-specific JSON-LD: WebSite + FAQ + ItemList + AggregateRating */}
      <JsonLd data={[faqSchema, itemListSchema, aggregateRatingSchema]} />

      {/* Server-rendered H1 for SEO — visually hidden, ClayHomePage shows the visible version */}
      <h1 className="sr-only">L'annuaire des artisans qualifiés en France</h1>

      {/* ─── TRUST BAR — indicateurs clés (artisans, avis, SIREN, départements) ─── */}
      <TrustBar />

      {/* ─── CLAY HOMEPAGE DESIGN ─────────────────────────────── */}
      <ClayHomePage
        stats={homepageData}
        serviceCounts={homepageData.serviceCounts}
        topProviders={homepageData.topProviders}
        recentReviews={homepageData.recentReviews}
      />

      {/* ─── RECENT SEARCHES (personalization) ─────────────── */}
      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <RecentSearches />
        </div>
      </section>

      {/* ─── SOCIAL PROOF ────────────────────────────────────── */}
      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <SocialProofBanner variant="card" />
        </div>
      </section>

      {/* ─── SIMULATEUR AIDES RÉNOVATION (MASTER-PLAN-00 Sprint 1 — ICE 648)
          Surfacer le simulateur officiel en homepage : amplifie la conversion
          sur le trafic pSEO (villes/services) et capte l'intent "aides
          rénovation énergétique" directement dès l'entrée. */}
      <section className="py-10 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4">
          <SimulateurCTA variant="banner" />
        </div>
      </section>

      {/* ─── SERVICE × CITY MATRIX (60 money page links) ─────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-400 rounded-full text-sm font-medium mb-5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              Recherche rapide
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-2 tracking-tight">
              Trouvez un artisan près de chez vous
            </h2>
            <p className="text-charcoal-500 max-w-lg mx-auto">
              Accédez directement aux artisans les plus demandés dans les grandes villes de France
            </p>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-charcoal-500 font-medium text-xs uppercase tracking-wider border-b border-sand-200">
                    Métier
                  </th>
                  {TOP_CITIES.slice(0, 6).map((city) => (
                    <th
                      key={city.slug}
                      className="text-center py-3 px-2 text-charcoal-500 font-medium text-xs uppercase tracking-wider border-b border-sand-200"
                    >
                      {city.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP_SERVICES.map((service, si) => (
                  <tr key={service.slug} className={si % 2 === 0 ? 'bg-sand-50/50' : ''}>
                    <td className="py-2.5 px-3 font-medium text-charcoal-800 whitespace-nowrap border-b border-sand-100">
                      {service.name}
                    </td>
                    {TOP_CITIES.slice(0, 6).map((city, ci) => (
                      <td
                        key={city.slug}
                        className="py-2.5 px-2 text-center border-b border-sand-100"
                      >
                        <Link
                          href={`/services/${service.slug}/${city.slug}`}
                          className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        >
                          {ci % 3 === 0
                            ? `${service.name} ${city.name}`
                            : ci % 3 === 1
                              ? `à ${city.name}`
                              : city.name}
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── TARIFS POPULAIRES (18 money page links) ──────────── */}
      <section className="py-12 bg-sand-50 border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 tracking-tight">
              Tarifs artisans par ville
            </h2>
            <p className="text-charcoal-500 mt-2 text-sm max-w-lg mx-auto">
              Consultez les grilles tarifaires des métiers les plus demandés
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {TOP_SERVICES.slice(0, 6).map((service) =>
              TOP_CITIES.slice(0, 3).map((city) => (
                <Link
                  key={`tarif-${service.slug}-${city.slug}`}
                  href={`/tarifs/${service.slug}/${city.slug}`}
                  className="flex items-center justify-center px-3 py-2.5 text-sm text-charcoal-700 bg-white hover:bg-primary-50 hover:text-primary-600 rounded-xl border border-sand-200 transition-colors text-center"
                >
                  Tarif {service.name.toLowerCase()} {city.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── GEOGRAPHIC COVERAGE ──────────────────────────────── */}
      <section className="py-16 bg-sand-100">
        <div className="max-w-6xl mx-auto px-4">
          <GeographicSectionWrapper>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-400 rounded-full text-sm font-medium mb-5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                Couverture nationale
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-2 text-center tracking-tight">
                Artisans partout en France
              </h2>
              <p className="text-charcoal-500 text-center max-w-lg mx-auto">
                Trouvez des professionnels dans votre région, département ou ville.
              </p>
            </div>
            <GeographicNavigation />
          </GeographicSectionWrapper>
        </div>
      </section>

      {/* ─── EXPLORE & RESOURCES (merged) ─────────────────────── */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 tracking-tight">
              Explorer et préparer vos travaux
            </h2>
            <p className="text-charcoal-500 mt-2 text-sm max-w-lg mx-auto">
              Guides, tarifs, avis et outils pour bien choisir votre artisan
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/avis"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Avis artisans
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Tarifs artisans
            </Link>
            <Link
              href="/urgence"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Urgence artisan
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Guides travaux
            </Link>
            <Link
              href="/barometre"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Baromètre prix
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/carte-artisans"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Carte des artisans
            </Link>
            <Link
              href="/avant-apres"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Avant / Après
            </Link>
            <Link
              href="/badge-artisan"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors"
            >
              Badge Artisan
            </Link>
          </div>
        </div>
      </section>

      {/* ─── RÉNOVATION ÉNERGÉTIQUE — CEE / RGE / ADEME ─────── */}
      <section className="py-16 bg-gradient-to-br from-emerald-700 via-emerald-800 to-charcoal-900 text-white border-t border-emerald-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-sm font-medium text-emerald-100 mb-5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Rénovation énergétique 2026
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2 tracking-tight">
              Jusqu'à 15&nbsp;000&nbsp;€ d'aides pour vos travaux
            </h2>
            <p className="text-emerald-100/90 max-w-2xl mx-auto">
              Primes CEE, MaPrimeRénov', artisans RGE qualifiés : tout ce qu'il faut savoir pour
              financer votre rénovation énergétique.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/cee"
              className="group p-5 bg-white/5 hover:bg-white/10 border border-emerald-400/20 hover:border-emerald-300/50 rounded-2xl backdrop-blur transition"
            >
              <div className="text-xs font-semibold text-emerald-300 mb-1">19 opérations</div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Primes CEE 2026</h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                PAC, isolation, poêle, chaudière biomasse… Montants classiques et précarité par
                opération.
              </p>
              <div className="mt-3 text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 inline-flex items-center gap-1">
                Voir le catalogue →
              </div>
            </Link>
            <Link
              href="/cee/guides"
              className="group p-5 bg-white/5 hover:bg-white/10 border border-emerald-400/20 hover:border-emerald-300/50 rounded-2xl backdrop-blur transition"
            >
              <div className="text-xs font-semibold text-emerald-300 mb-1">10 guides détaillés</div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">Guides primes CEE</h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Conditions techniques, cumul MaPrimeRénov' et pièges à éviter, opération par
                opération.
              </p>
              <div className="mt-3 text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 inline-flex items-center gap-1">
                Lire les guides →
              </div>
            </Link>
            <Link
              href="/rge"
              className="group p-5 bg-white/5 hover:bg-white/10 border border-emerald-400/20 hover:border-emerald-300/50 rounded-2xl backdrop-blur transition"
            >
              <div className="text-xs font-semibold text-emerald-300 mb-1">
                Source ADEME officielle
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">
                Annuaire artisans RGE
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV : artisans qualifiés par métier
                et par ville.
              </p>
              <div className="mt-3 text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 inline-flex items-center gap-1">
                Trouver un RGE →
              </div>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/rge/qualifications"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-100 border border-emerald-400/30 bg-emerald-800/30 hover:bg-emerald-800/50 rounded-full transition"
            >
              Qualifications RGE
            </Link>
            <Link
              href="/rge/sources"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-100 border border-emerald-400/30 bg-emerald-800/30 hover:bg-emerald-800/50 rounded-full transition"
            >
              Sources &amp; méthodologie
            </Link>
            <Link
              href="/ademe"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-100 border border-emerald-400/30 bg-emerald-800/30 hover:bg-emerald-800/50 rounded-full transition"
            >
              Données ADEME
            </Link>
          </div>
        </div>
      </section>

      {/* Popular links handled by site-wide Footer — no duplication needed */}

      {/* ─── CONVERSION BOOSTERS ───────────────────────────── */}
      <StickyMobileCTA ctaText="Devis gratuit en 30s" />
      <ExitIntentPopup />
    </div>
  )
}
