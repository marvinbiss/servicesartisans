import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { tradeContent } from '@/lib/data/trade-content'
import { services } from '@/lib/data/france'
import CalculateurClient from './CalculateurClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Calculateur prix artisan 2026',
  description:
    'Estimez vos travaux en un clic : plombier, électricien, serrurier, peintre et tous métiers du bâtiment. Calculateur gratuit, prix 2026 actualisés.',
  alternates: getAlternates('/outils/calculateur-prix'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Calculateur de prix artisan 2026 — Estimez vos travaux',
    description:
      'Estimez le coût de vos travaux en quelques clics. Prix plombier, tarif électricien, coût serrurier. Calculateur gratuit.',
    url: `${SITE_URL}/outils/calculateur-prix`,
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Calculateur de prix artisan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculateur de prix artisan 2026 — Estimez vos travaux',
    description:
      'Estimez le coût de vos travaux en quelques clics. Prix plombier, tarif électricien, coût serrurier.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function CalculateurPrixPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Outils', url: '/outils' },
    { name: 'Calculateur de prix', url: '/outils/calculateur-prix' },
  ])

  // HowTo JSON-LD removed — Google no longer supports HowTo rich results
  const howToSchema = null

  // FAQPage schema not applicable here — FAQ content is per-trade and rendered client-side
  const faqSchema = null

  // Serialize trade content for client component (only what's needed)
  const clientTradeContent: Record<
    string,
    {
      slug: string
      name: string
      priceRange: { min: number; max: number; unit: string }
      commonTasks: string[]
      tips: string[]
      faq: { q: string; a: string }[]
    }
  > = {}

  for (const [key, trade] of Object.entries(tradeContent)) {
    clientTradeContent[key] = {
      slug: trade.slug,
      name: trade.name,
      priceRange: trade.priceRange,
      commonTasks: trade.commonTasks,
      tips: trade.tips,
      faq: trade.faq,
    }
  }

  return (
    <>
      <JsonLd data={[breadcrumbSchema, howToSchema, faqSchema]} />

      <div className="min-h-screen bg-sand-50">
        {/* Hero */}
        <section className="relative bg-charcoal-950 text-white overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200, 73, 42,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(200, 73, 42,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(200, 73, 42,0.06) 0%, transparent 50%)',
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
            <Breadcrumb
              items={[{ label: 'Outils', href: '/outils' }, { label: 'Calculateur de prix' }]}
              className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
            <div className="text-center">
              <h1
                data-speakable="true"
                className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
              >
                Calculateur de prix artisan 2026
              </h1>
              <p className="text-xl text-charcoal-400 max-w-3xl mx-auto mb-4">
                Estimez le coût de vos travaux en quelques clics. Tarifs actualisés pour{' '}
                {Object.keys(tradeContent).length} métiers du bâtiment.
              </p>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section className="py-12 sm:py-16 -mt-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalculateurClient services={services} tradeContent={clientTradeContent} />
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-8 text-center">
              Comment fonctionne le calculateur ?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-500">1</span>
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-2">Choisissez un métier</h3>
                <p className="text-charcoal-600 text-sm">
                  Sélectionnez parmi 10 corps de métier : plombier, électricien, serrurier, peintre
                  et plus.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-500">2</span>
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-2">
                  Sélectionnez une prestation
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Choisissez l'intervention souhaitée pour obtenir une estimation précise du coût.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-500">3</span>
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-2">Obtenez votre estimation</h3>
                <p className="text-charcoal-600 text-sm">
                  Consultez la fourchette de prix, les conseils pratiques et trouvez un artisan
                  qualifié.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
