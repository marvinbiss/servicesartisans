import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrières | ServicesArtisans',
  description: 'Rejoignez l\'équipe ServicesArtisans. Découvrez nos offres d\'emploi.',
  alternates: { canonical: 'https://servicesartisans.fr/carrieres' },
  robots: { index: false, follow: true },
}

export default function CarrieresLayout({ children }: { children: React.ReactNode }) {
  return children
}
