import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/config'
import { GeographicNavigation } from '@/components/InternalLinks'
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
            <Link href="/avis" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Avis artisans</Link>
            <Link href="/tarifs" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Tarifs artisans</Link>
            <Link href="/urgence" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Urgence artisan</Link>
            <Link href="/guides" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Guides travaux</Link>
            <Link href="/barometre" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Baromètre prix</Link>
            <Link href="/questions" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">FAQ</Link>
            <Link href="/blog" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-charcoal-700 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 transition-colors">Blog</Link>
          </div>
        </div>
      </section>

      {/* Popular links handled by site-wide Footer — no duplication needed */}
    </div>
  )
}
