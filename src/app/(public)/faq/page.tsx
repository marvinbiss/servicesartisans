import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'

import FAQPageClient from './FAQPageClient'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'FAQ ServicesArtisans — Questions sur les artisans et travaux',
  description: 'Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans : inscription, devis, fonctionnement de l\'annuaire d\'artisans.',
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: 'Questions fréquentes (FAQ)',
    description: 'Retrouvez les réponses aux questions fréquentes sur ServicesArtisans.',
    url: `${SITE_URL}/faq`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — FAQ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Questions fréquentes (FAQ)',
    description: 'Retrouvez les réponses aux questions fréquentes sur ServicesArtisans.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export const revalidate = 86400

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Accueil', url: '/' },
  { name: 'FAQ', url: '/faq' },
])

// WebPage schema for the FAQ page (FAQPage rich results deprecated by Google Aug 2023)
const faqWebPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Questions fréquentes (FAQ)',
  description: 'Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans : inscription, devis, fonctionnement de l\'annuaire d\'artisans.',
  url: `${SITE_URL}/faq`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'ServicesArtisans',
    url: SITE_URL,
  },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', '[data-speakable="true"]'],
  },
}

export default async function FAQPage() {
  const cmsPage = await getPageContent('faq', 'faq')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JsonLd data={[faqWebPageSchema, breadcrumbSchema]} />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'FAQ' }]} className="mb-4" />
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
    <>
      <JsonLd data={[faqWebPageSchema, breadcrumbSchema]} />
      <FAQPageClient />
    </>
  )
}
