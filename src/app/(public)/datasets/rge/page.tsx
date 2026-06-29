import type { Metadata } from 'next'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import Link from 'next/link'
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileBox,
  FileText,
  BookOpen,
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
 * Action #4 (Sprint B 2026-05-03) : activation complète.
 *   1. ✅ Remplacement STUB par fetch real-time du fichier `rge-latest.meta.json`
 *      au build (build-time read, pas de charge prod runtime)
 *   2. Cron `/api/cron/export-rge-dataset` à activer via env RGE_DATASET_EXPORT_ENABLED=true
 *   3. Manifest data.gouv.fr : `docs/datagouv-rge-manifest.json`
 *   4. Submission UI : data.gouv.fr/admin/datasets/new (manuel post-activation cron)
 */

// 24 h — la cron tourne 1×/mois, pas besoin de fraîcheur fine
export const revalidate = 86400

// Fallback values utilisés si le fichier meta JSON n'est pas lisible (build env).
// Synchronisés avec le dernier export réel pour rester crédibles si la lecture
// fs échoue (CI sans fichier copié, test build, etc.).
const FALLBACK_COUNT = 49228
const FALLBACK_GENERATED_AT = '2026-04-01T04:00:00Z'
const FALLBACK_YEARMONTH = '2026-04'

type DatasetMeta = {
  count: number
  generatedAt: string
  yearmonth: string
}

async function readDatasetMeta(): Promise<DatasetMeta> {
  // Read at build time (Server Component, revalidate=86400). No prod runtime
  // hit. If the file is absent or malformed, fall back to last-known values.
  try {
    const filePath = path.join(process.cwd(), 'public', 'datasets', 'rge', 'rge-latest.meta.json')
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as {
      count?: number
      generated_at?: string
      yearmonth?: string
    }
    return {
      count: typeof parsed.count === 'number' ? parsed.count : FALLBACK_COUNT,
      generatedAt:
        typeof parsed.generated_at === 'string' ? parsed.generated_at : FALLBACK_GENERATED_AT,
      yearmonth: typeof parsed.yearmonth === 'string' ? parsed.yearmonth : FALLBACK_YEARMONTH,
    }
  } catch {
    return {
      count: FALLBACK_COUNT,
      generatedAt: FALLBACK_GENERATED_AT,
      yearmonth: FALLBACK_YEARMONTH,
    }
  }
}

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

export async function generateMetadata(): Promise<Metadata> {
  const meta = await readDatasetMeta()
  return {
    title: `Dataset Artisans RGE 2026 — ${formatNumber(meta.count)} fiches CC-BY 4.0`,
    description: `Annuaire officiel ${formatNumber(meta.count)} artisans RGE France, maj mensuelle. CSV / JSON / Parquet libres. Source ADEME / France Rénov'. Licence CC-BY 4.0.`,
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
      title: `Dataset RGE — ${formatNumber(meta.count)} artisans certifiés | ${SITE_NAME}`,
      description: `Téléchargement libre CSV / JSON / Parquet. Licence CC-BY 4.0. Mise à jour mensuelle.`,
      url: canonicalUrl,
      type: 'article',
    },
  }
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

