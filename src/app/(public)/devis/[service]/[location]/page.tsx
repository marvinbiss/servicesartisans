import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle, Euro, ChevronDown, MapPin, Users, Thermometer, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities } from '@/lib/data/france'
import { getCommuneBySlug, formatNumber } from '@/lib/data/commune-data'
import { getServiceImage } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import DevisForm from '@/components/DevisForm'

// ---------------------------------------------------------------------------
// Static params: top 50 cities x 46 services = 2,300 pages
// ---------------------------------------------------------------------------

const tradeSlugs = getTradesSlugs()

function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

const top50Cities = [...villes]
  .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  .slice(0, 50)

export function generateStaticParams() {
  const params: { service: string; location: string }[] = []
  for (const service of tradeSlugs) {
    for (const ville of top50Cities) {
      params.push({ service, location: ville.slug })
    }
  }
  return params
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClimatLabel(zone: string | null): string {
  const labels: Record<string, string> = {
    oceanique: 'Climat oc\u00e9anique',
    'semi-oceanique': 'Climat semi-oc\u00e9anique',
    continental: 'Climat continental',
    mediterraneen: 'Climat m\u00e9diterran\u00e9en',
    montagnard: 'Climat montagnard',
  }
  return zone ? (labels[zone] ?? zone) : 'Climat temp\u00e9r\u00e9'
}

function getSeasonalTip(zone: string | null, serviceName: string): string {
  if (zone === 'mediterraneen') {
    return `\u00c0 noter : le climat m\u00e9diterran\u00e9en favorise les travaux ext\u00e9rieurs quasiment toute l\u2019ann\u00e9e. La demande de ${serviceName.toLowerCase()} peut \u00eatre plus forte en \u00e9t\u00e9 avec l\u2019afflux de r\u00e9sidents saisonniers.`
  }
  if (zone === 'montagnard') {
    return `En zone de montagne, les conditions hivernales peuvent limiter certains travaux ext\u00e9rieurs et augmenter les d\u00e9lais d\u2019intervention. Pr\u00e9voyez vos travaux de ${serviceName.toLowerCase()} en amont.`
  }
  if (zone === 'continental') {
    return `Avec un climat continental, les \u00e9carts de temp\u00e9rature sont importants. Les travaux de ${serviceName.toLowerCase()} li\u00e9s au chauffage et \u00e0 l\u2019isolation sont particuli\u00e8rement pertinents.`
  }
  if (zone === 'oceanique' || zone === 'semi-oceanique') {
    return `Le climat oc\u00e9anique implique une humidit\u00e9 fr\u00e9quente. Les interventions de ${serviceName.toLowerCase()} li\u00e9es \u00e0 l\u2019\u00e9tanch\u00e9it\u00e9 et \u00e0 la ventilation sont courantes.`
  }
  return `Les conditions climatiques locales peuvent influencer le type et la fr\u00e9quence des interventions de ${serviceName.toLowerCase()}.`
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string; location: string }>
}): Promise<Metadata> {
  const { service, location } = await params
  const trade = tradeContent[service]
  const villeData = getVilleBySlug(location)
  if (!trade || !villeData) return {}

  const tradeLower = trade.name.toLowerCase()
  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const titleHash = Math.abs(hashCode(`devis-loc-title-${service}-${location}`))
  const titleTemplates = [
    `Devis ${tradeLower} \u00e0 ${villeData.name} \u2014 Gratuit`,
    `Devis gratuit ${tradeLower} ${villeData.name} 2026`,
    `${trade.name} \u00e0 ${villeData.name} : devis gratuit`,
    `Devis ${tradeLower} ${villeData.name} \u2014 Comparez`,
  ]
  const title = titleTemplates[titleHash % titleTemplates.length]

  const description = `Devis ${tradeLower} \u00e0 ${villeData.name} : ${minPrice}\u2013${maxPrice} ${trade.priceRange.unit}. Comparez jusqu\u2019\u00e0 3 artisans r\u00e9f\u00e9renc\u00e9s. 100 % gratuit, sans engagement.`

  const serviceImage = getServiceImage(service)
  const canonicalUrl = `${SITE_URL}/devis/${service}/${location}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Devis ${trade.name} \u00e0 ${villeData.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function DevisServiceLocationPage({
  params,
}: {
  params: Promise<{ service: string; location: string }>
}) {
  const { service, location } = await params

  const trade = tradeContent[service]
  const villeData = getVilleBySlug(location)
  if (!trade || !villeData) notFound()

  const commune = await getCommuneBySlug(location)

  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(trade.priceRange.min * multiplier)
  const maxPrice = Math.round(trade.priceRange.max * multiplier)

  const tradeLower = trade.name.toLowerCase()

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Devis', url: '/devis' },
    { name: `Devis ${tradeLower}`, url: `/devis/${service}` },
    { name: villeData.name, url: `/devis/${service}/${location}` },
  ])

  const faqSchema = getFAQSchema(
    trade.faq.slice(0, 5).map((f) => ({
      question: f.q.replace(/\?$/, '') + ` \u00e0 ${villeData.name}\u00a0?`,
      answer: f.a,
    }))
  )

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Devis ${trade.name} \u00e0 ${villeData.name}`,
    description: `Demandez un devis gratuit pour ${tradeLower} \u00e0 ${villeData.name} (${villeData.departement}). Prix : ${minPrice}\u2013${maxPrice} ${trade.priceRange.unit}.`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'City',
      name: villeData.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: villeData.region,
      },
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: commune?.nb_entreprises_artisanales ?? undefined,
    },
  }

  // Related city links
  const nearbyCities = getNearbyCities(location, 6)

  // Related services
  const relatedSlugs = relatedServices[service] || []
  const otherTrades = relatedSlugs.length > 0
    ? relatedSlugs.slice(0, 6).filter((s) => tradeContent[s])
    : tradeSlugs.filter((s) => s !== service).slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema]} />

      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[
              { label: 'Devis', href: '/devis' },
              { label: `Devis ${tradeLower}`, href: `/devis/${service}` },
              { label: villeData.name },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]">
              {(() => {
                const h1Hash = Math.abs(hashCode(`devis-loc-h1-${service}-${location}`))
                const h1Templates = [
                  `Devis ${tradeLower} \u00e0 ${villeData.name}`,
                  `Obtenez un devis gratuit pour ${tradeLower} \u00e0 ${villeData.name}`,
                  `${trade.name} \u00e0 ${villeData.name} \u2014 Devis gratuit en 24h`,
                  `Devis ${tradeLower} : comparez les artisans \u00e0 ${villeData.name}`,
                  `${trade.name} \u00e0 ${villeData.name} : devis d\u00e9taill\u00e9 gratuit`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              Comparez jusqu&apos;\u00e0 3 devis de {tradeLower}s \u00e0 {villeData.name} ({villeData.departement}).
              Prix local : {minPrice} \u00e0 {maxPrice} {trade.priceRange.unit}.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-amber-400" />
                <span>{minPrice} \u2013 {maxPrice} {trade.priceRange.unit}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{villeData.name} ({villeData.departementCode})</span>
              </div>
              {commune?.nb_entreprises_artisanales && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{formatNumber(commune.nb_entreprises_artisanales)} artisans locaux</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DevisForm pre-filled */}
      <section id="formulaire" className="relative -mt-16 z-10 px-4 pb-20">
        <DevisForm
          prefilledService={service}
          prefilledCity={villeData.name}
          prefilledCityPostal={villeData.codePostal}
        />
      </section>

      {/* Common tasks grid with prices */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Tarif indicatif \u00e0 {villeData.name}
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-blue-600">
                {minPrice} \u2014 {maxPrice}
              </span>
              <span className="text-gray-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Prix moyen constat\u00e9 \u00e0 {villeData.name} et ses alentours, main-d&apos;\u0153uvre incluse
            </p>
            {multiplier !== 1.0 && (
              <p className="text-xs text-gray-400 mt-2">
                {multiplier > 1.0
                  ? `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((multiplier - 1) * 100)}\u00a0% sup\u00e9rieurs \u00e0 la moyenne nationale`
                  : `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((1 - multiplier) * 100)}\u00a0% inf\u00e9rieurs \u00e0 la moyenne nationale`}
              </p>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Prestations courantes \u00e0 {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.commonTasks.map((task, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl border border-gray-200 p-5 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-800">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local factors */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Facteurs locaux \u00e0 {villeData.name}
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Plusieurs facteurs locaux influencent le co\u00fbt d\u2019un {tradeLower} \u00e0 {villeData.name}.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <LocalFactorCard
              icon={<Euro className="w-5 h-5 text-blue-600" />}
              title="Pouvoir d'achat local"
              value={commune?.revenu_median ? `${formatNumber(commune.revenu_median)} \u20ac/an` : null}
              description={
                commune?.revenu_median
                  ? `Le revenu m\u00e9dian \u00e0 ${villeData.name} est de ${formatNumber(commune.revenu_median)}\u00a0\u20ac par an, ce qui influence le positionnement tarifaire des artisans locaux.`
                  : `Le pouvoir d\u2019achat local \u00e0 ${villeData.name} influence le niveau des tarifs pratiqu\u00e9s par les artisans.`
              }
            />
            <LocalFactorCard
              icon={<Users className="w-5 h-5 text-amber-600" />}
              title="Concurrence locale"
              value={commune?.nb_entreprises_artisanales ? `${formatNumber(commune.nb_entreprises_artisanales)} entreprises` : null}
              description={
                commune?.nb_entreprises_artisanales
                  ? commune.nb_entreprises_artisanales > 500
                    ? `Avec ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales, ${villeData.name} b\u00e9n\u00e9ficie d\u2019une forte concurrence, ce qui peut maintenir les prix comp\u00e9titifs.`
                    : `${villeData.name} compte ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales. Une concurrence mod\u00e9r\u00e9e peut impliquer des tarifs l\u00e9g\u00e8rement plus \u00e9lev\u00e9s.`
                  : `Le nombre d\u2019artisans disponibles \u00e0 ${villeData.name} influence directement les tarifs pratiqu\u00e9s.`
              }
            />
            <LocalFactorCard
              icon={<Thermometer className="w-5 h-5 text-green-600" />}
              title="Conditions climatiques"
              value={getClimatLabel(commune?.climat_zone ?? null)}
              description={getSeasonalTip(commune?.climat_zone ?? null, trade.name)}
            />
            <LocalFactorCard
              icon={<Building2 className="w-5 h-5 text-purple-600" />}
              title="Type de logement"
              value={commune?.part_maisons_pct ? `${commune.part_maisons_pct}\u00a0% de maisons` : null}
              description={
                commune?.part_maisons_pct
                  ? commune.part_maisons_pct > 50
                    ? `\u00c0 ${villeData.name}, ${commune.part_maisons_pct}\u00a0% des logements sont des maisons individuelles. Les interventions sur maisons (toiture, fa\u00e7ade, jardin) sont fr\u00e9quentes.`
                    : `\u00c0 ${villeData.name}, les appartements sont majoritaires (${100 - commune.part_maisons_pct}\u00a0%). Les travaux en copropri\u00e9t\u00e9 peuvent impliquer des contraintes sp\u00e9cifiques.`
                  : `La r\u00e9partition entre maisons et appartements \u00e0 ${villeData.name} influence les types de travaux demand\u00e9s.`
              }
            />
          </div>
        </div>
      </section>

      {/* Conseils */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower} \u00e0 {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions fr\u00e9quentes \u2014 Devis {trade.name} \u00e0 {villeData.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.slice(0, 5).map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-gray-900 pr-4">
                    {item.q.replace(/\?$/, '')} \u00e0 {villeData.name}&nbsp;?
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Trouver un {tradeLower} \u00e0 {villeData.name}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comparez les profils et obtenez un devis gratuit aupr\u00e8s de professionnels r\u00e9f\u00e9renc\u00e9s \u00e0 {villeData.name}.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#formulaire"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Demander un devis gratuit
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href={`/services/${service}/${location}`}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-lg border border-blue-400"
            >
              Voir les {tradeLower}s \u00e0 {villeData.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Devis {tradeLower} dans d&apos;autres villes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
            {nearbyCities.map((v) => (
              <Link
                key={v.slug}
                href={`/devis/${service}/${v.slug}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  Devis {tradeLower} \u00e0 {v.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Autres devis artisans \u00e0 {villeData.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              const m = getRegionalMultiplier(villeData.region)
              return (
                <Link
                  key={slug}
                  href={`/devis/${slug}/${location}`}
                  className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    Devis {t.name.toLowerCase()} \u00e0 {villeData.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(t.priceRange.min * m)} \u2014 {Math.round(t.priceRange.max * m)} {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Voir aussi */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link href={`/devis/${service}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                  Devis {tradeLower} en France
                </Link>
                <Link href={`/tarifs-artisans/${service}/${location}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                  Tarifs {tradeLower} \u00e0 {villeData.name}
                </Link>
                <Link href={`/services/${service}/${location}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                  {trade.name} \u00e0 {villeData.name}
                </Link>
                <Link href={`/services/${service}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                  {trade.name} \u2014 tous les artisans
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cette ville</h3>
              <div className="space-y-2">
                <Link href={`/villes/${location}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                  Artisans \u00e0 {villeData.name}
                </Link>
                {otherTrades.slice(0, 3).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link key={slug} href={`/devis/${slug}/${location}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                      Devis {t.name.toLowerCase()} \u00e0 {villeData.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link href="/devis" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Demander un devis</Link>
                <Link href="/tarifs-artisans" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Guide complet des tarifs</Link>
                <Link href="/comment-ca-marche" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Comment \u00e7a marche</Link>
                <Link href="/faq" className="block text-sm text-gray-600 hover:text-blue-600 py-1">FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial credibility */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Transparence tarifaire</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Les prix affich\u00e9s pour {villeData.name} sont des fourchettes indicatives ajust\u00e9es en fonction des donn\u00e9es r\u00e9gionales ({villeData.region}). Ils varient selon la complexit\u00e9 du chantier, les mat\u00e9riaux et l&apos;urgence. Seul un devis personnalis\u00e9 fait foi. {SITE_NAME} est un annuaire ind\u00e9pendant.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: Local factor card
// ---------------------------------------------------------------------------

function LocalFactorCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string | null
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          {value && <p className="text-xs text-blue-600 font-medium">{value}</p>}
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
