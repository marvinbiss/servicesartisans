import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getProvidersByServiceAndLocation } from '@/lib/supabase'
import ServiceLocationPageClient from '../PageClient'
import { getBreadcrumbSchema, getFAQSchema, getItemListSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { getArtisanUrl } from '@/lib/utils'
import { getServiceImageForContext } from '@/lib/data/images'
import {
  services as staticServicesList,
  getQuartierBySlug,
  getQuartiersByVille,
  getNearbyCities,
} from '@/lib/data/france'
import { getTradeContent } from '@/lib/data/trade-content'
import { getQuartierData } from '@/lib/data/quartier-data'
import {
  generateQuartierContent,
  hashCode,
  getRegionalMultiplier,
} from '@/lib/seo/location-content'
import { popularServices, relatedServices } from '@/lib/constants/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import { formatEuro } from '@/lib/data/commune-data'
import type { Service, Location as LocationType, Provider } from '@/types'

// Safely escape JSON for script tags to prevent XSS
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

interface ServiceQuartierPageProps {
  serviceSlug: string
  locationSlug: string
  quartierSlug: string
}

export default async function ServiceQuartierPage({
  serviceSlug,
  locationSlug,
  quartierSlug,
}: ServiceQuartierPageProps) {
  // 1. Resolve quartier (static data)
  const quartierData = getQuartierBySlug(locationSlug, quartierSlug)
  if (!quartierData) notFound()
  const { ville, quartierName } = quartierData

  // 1b. Enriched quartier data (real stats, description, risks, transport…)
  const quartierRealData = getQuartierData(locationSlug, quartierSlug)

  // 2. Resolve service (DB → static fallback)
  let service: Service
  try {
    const dbService = await getServiceBySlug(serviceSlug)
    if (dbService) {
      service = dbService
    } else {
      const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
      if (!staticSvc) notFound()
      service = {
        id: '',
        name: staticSvc.name,
        slug: staticSvc.slug,
        is_active: true,
        created_at: '',
      }
    }
  } catch {
    const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
    if (!staticSvc) notFound()
    service = {
      id: '',
      name: staticSvc.name,
      slug: staticSvc.slug,
      is_active: true,
      created_at: '',
    }
  }

  // 3. Fetch providers
  // STRICT RULE: Paris/Lyon/Marseille arrondissements show ONLY providers in that
  // exact arrondissement (filtered by address_postal_code). Other quartiers use the
  // city-level pool as before.
  const ARRONDISSEMENT_CITIES = ['paris', 'lyon', 'marseille']
  const arrondissementPostalCode =
    ARRONDISSEMENT_CITIES.includes(locationSlug) && quartierRealData?.codePostal
      ? quartierRealData.codePostal
      : undefined
  // Audit 2026-04-25 (agent #6 BLOCKER) : `throw on failure` ne profite plus
  // de stale ISR (Vercel logs Sentry post-mortem) → 500 brut. Fallback to []
  // pour laisser la page se rendre dégradée plutôt que 500.
  const providers = (await getProvidersByServiceAndLocation(serviceSlug, locationSlug, {
    postalCode: arrondissementPostalCode,
  }).catch(
    () => [] as Awaited<ReturnType<typeof getProvidersByServiceAndLocation>>
  )) as unknown as Provider[]

  // 4. Generate content
  const trade = getTradeContent(serviceSlug)
  const quartierContent = generateQuartierContent(ville, quartierName, serviceSlug)
  const pricingMultiplier = getRegionalMultiplier(ville.region, ville.departementCode)
  const svcLower = service.name.toLowerCase()

  // 5. JSON-LD schemas
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} à ${quartierName}, ${ville.name}`,
    description: `Trouvez des ${svcLower}s qualifiés dans le quartier ${quartierName} à ${ville.name}`,
    image: getServiceImageForContext(serviceSlug, `${locationSlug}-${quartierSlug}`).src,
    areaServed: {
      '@type': 'Place',
      name: `${quartierName}, ${ville.name}`,
      containedInPlace: {
        '@type': 'City',
        name: ville.name,
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: ville.departement,
        },
      },
    },
    provider: { '@id': `${SITE_URL}#organization` },
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.name, url: `/services/${serviceSlug}` },
    { name: ville.name, url: `/services/${serviceSlug}/${locationSlug}` },
    { name: quartierName, url: `/services/${serviceSlug}/${locationSlug}/${quartierSlug}` },
  ])

  // Combined FAQ: 2 trade FAQ (hash-selected) + 3 quartier FAQ
  const combinedFaq: { question: string; answer: string }[] = []
  if (trade && trade.faq.length > 0) {
    const tradeFaqHash = Math.abs(
      hashCode(`trade-faq-${serviceSlug}-${locationSlug}-${quartierSlug}`)
    )
    const idx1 = tradeFaqHash % trade.faq.length
    const idx2 = (tradeFaqHash + 3) % trade.faq.length
    combinedFaq.push({ question: trade.faq[idx1].q, answer: trade.faq[idx1].a })
    if (idx2 !== idx1) combinedFaq.push({ question: trade.faq[idx2].q, answer: trade.faq[idx2].a })
  }
  // Add quartier-specific FAQ (3 items max)
  combinedFaq.push(...quartierContent.faqItems.slice(0, 3))

  const faqSchema = combinedFaq.length > 0 ? getFAQSchema(combinedFaq) : null

  const itemListSchema =
    providers.length > 0
      ? getItemListSchema({
          name: `${service.name} à ${quartierName}, ${ville.name}`,
          description: `Liste des ${svcLower}s référencés à ${quartierName}, ${ville.name}`,
          url: `/services/${serviceSlug}/${locationSlug}/${quartierSlug}`,
          items: providers.slice(0, 20).map((p, i) => ({
            name: p.name,
            url: getArtisanUrl({
              stable_id: p.stable_id,
              slug: p.slug,
              specialty: p.specialty,
              city: p.address_city,
            }),
            position: i + 1,
            image: getServiceImageForContext(serviceSlug, `${locationSlug}-${quartierSlug}`).src,
            rating: p.rating_average ?? undefined,
            reviewCount: p.review_count ?? undefined,
          })),
        })
      : null

  const jsonLdSchemas: Record<string, unknown>[] = [
    serviceSchema,
    breadcrumbSchema,
    ...(faqSchema ? [faqSchema] : []),
    ...(itemListSchema ? [itemListSchema] : []),
  ]

  // 7. Varied H1
  const h1Hash = Math.abs(hashCode(`h1-sq-${serviceSlug}-${locationSlug}-${quartierSlug}`))
  const h1Templates = [
    `${service.name} RGE à ${quartierName}, ${ville.name}`,
    `${service.name} RGE — Quartier ${quartierName}, ${ville.name}`,
    `Trouvez un ${svcLower} RGE à ${quartierName} (${ville.name})`,
    `${service.name} à ${quartierName} : artisans RGE certifiés`,
    `${svcLower.charAt(0).toUpperCase() + svcLower.slice(1)}s RGE de confiance à ${quartierName}, ${ville.name}`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

  // 8. Location for PageClient
  const location: LocationType = {
    id: '',
    name: ville.name,
    slug: ville.slug,
    postal_code: ville.codePostal,
    region_name: ville.region,
    department_name: ville.departement,
    department_code: ville.departementCode,
    is_active: true,
    created_at: '',
  }

  // Other services for cross-linking — use related services map with fallback
  const relatedSlugs = relatedServices[serviceSlug] || []
  const otherServices =
    relatedSlugs.length > 0
      ? relatedSlugs
          .slice(0, 6)
          .map((slug) => {
            const svc = staticServicesList.find((s) => s.slug === slug)
            return svc ? { name: svc.name, slug: svc.slug } : null
          })
          .filter((s): s is NonNullable<typeof s> => s !== null)
      : popularServices.filter((s) => s.slug !== serviceSlug).slice(0, 6)
  const otherQuartiers = getQuartiersByVille(locationSlug)
    .filter((q) => q.slug !== quartierSlug)
    .slice(0, 10)
  const nearbyCities = getNearbyCities(locationSlug, 8)
  const { profile } = quartierContent

  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      ))}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Breadcrumb
            items={[
              { label: 'Services', href: '/services' },
              { label: service.name, href: `/services/${serviceSlug}` },
              { label: ville.name, href: `/services/${serviceSlug}/${locationSlug}` },
              { label: quartierName },
            ]}
          />
        </div>
      </div>

      {/* ─── QUARTIER IDENTITY CARD ────────────────────────── */}
      {quartierRealData && (
        <section className="bg-gradient-to-r from-primary-50 to-amber-50 border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-charcoal-700 leading-relaxed">{quartierRealData.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-medium">
                {quartierRealData.typeQuartier}
              </span>
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                {quartierRealData.epoque}
              </span>
              {quartierRealData.transport
                .filter((t) => t !== 'bus' && t !== 'aucun')
                .map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium"
                  >
                    {t.toUpperCase()}
                  </span>
                ))}
            </div>
            {quartierRealData.atout && (
              <p className="text-sm text-amber-700 font-medium mt-2">{quartierRealData.atout}</p>
            )}
          </div>
        </section>
      )}

      {/* Provider Listing (reuses the split-view PageClient from service×location) */}
      <ServiceLocationPageClient
        service={service}
        location={location}
        providers={providers}
        h1Text={h1Text}
      />

      {/* ─── QUARTIER-SPECIFIC SEO CONTENT ──────────────────── */}
      <section className="py-12 bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="border-l-4 border-amber-500 pl-4 !mt-0">
                {service.name} dans le quartier {quartierName} à {ville.name}
              </h2>
              <p>{quartierContent.intro}</p>

              <h3>Contexte du bâti à {quartierName}</h3>
              <p>{quartierContent.batimentContext}</p>
              <div className="not-prose grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-4">
                {quartierRealData ? (
                  <>
                    <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-sm font-bold text-amber-700">
                        {formatEuro(quartierRealData.prixM2)}/m²
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Prix m²</div>
                    </div>
                    <div className="text-center p-3 bg-primary-50 rounded-xl border border-primary-100">
                      <div className="text-sm font-bold text-primary-600">
                        {quartierRealData.loyerM2} €/m²
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Loyer m²</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-sm font-bold text-emerald-700">
                        {quartierRealData.tauxProprietaires}%
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Taux propriétaires</div>
                    </div>
                    <div className="text-center p-3 bg-violet-50 rounded-xl border border-violet-100">
                      <div className="text-sm font-bold text-violet-700">
                        {quartierRealData.populationEstimee.toLocaleString('fr-FR')}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Population quartier</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="text-sm font-bold text-orange-700">
                        DPE {quartierRealData.dpeMedian}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">DPE médian</div>
                    </div>
                    <div className="text-center p-3 bg-sand-50 rounded-xl border border-charcoal-100">
                      <div className="text-sm font-bold text-charcoal-700">
                        {quartierRealData.codePostal}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Code postal</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-sm font-bold text-amber-700">{profile.eraLabel}</div>
                      <div className="text-xs text-charcoal-500 mt-1">Type de bâti</div>
                    </div>
                    <div className="text-center p-3 bg-primary-50 rounded-xl border border-primary-100">
                      <div className="text-sm font-bold text-primary-600">
                        {profile.densityLabel}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Densité urbaine</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-sm font-bold text-emerald-700">{providers.length}</div>
                      <div className="text-xs text-charcoal-500 mt-1">
                        {svcLower}s à {ville.name}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-sand-50 rounded-xl border border-charcoal-100">
                      <div className="text-sm font-bold text-charcoal-700">
                        {ville.departementCode}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">{ville.departement}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Common issues relevant to this service */}
              {profile.commonIssues.length > 0 && (
                <>
                  <h3>
                    Problèmes fréquents à {quartierName} pour un {svcLower}
                  </h3>
                  <ul>
                    {profile.commonIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </>
              )}

              <h3>Services demandés à {quartierName}</h3>
              <p>{quartierContent.servicesDemandes}</p>

              <h3>Conseils pour vos travaux à {quartierName}</h3>
              <p>{quartierContent.conseils}</p>

              <p>{quartierContent.proximite}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DATA-DRIVEN SECTIONS ───────────────────────────── */}
      {quartierContent.dataDriven && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Immobilier */}
            {quartierContent.dataDriven.immobilierQuartier && (
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-100 p-8">
                <h2 className="text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-amber-500 pl-4">
                  Immobilier à {quartierName}, {ville.name}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {quartierContent.dataDriven.immobilierQuartier}
                </p>
                {quartierContent.dataDriven.statCards.prixM2Quartier > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                      <div className="text-lg font-bold text-amber-700">
                        {formatEuro(quartierContent.dataDriven.statCards.prixM2Quartier)}/m²
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">
                        Prix estimé {quartierName}
                      </div>
                    </div>
                    {quartierContent.dataDriven.statCards.artisansProximite > 0 && (
                      <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">
                          {quartierContent.dataDriven.statCards.artisansProximite}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Artisans à proximité</div>
                      </div>
                    )}
                    {quartierContent.dataDriven.statCards.artisansBtp > 0 && (
                      <div className="text-center p-3 bg-white rounded-xl border border-amber-100">
                        <div className="text-lg font-bold text-amber-700">
                          {quartierContent.dataDriven.statCards.artisansBtp}
                        </div>
                        <div className="text-xs text-charcoal-500 mt-1">Entreprises BTP</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Performance énergétique */}
            {quartierContent.dataDriven.statCards.passoiresDpe > 0 && (
              <div className="bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-2xl border border-orange-100 p-8">
                <h2 className="text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-orange-500 pl-4">
                  Performance énergétique à {quartierName}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  On estime que {quartierContent.dataDriven.statCards.passoiresDpe} % des logements
                  du quartier {quartierName} sont classés F ou G au DPE.
                  {quartierContent.dataDriven.statCards.passoiresDpe > 20
                    ? ` Ce taux élevé dans un quartier à ${profile.eraLabel.toLowerCase()} justifie des travaux de rénovation énergétique.`
                    : ` Ce taux reflète les caractéristiques constructives du bâti ${profile.eraLabel.toLowerCase()}.`}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-xl border border-orange-100">
                    <div className="text-lg font-bold text-orange-700">
                      {quartierContent.dataDriven.statCards.passoiresDpe}%
                    </div>
                    <div className="text-xs text-charcoal-500 mt-1">Passoires thermiques</div>
                  </div>
                  {quartierContent.dataDriven.statCards.joursGel !== null && (
                    <div className="text-center p-3 bg-white rounded-xl border border-orange-100">
                      <div className="text-lg font-bold text-orange-700">
                        {quartierContent.dataDriven.statCards.joursGel}
                      </div>
                      <div className="text-xs text-charcoal-500 mt-1">Jours de gel/an</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Climat */}
            {quartierContent.dataDriven.climatQuartier && (
              <div className="bg-gradient-to-br from-sky-50/50 to-cyan-50/30 rounded-2xl border border-sky-100 p-8">
                <h2 className="text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-sky-500 pl-4">
                  Climat et saisonnalité à {quartierName}
                </h2>
                <p className="text-charcoal-700 leading-relaxed">
                  {quartierContent.dataDriven.climatQuartier}
                </p>
              </div>
            )}

            {/* ─── RISQUES NATURELS (from quartierRealData) ──── */}
            {quartierRealData?.risques && quartierRealData.risques.length > 0 && (
              <div className="bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-2xl border border-red-100 p-8">
                <h2 className="text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-red-500 pl-4">
                  Risques naturels à {quartierName}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {quartierRealData.risques.map((risque) => (
                    <div
                      key={risque}
                      className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-red-100"
                    >
                      <span className="text-red-500">&#9888;</span>
                      <span className="text-sm font-medium text-charcoal-700 capitalize">
                        {risque}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-charcoal-600 mt-4">
                  Ces risques naturels identifiés à {quartierName} ({ville.name}) peuvent impacter
                  les travaux et l'entretien de votre logement. Un {svcLower} expérimenté saura
                  adapter ses interventions en conséquence.
                </p>
              </div>
            )}

            {/* ─── TRANSPORTS (from quartierRealData) ────────── */}
            {quartierRealData?.transport &&
              quartierRealData.transport.length > 0 &&
              quartierRealData.transport[0] !== 'aucun' && (
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-2xl border border-emerald-100 p-8">
                  <h2 className="text-xl font-bold text-charcoal-900 mb-4 border-l-4 border-emerald-500 pl-4">
                    Transports à {quartierName}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {quartierRealData.transport.map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-100"
                      >
                        <span className="text-sm font-medium text-charcoal-700">
                          {t === 'metro'
                            ? '🚇 Métro'
                            : t === 'tram'
                              ? '🚊 Tramway'
                              : t === 'rer'
                                ? '🚈 RER'
                                : t === 'bus'
                                  ? '🚌 Bus'
                                  : t === 'gare'
                                    ? '🚂 Gare'
                                    : t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </section>
      )}

      {/* ─── TRADE PRICING ──────────────────────────────────── */}
      {trade && (
        <section className="py-12 bg-sand-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
              <h2 className="text-xl font-bold text-charcoal-900 mb-1 border-l-4 border-amber-500 pl-4">
                Tarifs {svcLower} à {quartierName}, {ville.name}
              </h2>
              <p className="text-charcoal-600 mb-6 text-sm pl-[calc(1rem+4px)]">
                Tarif horaire moyen :{' '}
                <strong className="text-charcoal-900">
                  {Math.round(trade.priceRange.min * pricingMultiplier)}–
                  {Math.round(trade.priceRange.max * pricingMultiplier)} {trade.priceRange.unit}
                </strong>
                .{pricingMultiplier !== 1.0 && ` Tarifs ajustés pour la zone de ${ville.name}.`}
                {pricingMultiplier === 1.0 &&
                  ` Les prix à ${quartierName} peuvent varier selon la complexité des travaux.`}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {trade.commonTasks.slice(0, 6).map((task, i) => {
                  const [label, price] = task.split(' : ')
                  const adjustedPrice =
                    price && pricingMultiplier !== 1.0
                      ? price.replace(/\d[\d\s]*/g, (m) => {
                          const n = parseInt(m.replace(/\s/g, ''), 10)
                          return isNaN(n) ? m : String(Math.round(n * pricingMultiplier))
                        })
                      : price
                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-3 p-3 bg-sand-50 rounded-xl text-sm border border-sand-200"
                    >
                      <span className="text-charcoal-700">{label}</span>
                      {adjustedPrice && (
                        <span className="font-semibold text-amber-700 whitespace-nowrap">
                          {adjustedPrice}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {trade.emergencyInfo && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-800">
                    <strong>
                      Urgence {svcLower} à {quartierName} :
                    </strong>{' '}
                    {trade.averageResponseTime}
                  </p>
                </div>
              )}
              <p className="text-xs text-charcoal-400 mt-4">
                Les tarifs affichés sont indicatifs et basés sur les moyennes du marché en{' '}
                {ville.region} pour un {svcLower} à {quartierName}, {ville.name}.
              </p>
              <Link
                href={`/tarifs/${serviceSlug}`}
                className="inline-flex items-center gap-2 mt-6 text-primary-500 hover:text-primary-800 text-sm font-medium group"
              >
                Voir tous les tarifs {svcLower} en France
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CERTIFICATIONS & TIPS ──────────────────────────── */}
      {trade && (
        <section className="py-12 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-charcoal-900 mb-1 border-l-4 border-amber-500 pl-4">
              Choisir un {svcLower} à {quartierName}
            </h2>
            <div className="mt-6 space-y-4">
              {trade.certifications.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <h3 className="font-semibold text-emerald-900 mb-2">
                    Certifications recommandées
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trade.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="text-sm bg-white text-emerald-700 px-3 py-1 rounded-full border border-emerald-200"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {trade.tips.length > 0 &&
                (() => {
                  const tipHash = hashCode(`tips-sq-${serviceSlug}-${locationSlug}-${quartierSlug}`)
                  const tipCount = trade.tips.length
                  const selectedTips = Array.from(
                    { length: Math.min(3, tipCount) },
                    (_, i) => trade.tips[(tipHash + i) % tipCount]
                  )
                  return (
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                      <h3 className="font-semibold text-primary-800 mb-2">
                        Conseils pour {quartierName}
                      </h3>
                      <ul className="space-y-1">
                        {selectedTips.map((tip, i) => (
                          <li key={i} className="text-sm text-primary-800 flex items-start gap-2">
                            <span className="text-primary-300 mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })()}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ ────────────────────────────────────────────── */}
      {combinedFaq.length > 0 && (
        <section className="py-12 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
              <h2 className="text-xl font-bold text-charcoal-900 mb-6 border-l-4 border-amber-500 pl-4">
                Questions fréquentes — {svcLower} à {quartierName}, {ville.name}
              </h2>
              <div className="space-y-3">
                {combinedFaq.map((item, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group bg-sand-50 rounded-xl border border-sand-200 overflow-hidden transition-shadow duration-300 hover:shadow-sm"
                  >
                    <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-sand-100/80 transition-colors duration-200 [&::-webkit-details-marker]:hidden list-none">
                      <span className="font-semibold text-charcoal-900 pr-4">{item.question}</span>
                      <svg
                        className="w-5 h-5 text-amber-500 shrink-0 group-open:rotate-180 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="faq-answer px-6 pb-5 text-charcoal-600 leading-relaxed text-sm animate-fade-in">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <CrossIntentLinks
        service={serviceSlug}
        serviceName={service.name}
        ville={locationSlug}
        villeName={ville.name}
        currentIntent="services"
      />

      {/* ─── INTERNAL LINKS ─────────────────────────────────── */}
      <section className="py-12 bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back to city-level service page */}
          <Link
            href={`/services/${serviceSlug}/${locationSlug}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-200 rounded-xl text-sm font-medium text-charcoal-700 hover:text-primary-600 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Tous les {svcLower}s à {ville.name}
          </Link>

          {/* Other quartiers for this service */}
          {otherQuartiers.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">
                {service.name} dans d'autres quartiers de {ville.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherQuartiers.map((q) => (
                  <Link
                    key={q.slug}
                    href={`/services/${serviceSlug}/${locationSlug}/${q.slug}`}
                    className="text-sm bg-white text-primary-600 px-3 py-1.5 rounded-full border border-primary-100 hover:bg-primary-50 transition-colors"
                  >
                    {q.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Other services in this quartier */}
          {otherServices.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">
                Autres services à {quartierName}, {ville.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherServices.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}/${locationSlug}/${quartierSlug}`}
                    className="text-sm bg-white text-charcoal-700 px-3 py-1.5 rounded-full border border-sand-300 hover:bg-sand-50 transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Nearby cities */}
          {nearbyCities.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">
                {service.name} dans les villes proches
              </h3>
              <div className="flex flex-wrap gap-2">
                {nearbyCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/services/${serviceSlug}/${c.slug}`}
                    className="text-sm bg-white text-charcoal-700 px-3 py-1.5 rounded-full border border-sand-300 hover:bg-sand-50 transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── TRUST FOOTER ───────────────────────────────────── */}
      <section className="py-6 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-charcoal-400">
            Données vérifiées par SIREN/SIRET · Contenu mis à jour régulièrement · Sources : INSEE,
            ADEME, DVF
          </p>
        </div>
      </section>
    </>
  )
}
