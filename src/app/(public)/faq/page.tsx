import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { faqItems } from '@/lib/data/faq-data'

import FAQPageClient from './FAQPageClient'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import Breadcrumb from '@/components/Breadcrumb'
import dynamic from 'next/dynamic'
const GeoPageCTA = dynamic(() => import('@/components/conversion/GeoPageCTA'), { ssr: false })

const faqTitle = 'FAQ — Questions Artisans et Travaux | ServicesArtisans'

export const metadata: Metadata = {
  title: faqTitle,
  description:
    "Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans : inscription, devis, fonctionnement de l'annuaire d'artisans.",
  alternates: getAlternates('/faq'),
  openGraph: {
    title: faqTitle,
    description: 'Retrouvez les réponses aux questions fréquentes sur ServicesArtisans.',
    url: `${SITE_URL}/faq`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — FAQ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: faqTitle,
    description: 'Retrouvez les réponses aux questions fréquentes sur ServicesArtisans.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Accueil', url: '/' },
  { name: 'FAQ', url: '/faq' },
])

const faqPageSchema = getFAQSchema(faqItems)

const faqWebPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Questions fréquentes (FAQ)',
  description:
    "Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans : inscription, devis, fonctionnement de l'annuaire d'artisans.",
  url: `${SITE_URL}/faq`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '[data-speakable="true"]'],
  },
}

export default async function FAQPage() {
  const cmsPage = await getPageContent('faq', 'faq')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd data={[faqWebPageSchema, faqPageSchema, breadcrumbSchema]} />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'FAQ' }]} className="mb-4" />
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
        <GeoPageCTA variant="sticky-only" />
      </div>
    )
  }

  return (
    <>
      <JsonLd data={[faqWebPageSchema, faqPageSchema, breadcrumbSchema]} />
      <FAQPageClient />
      <GeoPageCTA variant="sticky-only" />
    </>
  )
}
