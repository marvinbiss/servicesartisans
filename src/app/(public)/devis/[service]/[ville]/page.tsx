import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronDown, ChevronRight, Euro, Shield, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { hashCode, getRegionalMultiplier } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes, getVilleBySlug } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import InContentLinks from '@/components/seo/InContentLinks'
import DeepPageLinks from '@/components/seo/DeepPageLinks'
import MoneyPageBoost from '@/components/seo/MoneyPageBoost'
import DevisForm from '@/components/DevisForm'
import DevisSidebar from '@/components/conversion/DevisSidebar'

// ISR: revalidate every 24h
export const revalidate = 86400
// Allow on-demand ISR for cities not pre-rendered at build time
export const dynamicParams = true

// Pre-render top 50 cities × all trade services
const TOP_CITIES_COUNT = 50
const topCities = villes.slice(0, TOP_CITIES_COUNT)

export function generateStaticParams() {
  const tradeSlugs = getTradesSlugs()
  return tradeSlugs.flatMap((service) =>
    topCities.map((ville) => ({ service, ville: ville.slug }))
  )
}

// Valid slug: lowercase alphanumeric + hyphens, 2-80 chars
const VALID_SLUG = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$/

function truncateTitle(title: string, maxLen = 60): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

interface PageProps {
  params: Promise<{ service: string; ville: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service, ville: villeSlug } = await params

  if (!VALID_SLUG.test(service) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }

  const trade = tradeContent[service]
  const ville = getVilleBySlug(villeSlug)
  if (!trade || !ville) return {}

  const tradeLower = trade.name.toLowerCase()
  const multiplier = getRegionalMultiplier(ville.region)
  const localMin = Math.round(trade.priceRange.min * multiplier)
  const localMax = Math.round(trade.priceRange.max * multiplier)

