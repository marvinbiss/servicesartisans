import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

export const metadata: Metadata = {
  title: 'Contact - Nous contacter | ServicesArtisans',
  description: 'Contactez l\'équipe ServicesArtisans. Questions, support, partenariats. Nous sommes là pour vous aider.',
  alternates: {
    canonical: 'https://servicesartisans.fr/contact',
  },
  openGraph: {
    title: 'Contact - Nous contacter | ServicesArtisans',
    description: 'Contactez l\'équipe ServicesArtisans pour toute question ou demande.',
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
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Contact', url: '/contact' },
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {children}
    </>
  )
}
