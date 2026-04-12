import { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, Stethoscope, ArrowRight, Wrench, Euro, HelpCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import RelatedHubs from '@/components/seo/RelatedHubs'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Outils Gratuits pour vos Travaux | ServicesArtisans',
  description:
    'Outils gratuits pour estimer vos travaux : calculateur de prix artisan, diagnostic pour trouver le bon professionnel. Simples, rapides et sans inscription.',
  alternates: {
    canonical: `${SITE_URL}/outils`,
  },
  openGraph: {
    title: 'Outils Gratuits pour vos Travaux',
    description:
      'Calculateur de prix artisan et diagnostic gratuit pour trouver le bon professionnel. Estimez vos travaux en quelques clics.',
    url: `${SITE_URL}/outils`,
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Outils gratuits pour vos travaux',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outils Gratuits pour vos Travaux',
    description:
      'Calculateur de prix artisan et diagnostic gratuit pour trouver le bon professionnel.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const tools = [
  {
    name: 'Calculateur de prix artisan',
    description:
      'Estimez le coût de vos travaux en quelques clics. Tarifs actualisés 2026 pour 10 corps de métier : plombier, électricien, serrurier, peintre et plus.',
    href: '/outils/calculateur-prix',
    icon: Calculator,
    color: 'text-primary-500',
    bg: 'bg-primary-50',
    borderHover: 'hover:border-primary-200',
  },
  {
    name: 'Diagnostic : quel artisan choisir ?',
    description:
      'Répondez à 3 questions simples pour savoir quel professionnel appeler. Plombier, électricien, serrurier... Notre outil vous guide en 30 secondes.',
    href: '/outils/diagnostic',
    icon: Stethoscope,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    borderHover: 'hover:border-indigo-200',
  },
]

const relatedPages = [
  {
    title: 'Tarifs artisans',
    description: 'Grilles tarifaires détaillées par métier et par ville.',
    href: '/tarifs',
    icon: Euro,
  },
  {
    title: 'Tous les services',
    description: 'Parcourez les métiers du bâtiment couverts sur notre plateforme.',
    href: '/services',
    icon: Wrench,
  },
  {
    title: 'Problèmes courants',
    description: 'Identifiez votre problème et trouvez la solution adaptée.',
    href: '/problemes',
    icon: HelpCircle,
  },
]

export default function OutilsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Outils', url: '/outils' },
  ])

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Outils gratuits pour vos travaux',
    description:
      'Calculateur de prix et diagnostic gratuit pour estimer vos travaux et trouver le bon artisan.',
    url: `${SITE_URL}/outils`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'WebApplication',
        name: tool.name,
        url: `${SITE_URL}${tool.href}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
      },
    })),
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, itemListSchema]} />

      <div className="min-h-screen bg-sand-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb items={[{ label: 'Outils' }]} />
          </div>
        </div>

        {/* Hero */}
        <section className="relative bg-charcoal-950 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%)',
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pt-16 md:pb-36">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400/20 backdrop-blur-sm border border-primary-300/30 rounded-full mb-6">
                <Wrench className="w-4 h-4 text-primary-300" />
                <span className="text-sm font-semibold text-primary-100">
                  {tools.length} outils gratuits
                </span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
                Outils gratuits{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-200 to-indigo-300">
                  pour vos travaux
                </span>
              </h1>
              <p className="text-lg text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
                Estimez le coût de vos travaux ou trouvez le bon artisan en quelques clics. Nos
                outils sont gratuits, sans inscription et disponibles 24h/24.
              </p>
            </div>
          </div>
        </section>

        {/* Tools list */}
        <section className="py-16 -mt-16 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`group bg-white rounded-xl border border-sand-300 p-6 hover:shadow-lg ${tool.borderHover} transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-14 h-14 ${tool.bg} rounded-xl flex items-center justify-center`}
                      >
                        <Icon className={`w-7 h-7 ${tool.color}`} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-charcoal-900 group-hover:text-primary-500 transition-colors mb-2">
                          {tool.name}
                        </h2>
                        <p className="text-charcoal-600 text-sm leading-relaxed mb-3">
                          {tool.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 group-hover:gap-2 transition-all">
                          Utiliser l&apos;outil <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Cross-links */}
        <section className="py-12 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-6">
              Ressources complémentaires
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group bg-sand-50 rounded-lg border border-sand-300 p-5 hover:shadow-md hover:border-primary-200 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <page.icon className="w-5 h-5 text-charcoal-400 group-hover:text-primary-400 transition-colors" />
                    <h3 className="font-medium text-charcoal-900 group-hover:text-primary-500 transition-colors">
                      {page.title}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-500">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <RelatedHubs currentPath="/outils" />
    </>
  )
}
