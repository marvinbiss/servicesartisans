import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Mes favoris',
  description: 'Retrouvez vos artisans favoris sur ServicesArtisans.',
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/mes-favoris` },
}

export default function MesFavorisLayout({ children }: { children: React.ReactNode }) {
  return children
}
