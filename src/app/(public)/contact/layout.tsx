import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Nous contacter | ServicesArtisans',
  description: 'Contactez l\'equipe ServicesArtisans. Questions, support, partenariats. Nous sommes la pour vous aider.',
  alternates: {
    canonical: 'https://servicesartisans.fr/contact',
  },
  openGraph: {
    title: 'Contact - Nous contacter | ServicesArtisans',
    description: 'Contactez l\'equipe ServicesArtisans pour toute question ou demande.',
    url: 'https://servicesartisans.fr/contact',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
