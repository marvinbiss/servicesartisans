/**
 * SimpleView — variante 8 blocs du template service+ville.
 *
 * Pivot 2026-05-05 : la version "full" (page.tsx) empile ~48 composants pSEO
 * → fail HCU "scaled content" + INP/LCP catastrophique mobile + scroll attention
 * effondré au-delà du bloc 10. Cette variante (opt-in `?simple=1`) cible les
 * 8 blocs cardinaux issus de la synthèse 5-agents (marketplaces / FR / HCU /
 * CRO / mobile) :
 *
 *   1. Breadcrumb (signal nav + crumb schema déjà émis)
 *   2. ImmediateAnswerBlock (featured snippet bait — gated by data)
 *   3. ServiceLocationPageClient (hero + listing + map = atom de conversion)
 *   4. ReviewsDeptBlock (social proof — gated by reviewStats >= 3 reviews)
 *   5. CommuneContextBlock (contexte ville — gated par communeData : règle
 *      Aleyda "render gated by data uniqueness" — sur 40/40 top villes
 *      communeData = NULL, donc bloc disparaît plutôt que générique)
 *   6. FaqAndBlogSection (max 5 Q-R)
 *   7. MaillageInterneBlock (footer linking, PageRank sculpting)
 *   8. CTA finale Devis
 *
 * + Invisibles : JSON-LD, SearchRecorder, SpeakableAnswerBox, StickyMobileCTA,
 *   MicroConversions.
 *
 * Cardinal rules respectées :
 * - Above-fold = résultat (listing direct), pas de préambule SEO.
 * - 1 seul atome de conversion par section.
 * - Sticky bottom CTA mobile uniquement (StickyMobileCTA).
 * - Render gated by data uniqueness (Aleyda).
 *
 * @see docs (synthèse 5-agents 2026-05-05)
 */

import Link from 'next/link'
import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumb'
import ServiceLocationPageClient from '../PageClient'
import ImmediateAnswerBlock from '@/components/seo/ImmediateAnswerBlock'
import ReviewsDeptBlock from '@/components/seo/ReviewsDeptBlock'
import CommuneContextBlock from '@/components/seo/CommuneContextBlock'
import MaillageInterneBlock from '@/components/seo/MaillageInterneBlock'
import LocalProviderShowcase from '@/components/seo/LocalProviderShowcase'
import FaqAndBlogSection from './FaqAndBlogSection'
import MiniSimulateurInline from '@/components/conversion/MiniSimulateurInline'
import StickyMobileCTA from '@/components/conversion/StickyMobileCTA'
import SearchRecorder from '@/components/SearchRecorder'
import { SpeakableAnswerBox } from '@/components/SpeakableAnswerBox'
import { getCeeOpsForRgeService } from '@/lib/rge/service-guides-map'
import { buildDevisHref } from '@/lib/utils'
import type { Service, Location as LocationType, Provider } from '@/types'
import type { CommuneData } from '@/lib/data/commune-data'
import type { TradeContent } from '@/lib/data/trade-content'

const MicroConversions = dynamic(() => import('@/components/MicroConversions'), {
  loading: () => <div className="min-h-[80px]" aria-hidden="true" />,
})

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// Aleyda rule: bloc 5 (commune context) ne s'affiche que si on a au moins
// un champ riche (population, climat, prix m², revenu) — sinon on retombe
// sur des phrases génériques qui sont précisément ce que la synthèse
// "scaled content" qualifie de digital mulch.
function hasRichCommuneData(c: CommuneData | null): boolean {
  if (!c) return false
  return Boolean(
    c.population ||
    c.climat_zone ||
    c.prix_m2_moyen ||
    c.revenu_median ||
    c.altitude_moyenne ||
    c.temperature_moyenne_hiver
  )
}

interface SimpleViewProps {
  service: Service
  location: LocationType
  serviceSlug: string
  locationSlug: string
  providers: Provider[]
  totalProviderCount: number
  rgeProviderCount: number
  recentDevisCount: number
  rgeOnly: boolean
  h1Text: string
  combinedFaq: { question: string; answer: string }[]
  reviewStats: { avg_rating: number; review_count: number } | null
  topReviews: Array<{
    id: string
    rating: number
    comment: string | null
    created_at: string
    author_name: string | null
    provider_name: string
    provider_city: string | null
  }>
  communeData: CommuneData | null
  averageRating: number | null
  totalReviews: number | null
  jsonLdSchemas: Record<string, unknown>[]
  speakableSummary?: string
  trade: TradeContent | null
  pricingMultiplier: number
  /** True when service intent === 'renovation' — gates MiniSimulateurInline.
   *  Computed upstream via `shouldRenderRenovationBlocks(getServiceIntent(slug))`. */
  isRenovationIntent?: boolean
}

