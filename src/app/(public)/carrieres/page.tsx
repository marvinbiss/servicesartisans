import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Carrières — Rejoignez notre équipe',
  description:
    "Découvrez les opportunités de carrière chez ServicesArtisans. Rejoignez une équipe passionnée qui construit l'annuaire des artisans RGE certifiés de France, basé sur la base ADEME et les données SIREN.",
  alternates: {
    canonical: `${SITE_URL}/carrieres`,
  },
  openGraph: {
    title: 'Carrières — Rejoignez notre équipe',
    description:
      "Découvrez les opportunités de carrière chez ServicesArtisans. Rejoignez une équipe passionnée qui construit l'annuaire des artisans RGE certifiés de France, basé sur la base ADEME et les données SIREN.",
    url: `${SITE_URL}/carrieres`,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carrières — Rejoignez notre équipe',
    description:
      "Découvrez les opportunités de carrière chez ServicesArtisans. Rejoignez une équipe passionnée qui construit l'annuaire des artisans RGE certifiés de France, basé sur la base ADEME et les données SIREN.",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default async function CarrieresPage() {
  const cmsPage = await getPageContent('carrieres', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Carrières', url: '/carrieres' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Carrières' }]} className="mb-4" />
            <h1 data-speakable="true" className="font-heading text-3xl font-bold text-charcoal-900">
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
    <div className="min-h-screen bg-sand-50">
      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
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
            items={[{ label: 'Carrières' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <h1
            data-speakable="true"
            className="font-heading text-4xl font-extrabold mb-4 tracking-[-0.025em]"
          >
            Carrières
          </h1>
          <p className="text-xl text-charcoal-400 max-w-3xl">
            Rejoignez une équipe passionnée qui construit l'annuaire des artisans RGE certifiés de
            France, basé sur la base ADEME france-renov.gouv.fr et les données SIREN officielles.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-4">
            Aucune offre disponible pour le moment
          </h2>
          <p className="text-charcoal-600 mb-6">
            Nous n'avons pas de poste ouvert actuellement, mais nous sommes toujours à la recherche
            de talents. N'hésitez pas à nous envoyer une candidature spontanée.
          </p>
          <p className="text-charcoal-500 mb-8">
            Pour toute candidature spontanée, contactez-nous à{' '}
            <a
              href="mailto:careers@servicesartisans.fr"
              className="text-primary-500 hover:underline font-medium"
            >
              careers@servicesartisans.fr
            </a>
          </p>
          <Link
            href="/a-propos"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
          >
            En savoir plus sur ServicesArtisans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
