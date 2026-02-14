import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Euro, Shield, ChevronDown, TrendingUp, Clock } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { villes } from '@/lib/data/france'
import { getServiceImage } from '@/lib/data/images'

const tradeSlugs = getTradesSlugs()

export function generateStaticParams() {
  return tradeSlugs.map((service) => ({ service }))
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return {}

  const title = `Tarifs ${trade.name.toLowerCase()} 2026 — Prix détaillés et devis | ServicesArtisans`
  const description = `Guide complet des tarifs ${trade.name.toLowerCase()} en 2026 : ${trade.priceRange.min} à ${trade.priceRange.max} ${trade.priceRange.unit}. ${trade.commonTasks[0]}. Comparez les prix, demandez un devis gratuit.`
  const serviceImage = getServiceImage(service)

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/tarifs-artisans/${service}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tarifs-artisans/${service}`,
      type: 'website',
      images: [{ url: serviceImage.src, width: 800, height: 600, alt: `Tarifs ${trade.name}` }],
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

export default async function TarifsServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params
  const trade = tradeContent[service]
  if (!trade) return null

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Tarifs artisans', url: '/tarifs-artisans' },
    { name: `Tarifs ${trade.name.toLowerCase()}`, url: `/tarifs-artisans/${service}` },
  ])

  const faqSchema = getFAQSchema(
    trade.faq.map((f) => ({ question: f.q, answer: f.a }))
  )

  const otherTrades = tradeSlugs.filter((s) => s !== service).slice(0, 8)

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

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
              { label: 'Tarifs artisans', href: '/tarifs-artisans' },
              { label: `Tarifs ${trade.name.toLowerCase()}` },
            ]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]">
              Tarifs {trade.name.toLowerCase()} 2026
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
              Guide complet des prix {trade.name.toLowerCase()} en France.
              Tarif horaire : {trade.priceRange.min} à {trade.priceRange.max} {trade.priceRange.unit}.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Euro className="w-4 h-4 text-amber-400" />
                <span>Prix actualisés 2026</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>{trade.commonTasks.length} prestations détaillées</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{trade.averageResponseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price range overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center mb-12">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Tarif horaire moyen</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-blue-600">
                {trade.priceRange.min} — {trade.priceRange.max}
              </span>
              <span className="text-gray-600 text-lg">{trade.priceRange.unit}</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Prix moyen constaté en France métropolitaine, main-d&apos;oeuvre incluse
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Détail des prestations courantes
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

      {/* Conseils */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Conseils pour choisir un {trade.name.toLowerCase()}
          </h2>
          <div className="space-y-4">
            {trade.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      {trade.certifications.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Certifications et qualifications
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Vérifiez que votre {trade.name.toLowerCase()} possède les certifications adaptées à votre projet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {trade.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Questions fréquentes — {trade.name}
          </h2>
          <div className="space-y-4">
            {trade.faq.map((item, i) => (
              <details key={i} className="bg-white rounded-xl border border-gray-200 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-gray-900 pr-4">{item.q}</h3>
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

      {/* Trouver par ville */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Trouver un {trade.name.toLowerCase()} près de chez vous
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {topCities.map((ville) => (
              <Link
                key={ville.slug}
                href={`/services/${service}/${ville.slug}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group text-center"
              >
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  {trade.name} à {ville.name}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href={`/services/${service}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
              Voir tous les {trade.name.toLowerCase()}s
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Urgence */}
      {trade.emergencyInfo && (
        <section className="py-16 bg-red-50 border-y border-red-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {trade.name} en urgence ?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-sm leading-relaxed">
              {trade.emergencyInfo}
            </p>
            <Link
              href={`/urgence/${service}`}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              {trade.name} urgence 24h/24
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Autres tarifs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tarifs d&apos;autres corps de métier</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {otherTrades.map((slug) => {
              const t = tradeContent[slug]
              return (
                <Link
                  key={slug}
                  href={`/tarifs-artisans/${slug}`}
                  className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all group"
                >
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {t.priceRange.min} — {t.priceRange.max} {t.priceRange.unit}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Obtenez un devis précis pour votre projet
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Les prix varient selon votre situation. Demandez un devis gratuit à un {trade.name.toLowerCase()} référencé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg"
            >
              Demander un devis gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/services/${service}`}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-lg border border-blue-400"
            >
              Trouver un {trade.name.toLowerCase()}
              <ArrowRight className="w-5 h-5" />
            </Link>
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
                <Link href={`/services/${service}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">{trade.name} — tous les artisans</Link>
                {trade.emergencyInfo && (
                  <Link href={`/urgence/${service}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">{trade.name} urgence</Link>
                )}
                {topCities.slice(0, 4).map((v) => (
                  <Link key={v.slug} href={`/services/${service}/${v.slug}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                    {trade.name} à {v.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tarifs associés</h3>
              <div className="space-y-2">
                {otherTrades.slice(0, 6).map((slug) => (
                  <Link key={slug} href={`/tarifs-artisans/${slug}`} className="block text-sm text-gray-600 hover:text-blue-600 py-1">
                    Tarifs {tradeContent[slug].name.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link href="/tarifs-artisans" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Guide complet des tarifs</Link>
                <Link href="/comment-ca-marche" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Comment ça marche</Link>
                <Link href="/devis" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Demander un devis</Link>
                <Link href="/faq" className="block text-sm text-gray-600 hover:text-blue-600 py-1">FAQ</Link>
                <Link href="/notre-processus-de-verification" className="block text-sm text-gray-600 hover:text-blue-600 py-1">Processus de vérification</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
