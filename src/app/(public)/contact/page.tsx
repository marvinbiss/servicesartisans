import { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contactez-nous | ServicesArtisans',
  description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans. Formulaire de contact, email et assistance rapide.',
  alternates: {
    canonical: 'https://servicesartisans.fr/contact',
  },
  openGraph: {
    title: 'Contactez-nous | ServicesArtisans',
    description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans.',
    url: 'https://servicesartisans.fr/contact',
    type: 'website',
    images: [{ url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: 'ServicesArtisans — Contact' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contactez-nous | ServicesArtisans',
    description: 'Contactez l\'équipe ServicesArtisans pour toute question sur notre annuaire d\'artisans.',
    images: ['https://servicesartisans.fr/opengraph-image'],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
