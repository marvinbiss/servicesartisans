import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Euro, TrendingUp, CheckCircle, Search, ChevronDown } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema, getReviewedByPersonSchema } from '@/lib/seo/jsonld'
import { spreadCitationsForTopics } from '@/lib/seo/authoritative-citations'
import { authors, getReviewerForAuthor } from '@/lib/data/authors'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { tradeContent } from '@/lib/data/trade-content'
import { services } from '@/lib/data/france'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import SnippetBaitSummary from '@/components/seo/SnippetBaitSummary'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'
import { getPublishedDate } from '@/lib/seo/published-dates'

import StickyMobileCTA from '@/components/conversion/StickyMobileCTA.client'
import ExitIntentPopup from '@/components/conversion/ExitIntentModal.client'

export const revalidate = 86400

const PUBLISHED_DATE = getPublishedDate('/tarifs')

export const metadata: Metadata = {
  title: 'Tarifs Artisans RGE 2026 : Prix par Métier',
  description:
    'Tarifs artisans RGE 2026 : 35 à 90 €/h selon le métier. Prix plombier, électricien, chauffagiste, pompe à chaleur, isolation. Devis gratuit.',
  alternates: getAlternates('/tarifs'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Tarifs Artisans 2026 : Prix Moyens par Métier et Ville',
    description:
      'Tarifs artisans RGE 2026 : 35 à 90 €/h selon le métier. Prix plombier, électricien, chauffagiste, pompe à chaleur, isolation. Devis gratuit.',
    url: `${SITE_URL}/tarifs`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Tarifs artisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Artisans 2026 : Prix Moyens par Métier et Ville',
    description:
      'Tarifs artisans RGE 2026 : 35 à 90 €/h selon le métier. Prix plombier, électricien, chauffagiste, pompe à chaleur, isolation. Devis gratuit.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const tradeFaqs = [
  {
    question: "Quel est le prix moyen d'un artisan en France en 2026 ?",
    answer:
      "Le prix moyen d'un artisan en France se situe entre 35 et 90 €/h TTC en 2026, selon le corps de métier. Un plombier coûte 60 à 90 €/h, un électricien 50 à 80 €/h, un peintre 35 à 55 €/h. Demandez plusieurs devis pour comparer.",
  },
  {
    question: 'Comment sont calculés les prix affichés ?',
    answer:
      "Les prix affichés sont des fourchettes moyennes observées en France métropolitaine, main-d'œuvre incluse. Ils varient selon la région, la complexité des travaux et le niveau de qualification de l'artisan. Demandez toujours plusieurs devis.",
  },
  {
    question: "Pourquoi les prix varient-ils autant d'un artisan à l'autre ?",
    answer:
      "Les écarts de prix s'expliquent par la localisation (plus cher en Île-de-France), l'expérience de l'artisan, ses certifications, la complexité du chantier, les matériaux et la période de l'année. Comptez +25 % en région parisienne.",
  },
  {
    question: 'Comment obtenir un devis gratuit pour mes travaux ?',
    answer:
      "Remplissez notre formulaire en ligne pour obtenir un devis gratuit d'artisans RGE certifiés. Vous pouvez aussi contacter directement les artisans RGE de notre annuaire. Comparez toujours plusieurs devis avant de vous engager.",
  },
  {
    question: 'Les prix incluent-ils la TVA ?',
    answer:
      "Les prix affichés sont TTC. Le taux de TVA varie : 10 % pour la rénovation (logement de plus de 2 ans), 5,5 % pour les travaux d'amélioration énergétique (isolation, chauffage) et 20 % pour les constructions neuves.",
  },
]

// Pivot full RGE 2026-05-03 : serrurier/carreleur/vitrier/cuisiniste retirés.
// Pivot pure-play BTP énergétique 2026-05-02 : jardinier/nettoyage retirés.
const tradeEmojis: Record<string, string> = {
  plombier: '🔧',
  electricien: '⚡',
  chauffagiste: '🔥',
  'peintre-en-batiment': '🎨',
  menuisier: '🪚',
  'salle-de-bain': '🛁',
  couvreur: '🏠',
  macon: '🏗️',
  climaticien: '❄️',
  'pompe-a-chaleur': '♨️',
  'isolation-thermique': '🧱',
  'panneaux-solaires': '☀️',
}

export default async function TarifsPage() {
  const cmsPage = await getPageContent('tarifs-artisans', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PageHeroH1 size="article">{cmsPage.title}</PageHeroH1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Tarifs artisans', url: '/tarifs' },
  ])

  const faqSchema = getFAQSchema(tradeFaqs)

  const trades = Object.values(tradeContent)

  const serviceSchemas = trades.map((trade) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: trade.name,
    provider: { '@type': 'Organization', name: 'ServicesArtisans', url: SITE_URL },
    areaServed: { '@type': 'Country', name: 'France' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: trade.priceRange.min,
      highPrice: trade.priceRange.max,
      offerCount: trade.commonTasks.length,
    },
  }))

  const dateModifiedIso = monthlyAnchorIso()
  const totalPrestations = trades.reduce((s, t) => s + t.commonTasks.length, 0)

  // Tier 3 2026-05-04 — claire-dubois (prix/baromètres) sur le hub tarifs.
  // Reviewer auto = sophie-martin (rénovation/réglementation, peer cross-review).
  const TARIFS_AUTHOR = authors['claire-dubois']
  const TARIFS_REVIEWER = getReviewerForAuthor(TARIFS_AUTHOR)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE_URL}/tarifs#article`,
    headline: 'Tarifs Artisans 2026 — Prix par métier en France',
    description: `Guide des tarifs ${trades.length} métiers du bâtiment 2026 : ${totalPrestations} prestations, fourchettes vérifiées, multiplicateur régional, méthodologie publique.`,
    url: `${SITE_URL}/tarifs`,
    datePublished: PUBLISHED_DATE,
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    articleSection: 'Tarifs artisans',
    keywords: [
      'tarifs artisans',
      'prix artisans',
      'France',
      'guide prix',
      'fourchette tarifs',
      'multiplicateur régional',
      '2026',
    ].join(', '),
    about: [
      { '@type': 'Thing', name: 'Tarifs artisans bâtiment' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Thing', name: 'Prix prestations bâtiment' },
    ],
    ...spreadCitationsForTopics('tarifs artisans bâtiment rénovation'),
    image: `${SITE_URL}/opengraph-image`,
    author: TARIFS_AUTHOR
      ? {
          '@type': 'Person',
          name: TARIFS_AUTHOR.name,
          jobTitle: TARIFS_AUTHOR.role,
          url: `${SITE_URL}/equipe/${TARIFS_AUTHOR.slug}`,
          ...(TARIFS_AUTHOR.methodology &&
            TARIFS_AUTHOR.methodology.length > 0 && { skills: TARIFS_AUTHOR.methodology }),
        }
      : {
          '@type': 'Organization',
          name: 'Équipe éditoriale ServicesArtisans',
          url: `${SITE_URL}/a-propos`,
          '@id': `${SITE_URL}#organization`,
        },
    ...(TARIFS_REVIEWER && { reviewedBy: getReviewedByPersonSchema(TARIFS_REVIEWER) }),
    publisher: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/tarifs` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  }

  const enBrefPoints = [
    `${trades.length} métiers du bâtiment couverts (plombier, électricien, maçon, peintre…)`,
    `${totalPrestations} prestations avec fourchettes de prix indicatives`,
    `Multiplicateur régional intégré (Paris ×1,25, Hauts-de-France ×0,95)`,
    `Mise à jour annuelle — sources INSEE, CAPEB, FFB, devis vérifiés ServicesArtisans`,
  ]

  const tldrBullets = [
    `Tarif horaire artisans France 2026 : 35 à 90 €/h TTC selon le métier (plombier 60–90 €/h, peintre 35–55 €/h).`,
    `Île-de-France ≈ +25 % vs moyenne nationale ; Hauts-de-France/Grand Est ≈ −5 %.`,
    `${totalPrestations} prestations indexées avec fourchettes prix par intervention/m²/h, mises à jour à partir de devis réels.`,
    `Toujours comparer 3 devis détaillés (matériaux, MO, déplacement) avant de signer ; vérifier SIRET + assurance décennale.`,
  ]

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema, faqSchema, ...serviceSchemas]} />
      <div className="min-h-screen bg-sand-50">
        {/* Hero */}
        <section className="relative bg-gradient-hero text-white overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(61,139,104,0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 sm:pt-10 sm:pb-28 md:pt-14 md:pb-36">
            <Breadcrumb
              items={[{ label: 'Tarifs artisans' }]}
              className="mb-6 text-sand-400 [&_a]:text-sand-400 [[&_a:hover]:text-white_a:hover]:text-white [&_svg]:text-sand-600"
            />
            <div className="text-center">
              <h1
                data-speakable="true"
                className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-[-0.025em]"
              >
                Guide des prix artisans 2026
              </h1>
              <p className="text-base sm:text-xl text-sand-400 max-w-3xl mx-auto mb-4">
                Tarifs moyens par corps de métier en France. Comparez les prix de {trades.length}{' '}
                métiers du bâtiment pour estimer votre budget travaux avant de demander un devis.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Euro className="w-4 h-4 text-secondary-400" />
                  <span>Prix actualisés 2026</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <TrendingUp className="w-4 h-4 text-secondary-400" />
                  <span>{trades.length} corps de métier</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <CheckCircle className="w-4 h-4 text-secondary-400" />
                  <span>Données vérifiées</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Byline + En bref — E-E-A-T DOM signal post-hero */}
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ArticleMeta
              author="Équipe éditoriale ServicesArtisans"
              authorHref="/a-propos"
              datePublished={PUBLISHED_DATE}
              dateModified={dateModifiedIso}
              className="mb-6"
            />
            <EnBrefBox keyPoints={enBrefPoints} />
          </div>
        </section>

        {/* TL;DR — featured-snippet bait */}
        <section className="py-8 bg-sand-50 border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <TldrBlock bullets={tldrBullets} />
          </div>
        </section>

        {/* Quick nav */}
        <section className="py-3 sm:py-8 bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto sm:overflow-x-visible sm:flex-wrap pb-1 sm:pb-0">
              {trades.map((trade) => (
                <a
                  key={trade.slug}
                  href={`#${trade.slug}`}
                  className="shrink-0 sm:shrink px-3 py-1.5 rounded-full text-sm font-medium bg-sand-200 text-charcoal-700 hover:bg-primary-100 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  {trade.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Snippet-bait: tableau recapitulatif des prix pour Featured Snippet Google */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Combien co{'u'}te un artisan en France en 2026 ?
            </h2>
            <SnippetBaitSummary
              trades={trades.map((trade) => ({
                name: trade.name,
                slug: trade.slug,
                min: trade.priceRange.min,
                max: trade.priceRange.max,
                unit: trade.priceRange.unit,
              }))}
            />
          </div>
        </section>

        {/* Trade cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-charcoal-900 mb-4">
                Tarifs par corps de métier
              </h2>
              <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
                Prix moyens constatés en France métropolitaine, main-d'œuvre incluse
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trades.map((trade) => {
                const topTasks = trade.commonTasks.slice(0, 3)
                const emoji = tradeEmojis[trade.slug] || '🔧'

                return (
                  <div
                    key={trade.slug}
                    id={trade.slug}
                    className="bg-white rounded-xl border border-sand-300 overflow-hidden hover:shadow-soft transition-shadow scroll-mt-24"
                  >
                    <div className="bg-gradient-to-r from-sand-100 to-sand-200 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{emoji}</span>
                        <h3 className="font-heading text-xl font-bold text-charcoal-900">
                          {trade.name}
                        </h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-3xl font-bold text-primary-500">
                          {trade.priceRange.min} - {trade.priceRange.max}
                        </span>
                        <span className="text-charcoal-600 text-sm">
                          {trade.priceRange.unit} TTC
                        </span>
                      </div>
                      <span className="inline-block mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700">
                        Prix moyen
                      </span>
                    </div>

                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wider mb-3">
                        Prestations courantes
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {topTasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-charcoal-700">
                            <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>

                      {trade.certifications.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {trade.certifications.slice(0, 2).map((cert, i) => (
                              <span
                                key={i}
                                className="inline-block bg-primary-50 text-primary-600 text-xs px-2 py-1 rounded"
                              >
                                {cert}
                              </span>
                            ))}
                            {trade.certifications.length > 2 && (
                              <span className="inline-block bg-sand-200 text-charcoal-600 text-xs px-2 py-1 rounded">
                                +{trade.certifications.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/tarifs/${trade.slug}`}
                        className="flex items-center justify-between w-full bg-primary-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
                      >
                        <span>Voir les tarifs détaillés</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How to save money */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-charcoal-900 mb-4">
                Comment obtenir le meilleur prix ?
              </h2>
              <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
                Nos conseils pour réduire le coût de vos travaux sans sacrifier la qualité
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  n: 1,
                  title: 'Comparez 3 devis minimum',
                  text: "Ne vous contentez jamais d'un seul devis. La comparaison permet d'identifier le juste prix et de négocier.",
                },
                {
                  n: 2,
                  title: 'Évitez les urgences',
                  text: "Les interventions d'urgence coûtent 50 à 100% plus cher. Anticipez l'entretien et les réparations.",
                },
                {
                  n: 3,
                  title: 'Profitez des aides',
                  text: "MaPrimeRénov', CEE, éco-PTZ... Les aides peuvent couvrir 30 à 90% du coût des travaux de rénovation énergétique.",
                },
                {
                  n: 4,
                  title: "Vérifiez l'artisan",
                  text: "Un artisan RGE certifié (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) avec SIRET, assurance et qualifications ADEME vous protège contre les malfaçons et les arnaques, et vous donne accès aux aides MaPrimeRénov' / CEE.",
                },
              ].map(({ n, title, text }) => (
                <div key={n} className="text-center p-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-500">{n}</span>
                  </div>
                  <h3 className="font-semibold text-charcoal-900 mb-2">{title}</h3>
                  <p className="text-charcoal-600 text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-charcoal-900 mb-4">
                Questions fréquentes sur les tarifs artisans
              </h2>
            </div>

            <div className="space-y-4">
              {tradeFaqs.map((faq, index) => (
                <details key={index} className="bg-white rounded-xl border border-sand-300 group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-charcoal-900 pr-4">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-charcoal-600 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-4">
              Obtenez un devis précis pour vos travaux
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Les prix varient selon votre projet. Demandez un devis gratuit pour connaître le coût
              exact.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/devis"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-base sm:text-lg w-full sm:w-auto"
              >
                Obtenir mon devis gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-primary-300 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-base sm:text-lg border border-primary-300 w-full sm:w-auto"
              >
                <Search className="w-5 h-5" />
                Trouver un artisan
              </Link>
            </div>
          </div>
        </section>

        {/* Tous les métiers — tarif détaillés (limité aux 12 premiers, le reste via /services) */}
        <section className="py-12 border-t bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
              Tarifs détaillés par métier
            </h2>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 12).map((s) => (
                <Link
                  key={`tarif-all-${s.slug}`}
                  href={`/tarifs/${s.slug}`}
                  className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Tarifs {s.name.toLowerCase()}
                </Link>
              ))}
              <Link
                href="/services"
                className="text-sm font-semibold text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                Voir tous les métiers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/widget-prix"
                className="text-sm text-charcoal-700 hover:text-primary-500 bg-sand-50 hover:bg-primary-50 border border-sand-200 hover:border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Widget prix artisan
              </Link>
            </div>
          </div>
        </section>

        <StickyMobileCTA ctaText="Comparer les prix gratuitement" />
        <ExitIntentPopup />
      </div>
    </>
  )
}
