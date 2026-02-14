import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Euro, TrendingUp, CheckCircle, Search, ChevronDown } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { PopularServicesLinks, PopularCitiesLinks } from '@/components/InternalLinks'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { tradeContent } from '@/lib/data/trade-content'

export const metadata: Metadata = {
  title: 'Tarifs artisans 2026 — Guide complet des prix par métier | ServicesArtisans',
  description: 'Guide complet des tarifs artisans en 2026 : prix plombier, électricien, peintre, couvreur, maçon et tous les corps de métier. Comparez les prix pour mieux estimer votre budget travaux.',
  alternates: {
    canonical: 'https://servicesartisans.fr/tarifs-artisans',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Tarifs artisans 2026 — Guide complet des prix | ServicesArtisans',
    description: 'Prix plombier, électricien, peintre, couvreur, maçon et tous les corps de métier. Comparez les prix.',
    url: 'https://servicesartisans.fr/tarifs-artisans',
    type: 'website',
    images: [{ url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: 'ServicesArtisans — Tarifs artisans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs artisans 2026 — Guide complet des prix | ServicesArtisans',
    description: 'Prix plombier, électricien, peintre, couvreur et tous les corps de métier.',
    images: ['https://servicesartisans.fr/opengraph-image'],
  },
}

const tradeFaqs = [
  {
    question: 'Comment sont calculés les prix affichés ?',
    answer: 'Les prix affichés sont des fourchettes moyennes observées en France métropolitaine. Ils incluent la main-d\'oeuvre et varient selon la région, la complexité des travaux, l\'urgence et le niveau de qualification de l\'artisan. Demandez toujours plusieurs devis pour obtenir le meilleur prix.',
  },
  {
    question: 'Pourquoi les prix varient-ils autant d\'un artisan à l\'autre ?',
    answer: 'Plusieurs facteurs expliquent les écarts de prix : la localisation géographique (les prix sont plus élevés en Île-de-France), l\'expérience et les certifications de l\'artisan, la complexité du chantier, les matériaux utilisés et la période de l\'année (plus cher en haute saison).',
  },
  {
    question: 'Comment obtenir un devis gratuit pour mes travaux ?',
    answer: 'Sur ServicesArtisans, vous pouvez demander un devis gratuit en remplissant notre formulaire en ligne. Vous pouvez aussi contacter directement les artisans référencés sur notre plateforme. Nous recommandons de demander au moins 3 devis pour comparer.',
  },
  {
    question: 'Les prix incluent-ils la TVA ?',
    answer: 'Les prix affichés sont généralement TTC (toutes taxes comprises). Le taux de TVA varie selon le type de travaux : 10% pour la rénovation dans un logement de plus de 2 ans, 5,5% pour les travaux d\'amélioration énergétique (isolation, chauffage), et 20% pour les constructions neuves.',
  },
]

const tradeEmojis: Record<string, string> = {
  plombier: '\uD83D\uDD27',
  electricien: '\u26A1',
  serrurier: '\uD83D\uDD11',
  chauffagiste: '\uD83D\uDD25',
  'peintre-en-batiment': '\uD83C\uDFA8',
  menuisier: '\uD83E\uDE9A',
  carreleur: '\uD83E\uDDF1',
  couvreur: '\uD83C\uDFE0',
  macon: '\uD83C\uDFD7\uFE0F',
  jardinier: '\uD83C\uDF33',
  vitrier: '\uD83E\uDE9F',
  climaticien: '\u2744\uFE0F',
  cuisiniste: '\uD83C\uDF73',
  solier: '\uD83D\uDECB\uFE0F',
  nettoyage: '\u2728',
}

export default function TarifsArtisansPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Tarifs artisans', url: '/tarifs-artisans' },
  ])

  const faqSchema = getFAQSchema(tradeFaqs)

  const trades = Object.values(tradeContent)

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
            }} />
            <div className="absolute inset-0 opacity-[0.025]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }} />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
            <Breadcrumb
              items={[{ label: 'Tarifs artisans' }]}
              className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
            <div className="text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]">
                Guide des prix artisans 2026
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
                Tarifs moyens par corps de m&eacute;tier en France. Comparez les prix de {trades.length} m&eacute;tiers
                du b&acirc;timent pour estimer votre budget travaux avant de demander un devis.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <Euro className="w-4 h-4 text-amber-400" />
                  <span>Prix actualis&eacute;s 2026</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>{trades.length} corps de m&eacute;tier</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Donn&eacute;es v&eacute;rifi&eacute;es</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick navigation */}
        <section className="py-8 bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              {trades.map((trade) => (
                <a
                  key={trade.slug}
                  href={`#${trade.slug}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {trade.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Trade cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tarifs par corps de métier
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Prix moyens constatés en France métropolitaine, main-d&apos;oeuvre incluse
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trades.map((trade) => {
                const topTasks = trade.commonTasks.slice(0, 3)
                const emoji = tradeEmojis[trade.slug] || '\uD83D\uDD27'

                return (
                  <div
                    key={trade.slug}
                    id={trade.slug}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow scroll-mt-24"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{emoji}</span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {trade.name}
                        </h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-blue-600">
                          {trade.priceRange.min} - {trade.priceRange.max}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {trade.priceRange.unit}
                        </span>
                      </div>
                    </div>

                    {/* Top tasks */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Prestations courantes
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {topTasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Certifications */}
                      {trade.certifications.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {trade.certifications.slice(0, 2).map((cert, i) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                              >
                                {cert}
                              </span>
                            ))}
                            {trade.certifications.length > 2 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{trade.certifications.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <Link
                        href={`/services/${trade.slug}`}
                        className="flex items-center justify-between w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Comment obtenir le meilleur prix ?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nos conseils pour réduire le coût de vos travaux sans sacrifier la qualité
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Comparez 3 devis minimum</h3>
                <p className="text-gray-600 text-sm">
                  Ne vous contentez jamais d&apos;un seul devis. La comparaison permet d&apos;identifier le juste prix et de négocier.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Évitez les urgences</h3>
                <p className="text-gray-600 text-sm">
                  Les interventions d&apos;urgence coûtent 50 à 100% plus cher. Anticipez l&apos;entretien et les réparations.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profitez des aides</h3>
                <p className="text-gray-600 text-sm">
                  MaPrimeRénov&apos;, CEE, éco-PTZ... Les aides peuvent couvrir 30 à 90% du coût des travaux de rénovation énergétique.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Vérifiez l&apos;artisan</h3>
                <p className="text-gray-600 text-sm">
                  Un artisan référencé avec SIRET, assurance et certifications vous protège contre les malfaçons et les arnaques.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes sur les tarifs artisans
              </h2>
            </div>

            <div className="space-y-4">
              {tradeFaqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 group"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Obtenez un devis précis pour vos travaux
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Les prix varient selon votre projet. Demandez un devis gratuit pour connaître le coût exact.
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
                href="/services"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors text-lg border border-blue-400"
              >
                <Search className="w-5 h-5" />
                Trouver un artisan
              </Link>
            </div>
          </div>
        </section>

        {/* Related Links Section */}
        <section className="bg-gray-50 py-12 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Trouvez un artisan près de chez vous
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <PopularServicesLinks />
              <PopularCitiesLinks />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
