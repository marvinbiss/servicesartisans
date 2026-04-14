import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Obtenir mon devis gratuit | ServicesArtisans',
  description:
    "Demandez un devis gratuit et recevez jusqu'à 3 propositions d'artisans qualifiés près de chez vous. Service 100% gratuit et sans engagement.",
  alternates: {
    canonical: `${SITE_URL}/devis`,
  },
  openGraph: {
    title: 'Obtenir mon devis gratuit | ServicesArtisans',
    description: "Devis gratuit et sans engagement d'artisans qualifiés.",
    url: `${SITE_URL}/devis`,
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
}

export default function DevisLayout({ children }: { children: React.ReactNode }) {
  return children
}
