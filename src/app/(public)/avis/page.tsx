import { Metadata } from 'next'
import Link from 'next/link'
import { Star, Shield, Users, Search, CheckCircle, ChevronDown } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { tradeContent } from '@/lib/data/trade-content'

export const metadata: Metadata = {
  title: 'Avis artisans \u2014 Trouvez un professionnel de confiance',
  description:
    'Consultez les avis et recommandations pour choisir le bon artisan. Plombier, \u00e9lectricien, serrurier\u2026 Comparez les profils et les avis v\u00e9rifi\u00e9s.',
  alternates: {
    canonical: `${SITE_URL}/avis`,
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Avis artisans \u2014 Trouvez un professionnel de confiance',
    description:
      'Consultez les avis et recommandations pour choisir le bon artisan. Plombier, \u00e9lectricien, serrurier\u2026 Comparez les profils et les avis v\u00e9rifi\u00e9s.',
    url: `${SITE_URL}/avis`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans \u2014 Avis artisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avis artisans \u2014 Trouvez un professionnel de confiance',
    description:
      'Consultez les avis et recommandations pour choisir le bon artisan. Comparez les profils et les avis v\u00e9rifi\u00e9s.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const trustBadges = [
  { icon: Star, label: 'Avis v\u00e9rifi\u00e9s', sublabel: 'Clients authentiques' },
  { icon: Shield, label: 'Artisans r\u00e9f\u00e9renc\u00e9s', sublabel: 'SIREN contr\u00f4l\u00e9' },
  { icon: Users, label: 'Comparaison gratuite', sublabel: 'Sans engagement' },
]

const howSteps = [
  {
    number: '1',
    icon: Search,
    title: 'Consultez les profils',
    description:
      'Explorez les profils d\u2019artisans r\u00e9f\u00e9renc\u00e9s pr\u00e8s de chez vous et consultez leurs comp\u00e9tences.',
  },
  {
    number: '2',
    icon: Star,
    title: 'Comparez les avis',
    description:
      'Lisez les retours d\u2019exp\u00e9rience v\u00e9rifi\u00e9s et comparez les notes des professionnels.',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez votre artisan',
    description:
      'S\u00e9lectionnez le professionnel qui correspond le mieux \u00e0 votre projet et demandez un devis.',
  },
]

const faqItems = [
  {
    question: 'Comment sont v\u00e9rifi\u00e9s les avis\u00a0?',
    answer:
      'Les avis publi\u00e9s sur ServicesArtisans proviennent de clients ayant effectivement sollicit\u00e9 un artisan via notre plateforme. Chaque avis est associ\u00e9 \u00e0 une demande de devis ou \u00e0 une mise en relation v\u00e9rifi\u00e9e.',
  },
  {
    question: 'Puis-je laisser un avis\u00a0?',
    answer:
      'Oui, tout client ayant fait appel \u00e0 un artisan r\u00e9f\u00e9renc\u00e9 peut d\u00e9poser un avis. Celui-ci sera publi\u00e9 apr\u00e8s v\u00e9rification de la mise en relation.',
  },
  {
    question: 'Les artisans peuvent-ils supprimer un avis n\u00e9gatif\u00a0?',
    answer:
      'Non. Les avis n\u00e9gatifs sont maintenus d\u00e8s lors qu\u2019ils respectent nos conditions de publication (pas d\u2019insultes, contenu v\u00e9ridique). Les artisans peuvent y r\u00e9pondre publiquement.',
  },
  {
    question: 'Comment lire les avis efficacement\u00a0?',
    answer:
      'Privil\u00e9giez les avis d\u00e9taill\u00e9s qui d\u00e9crivent le type de travaux r\u00e9alis\u00e9s, le respect des d\u00e9lais et la qualit\u00e9 du r\u00e9sultat. Un artisan avec 10 avis \u00e0 4,5/5 est souvent plus fiable qu\u2019un artisan avec 2 avis \u00e0 5/5.',
  },
  {
    question: 'Les avis influencent-ils le classement des artisans\u00a0?',
    answer:
      'Oui, les artisans les mieux not\u00e9s et les plus actifs apparaissent en priorit\u00e9 dans les r\u00e9sultats de recherche sur ServicesArtisans.',
  },
  {
    question: 'Que faire en cas de litige avec un artisan\u00a0?',
    answer:
      'En cas de diff\u00e9rend, contactez notre service de m\u00e9diation. Nous intervenons gratuitement pour faciliter la r\u00e9solution entre le client et l\u2019artisan.',
  },
]

export default async function AvisPage() {
  const cmsPage = await getPageContent('avis', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              {cmsPage.title}
            </h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Avis', url: '/avis' },
          ]),
          getFAQSchema(
            faqItems.map((item) => ({
              question: item.question,
              answer: item.answer,
            }))
          ),
        ]}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background */}
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

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[{ label: 'Avis' }]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
              Avis artisans &mdash;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                Trouvez un professionnel
              </span>{' '}
              de confiance
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Consultez les avis v&eacute;rifi&eacute;s, comparez les profils
              et choisissez l&apos;artisan qui correspond &agrave; votre projet.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {trustBadges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div key={badge.label} className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/[0.08] backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">
                        {badge.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {badge.sublabel}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              Simple et rapide
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Comment &ccedil;a marche&nbsp;?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Trois &eacute;tapes pour trouver un artisan de confiance pr&egrave;s de chez vous.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%]">
              <div className="h-px border-t-2 border-dashed border-gray-200" />
            </div>

            {howSteps.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.number} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-slate-700">
                        {item.number}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
              FAQ
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Questions fr&eacute;quentes
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Tout ce que vous devez savoir sur les avis artisans.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-slate-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 text-slate-500 leading-relaxed text-sm">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AVIS PAR MÉTIER ──────────────────────────────────── */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Avis par m&eacute;tier
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              S&eacute;lectionnez un m&eacute;tier pour consulter les avis et recommandations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(tradeContent).map(([slug, trade]) => (
              <Link
                key={slug}
                href={`/avis/${slug}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-3 transition-all group text-center"
              >
                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  {trade.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {trade.priceRange.min}&ndash;{trade.priceRange.max}{' '}
                  {trade.priceRange.unit}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-3">
            Besoin d&apos;un artisan de confiance&nbsp;?
          </h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Comparez les avis, consultez les profils et demandez un devis gratuit
            aupr&egrave;s d&apos;artisans r&eacute;f&eacute;renc&eacute;s.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Star className="w-5 h-5" />
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}
