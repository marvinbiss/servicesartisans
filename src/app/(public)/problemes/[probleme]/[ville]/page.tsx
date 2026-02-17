import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, ArrowRight, Shield, Clock, Euro, MapPin, ChevronDown, Lightbulb, ListChecks, Eye, Users, Thermometer, Building2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { getProblemBySlug, getProblemSlugs, getProblemsByService } from '@/lib/data/problems'
import { tradeContent } from '@/lib/data/trade-content'
import { villes, getVilleBySlug, getNearbyCities } from '@/lib/data/france'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { getCommuneBySlug, formatNumber } from '@/lib/data/commune-data'

// ---------------------------------------------------------------------------
// Static params: top 10 problems x top 30 cities = 300 pre-rendered pages
// ---------------------------------------------------------------------------

function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

const top30Cities = [...villes]
  .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
  .slice(0, 30)

export function generateStaticParams() {
  const top10Problems = getProblemSlugs().slice(0, 10)
  return top10Problems.flatMap((p) =>
    top30Cities.map((v) => ({ probleme: p, ville: v.slug }))
  )
}

export const dynamicParams = true
export const revalidate = 86400

// ---------------------------------------------------------------------------
// Urgency config
// ---------------------------------------------------------------------------

const urgencyGradients = {
  haute: 'from-red-600 to-red-800',
  moyenne: 'from-amber-600 to-amber-800',
  basse: 'from-green-600 to-green-800',
}

const urgencyLabels = {
  haute: 'Urgence haute',
  moyenne: 'Urgence moyenne',
  basse: 'Non urgent',
}

