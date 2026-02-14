import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { SITE_URL } from '@/lib/seo/config'
import { faqCategories } from '@/lib/data/faq-data'
import FAQPageClient from './FAQPageClient'

export const metadata: Metadata = {
  title: 'Questions fréquentes (FAQ)',
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

// Build FAQPage JSON-LD schema from all FAQ categories
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqCategories.flatMap((category) =>
    category.questions.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
}

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <FAQPageClient />
    </>
  )
}
