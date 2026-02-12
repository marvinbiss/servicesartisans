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
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