const urgencyDotColors = {
  haute: 'bg-red-400',
  moyenne: 'bg-amber-400',
  basse: 'bg-green-400',
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

function truncateTitle(title: string, maxLen = 60): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ probleme: string; ville: string }>
}): Promise<Metadata> {
  const { probleme, ville } = await params
  const problem = getProblemBySlug(probleme)
  const villeData = getVilleBySlug(ville)
  if (!problem || !villeData) return {}

  const titleHash = Math.abs(hashCode(`probleme-ville-title-${probleme}-${ville}`))
  const titleTemplates = [
    `${problem.name} \u00e0 ${villeData.name} \u2014 Solutions`,
    `${problem.name} ${villeData.name} : diagnostic et co\u00fbts`,
    `R\u00e9soudre ${problem.name.toLowerCase()} \u00e0 ${villeData.name}`,
    `${problem.name} \u00e0 ${villeData.name} \u2014 Artisans`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(problem.estimatedCost.min * multiplier)
  const maxPrice = Math.round(problem.estimatedCost.max * multiplier)

  const description = `${problem.name} \u00e0 ${villeData.name} : co\u00fbt ${minPrice} \u00e0 ${maxPrice} \u20ac. Diagnostic, conseils d\u2019urgence et artisans r\u00e9f\u00e9renc\u00e9s. ${problem.averageResponseTime}.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/problemes/${probleme}/${ville}` },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/problemes/${probleme}/${ville}`,
      type: 'website',
      images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: `${problem.name} \u00e0 ${villeData.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ProblemeVillePage({
  params,
}: {
  params: Promise<{ probleme: string; ville: string }>
}) {
  const { probleme, ville } = await params

  const problem = getProblemBySlug(probleme)
  const villeData = getVilleBySlug(ville)
  if (!problem || !villeData) notFound()

  const trade = tradeContent[problem.primaryService]
  const tradeName = trade?.name ?? problem.primaryService
  const gradient = urgencyGradients[problem.urgencyLevel]

  const commune = await getCommuneBySlug(ville)
  const multiplier = getRegionalMultiplier(villeData.region)
  const minPrice = Math.round(problem.estimatedCost.min * multiplier)
  const maxPrice = Math.round(problem.estimatedCost.max * multiplier)

  // H1 variation
  const h1Hash = Math.abs(hashCode(`probleme-ville-h1-${probleme}-${ville}`))
  const h1Templates = [
    `${problem.name} \u00e0 ${villeData.name}`,
    `${problem.name} \u00e0 ${villeData.name} \u2014 Que faire ?`,
    `R\u00e9soudre un probl\u00e8me de ${problem.name.toLowerCase()} \u00e0 ${villeData.name}`,
    `${problem.name} : artisans \u00e0 ${villeData.name}`,
  ]
  const h1 = h1Templates[h1Hash % h1Templates.length]

  // Related data
  const nearbyCities = getNearbyCities(ville, 6)
  const relatedProblems = getProblemsByService(problem.primaryService)
    .filter((p) => p.slug !== problem.slug)
    .slice(0, 4)

  // FAQ: 3 problem-specific + 2 from trade
  const localFaq = problem.faq.slice(0, 3).map((f) => ({
    question: f.q.replace(/\?$/, '') + ` \u00e0 ${villeData.name}\u00a0?`,
    answer: f.a,
  }))
  const tradeFaq = trade
    ? trade.faq.slice(0, 2).map((f) => ({
        question: f.q.replace(/\?$/, '') + ` \u00e0 ${villeData.name}\u00a0?`,
        answer: f.a,
      }))
    : []
  const allFaq = [...localFaq, ...tradeFaq]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Probl\u00e8mes', url: '/problemes' },
    { name: problem.name, url: `/problemes/${probleme}` },
    { name: villeData.name, url: `/problemes/${probleme}/${ville}` },
  ])

  const faqSchema = getFAQSchema(allFaq)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${problem.name} \u00e0 ${villeData.name}`,
    description: `Diagnostic et r\u00e9solution de ${problem.name.toLowerCase()} \u00e0 ${villeData.name} (${villeData.departement}). Co\u00fbt : ${minPrice} \u00e0 ${maxPrice} \u20ac.`,
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
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[
            { label: 'Probl\u00e8mes', href: '/problemes' },
            { label: problem.name, href: `/problemes/${probleme}` },
            { label: villeData.name },
          ]} />
        </div>
      </div>

      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${gradient} text-white py-16 md:py-20 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[150px] animate-pulse" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${urgencyDotColors[problem.urgencyLevel]} animate-pulse`} />
              {urgencyLabels[problem.urgencyLevel]}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {h1}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mb-8">
            {problem.description}
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Euro className="w-4 h-4" />
              <span className="text-sm">{minPrice} \u2013 {maxPrice} \u20ac</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{villeData.name} ({villeData.departementCode})</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{problem.averageResponseTime}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/devis/${problem.primaryService}/${ville}`}
              className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Devis gratuit \u00e0 {villeData.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/urgence/${problem.primaryService}/${ville}`}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              {tradeName} urgence \u00e0 {villeData.name}
            </Link>
          </div>
        </div>
      </section>

      {/* Symptoms localized */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-medium mb-4">
              <Eye className="w-4 h-4" />
              Sympt\u00f4mes
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Comment reconna\u00eetre ce probl\u00e8me ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              \u00c0 {villeData.name}, voici les signes qui indiquent un probl\u00e8me de {problem.name.toLowerCase()}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {problem.symptoms.map((symptom, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-50 rounded-xl border border-gray-200 p-5"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate actions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-4">
              <ListChecks className="w-4 h-4" />
              Actions imm\u00e9diates
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Que faire en urgence ?
            </h2>
          </div>
          <div className="space-y-4">
            {problem.immediateActions.map((action, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">{i + 1}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Co\u00fbt \u00e0 {villeData.name}
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Fourchette de prix \u00e0 {villeData.name}</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-blue-600">
                {minPrice} \u2014 {maxPrice}
              </span>
              <span className="text-gray-600 text-lg">\u20ac</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Prix indicatif pour {problem.name.toLowerCase()} \u00e0 {villeData.name} et ses alentours
            </p>
            {multiplier !== 1.0 && (
              <p className="text-xs text-gray-400 mt-2">
                {multiplier > 1.0
                  ? `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((multiplier - 1) * 100)}\u00a0% sup\u00e9rieurs \u00e0 la moyenne nationale`
                  : `Les tarifs en ${villeData.region} sont en moyenne ${Math.round((1 - multiplier) * 100)}\u00a0% inf\u00e9rieurs \u00e0 la moyenne nationale`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Local context — 4 stat cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Contexte local \u2014 {villeData.name}
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Donn\u00e9es locales qui influencent le co\u00fbt et la disponibilit\u00e9 des artisans.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <LocalFactorCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              title="Artisans locaux"
              value={commune?.nb_entreprises_artisanales ? `${formatNumber(commune.nb_entreprises_artisanales)} entreprises` : null}
              description={
                commune?.nb_entreprises_artisanales
                  ? `${villeData.name} compte ${formatNumber(commune.nb_entreprises_artisanales)} entreprises artisanales, ce qui garantit un bon choix de professionnels pour intervenir rapidement.`
                  : `La disponibilit\u00e9 des artisans \u00e0 ${villeData.name} d\u00e9pend du nombre de professionnels install\u00e9s localement.`
              }
            />
            <LocalFactorCard
              icon={<Thermometer className="w-5 h-5 text-green-600" />}
              title="Zone climatique"
              value={getClimatLabel(commune?.climat_zone ?? null)}
              description={
                problem.seasonality
                  ? `Ce probl\u00e8me est plus fr\u00e9quent en ${problem.seasonality}. Le climat \u00e0 ${villeData.name} influence la fr\u00e9quence de ce type d\u2019intervention.`
                  : `Le climat local \u00e0 ${villeData.name} peut influencer la fr\u00e9quence et l\u2019urgence de ce type de probl\u00e8me.`
              }
            />
            <LocalFactorCard
              icon={<Building2 className="w-5 h-5 text-purple-600" />}
              title="Type de logement"
              value={commune?.part_maisons_pct ? `${commune.part_maisons_pct}\u00a0% de maisons` : null}
              description={
                commune?.part_maisons_pct
                  ? commune.part_maisons_pct > 50
                    ? `\u00c0 ${villeData.name}, ${commune.part_maisons_pct}\u00a0% des logements sont des maisons individuelles. Les probl\u00e8mes de ${problem.name.toLowerCase()} y sont courants.`
                    : `\u00c0 ${villeData.name}, les appartements sont majoritaires. Les interventions en copropri\u00e9t\u00e9 peuvent impliquer le syndic.`
                  : `La r\u00e9partition entre maisons et appartements influence les sp\u00e9cificit\u00e9s des interventions \u00e0 ${villeData.name}.`
              }
            />
            <LocalFactorCard
              icon={<MapPin className="w-5 h-5 text-amber-600" />}
              title="Population"
              value={commune?.population ? formatNumber(commune.population) + ' habitants' : villeData.population + ' habitants'}
              description={`${villeData.name} est une commune de ${villeData.departement} (${villeData.region}). La densit\u00e9 de population influence les d\u00e9lais d\u2019intervention des artisans.`}
            />
          </div>
        </div>
      </section>

      {/* Prevention tips localized */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Pr\u00e9vention
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pr\u00e9vention \u00e0 {villeData.name}
            </h2>
          </div>
          <div className="space-y-4">
            {problem.preventiveTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-green-600" />
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
            Questions fr\u00e9quentes \u2014 {problem.name} \u00e0 {villeData.name}
          </h2>
          <div className="space-y-4">
            {allFaq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-gray-900 pr-4">{item.question}</h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`bg-gradient-to-br ${gradient} text-white py-16 overflow-hidden`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d&apos;un {tradeName.toLowerCase()} \u00e0 {villeData.name} ?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Comparez les artisans r\u00e9f\u00e9renc\u00e9s et obtenez un devis gratuit.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/devis/${problem.primaryService}/${ville}`}
              className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/urgence/${problem.primaryService}/${ville}`}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              {tradeName} urgence
            </Link>
          </div>
        </div>
      </section>

      {/* Nearby cities */}
      {nearbyCities.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {problem.name} dans d&apos;autres villes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
              {nearbyCities.map((v) => (
                <Link
                  key={v.slug}
                  href={`/problemes/${probleme}/${v.slug}`}
                  className="bg-gray-50 hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl p-4 transition-all group text-center"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                    {problem.name} \u00e0 {v.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other problems */}
      {relatedProblems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Autres probl\u00e8mes \u00e0 {villeData.name}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProblems.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/problemes/${rp.slug}/${ville}`}
                  className="bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                    {rp.name} \u00e0 {villeData.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(rp.estimatedCost.min * multiplier)} \u2013 {Math.round(rp.estimatedCost.max * multiplier)} \u20ac
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Voir aussi */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ce probl\u00e8me</h3>
              <div className="space-y-2">
                <Link href={`/problemes/${probleme}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                  {problem.name} en France
                </Link>
                <Link href={`/devis/${problem.primaryService}/${ville}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                  Devis {tradeName.toLowerCase()} \u00e0 {villeData.name}
                </Link>
                <Link href={`/services/${problem.primaryService}/${ville}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                  {tradeName} \u00e0 {villeData.name}
                </Link>
                <Link href={`/urgence/${problem.primaryService}/${ville}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                  {tradeName} urgence \u00e0 {villeData.name}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">\u00c0 {villeData.name}</h3>
              <div className="space-y-2">
                <Link href={`/villes/${ville}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                  Artisans \u00e0 {villeData.name}
                </Link>
                {relatedProblems.slice(0, 3).map((rp) => (
                  <Link key={rp.slug} href={`/problemes/${rp.slug}/${ville}`} className="block text-sm text-gray-600 hover:text-amber-600 py-1">
                    {rp.name} \u00e0 {villeData.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link href="/problemes" className="block text-sm text-gray-600 hover:text-amber-600 py-1">Tous les probl\u00e8mes</Link>
                <Link href="/urgence" className="block text-sm text-gray-600 hover:text-amber-600 py-1">Urgence artisan 24h/24</Link>
                <Link href="/tarifs-artisans" className="block text-sm text-gray-600 hover:text-amber-600 py-1">Guide des tarifs</Link>
                <Link href="/faq" className="block text-sm text-gray-600 hover:text-amber-600 py-1">FAQ</Link>
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
              Les prix affich\u00e9s pour {villeData.name} sont des fourchettes indicatives ajust\u00e9es en fonction des donn\u00e9es r\u00e9gionales ({villeData.region}). Ils varient selon la complexit\u00e9 du probl\u00e8me et l&apos;urgence. Seul un devis personnalis\u00e9 fait foi. {SITE_NAME} est un annuaire ind\u00e9pendant \u2014 nous mettons en relation mais ne r\u00e9alisons pas les interventions.
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
