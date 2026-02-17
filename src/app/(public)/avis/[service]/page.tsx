import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle,
  Euro,
  Shield,
  Clock,
  ChevronDown,
  Phone,
  Star,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { hashCode } from '@/lib/seo/location-content'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'
import { relatedServices } from '@/lib/constants/navigation'

const tradeSlugs = getTradesSlugs()

export function generateStaticParams() {
  return tradeSlugs.map((service) => ({ service }))
}

function truncateTitle(title: string, maxLen = 55): string {
  if (title.length <= maxLen) return title
  return title.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '\u2026'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>
}): Promise<Metadata> {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return {}

  const tradeLower = trade.name.toLowerCase()

  const titleHash = Math.abs(hashCode(`avis-title-${service}`))
  const titleTemplates = [
    `Avis ${tradeLower} \u2014 Comment bien choisir`,
    `Choisir un bon ${tradeLower} \u2014 Avis et conseils`,
    `Avis et recommandations ${tradeLower}`,
    `${trade.name} : avis, tarifs et conseils pour bien choisir`,
    `Trouver un ${tradeLower} de confiance \u2014 Avis v\u00e9rifi\u00e9s`,
  ]
  const title = truncateTitle(titleTemplates[titleHash % titleTemplates.length])

  const descHash = Math.abs(hashCode(`avis-desc-${service}`))
  const descTemplates = [
    `Consultez les avis sur les ${tradeLower}s. Comparez les profils, v\u00e9rifiez les certifications et choisissez un professionnel de confiance. ${trade.priceRange.min}\u2013${trade.priceRange.max} ${trade.priceRange.unit}.`,
    `Avis ${tradeLower} : comment bien choisir\u00a0? Tarifs ${trade.priceRange.min}\u2013${trade.priceRange.max} ${trade.priceRange.unit}, certifications, conseils et retours clients v\u00e9rifi\u00e9s.`,
    `Trouvez un ${tradeLower} de confiance gr\u00e2ce aux avis v\u00e9rifi\u00e9s. Prix : ${trade.priceRange.min} \u00e0 ${trade.priceRange.max} ${trade.priceRange.unit}. Comparaison gratuite.`,
  ]
  const description = descTemplates[descHash % descTemplates.length]

  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/avis/${service}` },
    openGraph: {
      locale: 'fr_FR',
      title,
      description,
      url: `${SITE_URL}/avis/${service}`,
      type: 'website',
      images: [
        {
          url: serviceImage.src,
          width: 800,
          height: 600,
          alt: `Avis ${trade.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [serviceImage.src],
    },
  }
}

const topCities = villes.slice(0, 20)