  const titleHash = Math.abs(hashCode(`devis-ville-title-${service}-${villeSlug}`))
  const titleTemplates = [
    `Devis ${trade.name} ${ville.name} 2026 : Gratuit`,
    `Devis ${tradeLower} à ${ville.name} — Gratuit 2026`,
    `Devis ${tradeLower} ${ville.name} (${ville.departementCode})`,
    `${trade.name} ${ville.name} : devis gratuit 2026`,
    `Devis ${tradeLower} ${ville.name} — Sans engagement`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`devis-ville-desc-${service}-${villeSlug}`))
  const descTemplates = [
    `Demandez un devis ${tradeLower} à ${ville.name} (${ville.departementCode}). Prix local : ${localMin}–${localMax} ${trade.priceRange.unit}. Gratuit, sans engagement.`,
    `Devis gratuit ${tradeLower} à ${ville.name}. Comparez jusqu'à 3 artisans référencés. ${localMin}–${localMax} ${trade.priceRange.unit}.`,
    `Obtenez un devis ${tradeLower} à ${ville.name} en 2 minutes. Tarifs locaux : ${localMin}–${localMax} ${trade.priceRange.unit}. 100 % gratuit.`,
    `Devis ${tradeLower} ${ville.name} : de ${localMin} à ${localMax} ${trade.priceRange.unit}. Artisans vérifiés, devis gratuit et sans engagement.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/devis/${service}/${villeSlug}` },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/devis/${service}/${villeSlug}`,
      type: 'website',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Devis ${trade.name} à ${ville.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

export default async function DevisServiceVillePage({ params }: PageProps) {
  const { service, ville: villeSlug } = await params

  if (!VALID_SLUG.test(service) || !VALID_SLUG.test(villeSlug)) {
    notFound()
  }

  const trade = tradeContent[service]
  const ville = getVilleBySlug(villeSlug)

  if (!trade || !ville) notFound()

  const tradeLower = trade.name.toLowerCase()

  // Local price calculation
  const multiplier = getRegionalMultiplier(ville.region)
  const localMin = Math.round(trade.priceRange.min * multiplier)
  const localMax = Math.round(trade.priceRange.max * multiplier)
  const priceLabel = multiplier >= 1.05
    ? 'légèrement supérieurs à la moyenne nationale'
    : multiplier <= 0.95
    ? 'légèrement inférieurs à la moyenne nationale'
    : 'proches de la moyenne nationale'

  // H1 variation
  const h1Hash = Math.abs(hashCode(`devis-ville-h1-${service}-${villeSlug}`))
  const h1Templates = [
    `Devis ${trade.name} à ${ville.name} — Gratuit en 2 min`,
    `Devis ${tradeLower} à ${ville.name} (${ville.departementCode})`,
    `Devis gratuit ${tradeLower} à ${ville.name}`,
    `${trade.name} à ${ville.name} : votre devis gratuit`,
    `Demandez un devis ${tradeLower} à ${ville.name}`,
  ]
  const h1Text = h1Templates[h1Hash % h1Templates.length]

  // Breadcrumb
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Devis', url: '/devis' },
    { name: `Devis ${tradeLower}`, url: `/devis/${service}` },
    { name: ville.name, url: `/devis/${service}/${villeSlug}` },
  ])

  // FAQ — localized questions
  const localFaq = [
    {
      question: `Combien coûte un ${tradeLower} à ${ville.name} ?`,
      answer: `Les tarifs d'un ${tradeLower} à ${ville.name} se situent entre ${localMin} et ${localMax} ${trade.priceRange.unit}, ${priceLabel}. Demandez un devis gratuit pour obtenir un prix exact.`,
    },
    {
      question: `Comment trouver un ${tradeLower} fiable à ${ville.name} ?`,
      answer: `Sur ServicesArtisans, tous les ${tradeLower}s sont référencés via les données SIREN officielles. Demandez jusqu'à 3 devis gratuits pour comparer les offres à ${ville.name}.`,
    },
    {
      question: `Le devis ${tradeLower} à ${ville.name} est-il gratuit ?`,
      answer: `Oui, la demande de devis est 100 % gratuite et sans engagement. Vous recevez jusqu'à 3 propositions d'artisans à ${ville.name}.`,
    },
    ...trade.faq.slice(0, 2).map((f) => ({ question: f.q, answer: f.a })),
  ]

  // JSON-LD Service schema
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Devis ${trade.name} à ${ville.name}`,
    description: `Demandez un devis gratuit pour ${tradeLower} à ${ville.name} (${ville.departement}). Tarif local : ${localMin}–${localMax} ${trade.priceRange.unit}.`,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'City',
      name: ville.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: ville.departement,
      },
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: localMin,
      highPrice: localMax,
    },
  }

  // FAQPage schema
  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localFaq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  // Sidebar FAQ
  const sidebarFaq = localFaq.slice(0, 3).map((f) => ({ question: f.question, answer: f.answer }))

  // Related services
  const tradeSlugs = getTradesSlugs()
  const relatedSlugs = relatedServices[service] || []
  const otherTrades = relatedSlugs.length > 0
    ? relatedSlugs.slice(0, 4).filter((s) => tradeContent[s])
    : tradeSlugs.filter((s) => s !== service).slice(0, 4)

  // Nearby cities for internal linking
  const nearbyCities = villes
    .filter((v) => v.slug !== villeSlug && v.departement === ville.departement)
    .slice(0, 6)

  // If no nearby cities in same department, fallback to top cities
  const linkCities = nearbyCities.length > 0
    ? nearbyCities
    : villes.filter((v) => v.slug !== villeSlug).slice(0, 6)

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, serviceSchema, faqPageSchema]} />

      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Breadcrumb
            items={[
              { label: 'Devis', href: '/devis' },
              { label: `Devis ${tradeLower}`, href: `/devis/${service}` },
              { label: ville.name },
            ]}
            className="mb-4 text-charcoal-400"
          />
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 tracking-tight">
            {h1Text}
          </h1>
          <p className="text-charcoal-500 mt-2 max-w-2xl">
            Recevez jusqu'à 3 devis gratuits de {tradeLower}s référencés à {ville.name} ({ville.departementCode}).
            Prix local : {localMin} à {localMax} {trade.priceRange.unit}.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 mt-5">
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Shield className="w-4 h-4 text-accent-500" />
              <span>Artisans vérifiés SIREN</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>Réponse sous 24–48h</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100 % gratuit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-charcoal-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{ville.name} ({ville.departementCode})</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPLIT LAYOUT: Form (60%) + Sidebar (40%) ────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* LEFT: Formulaire pré-rempli service + ville */}
            <div id="formulaire">
              <DevisForm
                prefilledService={service}
                prefilledCity={ville.name}
                prefilledCityPostal={ville.codePostal}
              />
            </div>

            {/* RIGHT: Sidebar de réassurance */}
            <div className="hidden lg:block lg:sticky lg:top-20">
              <DevisSidebar
                serviceName={trade.name}
                faqItems={sidebarFaq}
                priceRange={{ min: localMin, max: localMax, unit: trade.priceRange.unit }}
              />
            </div>
          </div>

          {/* Mobile: réassurance sous le formulaire */}
          <div className="lg:hidden mt-8">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 cursor-pointer py-3 px-6 bg-white rounded-xl border border-sand-200 shadow-soft text-sm font-semibold text-charcoal-700 [&::-webkit-details-marker]:hidden">
                <span>Pourquoi nous faire confiance ?</span>
                <ChevronRight className="w-4 h-4 text-charcoal-400 group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div className="mt-4">
                <DevisSidebar
                  serviceName={trade.name}
                  faqItems={sidebarFaq}
                  priceRange={{ min: localMin, max: localMax, unit: trade.priceRange.unit }}
                />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── Prix moyen local ────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-2">
              Prix moyen {tradeLower} à {ville.name}
            </h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {localMin} — {localMax}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Tarifs {priceLabel} ({ville.region})
            </p>
          </div>

          {/* Prestations courantes */}
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Prestations courantes — {trade.name} à {ville.name}
          </h2>
          <div className="space-y-4">
            {trade.commonTasks.map((task, i) => (
              <div key={i} className="flex items-start gap-4 bg-sand-50 rounded-xl border border-sand-300 p-5 hover:bg-primary-50 hover:border-primary-200 transition-colors">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-primary-500" />
                </div>
                <span className="text-charcoal-800">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Certifications ──────────────────────────────── */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-sand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Certifications à vérifier pour votre {tradeLower} à {ville.name}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-3 rounded-xl text-sm font-medium">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Villes proches ──────────────────────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Devis {tradeLower} dans les villes proches
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {linkCities.map((v) => (
              <Link
                key={v.slug}
                href={`/devis/${service}/${v.slug}`}
                className="flex items-center gap-3 bg-sand-50 hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
              >
                <MapPin className="w-4 h-4 text-charcoal-400 group-hover:text-primary-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Devis {tradeLower} à {v.name}
                  </div>
                  <div className="text-xs text-charcoal-500">
                    {v.departement} ({v.departementCode})
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Devis {trade.name} à {ville.name}
          </h2>
          <div className="space-y-4">
            {localFaq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">{item.question}</h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA final ───────────────────────────────────── */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Prêt à recevoir votre devis {tradeLower} à {ville.name}&nbsp;?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Comparez les artisans, obtenez le meilleur prix.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#formulaire"
              className="inline-flex items-center gap-2 bg-white text-primary-500 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              Demander mon devis gratuit
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href={`/services/${service}/${villeSlug}`}
              className="inline-flex items-center gap-2 bg-primary-300 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-lg border border-primary-300"
            >
              Voir les {tradeLower}s à {ville.name}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Devis associés ──────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Autres devis à {ville.name}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              const m = getRegionalMultiplier(ville.region)
              return (
                <Link
                  key={slug}
                  href={`/devis/${slug}/${villeSlug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Devis {t.name.toLowerCase()} à {ville.name}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {Math.round(t.priceRange.min * m)} — {Math.round(t.priceRange.max * m)} {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Voir aussi ──────────────────────────────────── */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">{trade.name} à {ville.name}</h3>
              <div className="space-y-2">
                <Link href={`/services/${service}/${villeSlug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                  {trade.name} à {ville.name} — tous les artisans
                </Link>
                <Link href={`/tarifs/${service}/${villeSlug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                  Tarifs {tradeLower} à {ville.name}
                </Link>
                {trade.emergencyInfo && (
                  <Link href={`/urgence/${service}/${villeSlug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                    {trade.name} urgence à {ville.name}
                  </Link>
                )}
                <Link href={`/devis/${service}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                  Devis {tradeLower} — toutes les villes
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Devis à {ville.name}</h3>
              <div className="space-y-2">
                {otherTrades.slice(0, 4).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link key={slug} href={`/devis/${slug}/${villeSlug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                      Devis {t.name.toLowerCase()} à {ville.name}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link href="/devis" className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">Demander un devis</Link>
                <Link href="/tarifs" className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">Guide complet des tarifs</Link>
                <Link href="/comment-ca-marche" className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">Comment ça marche</Link>
                <Link href="/faq" className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">FAQ</Link>
                <Link href="/notre-processus-de-verification" className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">Processus de vérification</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust & Safety Links (E-E-A-T) ──────────────── */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-3">
            Confiance &amp; Sécurité
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/notre-processus-de-verification" className="text-primary-500 hover:text-primary-700">
              Comment nous référençons les artisans
            </Link>
            <Link href="/politique-avis" className="text-primary-500 hover:text-primary-700">
              Notre politique des avis
            </Link>
            <Link href="/mediation" className="text-primary-500 hover:text-primary-700">
              Service de médiation
            </Link>
          </nav>
        </div>
      </section>

      <InContentLinks serviceSlug={service} serviceName={trade.name} currentIntent="devis" />

      <CrossIntentLinks service={service} serviceName={trade.name} currentIntent="devis" />

      <DeepPageLinks currentService={service} currentIntent="devis" skipCrossIntent />

      <MoneyPageBoost currentService={service} />

      {/* ─── Editorial credibility ───────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Transparence tarifaire</h3>
            <p className="text-xs text-sand-500 leading-relaxed">
              Les prix affichés sont des fourchettes indicatives basées sur des moyennes constatées à {ville.name} et dans la région {ville.region}. Ils varient selon la complexité du chantier, les matériaux et l'urgence. Seul un devis personnalisé fait foi. ServicesArtisans est un annuaire indépendant.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
