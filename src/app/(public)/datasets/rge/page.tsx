import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileBox,
  Mail,
  Github,
  Calendar,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

/**
 * Page hub du dataset RGE — Sprint 0.4 (data.gouv.fr backbone).
 *
 * NON câblée à la DB côté Server Component pour éviter charge prod tant que
 * Sprint 0.1 (template /rge/[s]/[v]) n'est pas validé. Les chiffres
 * dynamiques (count, dernière maj) sont des stubs typés — voir TODOs.
 *
 * Activation après Sprint 0.1 :
 *   1. Remplacer STUB_COUNT / STUB_GENERATED_AT par fetch real-time depuis
 *      `/datasets/rge/rge-latest.meta.json` (ou query Supabase si meta KO)
 *   2. Connecter à `barometre_rge_snapshots` pour le compte mensuel
 *   3. Activer la cron `/api/cron/export-rge-dataset` (env RGE_DATASET_EXPORT_ENABLED)
 *   4. Soumettre dataset à data.gouv.fr (cf. docs/datagouv-submission-2026-04.md)
 */

// 24 h — la cron tourne 1×/mois, pas besoin de fraîcheur fine
export const revalidate = 86400

// TODO Sprint 0.4 : fetch /datasets/rge/rge-latest.meta.json
const STUB_COUNT = 49228
// TODO Sprint 0.4 : ISO du dernier export réel (rge-latest.meta.json → generated_at)
const STUB_GENERATED_AT = '2026-04-01T04:00:00Z'
const STUB_YEARMONTH = '2026-04'

const canonicalUrl = `${SITE_URL}/datasets/rge`
const datasetBaseUrl = `${SITE_URL}/datasets/rge`

const formatNumber = (n: number) => n.toLocaleString('fr-FR')

const formatMonth = (yearmonth: string): string =>
  new Date(`${yearmonth}-01T00:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

const formatDateLong = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

export const metadata: Metadata = {
  title: `Dataset Artisans RGE — CC-BY 4.0`,
  description: `Annuaire officiel des artisans RGE France, mis à jour mensuellement. CSV / JSON / Parquet libres. Source ADEME / France Rénov'. CC-BY 4.0.`,
  alternates: getAlternates('/datasets/rge'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1,
  },
  openGraph: {
    ...getOgDefaults(),
    title: `Dataset RGE — ${formatNumber(STUB_COUNT)} artisans certifiés | ${SITE_NAME}`,
    description: `Téléchargement libre CSV / JSON / Parquet. Licence CC-BY 4.0. Mise à jour mensuelle.`,
    url: canonicalUrl,
    type: 'article',
  },
}

type SchemaField = {
  name: string
  type: string
  description: string
  example: string
}

const SCHEMA_FIELDS: SchemaField[] = [
  {
    name: 'siret',
    type: 'string(14)',
    description: 'SIRET officiel de l’entreprise',
    example: '83001931100026',
  },
  { name: 'name', type: 'string', description: 'Raison sociale', example: 'Chauffage Lyon SARL' },
  {
    name: 'slug',
    type: 'string',
    description: 'Slug d’URL ServicesArtisans',
    example: 'chauffage-lyon-sarl',
  },
  {
    name: 'address_street',
    type: 'string?',
    description: 'Adresse postale',
    example: '12 rue Garibaldi',
  },
  { name: 'address_city', type: 'string?', description: 'Commune', example: 'Lyon' },
  { name: 'address_postal_code', type: 'string?', description: 'Code postal', example: '69003' },
  {
    name: 'address_department',
    type: 'string?',
    description: 'Code département (01–95, 971–976)',
    example: '69',
  },
  {
    name: 'address_region',
    type: 'string?',
    description: 'Région administrative',
    example: 'Auvergne-Rhône-Alpes',
  },
  { name: 'latitude', type: 'number?', description: 'Latitude WGS84', example: '45.7485' },
  { name: 'longitude', type: 'number?', description: 'Longitude WGS84', example: '4.8467' },
  {
    name: 'specialty',
    type: 'string?',
    description: 'Métier principal (slug)',
    example: 'chauffagiste',
  },
  {
    name: 'rge_qualifications',
    type: 'array<object>',
    description: 'Qualifications RGE actives — code, nom, organisme, domaine, date_debut, date_fin',
    example: '[{"code":"QualiPAC","organisme":"Qualit\'EnR",…}]',
  },
  {
    name: 'rge_valid_until',
    type: 'date?',
    description: 'Date max de validité (max des date_fin)',
    example: '2027-03-14',
  },
  {
    name: 'rge_organismes',
    type: 'array<string>',
    description: 'Organismes certificateurs distincts',
    example: '["Qualit\'EnR","Qualibat"]',
  },
  {
    name: 'rge_last_synced_at',
    type: 'datetime?',
    description: 'Dernière sync ADEME réussie',
    example: '2026-04-29T03:14:00Z',
  },
  {
    name: 'rge_source_url',
    type: 'uri?',
    description: 'Lien fiche officielle France Rénov’',
    example: 'https://france-renov.gouv.fr/…',
  },
]

