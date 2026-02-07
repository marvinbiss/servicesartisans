import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demander un devis gratuit | ServicesArtisans',
  description: 'Demandez un devis gratuit et recevez jusqu\'a 3 propositions d\'artisans qualifies pres de chez vous. Service 100% gratuit et sans engagement.',
  alternates: {
    canonical: 'https://servicesartisans.fr/devis',
  },
  openGraph: {
    title: 'Demander un devis gratuit | ServicesArtisans',
    description: 'Recevez jusqu\'a 3 devis d\'artisans qualifies. Gratuit et sans engagement.',
    url: 'https://servicesartisans.fr/devis',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
