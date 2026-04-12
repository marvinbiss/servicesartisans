import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import ContactPageClient from './ContactPageClient'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

const contactTitle = "Contactez l'équipe ServicesArtisans — Support & Questions"

export const metadata: Metadata = {
  title: contactTitle,
  description:
    "Contactez l'équipe ServicesArtisans pour toute question sur notre annuaire d'artisans. Formulaire de contact, email et assistance rapide.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: contactTitle,
    description:
      "Contactez l'équipe ServicesArtisans pour toute question sur notre annuaire d'artisans.",
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Contact',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: contactTitle,
    description:
      "Contactez l'équipe ServicesArtisans pour toute question sur notre annuaire d'artisans.",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400

export default async function ContactPage() {
  const cmsPage = await getPageContent('contact', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Contact', url: '/contact' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Contact' }]} className="mb-4" />
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
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
    <>
      <JsonLd
        data={getBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Contact', url: '/contact' },
        ])}
      />

      {/* Server-rendered intro for SEO — visible content before client hydration */}
      <div className="min-h-screen bg-sand-50">
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
              items={[{ label: 'Contact' }]}
              className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
            <div className="text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]">
                Contactez ServicesArtisans
              </h1>
              <p className="text-xl text-charcoal-400 max-w-2xl mx-auto">
                Une question sur notre annuaire d&apos;artisans ? Notre équipe est disponible pour
                vous aider par email, téléphone ou via le formulaire ci-dessous.
              </p>
            </div>
          </div>
        </section>

        {/* Server-rendered contact info for SEO */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Nos coordonnées</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-charcoal-900">Email</h3>
                  <p>
                    <a
                      href="mailto:contact@servicesartisans.fr"
                      className="text-primary-500 hover:underline font-medium"
                    >
                      contact@servicesartisans.fr
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Téléphone</h3>
                  <p>
                    <a
                      href="tel:+33756872787"
                      className="text-primary-500 hover:text-primary-600 font-medium"
                    >
                      07 56 87 27 87
                    </a>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Horaires d&apos;ouverture</h3>
                  <p className="text-charcoal-600">Lundi - Vendredi : 9h - 18h</p>
                  <p className="text-charcoal-600">Samedi : 9h - 12h</p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="font-semibold text-charcoal-900 mb-2">
                  Besoin d&apos;aide rapide ?
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Consultez notre{' '}
                  <a href="/faq" className="text-primary-500 hover:underline">
                    FAQ
                  </a>{' '}
                  pour trouver des réponses aux questions les plus fréquentes sur l&apos;utilisation
                  de ServicesArtisans, la demande de devis ou l&apos;inscription en tant
                  qu&apos;artisan.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <ContactPageClient />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
