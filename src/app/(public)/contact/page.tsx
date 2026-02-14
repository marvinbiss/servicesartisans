import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contactez-nous',
  description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans. Formulaire de contact, email et assistance rapide.',
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: 'Contactez-nous',
    description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans.',
    url: `${SITE_URL}/contact`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Contact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contactez-nous',
    description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
