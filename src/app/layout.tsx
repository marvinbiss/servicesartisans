import type { ComponentType, ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { DM_Sans, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CompareProviderWrapper as CompareProviderWrapperStatic } from '@/components/compare/CompareProvider'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seo/jsonld'
import { safeJsonStringify } from '@/lib/seo/safe-json'
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
// Kill switch: NEXT_PUBLIC_DISABLE_COMPARE_SSR must be UNSET in normal production.
// Set it to 'true' on Vercel ONLY to trigger an emergency rollback to CSR-only
// (~60-90s via env var + redeploy). Build-time inlined, so it requires a redeploy
// to flip — not a runtime flag. Trade-off: CompareProvider is imported twice
// (main bundle + dynamic chunk ~3KB) to keep rollback path instant.
// CompareProvider is SSR-safe (useState([]) initial, no window/document access),
// but wraps Header + main + Footer — previous ssr:false hid the entire tree from Googlebot.
const CompareProviderWrapperDynamic = dynamic(
  () =>
    import('@/components/compare/CompareProvider').then((mod) => ({
      default: mod.CompareProviderWrapper,
    })),
  { ssr: false }
)
const CompareProviderWrapper: ComponentType<{ children: ReactNode }> =
  process.env.NEXT_PUBLIC_DISABLE_COMPARE_SSR === 'true'
    ? CompareProviderWrapperDynamic
    : CompareProviderWrapperStatic

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
    default: 'ServicesArtisans — Le 1er annuaire 100% artisans RGE certifiés',
    template: '%s | ServicesArtisans',
  },
  description:
    'Le premier annuaire 100% artisans RGE certifiés en France. 49 000 professionnels qualifiés (Qualibat, Qualifelec, QualiPAC) pour vos travaux de rénovation énergétique. SIREN vérifié, devis gratuits.',
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
    title: 'ServicesArtisans — 1er annuaire 100% artisans RGE certifiés',
    description:
      '49 000 artisans RGE certifiés (Qualibat, Qualifelec, QualiPAC) pour vos travaux de rénovation énergétique. Éligibles MaPrimeRénov & CEE. Devis gratuits.',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Le 1er annuaire 100% artisans RGE certifiés',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServicesArtisans — 1er annuaire 100% artisans RGE certifiés',
    description:
      '49 000 artisans RGE pour la rénovation énergétique : Qualibat, Qualifelec, QualiPAC. Éligibles MaPrimeRénov & CEE.',
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
            __html: safeJsonStringify([getOrganizationSchema(), getWebsiteSchema()]),
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

        {/* Ahrefs Site Audit ownership verification — static HTML only (Ahrefs does not render JS) */}
        <meta
          name="ahrefs-site-verification"
          content="28cb425a7c89d8ef2e0f1e28a2d156c95c0a4e13b752a97aca555611ba44749a"
        />

        {/* Ahrefs Web Analytics — cookieless, no PII, no RGPD consent required. Must render in <head> (Ahrefs crawler verification requirement) */}
        {process.env.NEXT_PUBLIC_AHREFS_KEY ? (
          <>
            <link rel="preconnect" href="https://analytics.ahrefs.com" />
            <link rel="dns-prefetch" href="https://analytics.ahrefs.com" />
            <script
              async
              src="https://analytics.ahrefs.com/analytics.js"
              data-key={process.env.NEXT_PUBLIC_AHREFS_KEY}
            />
          </>
        ) : null}
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
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
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
            <CookieConsent />
            <SpeedInsights />
          </CompareProviderWrapper>
        </MobileMenuProvider>
      </body>
    </html>
  )
}
