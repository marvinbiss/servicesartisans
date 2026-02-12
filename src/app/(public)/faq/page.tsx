import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { faqCategories } from '@/lib/data/faq-data'
import FAQPageClient from './FAQPageClient'

export const metadata: Metadata = {
  title: 'Questions fréquentes (FAQ) | ServicesArtisans',
  description: 'Retrouvez les réponses aux questions les plus fréquentes sur ServicesArtisans : inscription, devis, fonctionnement de l\'annuaire d\'artisans.',
  alternates: {
    canonical: 'https://servicesartisans.fr/faq',
  },
  openGraph: {
    title: 'Questions fréquentes (FAQ) | ServicesArtisans',
    description: 'Retrouvez les réponses aux questions fréquentes sur ServicesArtisans.',
    url: 'https://servicesartisans.fr/faq',
    type: 'website',
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
