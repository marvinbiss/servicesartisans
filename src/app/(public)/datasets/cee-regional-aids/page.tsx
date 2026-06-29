import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileJson, FileSpreadsheet, Mail, Github, Calendar, BookOpen } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import {
  CEE_REGIONAL_DATASET_LICENSE,
  CEE_REGIONAL_DATASET_PATH,
  getCeeRegionalAidsFlat,
  getCeeRegionalDatasetEntries,
  getCeeRegionalDatasetLastReviewedAt,
} from '@/lib/cee/regional-aids-dataset'

/**
 * /datasets/cee-regional-aids — Sprint AI Wave G 2026-05-03.
 *
 * Page hub publique du dataset "Aides CEE régionales 2026" (CC-BY 4.0).
 * Sœur de /datasets/rge. Surface canonique pour soumission data.gouv.fr.
 *
 * Le dataset est régénéré au build via les sources éditoriales (sites
 * officiels conseils régionaux + INSEE RP 2021), donc pas de cron — la
 * fraîcheur dépend du `lastReviewedAt` éditorial.
 */

export const revalidate = 86400

const canonicalUrl = `${SITE_URL}${CEE_REGIONAL_DATASET_PATH}`

const FIELD_SCHEMA = [
  {
    name: 'region_slug',
    type: 'string',
    description: 'Slug de la région (matche la nomenclature interne SA)',
    example: 'ile-de-france',
  },
  {
    name: 'region_name',
    type: 'string',
    description: 'Nom complet officiel de la région',
    example: 'Île-de-France',
  },
  {
    name: 'climate_zone',
    type: 'enum(H1a,H1b,H1c,H2a,H2b,H2c,H2d,H3)',
    description: 'Zone climatique RT2012 — module les forfaits CEE chauffage / isolation',
    example: 'H1a',
  },
  {
    name: 'pct_maisons_individuelles',
    type: 'integer (0-100)',
    description: 'Part des maisons individuelles dans le parc résidentiel (INSEE RP 2021)',
    example: '64',
  },
  {
    name: 'pct_construction_pre_1975',
    type: 'integer (0-100)',
    description: 'Part des logements construits avant 1975 (INSEE RP 2021)',
    example: '52',
  },
  {
    name: 'aid_name',
    type: 'string',
    description: 'Nom officiel de l’aide régionale',
    example: 'Éco-rénovons Paris+',
  },
  {
    name: 'aid_montant',
    type: 'string',
    description: 'Montant max ou plafond exprimé en français lisible',
    example: 'jusqu’à 15 000 €',
  },
  {
    name: 'aid_detail',
    type: 'string',
    description: 'Description courte du dispositif et conditions',
    example: 'Aide ville de Paris + Métropole pour copropriétés…',
  },
  {
    name: 'aid_source_url',
    type: 'uri',
    description: 'URL officielle source (conseil régional / collectivité)',
    example: 'https://www.iledefrance.fr/energie-renovation',
  },
  {
    name: 'last_reviewed_at',
    type: 'date (YYYY-MM-DD)',
    description: 'Date de la dernière vérification éditoriale du barème régional',
    example: '2026-05-03',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  const lastReviewedAt = getCeeRegionalDatasetLastReviewedAt()
  return {
    title: `Dataset Aides CEE régionales 2026 — 13 régions, CC-BY 4.0`,
    description: `Dataset open-data aides CEE régionales France 2026 cumulables MPR. 13 régions, sources officielles. Vérifié ${lastReviewedAt}.`,
    alternates: getAlternates(CEE_REGIONAL_DATASET_PATH),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
    openGraph: {
      ...getOgDefaults(),
      title: `Dataset Aides CEE régionales 2026 — CC-BY 4.0 | ${SITE_NAME}`,
      description: `13 régions × aides cumulables CEE. JSON-LD + CSV libres. Sources officielles.`,
      url: canonicalUrl,
      type: 'article',
    },
  }
}

export default function CeeRegionalAidsDatasetPage() {
  const entries = getCeeRegionalDatasetEntries()
  const flatRows = getCeeRegionalAidsFlat()
  const lastReviewedAt = getCeeRegionalDatasetLastReviewedAt()
  const monthYear = new Date(lastReviewedAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Datasets', url: '/datasets' },
    { name: 'Aides CEE régionales', url: CEE_REGIONAL_DATASET_PATH },
  ]

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Aides CEE régionales France 2026',
    description: `Inventaire structuré des aides régionales cumulables avec la prime CEE nationale pour la rénovation énergétique résidentielle. ${entries.length} régions métropole + Corse (DOM exclu : dispositif GUSE distinct). Pour chaque région : zone climatique RT2012 (qui module les forfaits CEE chauffage / isolation), mix résidentiel INSEE RP 2021, et chaque aide régionale avec montant, détail et URL officielle source.`,
    url: canonicalUrl,
    license: CEE_REGIONAL_DATASET_LICENSE,
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    dateModified: lastReviewedAt,
    temporalCoverage: '2026-01-01/2026-12-31',
    spatialCoverage: {
      '@type': 'Place',
      name: 'France métropolitaine + Corse',
    },
    keywords: [
      'CEE',
      'certificats économies énergie',
      'aides régionales',
      'rénovation énergétique',
      "MaPrimeRénov'",
      'zone climatique',
      'RT2012',
      'INSEE',
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/ld+json',
        contentUrl: `${SITE_URL}/api/datasets/cee-regional-aids.json`,
        name: 'JSON-LD',
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${SITE_URL}/api/datasets/cee-regional-aids.csv`,
        name: 'CSV (Excel-ready, BOM UTF-8)',
      },
    ],
    variableMeasured: FIELD_SCHEMA.map((f) => ({
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
              { label: 'Aides CEE régionales', href: CEE_REGIONAL_DATASET_PATH },
            ]}
          />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Données ouvertes — licence CC-BY 4.0
            </div>
            <h1 data-speakable="true" className="mt-4 text-4xl font-extrabold text-charcoal-900">
              Aides CEE régionales — {entries.length} régions, {flatRows.length} dispositifs
            </h1>
            <p className="mt-3 text-lg text-charcoal-600">
              Inventaire structuré des aides régionales cumulables avec la prime CEE nationale pour
              la rénovation énergétique résidentielle. Sources officielles conseils régionaux +
              INSEE Recensement 2021. France métropolitaine + Corse (DOM exclu — dispositif GUSE
              distinct).
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-charcoal-500">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Vérification éditoriale : {monthYear} ({lastReviewedAt})
            </p>
          </header>

          {/* Téléchargement */}
          <section className="mt-10">
            <h2 className="text-2xl font-bold text-charcoal-900">Téléchargement</h2>
            <p className="mt-2 text-charcoal-600">
              Deux formats au choix. Mêmes données, libres de redistribution avec attribution (cf.
              section{' '}
              <a href="#citation" className="text-clay-500 underline">
                Citation
              </a>
              ).
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <a
                href="/api/datasets/cee-regional-aids.json"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <FileJson className="h-6 w-6 flex-shrink-0 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">JSON-LD</p>
                  <p className="mt-1 text-sm text-charcoal-500">
                    Schema.org Dataset wrapper, hiérarchie région → aides
                  </p>
                  <p className="mt-2 text-xs text-charcoal-400">
                    Streaming, jq, BigQuery, ETL programmatique
                  </p>
                </div>
              </a>
              <a
                href="/api/datasets/cee-regional-aids.csv"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download
              >
                <FileSpreadsheet
                  className="h-6 w-6 flex-shrink-0 text-accent-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-charcoal-900">CSV (one-row-per-aid)</p>
                  <p className="mt-1 text-sm text-charcoal-500">UTF-8 BOM, séparateur virgule</p>
                  <p className="mt-2 text-xs text-charcoal-400">Excel, LibreOffice, Power BI</p>
                </div>
              </a>
            </div>
          </section>

          {/* Métadonnées */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-charcoal-900">Métadonnées</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Régions couvertes</dt>
                <dd className="mt-1 text-2xl font-bold text-charcoal-900">{entries.length}</dd>
                <dd className="text-xs text-charcoal-400">Métropole + Corse — DOM exclu (GUSE)</dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Dispositifs recensés</dt>
                <dd className="mt-1 text-2xl font-bold text-charcoal-900">{flatRows.length}</dd>
                <dd className="text-xs text-charcoal-400">Aides régionales actives 2026</dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Licence</dt>
                <dd className="mt-1 text-base font-semibold text-charcoal-900">
                  Creative Commons Attribution 4.0
                </dd>
                <dd className="text-xs text-charcoal-400">CC-BY-4.0</dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Vérification éditoriale</dt>
                <dd className="mt-1 text-base font-semibold text-charcoal-900">{lastReviewedAt}</dd>
                <dd className="text-xs text-charcoal-400">Trimestrielle</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-charcoal-600">
              Sources primaires : sites officiels conseils régionaux (URLs canoniques dans le champ{' '}
              <code>aid_source_url</code>), INSEE Recensement 2021 pour le mix résidentiel, zonage
              climatique RT2012 pour le champ <code>climate_zone</code>.
            </p>
          </section>

          {/* Schema */}
          <section className="mt-12" id="schema">
            <h2 className="text-2xl font-bold text-charcoal-900">Schéma des données</h2>
            <p className="mt-2 text-charcoal-600">
              Schéma identique en JSON-LD (vue hiérarchique) et CSV (vue plate one-row-per-aid).
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-sand-300 bg-white">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Schéma des champs du dataset Aides CEE régionales — nom, type, description,
                  exemple
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
                  {FIELD_SCHEMA.map((f) => (
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
              {`ServicesArtisans. (${lastReviewedAt.slice(0, 4)}). Aides CEE régionales France
[Dataset]. Licence CC-BY-4.0. Récupéré sur ${canonicalUrl}`}
            </pre>

            <h3 className="mt-6 text-base font-semibold text-charcoal-900">BibTeX</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal-900 p-4 text-xs leading-relaxed text-sand-100">
              {`@dataset{servicesartisans_cee_regional_${lastReviewedAt.replace(/-/g, '_')},
  author       = {{ServicesArtisans}},
  title        = {Aides CEE régionales France 2026},
  year         = {${lastReviewedAt.slice(0, 4)}},
  publisher    = {${SITE_NAME}},
  url          = {${canonicalUrl}},
  license      = {CC-BY-4.0},
  version      = {${lastReviewedAt}}
}`}
            </pre>
          </section>

          {/* Liens éditoriaux */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-charcoal-900">Pages canoniques associées</h2>
            <p className="mt-2 text-charcoal-600">
              Les pages éditoriales SA qui consomment ce dataset.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-clay-500" aria-hidden="true" />
                <Link href="/cee" className="text-clay-500 underline">
                  /cee
                </Link>
                <span className="text-charcoal-500">— hub canonique des primes CEE 2026</span>
              </li>
              <li className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-clay-500" aria-hidden="true" />
                <Link href="/datasets/rge" className="text-clay-500 underline">
                  /datasets/rge
                </Link>
                <span className="text-charcoal-500">— dataset complémentaire des artisans RGE</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mt-12 rounded-xl border border-sand-300 bg-white p-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Contact & feedback</h2>
            <p className="mt-2 text-charcoal-600">
              Une aide régionale obsolète, un nouveau dispositif à intégrer, un cas d’usage à
              discuter ?
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
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
