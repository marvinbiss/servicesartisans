import type { Metadata } from 'next'
import Stepper from '@/components/simulateur/Stepper'

const PAGE_PATH = '/simulateur-aides-renovation'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://servicesartisans.fr'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

const TITLE = "Simulateur aides rénovation énergétique 2026 — MaPrimeRénov', CEE, Coup de Pouce"
const DESCRIPTION =
  "Estimez en 5 étapes vos aides rénovation énergétique : MaPrimeRénov', Certificats d'Économies d'Énergie (CEE), Coup de Pouce, TVA réduite. Barèmes officiels 2026."

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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <header className="mb-6 sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simulateur aides rénovation énergétique 2026
          </h1>
          <p className="mt-3 text-base text-slate-700 sm:text-lg">
            Estimez en 5 étapes le montant de vos aides : <strong>MaPrimeRénov&apos;</strong>,{' '}
            <strong>Certificats d&apos;Économies d&apos;Énergie (CEE)</strong>,{' '}
            <strong>Coup de Pouce</strong>, TVA 5,5 % et Éco-PTZ.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Estimation indicative non contractuelle — barèmes officiels 2026-01.
          </p>
        </header>

        <Stepper />
      </div>
    </main>
  )
}
