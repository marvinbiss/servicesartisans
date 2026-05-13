import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo/config'

export const metadata: Metadata = {
  title: 'Mes recherches sauvegardées — ServicesArtisans',
  description: 'Retrouvez en un clic vos recherches d’artisans enregistrées.',
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/mes-recherches` },
}

export default function MesRecherchesLayout({ children }: { children: React.ReactNode }) {
  return children
}
