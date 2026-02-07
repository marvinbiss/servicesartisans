import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import localFont from 'next/font/local'
import './globals.css'

const inter = localFont({
  src: [
    { path: '../fonts/inter-latin-wght-normal.woff2', style: 'normal' },
    { path: '../fonts/inter-latin-ext-wght-normal.woff2', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-inter',
})
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
const CapacitorInit = dynamic(
  () => import('@/components/CapacitorInit').then(mod => ({ default: mod.CapacitorInit })),
  { ssr: false }
)

// Viewport configuration - Primary brand color
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://servicesartisans.fr'),
  title: {
    default: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
    template: '%s | ServicesArtisans',
  },
  description:
    'Trouvez et comparez les meilleurs artisans de votre region. Plombiers, electriciens, menuisiers et plus. Devis gratuits et avis verifies.',
  keywords: [
    'artisan',
    'plombier',
    'electricien',
    'menuisier',
    'devis',
    'travaux',
    'renovation',
    'serrurier',
    'chauffagiste',
    'peintre',
  ],
  authors: [{ name: 'ServicesArtisans' }],
  applicationName: 'ServicesArtisans',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ServicesArtisans',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://servicesartisans.fr',
    siteName: 'ServicesArtisans',
    title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
    description:
      'Trouvez et comparez les meilleurs artisans de votre region. Plombiers, electriciens, menuisiers et plus.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServicesArtisans - Trouvez les meilleurs artisans pres de chez vous',
    description:
      'Trouvez et comparez les meilleurs artisans de votre region.',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ServicesArtisans" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1d4ed8" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167x167.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts handled by next/font — no external preconnect needed */}

        {/* Preconnect for Supabase backend */}
        <link rel="preconnect" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />
        <link rel="dns-prefetch" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />

        {/* Preconnect for images - Unsplash */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-gray-50 antialiased">
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
          <CapacitorInit />
        </MobileMenuProvider>
      </body>
    </html>
  )
}
