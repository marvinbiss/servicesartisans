import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  Clock,
  Euro,
  MapPin,
  ChevronDown,
  Lightbulb,
  Wrench,
  ListChecks,
  Eye,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { getBreadcrumbSchema, getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { getAuthorForServiceSlug } from '@/lib/data/service-author'
import { getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getProblemBySlug, getProblemSlugs, getProblemsByService } from '@/lib/data/problems'
import { tradeContent } from '@/lib/data/trade-content'
import { villes } from '@/lib/data/france'
import { hashCode } from '@/lib/seo/location-content'
import { selectFittingTitle } from '@/lib/seo/title-selector'
import GeoPageCTA from '@/components/conversion/GeoPageCTA'

export const revalidate = 86400
export const dynamicParams = true

export function generateStaticParams() {
  return getProblemSlugs().map((probleme) => ({ probleme }))
}

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

const urgencyBadgeColors = {
  haute: 'bg-red-100 text-red-700 border-red-200',
  moyenne: 'bg-amber-100 text-amber-700 border-amber-200',
  basse: 'bg-green-100 text-green-700 border-green-200',
}

const urgencyDotColors = {
  haute: 'bg-red-400',
  moyenne: 'bg-amber-400',
  basse: 'bg-green-400',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ probleme: string }>
}): Promise<Metadata> {
  const { probleme } = await params
  const problem = getProblemBySlug(probleme)
  if (!problem) return { robots: { index: false, follow: false } }

  const titleHash = Math.abs(hashCode(`probleme-title-${probleme}`))
  // Sprint 2 — variants gradués + first-fitting via title-selector partagé.
  const titleTemplates = [
    `${problem.name} — Diagnostic et solutions`,
    `${problem.name} : que faire ? Coûts 2026`,
    `${problem.name} — Guide et tarifs`,
    `${problem.name} : solutions et artisans`,
    `${problem.name} — Coûts et conseils`,
    `${problem.name} 2026`,
    `${problem.name}`,
  ]
  // Tier 1 2026-05-04 — maxLen 41 → 60 (Google SERP desktop limite).
  const title = selectFittingTitle(titleTemplates, titleHash, 60)

  const description = `${problem.name} : ${problem.description} Coût estimé : ${problem.estimatedCost.min} à ${problem.estimatedCost.max} €. ${problem.averageResponseTime}.`

  return {
    title,
    description,
    alternates: getAlternates(`/problemes/${probleme}`),
    openGraph: {
      ...getOgDefaults(),
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/problemes/${probleme}`,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${problem.name} — ServicesArtisans`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

// Top 20 cities sorted by population
const top20Cities = [...villes]
  .sort(
    (a, b) => parseInt(b.population.replace(/\s/g, '')) - parseInt(a.population.replace(/\s/g, ''))
  )
  .slice(0, 20)

export default async function ProblemePage({ params }: { params: Promise<{ probleme: string }> }) {
  const { probleme } = await params
  const problem = getProblemBySlug(probleme)
  if (!problem) notFound()

  const trade = tradeContent[problem.primaryService]
  const tradeName = trade?.name ?? problem.primaryService
  const gradient = urgencyGradients[problem.urgencyLevel]

  // H1 variation
  const h1Hash = Math.abs(hashCode(`probleme-h1-${probleme}`))
  const h1Templates = [
    problem.name,
    `${problem.name} — Que faire ?`,
    `Problème de ${problem.name.toLowerCase()}`,
    `${problem.name} : diagnostic et solutions`,
    `${problem.name} : causes et solutions`,
  ]
  const h1 = h1Templates[h1Hash % h1Templates.length]

  // Related problems (same service)
  const relatedProblems = getProblemsByService(problem.primaryService)
    .filter((p) => p.slug !== problem.slug)
    .slice(0, 6)

  // Breadcrumb
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Problèmes courants', url: '/problemes' },
    { name: problem.name, url: `/problemes/${probleme}` },
  ])

  const faqSchema = getFAQSchema(problem.faq.map((f) => ({ question: f.q, answer: f.a })))

  // HowTo JSON-LD removed — Google no longer supports HowTo rich results
  const howToSchema = null

  // Tier 7 — Person dispatché via problem.primaryService → Author spécialiste.
  const PROB_AUTHOR = getAuthorForServiceSlug(problem.primaryService)
  const PROB_REVIEWER = getReviewerForAuthor(PROB_AUTHOR)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/problemes/${probleme}#article`,
    headline: h1,
    description: `${problem.name} : ${problem.description.length > 140 ? problem.description.slice(0, 140) + '…' : problem.description} Coût ${problem.estimatedCost.min}-${problem.estimatedCost.max} €.`,
    image: `${SITE_URL}/opengraph-image`,
    url: `${SITE_URL}/problemes/${probleme}`,
    mainEntityOfPage: `${SITE_URL}/problemes/${probleme}`,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Problèmes & dépannage',
    keywords: [
      problem.name,
      `dépannage ${problem.name.toLowerCase()}`,
      problem.primaryService,
      'coût intervention',
      'délai',
      'France',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: problem.name },
      { '@type': 'Service', name: problem.primaryService },
      { '@type': 'Thing', name: 'Dépannage bâtiment' },
    ],
    ...spreadCitationsForTopics(`${problem.name} ${problem.primaryService}`),
    datePublished: '2026-01-15T08:00:00+02:00',
    dateModified: monthlyAnchorIso(),
    author: {
      '@type': 'Person',
      name: PROB_AUTHOR.name,
      jobTitle: PROB_AUTHOR.role,
      url: `${SITE_URL}/equipe/${PROB_AUTHOR.slug}`,
      ...(PROB_AUTHOR.methodology &&
        PROB_AUTHOR.methodology.length > 0 && { skills: PROB_AUTHOR.methodology }),
    },
    ...(PROB_REVIEWER && { reviewedBy: getReviewedByPersonSchema(PROB_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints: string[] = [
    `Coût indicatif : ${problem.estimatedCost.min} à ${problem.estimatedCost.max} €`,
    `Délai d'intervention typique : ${problem.averageResponseTime}`,
    `Niveau d'urgence : ${urgencyLabels[problem.urgencyLevel].toLowerCase()}`,
    `Métier concerné : ${tradeName}${problem.seasonality ? ` · saisonnalité : ${problem.seasonality}` : ''}`,
  ]

  const tldrBullets: string[] = [
    `${problem.name} — coût indicatif ${problem.estimatedCost.min}-${problem.estimatedCost.max} €, délai ${problem.averageResponseTime}, urgence ${urgencyLabels[problem.urgencyLevel].toLowerCase()}.`,
    `Étapes : repérer les ${problem.symptoms.length} symptômes, exécuter les ${problem.immediateActions.length} actions d'urgence, contacter un ${tradeName.toLowerCase()} référencé.`,
    problem.preventiveTips.length > 0
      ? `Prévention : ${problem.preventiveTips.length} bonnes pratiques pour éviter ce problème (entretien, surveillance, contrats).`
      : `Bonnes pratiques : entretien régulier + surveillance des symptômes + contrats de maintenance.`,
    `Notre rôle : mise en relation gratuite avec un ${tradeName.toLowerCase()} référencé près de chez vous, devis sous 24 h, sans engagement.`,
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, articleSchema, faqSchema, howToSchema]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[{ label: 'Problèmes', href: '/problemes' }, { label: problem.name }]}
          />
        </div>
      </div>

      {/* Hero */}
      <section
        className={`relative bg-gradient-to-br ${gradient} text-white py-16 md:py-20 overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[150px] animate-pulse" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-sm font-semibold`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${urgencyDotColors[problem.urgencyLevel]} animate-pulse`}
              />
              {urgencyLabels[problem.urgencyLevel]}
            </span>
          </div>
          <h1
            className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight"
            data-speakable="true"
          >
            {h1}
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mb-8">{problem.description}</p>
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Euro className="w-4 h-4" />
              <span className="text-sm">
                {problem.estimatedCost.min} – {problem.estimatedCost.max} €
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{problem.averageResponseTime}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">{tradeName}</span>
            </div>
            {problem.seasonality && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Saisonnier : {problem.seasonality}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/devis/${problem.primaryService}`}
              className="inline-flex items-center justify-center gap-3 bg-white text-charcoal-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Obtenir mon devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/services/${problem.primaryService}`}
              className="inline-flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Trouver un {tradeName.toLowerCase()}
            </Link>
          </div>
        </div>
      </section>

      {/* Article byline + En bref — E-E-A-T DOM signals + FS Position 0 capture */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ArticleMeta
            author={SITE_NAME}
            datePublished="2026-01-15"
            dateModified={monthlyAnchorIso().slice(0, 10)}
            className="mb-5"
          />
          <EnBrefBox keyPoints={enBrefPoints} />
        </div>
      </section>

      {/* Symptoms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-medium mb-4">
              <Eye className="w-4 h-4" />
              Symptômes
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Comment reconnaître ce problème ?
            </h2>
            <p className="text-charcoal-600 max-w-2xl mx-auto">
              Voici les signes qui permettent d'identifier un problème de{' '}
              {problem.name.toLowerCase()}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {problem.symptoms.map((symptom, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-sand-50 rounded-xl border border-sand-300 p-5"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-charcoal-700 text-sm">{symptom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate actions */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium mb-4">
              <ListChecks className="w-4 h-4" />
              Actions immédiates
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">Que faire en urgence ?</h2>
            <p className="text-charcoal-600 max-w-xl mx-auto">
              Suivez ces étapes en attendant l'intervention d'un professionnel.
            </p>
          </div>
          <div className="space-y-4">
            {problem.immediateActions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">{i + 1}</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost breakdown */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">Coût estimé</h2>
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 text-center mb-8">
            <h3 className="text-lg font-semibold text-charcoal-700 mb-2">Fourchette de prix</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {problem.estimatedCost.min} — {problem.estimatedCost.max}
              </span>
              <span className="text-charcoal-600 text-lg">€</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté en France métropolitaine, main-d'œuvre incluse
            </p>
            <p className="text-xs text-charcoal-400 mt-2">
              Les tarifs varient selon votre région, la complexité du problème et l'urgence.
              Majorations possibles en nuit/week-end.
            </p>
          </div>

          {/* Related service card */}
          <div className="bg-white rounded-xl border border-sand-300 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900">{tradeName}</h3>
                <p className="text-sm text-charcoal-500">
                  Artisan spécialisé pour ce type de problème
                </p>
              </div>
            </div>
            {trade && (
              <p className="text-charcoal-600 text-sm mb-4">
                Tarif horaire moyen : {trade.priceRange.min} à {trade.priceRange.max}{' '}
                {trade.priceRange.unit}. {trade.averageResponseTime}.
              </p>
            )}
            <Link
              href={`/services/${problem.primaryService}`}
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm"
            >
              Voir les {tradeName.toLowerCase()}s près de chez vous
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Prevention tips */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Prévention
            </div>
            <h2 className="text-3xl font-bold text-charcoal-900 mb-3">
              Comment éviter ce problème ?
            </h2>
          </div>
          <div className="space-y-4">
            {problem.preventiveTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-300 p-5"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-charcoal-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 20 cities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
            {problem.name} par ville
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {top20Cities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/problemes/${probleme}/${ville.slug}`}
                className="bg-sand-50 hover:bg-amber-50 border border-sand-300 hover:border-amber-300 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sand-100 group-hover:bg-amber-100 rounded-lg flex items-center justify-center transition-colors">
                    <MapPin className="w-4 h-4 text-charcoal-600 group-hover:text-amber-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal-900 group-hover:text-amber-600 transition-colors text-sm">
                      {ville.name}
                    </div>
                    <div className="text-xs text-charcoal-500">{ville.departementCode}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/villes"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm"
            >
              Voir {problem.name.toLowerCase()} dans toutes les villes ({villes.length}){' '}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Service×ville cross-links — maillage interne vers pages artisans */}
          <div className="mt-6 flex flex-wrap gap-2">
            {top20Cities.slice(0, 4).map((ville) => (
              <Link
                key={ville.slug}
                href={`/services/${problem.primaryService}/${ville.slug}`}
                className="text-xs text-charcoal-500 hover:text-amber-600 px-3 py-1.5 bg-sand-50 hover:bg-amber-50 border border-sand-300 rounded-full transition-colors"
              >
                {tradeName} à {ville.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TL;DR pré-FAQ — capture FS Position 0 / AI Overviews */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <TldrBlock bullets={tldrBullets} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — {problem.name}
          </h2>
          <div className="space-y-4">
            {problem.faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">{item.q}</h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-charcoal-600 text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related problems */}
      {relatedProblems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Problèmes similaires</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedProblems.slice(0, 4).map((rp) => {
                const rpUrgency = urgencyBadgeColors[rp.urgencyLevel]
                return (
                  <Link
                    key={rp.slug}
                    href={`/problemes/${rp.slug}`}
                    className="bg-sand-50 hover:bg-amber-50 border border-sand-300 hover:border-amber-300 rounded-xl p-5 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-amber-600 transition-colors text-sm">
                        {rp.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${rpUrgency}`}>
                        {urgencyLabels[rp.urgencyLevel]}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 line-clamp-2">{rp.description}</p>
                    <div className="mt-2 text-xs text-charcoal-400">
                      {rp.estimatedCost.min} – {rp.estimatedCost.max} €
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className={`bg-gradient-to-br ${gradient} text-white py-16 overflow-hidden`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'un {tradeName.toLowerCase()} ?</h2>
          <p className="text-xl opacity-90 mb-8">
            Demandez un devis gratuit et comparez les artisans RGE certifiés près de chez vous.
          </p>
          <Link
            href={`/devis/${problem.primaryService}`}
            className="inline-flex items-center justify-center gap-3 bg-white text-charcoal-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Obtenir mon devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Voir aussi */}
      <section className="py-12 bg-sand-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link
                  href={`/services/${problem.primaryService}`}
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  {tradeName} — page principale
                </Link>
                <Link
                  href={`/devis/${problem.primaryService}`}
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Devis {tradeName.toLowerCase()}
                </Link>
                <Link
                  href={`/urgence/${problem.primaryService}`}
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  {tradeName} urgence
                </Link>
                <Link
                  href={`/tarifs/${problem.primaryService}`}
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Tarifs {tradeName.toLowerCase()}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Problèmes similaires</h3>
              <div className="space-y-2">
                {relatedProblems.slice(0, 3).map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/problemes/${rp.slug}`}
                    className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                  >
                    {rp.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link
                  href="/problemes"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Tous les problèmes
                </Link>
                <Link
                  href="/urgence"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Urgence artisan 24h/24
                </Link>
                <Link
                  href="/tarifs"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Guide des tarifs
                </Link>
                <Link
                  href="/verifier-artisan"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Vérifier un artisan (SIRET)
                </Link>
                <Link
                  href="/guides/devis-travaux"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Guide : bien comparer les devis
                </Link>
                <Link
                  href="/statistiques-artisans-france"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  Statistiques artisans en France
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-charcoal-600 hover:text-amber-600 py-1"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial credibility */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl border border-charcoal-200 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Information importante</h3>
            <p className="text-xs text-charcoal-900 leading-relaxed">
              Les coûts et délais indiqués sont des estimations moyennes. Ils varient selon la
              complexité, votre région et l'urgence. Seul un devis personnalisé fait foi.{' '}
              {SITE_NAME} est un annuaire indépendant. En cas d'urgence vitale, appelez le 18
              (pompiers) ou le 112.
            </p>
          </div>
        </div>
      </section>

      {/* Conversion: Sticky mobile CTA + Exit intent */}
      <GeoPageCTA variant="sticky-only" service={problem.primaryService} />
    </div>
  )
}
