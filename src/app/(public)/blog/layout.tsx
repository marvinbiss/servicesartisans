import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Conseils et actualités travaux | ServicesArtisans',
  description: 'Conseils pratiques, guides et actualités pour tous vos projets de travaux. Rénovation, décoration, entretien maison.',
  alternates: {
    canonical: 'https://servicesartisans.fr/blog',
  },
  openGraph: {
    title: 'Blog — Conseils et actualités travaux | ServicesArtisans',
    description: 'Conseils pratiques, guides et actualités pour tous vos projets de travaux.',
    url: 'https://servicesartisans.fr/blog',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
