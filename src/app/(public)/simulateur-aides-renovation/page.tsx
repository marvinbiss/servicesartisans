import type { Metadata } from 'next'
import StepperV2 from '@/components/simulateur/StepperV2'

const PAGE_PATH = '/simulateur-aides-renovation'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://servicesartisans.fr'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

const TITLE = "Simulateur aides rénovation énergétique 2026 — MaPrimeRénov', CEE, Coup de Pouce"
const DESCRIPTION =
  "Estimez gratuitement vos aides rénovation énergétique en 45 secondes : MaPrimeRénov', CEE, Coup de Pouce, Éco-PTZ. Barèmes officiels 2026."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const revalidate = 86400

export default function SimulateurAidesRenovationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Simulateur aides rénovation énergétique',
    url: PAGE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: 'fr-FR',
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-900 sm:text-4xl">
            Combien d&apos;aides pour votre rénovation ?
          </h1>
          <p className="mt-3 text-base text-charcoal-600">
            Estimez vos aides en <strong>45 secondes</strong> — gratuit, sans engagement.
          </p>
          <p className="mt-2 text-xs text-charcoal-400">
            MaPrimeRénov&apos; · CEE · Coup de Pouce · Éco-PTZ — Barèmes officiels 2026
          </p>
        </header>

        <StepperV2 />
      </div>
    </main>
  )
}
