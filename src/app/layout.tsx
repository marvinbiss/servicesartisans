import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'

// Dynamic imports for performance
const MobileBottomNav = dynamic(() => import('@/components/MobileBottomNav'), {
  ssr: false,
})
const ServiceWorkerRegistration = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { ssr: false }
)

// Body font - Inter for readability
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

// Heading font - Plus Jakarta Sans for premium feel
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
})

// Viewport configuration - Primary brand color
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3366FF', // Primary brand color
}

export const metadata: Metadata = {
  metadataBase: new URL('https://servicesartisans.fr'),
  title: {
    default: 'ServicesArtisans - Trouvez les meilleurs artisans près de chez vous',
    template: '%s | ServicesArtisans',
  },
  description:
    'Trouvez et comparez les meilleurs artisans de votre région. Plombiers, électriciens, menuisiers et plus. Devis gratuits et avis vérifiés.',
  keywords: [
    'artisan',
    'plombier',
    'électricien',
    'menuisier',
    'devis',
    'travaux',
    'rénovation',
    'serrurier',
    'chauffagiste',
    'peintre',
  ],
  authors: [{ name: 'ServicesArtisans' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://servicesartisans.fr',
    siteName: 'ServicesArtisans',
    title: 'ServicesArtisans - Trouvez les meilleurs artisans près de chez vous',
    description:
      'Trouvez et comparez les meilleurs artisans de votre région. Plombiers, électriciens, menuisiers et plus.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServicesArtisans - Trouvez les meilleurs artisans près de chez vous',
    description:
      'Trouvez et comparez les meilleurs artisans de votre région.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />
        <link rel="dns-prefetch" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans bg-gray-50 antialiased`}>
        <MobileMenuProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50 font-medium"
          >
            Aller au contenu principal
          </a>
          <Header />
          <main id="main-content" className="pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <ServiceWorkerRegistration />
        </MobileMenuProvider>
      </body>
    </html>
  )
}
