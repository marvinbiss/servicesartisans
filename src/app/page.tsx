import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/config'
import { PopularCitiesLinks, PopularServicesLinks, PopularServiceCityLinks, GeographicNavigation } from '@/components/InternalLinks'
import { GeographicSectionWrapper } from '@/components/home/GeographicSectionWrapper'
import { ClayHomePage } from '@/components/home/ClayHomePage'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { getSiteStats, getHomepageData, formatProviderCount } from '@/lib/data/stats'
import { getFAQSchema, getItemListSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import JsonLd from '@/components/JsonLd'
import { faqItems } from '@/lib/data/faq-data'
import { popularServices } from '@/lib/constants/navigation'
import dynamic from 'next/dynamic'

const SocialProofBanner = dynamic(() => import('@/components/SocialProofBanner'), { ssr: false })
const RecentSearches = dynamic(() => import('@/components/RecentSearches'), { ssr: false })

export const revalidate = 86400 // ISR : la homepage est revalidée toutes les 24h

export async function generateMetadata(): Promise<Metadata> {
  const { artisanCount: count } = await getSiteStats()
  const countStr = count > 0 ? `${formatProviderCount(count)}+` : 'Des milliers d\''
  const absoluteTitle = `Artisans de France — ${countStr} Pros Vérifiés | ServicesArtisans`
    const metaDescription = `Trouvez un artisan qualifié parmi ${countStr} professionnels vérifiés SIREN. Plombier, électricien, serrurier : 101 départements couverts. Devis gratuit.`
    return {
    title: { absolute: absoluteTitle },
    description: metaDescription,
    alternates: { canonical: SITE_URL },
    openGraph: {
      title: absoluteTitle,
      description: metaDescription,
      type: 'website',
      url: SITE_URL,
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Annuaire des artisans en France' }],
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
      </div>
    )
  }

  // JSON-LD structured data for homepage
  const websiteSchema = getWebsiteSchema()
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
  const aggregateRatingSchema = homepageData.reviewCount > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ServicesArtisans',
        url: SITE_URL,
        description: 'Annuaire d\'artisans en France',
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
      <JsonLd data={[websiteSchema, faqSchema, itemListSchema, aggregateRatingSchema]} />

      {/* Server-rendered H1 for SEO — visually hidden, ClayHomePage shows the visible version */}
      <h1 className="sr-only">
        L'annuaire des artisans qualifiés en France
      </h1>

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

      {/* ─── GEOGRAPHIC COVERAGE ──────────────────────────────── */}
      <section className="py-16 bg-sand-100">
        <div className="max-w-6xl mx-auto px-4">
          <GeographicSectionWrapper>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-400 rounded-full text-sm font-medium mb-5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
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

      {/* ─── EXPLORE INTENT HUBS ─────────────────────────────── */}
      <section className="py-10 bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="font-heading text-lg font-semibold text-charcoal-800 mb-4">Explorer</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/avis" className="inline-block px-4 py-2 text-sm font-medium text-charcoal-700 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors">Avis artisans</Link>
            <Link href="/tarifs" className="inline-block px-4 py-2 text-sm font-medium text-charcoal-700 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors">Tarifs artisans</Link>
            <Link href="/urgence" className="inline-block px-4 py-2 text-sm font-medium text-charcoal-700 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors">Urgence artisan</Link>
            <Link href="/blog" className="inline-block px-4 py-2 text-sm font-medium text-charcoal-700 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors">Blog</Link>
            <Link href="/problemes" className="inline-block px-4 py-2 text-sm font-medium text-charcoal-700 bg-sand-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-colors">Problèmes courants</Link>
          </div>
        </div>
      </section>

      {/* ─── RESOURCES & TOOLS ──────────────────────────────── */}
      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 tracking-tight">
              Ressources et outils
            </h2>
            <p className="text-charcoal-500 mt-2 text-sm max-w-lg mx-auto">
              Guides, comparatifs et outils pour préparer vos travaux
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Link href="/guides" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <span className="text-sm font-medium">Guides travaux</span>
            </Link>
            <Link href="/questions" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
              <span className="text-sm font-medium">Questions fréquentes</span>
            </Link>
            <Link href="/comparaison" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              <span className="text-sm font-medium">Comparatifs</span>
            </Link>
            <Link href="/barometre" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              <span className="text-sm font-medium">Baromètre prix</span>
            </Link>
            <Link href="/glossaire" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
              <span className="text-sm font-medium">Glossaire</span>
            </Link>
            <Link href="/normes" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              <span className="text-sm font-medium">Normes</span>
            </Link>
            <Link href="/calendrier-travaux" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              <span className="text-sm font-medium">Calendrier travaux</span>
            </Link>
            <Link href="/checklist-travaux" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm font-medium">Checklist travaux</span>
            </Link>
            <Link href="/avant-apres" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
              <span className="text-sm font-medium">Avant/Après</span>
            </Link>
            <Link href="/statistiques-artisans-france" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sand-50 hover:bg-primary-50 hover:text-primary-600 text-charcoal-700 transition-colors text-center group">
              <svg className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
              <span className="text-sm font-medium">Statistiques</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── POPULAR LINKS (SEO) ──────────────────────────────── */}
      <section className="py-16 bg-sand-50 border-t border-sand-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <PopularServicesLinks showTitle limit={8} />
            <PopularCitiesLinks showTitle limit={10} />
            <PopularServiceCityLinks showTitle limit={12} />
          </div>
        </div>
      </section>
    </div>
  )
}
