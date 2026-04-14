import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hors connexion — ServicesArtisans',
  description:
    'Vous êtes actuellement hors connexion. Vérifiez votre connexion internet et réessayez.',
  robots: { index: false, follow: false },
}

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return children
}
