import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { DM_Sans, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { getProviderCount } from '@/lib/data/stats'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  adjustFontFallback: true,
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  adjustFontFallback: true,
})

// Dynamic imports for performance
const MobileBottomNav = dynamic(() => import('@/components/MobileBottomNav'), {
  ssr: false,
})
const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), {
  ssr: false,
})
const CapacitorInit = dynamic(
  () => import('@/components/CapacitorInit').then((mod) => ({ default: mod.CapacitorInit })),
  { ssr: false }
)
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
  ssr: false,
})
const WebVitals = dynamic(
  () => import('@/components/WebVitals').then((mod) => ({ default: mod.WebVitals })),
  { ssr: false }
)
const PageViewTracker = dynamic(() => import('@/components/PageViewTracker'), {
  ssr: false,
})
const PostHogProvider = dynamic(() => import('@/components/PostHogProvider'), {
  ssr: false,
})
const AuthTracker = dynamic(() => import('@/components/AuthTracker'), {
  ssr: false,
})
const ConsentGatedScripts = dynamic(() => import('@/components/ConsentGatedScripts'), {
  ssr: false,
})
const CompareProviderWrapper = dynamic(
  () =>
    import('@/components/compare/CompareProvider').then((mod) => ({
      default: mod.CompareProviderWrapper,
    })),
  { ssr: false }
)

// Viewport configuration - Primary brand color
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E86B4B' },
    { media: '(prefers-color-scheme: dark)', color: '#C24B2A' },
  ],
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ServicesArtisans — Annuaire d'artisans en France",
    template: '%s | ServicesArtisans',
  },
  description:
    "Annuaire d'artisans en France, données SIREN officielles. Plombiers, électriciens, menuisiers et plus dans 101 départements. Devis gratuits.",
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
    url: SITE_URL,
    siteName: 'ServicesArtisans',
    title: 'ServicesArtisans — Annuaire des artisans référencés en France',
    description:
      "Annuaire d'artisans de France basé sur les données SIREN officielles. Des milliers de professionnels référencés. Devis gratuits.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Annuaire des artisans référencés en France',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServicesArtisans — Annuaire des artisans référencés en France',
    description: "Annuaire d'artisans de France. Devis gratuits, données gouvernementales SIREN.",
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-FR': SITE_URL,
      'x-default': SITE_URL,
    },
    types: {
      'application/rss+xml': [
        { url: `${SITE_URL}/feed/blog.xml`, title: 'Blog ServicesArtisans' },
        { url: `${SITE_URL}/feed/nouveaux-artisans.xml`, title: 'Nouveaux artisans' },
        { url: `${SITE_URL}/feed/nouvelles-pages.xml`, title: 'Nouvelles pages' },
      ],
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

// revalidate removed — each page sets its own (86400 for pSEO pages)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const artisanCount = await getProviderCount()
  return (
    <html lang="fr" className={`scroll-smooth ${dmSans.variable} ${sora.variable}`}>
      <head>
        {/* PWA Meta Tags (apple-mobile-web-app, mobile-web-app-capable, theme-color handled by metadata/viewport exports) */}
        <meta name="msapplication-TileColor" content="#E86B4B" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Additional icon size (180px apple-touch-icon + icon.svg handled by metadata.icons export) */}
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />

        {/* LLM discovery — llms.txt (GEO/AEO optimization) */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM access guidelines" />
        <link
          rel="alternate"
          type="text/plain"
          href="/llms-full.txt"
          title="LLM detailed content"
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

        {/* Preconnect for Google Tag Manager + Google Analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* GA4 Consent Mode v2 defaults + gtag() definition — MUST load before GTM (RGPD) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','functionality_storage':'denied','personalization_storage':'denied','security_storage':'granted','wait_for_update':500});
gtag('set','url_passthrough',true);
gtag('set','ads_data_redaction',true);
gtag('js',new Date());
gtag('config','${process.env.NEXT_PUBLIC_GA_ID || 'G-K4XLTK72TB'}',{'send_page_view':false});
(function(){try{var p=localStorage.getItem('cookie_preferences');if(p){var prefs=JSON.parse(p);if(prefs.analytics)gtag('consent','update',{'analytics_storage':'granted'});if(prefs.marketing)gtag('consent','update',{'ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted'});}}catch(e){}})();`,
          }}
        />

        {/* Preconnect for Supabase backend */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || ''} />
      </head>
      <body className="font-sans bg-sand-50 antialiased text-charcoal-900">
        {/* Google Tag Manager — afterInteractive: loads after hydration, before idle (captures early interactions) */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-THV3KZ8N');`}
        </Script>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-THV3KZ8N"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* Meta Pixel + Contentsquare — gated by consent (RGPD) via ConsentGatedScripts */}
        {/* GA4 gtag.js — loaded after GTM for event forwarding to GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-K4XLTK72TB'}`}
          strategy="afterInteractive"
        />
        <ConsentGatedScripts />
        <WebVitals />
        <PageViewTracker />
        <PostHogProvider />
        <AuthTracker />
        <MobileMenuProvider>
          <CompareProviderWrapper>
            {/* Skip to main content for accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Aller au contenu principal
            </a>
            <Header artisanCount={artisanCount} />
            <main id="main-content" tabIndex={-1} className="pb-16 md:pb-0 outline-none">
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
            <ServiceWorkerRegistration />
            <CapacitorInit />
            <CookieConsent />
            <SpeedInsights />
          </CompareProviderWrapper>
        </MobileMenuProvider>
      </body>
    </html>
  )
}
