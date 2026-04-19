import type { Metadata } from 'next'
import StepperV2 from '@/components/simulateur/StepperV2'
import JsonLd from '@/components/JsonLd'
import {
  getBreadcrumbSchema,
  getFinancialProductSchema,
  getGovernmentServiceSchema,
} from '@/lib/seo/jsonld'

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
  const webApplicationSchema = {
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

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Aides à la rénovation', url: '/aides' },
    { name: 'Simulateur aides rénovation', url: PAGE_PATH },
  ])

  const governmentServiceSchema = getGovernmentServiceSchema({
    name: "MaPrimeRénov', CEE, Coup de pouce et Éco-PTZ",
    description:
      "Simulation des aides publiques et privées à la rénovation énergétique en France : MaPrimeRénov' (ANAH), Certificats d'Économies d'Énergie (dispositif L221-1 du code de l'énergie), Coup de pouce (chartes arrêté 25 mars 2020 modifié et arrêté 7 janvier 2026) et Éco-prêt à taux zéro (article 244 quater U du CGI). Barèmes officiels 2026.",
    url: PAGE_URL,
    serviceType: 'Aide financière à la rénovation énergétique',
    audience: 'Propriétaires et locataires de logements résidentiels en France',
    temporalCoverage: '2026-01-01/2030-12-31',
    sameAs: [
      'https://france-renov.gouv.fr/',
      'https://www.service-public.fr/particuliers/vosdroits/F342',
      'https://www.ecologie.gouv.fr/politiques-publiques/certificats-deconomies-denergie',
      'https://www.maprimerenov.gouv.fr/',
    ],
  })

  const financialProductSchema = getFinancialProductSchema({
    name: 'Aides cumulées rénovation énergétique',
    description:
      "Cumul des aides financières disponibles pour la rénovation énergétique : MaPrimeRénov' (ANAH), prime CEE classique ou précarité, bonification Coup de pouce, Éco-PTZ jusqu'à 50 000 €, TVA 5,5 %. Le total des aides ne peut excéder 100 % du coût TTC des travaux.",
    url: PAGE_URL,
    category: 'Government Grant',
    feesAndCommissionsSpecification:
      "Simulation gratuite, sans engagement. Versement des aides sous réserve d'éligibilité : logement de plus de 2 ans (CEE) ou de 15 ans (MaPrimeRénov'), artisan RGE à la date de signature du devis, respect du parcours administratif (engagement CEE AVANT signature du devis).",
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={governmentServiceSchema} />
      <JsonLd data={financialProductSchema} />
      <JsonLd data={webApplicationSchema} />
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