export default function SimpleView({
  service,
  location,
  serviceSlug,
  locationSlug,
  providers,
  totalProviderCount,
  rgeProviderCount,
  recentDevisCount,
  rgeOnly,
  h1Text,
  combinedFaq,
  reviewStats,
  topReviews,
  communeData,
  averageRating,
  totalReviews,
  jsonLdSchemas,
  speakableSummary,
  trade,
  pricingMultiplier,
  isRenovationIntent = false,
}: SimpleViewProps) {
  const showReviews = Boolean(
    reviewStats && reviewStats.review_count >= 3 && reviewStats.avg_rating > 0
  )
  const showCommuneCtx = hasRichCommuneData(communeData)
  const top5Faq = combinedFaq.slice(0, 5)
  const hasCEE = getCeeOpsForRgeService(serviceSlug).length > 0

  return (
    <>
      {/* JSON-LD — invisible, requis SEO */}
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      ))}

      {/* Bloc 1 — Breadcrumb */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { label: 'Services', href: '/services' },
              { label: service.name, href: `/services/${serviceSlug}` },
              { label: location.name },
            ]}
          />
        </div>
      </div>

      {/* SSR H1 — server-rendered pour Googlebot, sr-only car la barre sticky
          du PageClient affiche un duplicata visuel (downgradé en <p> pour
          éviter le bug "Multiple H1 tags"). */}
      <h1 className="sr-only">{h1Text}</h1>

      {/* JSON-LD LocalBusiness per provider (jsonLdOnly = pas de duplication
          visuelle avec le listing rendu par ServiceLocationPageClient). Donne
          à Google les signaux structurés top-3 artisans (rating + areaServed)
          sans empiler une seconde grille de cartes mobile. Funnel conversion
          injection 2026-05-22 — SimpleView était sans aucune surface
          LocalProviderShowcase. */}
      {providers.length > 0 && (
        <LocalProviderShowcase
          providers={providers.slice(0, 3)}
          serviceName={service.name}
          cityName={location.name}
          max={3}
          jsonLdOnly
        />
      )}

      {/* Bloc 2 — ImmediateAnswerBlock (featured snippet bait) */}
      <ImmediateAnswerBlock
        serviceName={service.name}
        villeName={location.name}
        trade={trade}
        minPrice={trade ? Math.round(trade.priceRange.min * pricingMultiplier) : undefined}
        maxPrice={trade ? Math.round(trade.priceRange.max * pricingMultiplier) : undefined}
        providerCount={totalProviderCount}
        averageRating={averageRating}
        totalReviews={totalReviews}
        variant="services"
      />

      {/* Bloc 3 — Listing (ServiceLocationPageClient = hero + listing + map) */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        providers={providers}
        h1Text={h1Text}
        totalCount={totalProviderCount}
        rgeCount={rgeProviderCount}
        serviceSlug={serviceSlug}
        locationSlug={locationSlug}
        recentDevisCount={recentDevisCount}
        rgeOnly={rgeOnly}
      />

      {/* SearchRecorder — invisible analytics (writes to localStorage) */}
      <SearchRecorder
        type="service-ville"
        label={`${service.name} à ${location.name}`}
        href={`/services/${serviceSlug}/${locationSlug}`}
      />

      {/* Speakable summary — capté par cssSelector .speakable-summary */}
      {speakableSummary && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SpeakableAnswerBox answer={speakableSummary} />
        </div>
      )}

      {/* Bloc 4 — Social proof (gated by data uniqueness) */}
      {showReviews && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ReviewsDeptBlock
            serviceSlug={serviceSlug}
            serviceName={service.name}
            departmentName={location.department_name || ''}
            stats={reviewStats}
            reviews={topReviews}
          />
        </section>
      )}

      {/* Funnel conversion — MiniSimulateurInline (gate intent renovation).
          Off-intent sur dépannage/urgence : aide MaPrimeRénov' = faux signal
          YMYL et dilue CTR. Funnel injection 2026-05-22 — SimpleView était
          sans surface simulateur, brûlait 95 % du trafic renovation. */}
      {isRenovationIntent && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
          <MiniSimulateurInline
            service={service.name.toLowerCase()}
            ville={location.name}
            source="services_slug_ville_simple"
            variant="inline"
          />
        </section>
      )}

      {/* Bloc 5 — Contexte commune (gated by hasRichCommuneData) */}
      {showCommuneCtx && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommuneContextBlock
            communeData={communeData}
            serviceName={service.name}
            villeName={location.name}
          />
        </section>
      )}

      {/* Bloc 6 — FAQ (5 questions max) */}
      {top5Faq.length > 0 && (
        <div className="speakable-faq">
          <FaqAndBlogSection
            combinedFaq={top5Faq}
            service={service}
            location={location}
            serviceSlug={serviceSlug}
          />
        </div>
      )}

      {/* Bloc 7 — Footer maillage (PageRank sculpting) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MaillageInterneBlock
          serviceSlug={serviceSlug}
          serviceName={service.name}
          villeSlug={locationSlug}
          villeName={location.name}
          departementSlug={location.department_code?.toLowerCase()}
          departementName={location.department_name}
          regionName={location.region_name}
          currentIntent="services"
          hasCEE={hasCEE}
        />
      </div>

      {/* Bloc 8 — CTA finale Devis */}
      <section className="py-16 bg-gradient-to-b from-sand-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-900 mb-3">
            Recevez vos devis gratuits {service.name.toLowerCase()} à {location.name}
          </h2>
          <p className="text-charcoal-600 mb-8 max-w-2xl mx-auto">
            Comparez les profils et choisissez parmi nos artisans RGE certifiés à {location.name}.
          </p>
          <Link
            href={buildDevisHref(serviceSlug, location.name)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] transition-all duration-200"
          >
            Obtenir mon devis gratuit
            <span aria-hidden="true" className="text-lg">
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Sticky CTA mobile + micro-conversions (invisible analytics) */}
      <StickyMobileCTA serviceSlug={serviceSlug} cityName={location.name} citySlug={locationSlug} />
      <MicroConversions
        pageType="service-ville"
        serviceSlug={serviceSlug}
        cityName={location.name}
      />
    </>
  )
}
