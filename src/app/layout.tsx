import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

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
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
})

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
    default: 'ServicesArtisans — 350 000+ artisans référencés en France',
    template: '%s | ServicesArtisans',
  },
  description:
    'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels référencés dans 101 départements. Plombiers, électriciens, menuisiers, maçons et plus. Devis gratuits.',
  keywords: [
    'artisan',
    'plombier',
    'electricien',
    'menuisier',
    'devis gratuit',
    'travaux',
    'renovation',
    'serrurier',
    'chauffagiste',
    'peintre',
    'annuaire artisans',
    'artisan référencé',
    'trouver artisan',
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
    title: 'ServicesArtisans — 350 000+ artisans référencés en France',
    description:
      'Le plus grand annuaire d\'artisans de France. 350 000+ professionnels référencés. Devis gratuits.',
    images: [{ url: 'https://servicesartisans.fr/opengraph-image', width: 1200, height: 630, alt: 'ServicesArtisans — 350 000+ artisans référencés en France' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServicesArtisans — 350 000+ artisans référencés en France',
    description:
      'Le plus grand annuaire d\'artisans de France. Devis gratuits, données gouvernementales.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://servicesartisans.fr',
    languages: {
      'fr-FR': 'https://servicesartisans.fr',
      'x-default': 'https://servicesartisans.fr',
    },
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
    <html lang="fr" className={`scroll-smooth ${inter.variable} ${plusJakarta.variable}`}>
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

        {/* Apple Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668-2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536-2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242-2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-828-1792.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170-2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1179-2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />

        {/* Global Organization + WebSite schema (E-E-A-T) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([getOrganizationSchema(), getWebsiteSchema()])
              .replace(/</g, '\\u003c')
              .replace(/>/g, '\\u003e')
              .replace(/&/g, '\\u0026'),
          }}
        />

        {/* Preconnect for Supabase backend */}
        <link rel="preconnect" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />
        <link rel="dns-prefetch" href="https://umjmbdbwcsxrvfqktiui.supabase.co" />

        {/* Preconnect for images - Unsplash */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans bg-gray-50 antialiased">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
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
          <CookieConsent />
        </MobileMenuProvider>
      </body>
    </html>
  )
}
