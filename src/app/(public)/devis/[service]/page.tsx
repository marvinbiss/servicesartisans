import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Euro, Shield, ChevronDown, ChevronRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { hashCode } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'
import CrossIntentLinks from '@/components/seo/CrossIntentLinks'
import InContentLinks from '@/components/seo/InContentLinks'
import DevisForm from '@/components/DevisForm'
import DevisSidebar from '@/components/conversion/DevisSidebar'

export const revalidate = false

const tradeSlugs = getTradesSlugs()

export function generateStaticParams() {
  return tradeSlugs.map((service) => ({ service }))
}

export const dynamicParams = false

function truncateTitle(title: string, maxLen = 42): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…'
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return {}

  const tradeLower = trade.name.toLowerCase()

  const titleHash = Math.abs(hashCode(`devis-title-${service}`))
  const titleTemplates = [
    `Devis ${tradeLower} gratuit 2026 — Comparez`,
    `Devis ${tradeLower} en ligne — Gratuit 2026`,
    `Devis ${tradeLower} gratuit — Artisans vérifiés`,
    `Devis ${tradeLower} 2026 : comparez les prix`,
    `Devis ${tradeLower} : gratuit et sans engagement`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`devis-desc-${service}`))
  const descTemplates = [
    `Demandez un devis ${tradeLower} gratuit. Comparez jusqu'à 3 artisans référencés. Prix : ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}. 100 % gratuit.`,
    `Devis ${tradeLower} en ligne : ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}. Comparez les offres de professionnels qualifiés. 100 % gratuit.`,
    `Obtenez un devis gratuit pour ${tradeLower}. ${trade.priceRange.min}–${trade.priceRange.max} ${trade.priceRange.unit}. Artisans vérifiés, sans engagement.`,
    `Devis gratuit ${tradeLower} : de ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}. Jusqu'à 3 propositions d'artisans qualifiés.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/devis/${service}` },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/devis/${service}`,
      type: 'website',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Devis ${trade.name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

const topCities = villes.slice(0, 6)

export default async function DevisServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params

  const trade = tradeContent[service]
  if (!trade) notFound()

  const tradeLower = trade.name.toLowerCase()

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Devis', url: '/devis' },
    { name: `Devis ${tradeLower}`, url: `/devis/${service}` },
  ])

  const faqSchema = getFAQSchema(
    trade.faq.map((f) => ({ question: f.q, answer: f.a }))
  )

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Devis ${trade.name} en France`,
    description: `Demandez un devis gratuit pour ${tradeLower}. ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}. Artisans référencés.`,
    provider: {
      '@type': 'Organization',
      name: 'ServicesArtisans',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'France',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: trade.priceRange.min,
      highPrice: trade.priceRange.max,
      offerCount: undefined,
    },
  }

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Devis ${tradeLower} par ville`,
    description: `Demandez un devis ${tradeLower} gratuit. Comparez les artisans référencés par ville. ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}.`,
    url: `${SITE_URL}/devis/${service}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topCities.map((ville, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Devis ${tradeLower} à ${ville.name}`,
        url: `${SITE_URL}/devis/${service}/${ville.slug}`,
      })),
    },
  }

  const relatedSlugs = relatedServices[service] || []
  const otherTrades = relatedSlugs.length > 0
    ? relatedSlugs.slice(0, 4).filter((s) => tradeContent[s])
    : tradeSlugs.filter((s) => s !== service).slice(0, 4)

  // H1 variation
  const h1Text = (() => {
    const h1Hash = Math.abs(hashCode(`devis-h1-${service}`))
    const h1Templates = [
      `Devis ${trade.name} gratuit`,
      `Devis ${tradeLower} — Comparez les meilleurs artisans`,
      `Devis ${tradeLower} : comparez jusqu'à 3 artisans`,
      `Devis gratuit ${tradeLower} — Sans engagement`,
      `${trade.name} : obtenez votre devis gratuit`,
    ]
    return h1Templates[h1Hash % h1Templates.length]
  })()

  // Sidebar FAQ from trade-specific FAQ
  const sidebarFaq = trade.faq.slice(0, 3).map((f) => ({ question: f.q, answer: f.a }))

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema, collectionPageSchema]} />

      {/* ─── HERO MINIMAL ────────────────────────────────── */}
      <section className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <Breadcrumb
            items={[
              { label: 'Devis', href: '/devis' },
              { label: `Devis ${tradeLower}` },
            ]}
            className="mb-4 text-charcoal-400"
          />
          <h1 className="font-heading text-3xl font-bold text-charcoal-900 tracking-tight">
            {h1Text}
          </h1>
          <p className="text-charcoal-500 mt-2 max-w-xl">
            Recevez jusqu'à 3 devis gratuits de {tradeLower}s référencés.
            Prix indicatif : {trade.priceRange.min} à {trade.priceRange.max} {trade.priceRange.unit}.
          </p>
        </div>
      </section>

      {/* ─── SPLIT LAYOUT: Form (60%) + Sidebar (40%) ────── */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* LEFT: Formulaire avec service pré-sélectionné */}
            <div id="formulaire">
              <DevisForm prefilledService={service} />
            </div>

            {/* RIGHT: Sidebar de réassurance */}
            <div className="hidden lg:block lg:sticky lg:top-20">
              <DevisSidebar
                serviceName={trade.name}
                faqItems={sidebarFaq}
                priceRange={trade.priceRange}
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
                  priceRange={trade.priceRange}
                />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── Prestations courantes + Tarifs ──────────────── */}
      <section className="py-16 bg-white border-t border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-2">Tarif indicatif</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-primary-500">
                {trade.priceRange.min} — {trade.priceRange.max}
              </span>
              <span className="text-charcoal-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-charcoal-500 text-sm mt-3">
              Prix moyen constaté en France métropolitaine, main-d'œuvre incluse
            </p>
          </div>

          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">
            Prestations courantes
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

      {/* ─── Trouver par ville ────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
            Devis {tradeLower} par ville
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {topCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/devis/${service}/${ville.slug}`}
                className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                  Devis {tradeLower} à {ville.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/villes" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold text-sm">
              Voir devis {tradeLower} dans toutes les villes ({villes.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Certifications ──────────────────────────────── */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6 text-center">
              Certifications et qualifications
            </h2>
            <p className="text-charcoal-600 text-center mb-8">
              Vérifiez que votre {tradeLower} possède les certifications adaptées à votre projet.
            </p>
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

      {/* ─── FAQ complète ────────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes — Devis {trade.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-sand-300 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">{item.q}</h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Prêt à recevoir votre devis {tradeLower}&nbsp;?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Commencez par choisir votre ville pour un devis adapté aux tarifs locaux.
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
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 bg-primary-300 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-lg border border-primary-300"
            >
              Trouver un {tradeLower}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Devis associés ──────────────────────────────── */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-6">Devis pour d'autres métiers</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              return (
                <Link
                  key={slug}
                  href={`/devis/${slug}`}
                  className="bg-white hover:bg-primary-50 border border-sand-300 hover:border-primary-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors text-sm">
                    Devis {t.name.toLowerCase()}
                  </div>
                  <div className="text-xs text-charcoal-500 mt-1">
                    {t.priceRange.min} — {t.priceRange.max} {t.priceRange.unit}
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
              <h3 className="font-semibold text-charcoal-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link href={`/services/${service}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">{trade.name} — tous les artisans</Link>
                <Link href={`/tarifs/${service}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">Tarifs {tradeLower}</Link>
                {trade.emergencyInfo && (
                  <Link href={`/urgence/${service}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">{trade.name} urgence</Link>
                )}
                {topCities.slice(0, 3).map((v) => (
                  <Link key={v.slug} href={`/devis/${service}/${v.slug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                    Devis {tradeLower} à {v.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 mb-3">Devis associés</h3>
              <div className="space-y-2">
                {otherTrades.slice(0, 4).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link key={slug} href={`/devis/${slug}`} className="block text-sm text-charcoal-600 hover:text-primary-500 py-1">
                      Devis {t.name.toLowerCase()}
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

      {/* ─── Editorial credibility ───────────────────────── */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-100 rounded-2xl border border-sand-300 p-6">
            <h3 className="text-sm font-semibold text-charcoal-700 mb-2">Transparence tarifaire</h3>
            <p className="text-xs text-sand-500 leading-relaxed">
              Les prix affichés sont des fourchettes indicatives basées sur des moyennes constatées en France. Ils varient selon la région, la complexité du chantier, les matériaux et l'urgence. Seul un devis personnalisé fait foi. ServicesArtisans est un annuaire indépendant.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