export default function DatasetRgePage() {
  const monthLabel = formatMonth(STUB_YEARMONTH)
  const generatedAtLong = formatDateLong(STUB_GENERATED_AT)

  const breadcrumbs = [
    { name: 'Accueil', url: SITE_URL },
    { name: 'Datasets', url: `${SITE_URL}/datasets` },
    { name: `RGE ${monthLabel}`, url: canonicalUrl },
  ]

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Annuaire des artisans RGE de France — ${monthLabel}`,
    description: `Liste exhaustive des entreprises certifiées RGE (Reconnu Garant de l'Environnement) référencées sur ${SITE_NAME}, ${formatNumber(STUB_COUNT)} fiches au ${monthLabel}. Source ADEME / France Rénov' enrichie (géolocalisation, services, validations). Mise à jour mensuelle.`,
    url: canonicalUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    datePublished: STUB_GENERATED_AT,
    dateModified: STUB_GENERATED_AT,
    temporalCoverage: STUB_YEARMONTH,
    spatialCoverage: {
      '@type': 'Place',
      name: 'France',
      geo: {
        '@type': 'GeoShape',
        // Box France métropolitaine + DOM-TOM, format SW_lat SW_lon NE_lat NE_lon
        // SW = Martinique (-61.85°O, 14.0°N) — NE = Alsace (55.57°E, 51.1°N)
        box: '14.0 -61.85 51.10 55.57',
      },
    },
    keywords: [
      'RGE',
      'rénovation énergétique',
      'artisans',
      'ADEME',
      "MaPrimeRénov'",
      'CEE',
      'France Rénov',
      'pompe à chaleur',
      'isolation',
      'chauffagiste',
    ],
    isAccessibleForFree: true,
    creativeWorkStatus: 'Published',
    inLanguage: 'fr-FR',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${datasetBaseUrl}/rge-latest.csv`,
        name: 'CSV (UTF-8 BOM)',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/x-ndjson',
        contentUrl: `${datasetBaseUrl}/rge-latest.json`,
        name: 'NDJSON (streaming)',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/vnd.apache.parquet',
        contentUrl: `${datasetBaseUrl}/rge-latest.parquet`,
        name: 'Parquet (analytics)',
      },
    ],
    variableMeasured: SCHEMA_FIELDS.map((f) => ({
      '@type': 'PropertyValue',
      name: f.name,
      description: f.description,
    })),
  }

  return (
    <>
      <JsonLd data={[getBreadcrumbSchema(breadcrumbs), datasetSchema]} />

      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: 'Datasets', href: '/datasets' },
              { label: `RGE ${monthLabel}`, href: '/datasets/rge' },
            ]}
          />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Données ouvertes — licence CC-BY 4.0
            </div>
            <h1 className="mt-4 text-4xl font-extrabold text-charcoal-900">
              Dataset RGE — {formatNumber(STUB_COUNT)} artisans certifiés
            </h1>
            <p className="mt-3 text-lg text-charcoal-600">
              Annuaire mensuel exhaustif des entreprises RGE (Reconnu Garant de l’Environnement) de
              France, sourcé du dataset officiel ADEME / France Rénov’ et enrichi par
              ServicesArtisans (géolocalisation, services, validations terrain).
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-charcoal-500">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Dernière mise à jour : {generatedAtLong} ({monthLabel})
            </p>
          </header>

          {/* Téléchargement */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-charcoal-900">Téléchargement</h2>
            <p className="mt-2 text-charcoal-600">
              Trois formats au choix. Tous incluent les mêmes données, libres de redistribution avec
              attribution (cf. section{' '}
              <a href="#citation" className="text-clay-500 underline">
                Citation
              </a>
              ).
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <a
                href={`${datasetBaseUrl}/rge-latest.csv`}
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-emerald-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                rel="nofollow"
                download
              >
                <FileSpreadsheet
                  className="h-6 w-6 flex-shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-charcoal-900">CSV</p>
                  <p className="mt-1 text-sm text-charcoal-500">UTF-8 BOM, séparateur virgule</p>
                  <p className="mt-2 text-xs text-charcoal-400">Excel, Numbers, LibreOffice</p>
                </div>
              </a>
              <a
                href={`${datasetBaseUrl}/rge-latest.json`}
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-emerald-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                rel="nofollow"
                download
              >
                <FileJson className="h-6 w-6 flex-shrink-0 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">JSON</p>
                  <p className="mt-1 text-sm text-charcoal-500">NDJSON (1 fiche / ligne)</p>
                  <p className="mt-2 text-xs text-charcoal-400">Streaming, jq, BigQuery</p>
                </div>
              </a>
              <a
                href={`${datasetBaseUrl}/rge-latest.parquet`}
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-emerald-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                rel="nofollow"
                download
              >
                <FileBox className="h-6 w-6 flex-shrink-0 text-purple-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">
                    Parquet
                    <span className="inline-flex items-center rounded-md bg-sand-200 px-2 py-0.5 text-xs font-medium text-charcoal-700 ml-2">
                      À venir
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-charcoal-500">Colonnaire, compressé</p>
                  <p className="mt-2 text-xs text-charcoal-400">DuckDB, pandas, Spark</p>
                </div>
              </a>
            </div>
            <p className="mt-3 text-xs text-charcoal-400">
              Métadonnées (count, sha256, schema_version) :{' '}
              <a
                href={`${datasetBaseUrl}/rge-latest.meta.json`}
                className="text-clay-500 underline"
                rel="nofollow"
              >
                rge-latest.meta.json
              </a>
            </p>
          </section>

          {/* Métadonnées */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-charcoal-900">Métadonnées</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Nombre de fiches</dt>
                <dd className="mt-1 text-2xl font-bold text-charcoal-900">
                  {formatNumber(STUB_COUNT)}
                </dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Mise à jour</dt>
                <dd className="mt-1 text-2xl font-bold text-charcoal-900">{monthLabel}</dd>
                <dd className="text-xs text-charcoal-400">Le 1er de chaque mois, 04:00 UTC</dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Licence</dt>
                <dd className="mt-1 text-base font-semibold text-charcoal-900">
                  Creative Commons Attribution 4.0
                </dd>
                <dd className="text-xs text-charcoal-400">CC-BY-4.0</dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Couverture</dt>
                <dd className="mt-1 text-base font-semibold text-charcoal-900">
                  France métropolitaine + DOM-TOM
                </dd>
                <dd className="text-xs text-charcoal-400">Schema v0.1.0</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-charcoal-600">
              Source primaire :{' '}
              <a
                href="https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/"
                className="text-clay-500 underline"
                rel="noopener nofollow"
                target="_blank"
              >
                Liste des entreprises RGE (data.gouv.fr / ADEME)
              </a>
              . Enrichissements ServicesArtisans : géolocalisation INSEE, attribution métier
              (cartographie NAF), normalisation slug, lien fiche France Rénov’.
            </p>
          </section>

          {/* Schema */}
          <section className="mt-12" id="schema">
            <h2 className="text-2xl font-bold text-charcoal-900">Schéma des données</h2>
            <p className="mt-2 text-charcoal-600">
              Tous les champs sont présents en CSV / JSON / Parquet. Les champs notés <code>?</code>{' '}
              sont nullable (provider sans donnée enrichie).
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-sand-300 bg-white">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Schéma des champs du dataset RGE — nom, type, description et exemple de valeur
                </caption>
                <thead className="bg-sand-50 text-left text-charcoal-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Champ
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Exemple
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEMA_FIELDS.map((f) => (
                    <tr key={f.name} className="border-t border-sand-200">
                      <td className="px-4 py-3 font-mono text-xs text-charcoal-900">{f.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-charcoal-600">{f.type}</td>
                      <td className="px-4 py-3 text-charcoal-700">{f.description}</td>
                      <td className="px-4 py-3 font-mono text-xs text-charcoal-500">{f.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Citation */}
          <section className="mt-12" id="citation">
            <h2 className="text-2xl font-bold text-charcoal-900">Citation</h2>
            <p className="mt-2 text-charcoal-600">
              Toute redistribution ou réutilisation publique doit créditer la source. Format
              recommandé :
            </p>

            <h3 className="mt-6 text-base font-semibold text-charcoal-900">APA</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal-900 p-4 text-xs leading-relaxed text-sand-100">
              {`ServicesArtisans. (${STUB_YEARMONTH.split('-')[0]}). Annuaire des artisans RGE
de France [Dataset]. Licence CC-BY-4.0. Récupéré sur ${canonicalUrl}`}
            </pre>

            <h3 className="mt-6 text-base font-semibold text-charcoal-900">BibTeX</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal-900 p-4 text-xs leading-relaxed text-sand-100">
              {`@dataset{servicesartisans_rge_${STUB_YEARMONTH.replace('-', '_')},
  author       = {{ServicesArtisans}},
  title        = {Annuaire des artisans RGE de France},
  year         = {${STUB_YEARMONTH.split('-')[0]}},
  month        = {${STUB_YEARMONTH.split('-')[1]}},
  publisher    = {ServicesArtisans SAS},
  url          = {${canonicalUrl}},
  license      = {CC-BY-4.0},
  version      = {${STUB_YEARMONTH}}
}`}
            </pre>
          </section>

          {/* API */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-charcoal-900">API JSON temps réel</h2>
            <p className="mt-2 text-charcoal-600">
              Pour des intégrations programmatiques (vérification SIRET unitaire, recherche
              filtrée), préférer l’API JSON :{' '}
              <Link href="/developpeurs" className="text-clay-500 underline">
                /developpeurs
              </Link>
              . Endpoints actuellement exposés : <code>/api/v1/rge/lookup</code>,{' '}
              <code>/api/v1/rge/search</code>.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-12 rounded-xl border border-sand-300 bg-white p-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Contact & feedback</h2>
            <p className="mt-2 text-charcoal-600">
              Une erreur dans une fiche, un format manquant, un cas d’usage à discuter ?
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:api@servicesartisans.fr"
                className="inline-flex items-center gap-2 rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white hover:bg-charcoal-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                api@servicesartisans.fr
              </a>
              <a
                href="https://github.com/marvinbiss/servicesartisans-api-examples/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-sand-50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub Issues
              </a>
              <a
                href={`${datasetBaseUrl}/rge-latest.csv`}
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 px-4 py-2 text-sm font-semibold text-charcoal-700 hover:bg-sand-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                rel="nofollow"
                download
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Téléchargement direct CSV
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
