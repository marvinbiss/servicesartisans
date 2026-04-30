import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { villes } from '@/lib/data/france'
import EnBrefBox from '@/components/seo/EnBrefBox'
import TldrBlock from '@/components/flagship/TldrBlock'
import { ArticleMeta } from '@/components/ArticleMeta'
import { monthlyAnchorIso } from '@/lib/seo/sprint-helpers'

export const revalidate = 86_400

// Title court : le template root ajoute ` | ServicesArtisans` (17 chars),
// objectif final ≤ 60 chars (audit Meta Quality 2026-04-30 : 68 → 51).
const TITLE = '36 000 communes — Données locales 2026'
const TITLE_SOCIAL = '36 000 communes — Données locales & artisans 2026'
const DESCRIPTION =
  'Annuaire 35 999 communes France : INSEE, climat, Géorisques, DVF, artisans RGE. Base ouverte CC-BY 4.0.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates('/communes'),
  robots: { index: true, follow: true },
  openGraph: {
    ...getOgDefaults(),
    locale: 'fr_FR',
    title: TITLE_SOCIAL,
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
    title: TITLE_SOCIAL,
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

  const dateModifiedIso = monthlyAnchorIso()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '36 000 communes — Données locales 2026',
    description: DESCRIPTION,
    url: `${SITE_URL}/communes`,
    datePublished: '2024-01-15T08:00:00.000Z',
    dateModified: dateModifiedIso,
    inLanguage: 'fr-FR',
    isAccessibleForFree: true,
    image: `${SITE_URL}/opengraph-image`,
    author: {
      '@type': 'Organization',
      name: 'Équipe éditoriale ServicesArtisans',
      url: `${SITE_URL}/a-propos`,
      '@id': `${SITE_URL}#organization`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/communes` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }

  const enBrefPoints = [
    `35 999 communes (métropole + DOM) avec données INSEE, climat, risques`,
    `100 plus grandes villes accessibles directement, 33 700 par URL canonique`,
    `Sources : INSEE, Météo-France, BRGM, DVF, ADEME, ANAH`,
    `Licence ouverte CC-BY 4.0 — citation autorisée avec lien vers la source`,
  ]

  const tldrBullets = [
    `Annuaire de 35 999 communes françaises agrégeant 6 datasets publics : INSEE, Météo-France, Géorisques (BRGM), DVF, ADEME (RGE), ANAH (MaPrimeRénov').`,
    `Chaque commune dispose d'une page /communes/[slug] avec démographie, climat, risques, marché immobilier, parc artisans BTP et RGE.`,
    `Les 100 plus grandes villes sont listées sur cette page ; les 33 700 autres sont accessibles via leur URL canonique sans pagination.`,
    `Base ouverte sous licence Creative Commons BY 4.0 — réutilisation autorisée avec attribution.`,
  ]

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbSchemaItems)} />
      <JsonLd data={articleSchema} />
      <JsonLd data={getDatasetSchema()} />

      <main className="min-h-screen bg-warm-cream-50">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Breadcrumb items={breadcrumbUiItems} />

          <header className="mt-6 mb-8">
            <h1 data-speakable="true" className="text-3xl md:text-4xl font-bold text-charcoal-900">
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
            <div className="mt-6 space-y-4">
              <ArticleMeta
                author="Équipe éditoriale ServicesArtisans"
                authorHref="/a-propos"
                datePublished="2024-01-15T08:00:00.000Z"
                dateModified={dateModifiedIso}
              />
              <EnBrefBox keyPoints={enBrefPoints} />
              <TldrBlock bullets={tldrBullets} />
            </div>
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