export default async function AvisServicePage({
  params,
}: {
  params: Promise<{ service: string }>
}) {
  const { service } = await params

  const trade = tradeContent[service]
  if (!trade) notFound()

  const tradeLower = trade.name.toLowerCase()

  // JSON-LD schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Avis', url: '/avis' },
    { name: `Avis ${tradeLower}`, url: `/avis/${service}` },
  ])

  // Merge trade FAQ + review-specific FAQ
  const reviewFaqItems = [
    {
      question: `Comment choisir un bon ${tradeLower}\u00a0?`,
      answer: `Pour choisir un bon ${tradeLower}, v\u00e9rifiez ses certifications (${trade.certifications.length > 0 ? trade.certifications.slice(0, 3).join(', ') : 'assurance d\u00e9cennale, RC pro'}), comparez les avis clients et demandez plusieurs devis. Les tarifs habituels vont de ${trade.priceRange.min} \u00e0 ${trade.priceRange.max} ${trade.priceRange.unit}.`,
    },
    {
      question: `Combien co\u00fbte un ${tradeLower}\u00a0?`,
      answer: `Les tarifs d\u2019un ${tradeLower} varient g\u00e9n\u00e9ralement de ${trade.priceRange.min} \u00e0 ${trade.priceRange.max} ${trade.priceRange.unit}, selon la complexit\u00e9 de l\u2019intervention et votre r\u00e9gion. Demandez plusieurs devis pour comparer.`,
    },
    {
      question: `Quelles certifications v\u00e9rifier pour un ${tradeLower}\u00a0?`,
      answer: trade.certifications.length > 0
        ? `Pour un ${tradeLower}, les certifications \u00e0 v\u00e9rifier sont : ${trade.certifications.join(', ')}. V\u00e9rifiez \u00e9galement l\u2019assurance d\u00e9cennale et la responsabilit\u00e9 civile professionnelle.`
        : `V\u00e9rifiez au minimum l\u2019assurance d\u00e9cennale et la responsabilit\u00e9 civile professionnelle. Un ${tradeLower} s\u00e9rieux fournit ces documents sans difficult\u00e9.`,
    },
  ]

  const tradeFaqItems = trade.faq
    .slice(0, trade.faq.length)
    .sort((a, b) => {
      const ha = Math.abs(hashCode(`faq-sort-${service}-${a.q}`))
      const hb = Math.abs(hashCode(`faq-sort-${service}-${b.q}`))
      return ha - hb
    })
    .slice(0, 3)

  const allFaqItems = [
    ...tradeFaqItems.map((f) => ({ question: f.q, answer: f.a })),
    ...reviewFaqItems,
  ]

  const faqSchema = getFAQSchema(allFaqItems)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Avis ${trade.name} en France`,
    description: `Consultez les avis et recommandations pour choisir un ${tradeLower} de confiance. ${trade.priceRange.min} \u00e0 ${trade.priceRange.max} ${trade.priceRange.unit}. Artisans r\u00e9f\u00e9renc\u00e9s.`,
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
      offerCount: 350000,
    },
  }

  // Related services
  const relatedSlugs = relatedServices[service] || []
  const otherTrades =
    relatedSlugs.length > 0
      ? relatedSlugs.slice(0, 8).filter((s) => tradeContent[s])
      : tradeSlugs.filter((s) => s !== service).slice(0, 8)

  // Hash-selected tips (3)
  const sortedTips = [...trade.tips].sort((a, b) => {
    const ha = Math.abs(hashCode(`tip-sort-${service}-${a}`))
    const hb = Math.abs(hashCode(`tip-sort-${service}-${b}`))
    return ha - hb
  })
  const selectedTips = sortedTips.slice(0, 3)

  // Review criteria
  const reviewCriteria = [
    {
      icon: Shield,
      title: 'Qualifications et certifications',
      description:
        trade.certifications.length > 0
          ? `V\u00e9rifiez que votre ${tradeLower} poss\u00e8de les certifications suivantes : ${trade.certifications.join(', ')}. L\u2019assurance d\u00e9cennale et la RC pro sont obligatoires.`
          : `V\u00e9rifiez que votre ${tradeLower} dispose d\u2019une assurance d\u00e9cennale et d\u2019une responsabilit\u00e9 civile professionnelle. Ces garanties sont obligatoires pour tout artisan du b\u00e2timent.`,
    },
    {
      icon: Euro,
      title: 'Transparence des tarifs',
      description: `Un bon ${tradeLower} fournit un devis d\u00e9taill\u00e9 avant intervention. Prix habituels : ${trade.priceRange.min}\u2013${trade.priceRange.max} ${trade.priceRange.unit}.`,
    },
    {
      icon: Clock,
      title: 'R\u00e9activit\u00e9 et ponctualit\u00e9',
      description: `V\u00e9rifiez le d\u00e9lai de r\u00e9ponse habituel. ${trade.averageResponseTime}.`,
    },
    {
      icon: CheckCircle,
      title: 'Qualit\u00e9 des finitions',
      description: `Examinez les photos avant/apr\u00e8s dans les avis clients. Un ${tradeLower} soigneux est un gage de s\u00e9rieux et de durabilit\u00e9 des travaux.`,
    },
    {
      icon: Phone,
      title: 'Service apr\u00e8s-intervention',
      description: `Un artisan s\u00e9rieux assure un suivi et reste joignable apr\u00e8s les travaux. V\u00e9rifiez ce point dans les avis clients.`,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, faqSchema, serviceSchema]} />

      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%)',
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
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[
              { label: 'Avis', href: '/avis' },
              { label: `Avis ${tradeLower}` },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]">
              {(() => {
                const h1Hash = Math.abs(hashCode(`avis-h1-${service}`))
                const h1Templates = [
                  `Avis ${tradeLower} \u2014 Comment bien choisir`,
                  `Choisir un bon ${tradeLower} : avis et conseils`,
                  `Avis ${tradeLower} : comparez les professionnels`,
                  `${trade.name} : avis v\u00e9rifi\u00e9s et recommandations`,
                  `Trouver un ${tradeLower} de confiance`,
                ]
                return h1Templates[h1Hash % h1Templates.length]
              })()}
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              Consultez les avis et recommandations pour bien choisir votre {tradeLower}.
              Prix indicatif : {trade.priceRange.min} &agrave; {trade.priceRange.max}{' '}
              {trade.priceRange.unit}.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-amber-400" />
                <span>
                  {trade.priceRange.min} &ndash; {trade.priceRange.max}{' '}
                  {trade.priceRange.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Avis v&eacute;rifi&eacute;s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review criteria */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2 text-center">
            Ce qu&apos;il faut v&eacute;rifier
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Les crit&egrave;res essentiels pour choisir un {tradeLower} de confiance.
          </p>
          <div className="space-y-4">
            {reviewCriteria.map((criterion) => {
              const Icon = criterion.icon
              return (
                <div
                  key={criterion.title}
                  className="flex items-start gap-4 bg-gray-50 rounded-xl border border-gray-200 p-5 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900 mb-1">
                      {criterion.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {criterion.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing expectations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Tarifs indicatifs {tradeLower}
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center mb-8">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-blue-600">
                {trade.priceRange.min} &mdash; {trade.priceRange.max}
              </span>
              <span className="text-gray-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Prix moyen constat&eacute; en France m&eacute;tropolitaine, main-d&apos;&oelig;uvre incluse
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {trade.commonTasks.slice(0, 6).map((task, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-800 text-sm">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
              Certifications &agrave; v&eacute;rifier
            </h2>
            <p className="text-gray-600 text-center mb-8">
              V&eacute;rifiez que votre {tradeLower} poss&egrave;de les certifications adapt&eacute;es &agrave; votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tips */}
      <section className={`py-16 ${trade.certifications.length > 0 ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Conseils pour choisir un {tradeLower}
          </h2>
          <div className="space-y-4">
            {selectedTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top cities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Avis {tradeLower} par ville
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {topCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/avis/${service}/${ville.slug}`}
                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  Avis {tradeLower} &agrave; {ville.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Voir tous les {tradeLower}s en France
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions fr&eacute;quentes &mdash; Avis {trade.name}
          </h2>
          <div className="space-y-4">
            {allFaqItems.map((item, i) => (
              <details
                key={i}
                className="bg-gray-50 rounded-xl border border-gray-200 group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-gray-900 pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Pr&ecirc;t &agrave; trouver votre {tradeLower}&nbsp;?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Demandez un devis gratuit et comparez les artisans pr&egrave;s de chez vous.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/devis/${service}`}
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Demander un devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-lg border border-blue-400"
            >
              Trouver un {tradeLower}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            Avis pour d&apos;autres m&eacute;tiers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              if (!t) return null
              return (
                <Link
                  key={slug}
                  href={`/avis/${slug}`}
                  className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    Avis {t.name.toLowerCase()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t.priceRange.min} &mdash; {t.priceRange.max}{' '}
                    {t.priceRange.unit}
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
          <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">
            Voir aussi
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ce service</h3>
              <div className="space-y-2">
                <Link
                  href={`/services/${service}`}
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  {trade.name} &mdash; tous les artisans
                </Link>
                <Link
                  href={`/devis/${service}`}
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Devis {tradeLower}
                </Link>
                <Link
                  href={`/tarifs-artisans/${service}`}
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Tarifs {tradeLower}
                </Link>
                {trade.emergencyInfo && (
                  <Link
                    href={`/urgence/${service}`}
                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                  >
                    {trade.name} urgence
                  </Link>
                )}
                {topCities.slice(0, 4).map((v) => (
                  <Link
                    key={v.slug}
                    href={`/avis/${service}/${v.slug}`}
                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                  >
                    Avis {tradeLower} &agrave; {v.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Avis associ&eacute;s
              </h3>
              <div className="space-y-2">
                {otherTrades.slice(0, 6).map((slug) => {
                  const t = tradeContent[slug]
                  if (!t) return null
                  return (
                    <Link
                      key={slug}
                      href={`/avis/${slug}`}
                      className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                    >
                      Avis {t.name.toLowerCase()}
                    </Link>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Informations utiles
              </h3>
              <div className="space-y-2">
                <Link
                  href="/avis"
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Tous les avis artisans
                </Link>
                <Link
                  href="/devis"
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Demander un devis
                </Link>
                <Link
                  href="/tarifs-artisans"
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Guide complet des tarifs
                </Link>
                <Link
                  href="/comment-ca-marche"
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  Comment &ccedil;a marche
                </Link>
                <Link
                  href="/faq"
                  className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                >
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Links (E-E-A-T) */}
      <section className="py-8 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Confiance &amp; S&eacute;curit&eacute;
          </h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/notre-processus-de-verification"
              className="text-blue-600 hover:text-blue-800"
            >
              Comment nous r&eacute;f&eacute;ren&ccedil;ons les artisans
            </Link>
            <Link
              href="/politique-avis"
              className="text-blue-600 hover:text-blue-800"
            >
              Notre politique des avis
            </Link>
            <Link
              href="/mediation"
              className="text-blue-600 hover:text-blue-800"
            >
              Service de m&eacute;diation
            </Link>
          </nav>
        </div>
      </section>

      {/* Editorial credibility */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Transparence &eacute;ditoriale
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Les informations pr&eacute;sent&eacute;es sur cette page sont
              indicatives et destin&eacute;es &agrave; vous aider dans le choix
              d&apos;un artisan. Les prix affich&eacute;s sont des fourchettes
              bas&eacute;es sur des moyennes constat&eacute;es en France. Seul un
              devis personnalis&eacute; fait foi. ServicesArtisans est un annuaire
              ind&eacute;pendant.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
