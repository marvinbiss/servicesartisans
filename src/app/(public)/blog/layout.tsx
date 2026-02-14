import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Blog — Conseils et actualités travaux | ServicesArtisans',
  description: 'Conseils pratiques, guides et actualités pour tous vos projets de travaux. Rénovation, décoration, entretien maison.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog — Conseils et actualités travaux | ServicesArtisans',
    description: 'Conseils pratiques, guides et actualités pour tous vos projets de travaux.',
    url: `${SITE_URL}/blog`,
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