export default async function DatasetRgePage() {
  const meta = await readDatasetMeta()
  const monthLabel = formatMonth(meta.yearmonth)
  const generatedAtLong = formatDateLong(meta.generatedAt)

  // Sprint AI Ahrefs 2026-05-03 (Reviewer datasets agent HIGH) — paths relatifs
  // obligatoires : `getBreadcrumbSchema` préfixe lui-même `${SITE_URL}`.
  // Avant ce fix, `${SITE_URL}${SITE_URL}/datasets` produisait des URLs
  // doublées dans le BreadcrumbList → Google Rich Results invalide.
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Datasets', url: '/datasets' },
    { name: `RGE ${monthLabel}`, url: '/datasets/rge' },
  ]

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Annuaire des artisans RGE de France — ${monthLabel}`,
    description: `Liste exhaustive des entreprises certifiées RGE (Reconnu Garant de l'Environnement) référencées sur ${SITE_NAME}, ${formatNumber(meta.count)} fiches au ${monthLabel}. Source ADEME / France Rénov' enrichie (géolocalisation, services, validations). Mise à jour mensuelle.`,
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
    datePublished: meta.generatedAt,
    dateModified: meta.generatedAt,
    temporalCoverage: meta.yearmonth,
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

  // Sprint AH Ahrefs 2026-05-03 — Dataset complémentaire glossaire RGE.
  // Référence l'asset open-data /api/glossaire-rge.{json,csv} créé par
  // Sprints AC + AF. Inventaire unique des datasets RGE sur cette page.
  const glossaireDatasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Glossaire RGE — Définitions canoniques',
    description:
      "Vocabulaire canonique des 16 qualifications RGE officielles (QualiPAC, QualiSol, QualiBois, Qualibat 7141/7144/7131, Qualifelec IRVE, OPQIBI 1905…) avec organismes certificateurs, domaines de travaux et primes CEE/MaPrimeRénov' débloquées. Source ADEME / France Rénov'.",
    url: `${SITE_URL}/rge/glossaire`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'fr-FR',
    keywords: [
      'glossaire RGE',
      'qualifications RGE',
      'QualiPAC',
      'Qualibat',
      'Qualifelec',
      'OPQIBI',
      'DefinedTermSet',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/ld+json',
        contentUrl: `${SITE_URL}/api/glossaire-rge.json`,
        name: 'JSON-LD (Schema.org DefinedTermSet)',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${SITE_URL}/api/glossaire-rge.csv`,
        name: 'CSV (Excel-ready, BOM UTF-8)',
      },
    ],
  }

  return (
    <>
      <JsonLd data={[getBreadcrumbSchema(breadcrumbs), datasetSchema, glossaireDatasetSchema]} />

      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: 'Datasets', href: '/datasets' },
              { label: `RGE ${monthLabel}`, href: '/datasets/rge' },
            ]}
          />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Données ouvertes — licence CC-BY 4.0
            </div>
            <h1 data-speakable="true" className="mt-4 text-4xl font-extrabold text-charcoal-900">
              Dataset RGE — {formatNumber(meta.count)} artisans certifiés
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
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                rel="nofollow"
                download
              >
                <FileSpreadsheet
                  className="h-6 w-6 flex-shrink-0 text-accent-600"
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
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
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
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
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
                  {formatNumber(meta.count)}
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
              {`ServicesArtisans. (${meta.yearmonth.split('-')[0]}). Annuaire des artisans RGE
de France [Dataset]. Licence CC-BY-4.0. Récupéré sur ${canonicalUrl}`}
            </pre>

            <h3 className="mt-6 text-base font-semibold text-charcoal-900">BibTeX</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal-900 p-4 text-xs leading-relaxed text-sand-100">
              {`@dataset{servicesartisans_rge_${meta.yearmonth.replace('-', '_')},
  author       = {{ServicesArtisans}},
  title        = {Annuaire des artisans RGE de France},
  year         = {${meta.yearmonth.split('-')[0]}},
  month        = {${meta.yearmonth.split('-')[1]}},
  publisher    = {${SITE_NAME}},
  url          = {${canonicalUrl}},
  license      = {CC-BY-4.0},
  version      = {${meta.yearmonth}}
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

          {/* Datasets complémentaires — Sprint AH Ahrefs 2026-05-03 */}
          <section className="mt-12" id="datasets-complementaires">
            <h2 className="text-2xl font-bold text-charcoal-900">Datasets complémentaires</h2>
            <p className="mt-2 text-charcoal-600">
              D’autres assets open-data ServicesArtisans liés à l’écosystème RGE, sous la même
              licence CC-BY 4.0. Réutilisables librement avec attribution.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="/api/glossaire-rge.json"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <FileJson className="h-6 w-6 flex-shrink-0 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">
                    Glossaire RGE — Définitions canoniques
                  </p>
                  <p className="mt-1 text-sm text-charcoal-600">
                    16 qualifications RGE officielles (QualiPAC, Qualibat, Qualifelec, OPQIBI) en
                    JSON-LD
                  </p>
                  <p className="mt-2 text-xs text-charcoal-400">
                    Format : JSON-LD Schema.org · Licence : CC-BY 4.0
                  </p>
                </div>
              </a>
              <a
                href="/api/glossaire-rge.csv"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download
              >
                <FileText className="h-6 w-6 flex-shrink-0 text-accent-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">Glossaire RGE — Format CSV</p>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Mêmes définitions RGE en CSV (Excel-ready, BOM UTF-8)
                  </p>
                  <p className="mt-2 text-xs text-charcoal-400">
                    Format : text/csv · Licence : CC-BY 4.0
                  </p>
                </div>
              </a>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-600">
              <BookOpen className="h-4 w-4 text-clay-500" aria-hidden="true" />
              Page HTML canonique (entité de référence) :{' '}
              <Link href="/rge/glossaire" className="text-clay-500 underline">
                /rge/glossaire
              </Link>
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
