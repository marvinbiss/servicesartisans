import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { villes } from '@/lib/data/france'

export const revalidate = 86_400

const TITLE = '36 000 communes françaises — Données locales & artisans'
const DESCRIPTION =
  'Annuaire des 35 999 communes de France métropolitaine et DOM avec données INSEE, climat Météo-France, risques Géorisques, marché immobilier DVF et artisans RGE. Base ouverte CC-BY 4.0.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates('/communes'),
  robots: { index: true, follow: true },
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/communes`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'Communes françaises — données locales',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function CommunesHubPage() {
  const breadcrumbSchemaItems = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Communes', url: `${SITE_URL}/communes` },
  ]
  const breadcrumbUiItems = [{ label: 'Communes' }]

  // Top 100 villes par population (déjà triée dans france.ts).
  const topVilles = villes.slice(0, 100)

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbSchemaItems)} />
      <JsonLd data={getDatasetSchema()} />

      <main className="min-h-screen bg-warm-cream-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Breadcrumb items={breadcrumbUiItems} />

          <header className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900">
              36 000 communes — données locales pour artisans & particuliers
            </h1>
            <p className="mt-3 text-charcoal-700">
              Toutes les communes de France métropolitaine et des DOM avec leurs données ouvertes :
              démographie INSEE, climat Météo-France, risques Géorisques (BRGM), marché immobilier
              DVF, parc artisans BTP & RGE. Base publiée sous licence{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="text-coral-700 underline"
                rel="noopener"
              >
                CC-BY 4.0
              </a>
              .
            </p>
          </header>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-charcoal-900">
              <MapPin className="h-6 w-6" /> 100 plus grandes villes
            </h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
              {topVilles.map((v) => (
                <li key={v.slug}>
                  <Link
                    href={`/villes/${v.slug}`}
                    className="text-sm text-coral-700 hover:underline"
                  >
                    {v.name} ({v.departementCode})
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-charcoal-600">
              Les ~33 700 autres communes sont accessibles via leur URL canonique{' '}
              <code className="rounded bg-warm-cream-100 px-2 py-0.5 text-xs">
                /communes/[slug-commune]
              </code>{' '}
              (ex :{' '}
              <Link href="/communes/saint-jean-de-luz" className="text-coral-700 underline">
                /communes/saint-jean-de-luz
              </Link>
              ).
            </p>
          </section>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-charcoal-900">
              Sources & méthodologie
            </h2>
            <ul className="space-y-2 text-sm text-charcoal-700">
              <li>
                <strong>INSEE</strong> — recensement démographique 2021, SIRENE (artisans actifs).
              </li>
              <li>
                <strong>Météo-France</strong> — normales climatiques 1991-2020 (jours de gel,
                précipitations, températures saisonnières).
              </li>
              <li>
                <strong>Géorisques (BRGM)</strong> — risques majeurs : inondation,
                retrait-gonflement argile, sismicité, radon, arrêtés CatNat.
              </li>
              <li>
                <strong>DVF (data.gouv.fr)</strong> — Demandes de Valeurs Foncières (prix m²
                médians, transactions/an).
              </li>
              <li>
                <strong>ADEME</strong> — annuaire RGE (Reconnu Garant de l&apos;Environnement), base
                nationale DPE.
              </li>
              <li>
                <strong>ANAH</strong> — dossiers MaPrimeRénov&apos; instruits (volume annuel).
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}

function getDatasetSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE_URL}/communes#dataset`,
    name: 'Communes françaises — données locales agrégées',
    description: DESCRIPTION,
    url: `${SITE_URL}/communes`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    isAccessibleForFree: true,
    keywords: [
      'France',
      'communes',
      'INSEE',
      'ADEME',
      'Géorisques',
      'DVF',
      'rénovation énergétique',
      'artisans',
      'RGE',
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: `${SITE_URL}/communes`,
    },
  }
}
