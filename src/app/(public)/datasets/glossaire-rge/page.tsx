import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileJson, FileSpreadsheet, Mail, Github, Calendar, BookOpen } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { buildDatasetSchema } from '@/lib/seo/dataset-schema'
import { getAllRgeGlossaryEntries, RGE_GLOSSAIRE_PATH } from '@/lib/seo/rge-qualifications-glossary'

/**
 * /datasets/glossaire-rge — Ralph itération 6 (2026-05-21).
 *
 * Page landing dédiée au dataset Glossaire RGE (DefinedTermSet) servi en
 * CC-BY 4.0 via /api/glossaire-rge.{json,csv}. Sœur de /datasets/rge et
 * /datasets/cee-regional-aids. Centralise la surface "dataset" pour
 * soumission data.gouv.fr et discoverability Google Dataset Search.
 *
 * Note : /rge/glossaire reste la page HTML canonique éditoriale (entité
 * de référence sameAs). Cette page-ci est l'entrée "data catalog" pure,
 * pas une duplication SEO du contenu glossaire.
 */

export const revalidate = 86400

const PAGE_PATH = '/datasets/glossaire-rge'
const canonicalUrl = `${SITE_URL}${PAGE_PATH}`
const LAST_REVIEWED_AT = '2026-05-03'

const FIELD_SCHEMA = [
  {
    name: 'slug',
    type: 'string',
    description: 'Identifiant slug stable kebab-case (utilisé pour @id et anchors)',
    example: 'qualipac',
  },
  {
    name: 'code',
    type: 'string',
    description: 'Code officiel court de la qualification RGE',
    example: 'QualiPAC',
  },
  {
    name: 'name',
    type: 'string',
    description: 'Libellé humain affichable',
    example: 'Qualification Pompes À Chaleur',
  },
  {
    name: 'definition',
    type: 'string',
    description: 'Définition courte (100-300 chars), ton expert YMYL',
    example: "Certification délivrée par Qualit'EnR pour les installateurs de PAC…",
  },
  {
    name: 'organisme',
    type: 'string',
    description: 'Organisme certificateur officiel',
    example: "Qualit'EnR",
  },
  {
    name: 'domaine',
    type: 'string',
    description: 'Domaine de travaux couvert',
    example: 'Chauffage / ECS',
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Dataset Glossaire RGE — 16 qualifications canoniques, CC-BY 4.0',
    description:
      'Dataset open-data du glossaire des qualifications RGE officielles (QualiPAC, Qualibat, Qualifelec, OPQIBI). JSON-LD DefinedTermSet + CSV. Licence CC-BY 4.0.',
    alternates: getAlternates(PAGE_PATH),
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large' as const,
      'max-video-preview': -1,
    },
    openGraph: {
      ...getOgDefaults(),
      title: `Dataset Glossaire RGE — CC-BY 4.0 | ${SITE_NAME}`,
      description:
        '16 qualifications RGE officielles en JSON-LD DefinedTermSet + CSV. Source ADEME / France Rénov.',
      url: canonicalUrl,
      type: 'article',
    },
  }
}

export default function DatasetGlossaireRgePage() {
  const entries = getAllRgeGlossaryEntries()
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Datasets', url: '/datasets' },
    { name: 'Glossaire RGE', url: PAGE_PATH },
  ]

  const datasetSchema = buildDatasetSchema({
    id: `${canonicalUrl}#dataset`,
    name: 'Glossaire RGE — Définitions canoniques des qualifications',
    description: `Vocabulaire canonique des ${entries.length} qualifications RGE officielles (QualiPAC, QualiSol, QualiBois, Qualibat 7141/7144/7131, Qualifelec IRVE, OPQIBI 1905…) avec organismes certificateurs, domaines de travaux et primes CEE/MaPrimeRénov' débloquées. Source ADEME / France Rénov'.`,
    url: canonicalUrl,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    creator: { name: SITE_NAME, url: SITE_URL },
    publisher: { name: SITE_NAME, url: SITE_URL },
    dateModified: LAST_REVIEWED_AT,
    spatialCoverage: 'FR',
    inLanguage: 'fr-FR',
    keywords: [
      'glossaire RGE',
      'qualifications RGE',
      'QualiPAC',
      'Qualibat',
      'Qualifelec',
      'OPQIBI',
      'DefinedTermSet',
      "MaPrimeRénov'",
      'CEE',
    ],
    distributions: [
      {
        contentUrl: `${SITE_URL}/api/glossaire-rge.json`,
        encodingFormat: 'application/ld+json',
        name: 'JSON-LD (Schema.org DefinedTermSet)',
      },
      {
        contentUrl: `${SITE_URL}/api/glossaire-rge.csv`,
        encodingFormat: 'text/csv',
        name: 'CSV (Excel-ready, BOM UTF-8)',
      },
    ],
    variableMeasured: FIELD_SCHEMA.map((f) => f.name),
  })

  return (
    <>
      <JsonLd data={[getBreadcrumbSchema(breadcrumbs), datasetSchema]} />

      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: 'Datasets', href: '/datasets' },
              { label: 'Glossaire RGE', href: PAGE_PATH },
            ]}
          />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Données ouvertes — licence CC-BY 4.0
            </div>
            <h1 data-speakable="true" className="mt-4 text-4xl font-extrabold text-charcoal-900">
              Dataset Glossaire RGE — {entries.length} qualifications canoniques
            </h1>
            <p className="mt-3 text-lg text-charcoal-600">
              Vocabulaire canonique des qualifications RGE (Reconnu Garant de l’Environnement)
              officielles : QualiPAC, QualiSol, QualiBois, Qualibat 7141 / 7144 / 7131, Qualifelec
              IRVE, OPQIBI 1905… Servi en JSON-LD Schema.org <code>DefinedTermSet</code> + CSV.
              Source ADEME / France Rénov’.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm text-charcoal-500">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Vérification éditoriale : {LAST_REVIEWED_AT}
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
                href="/api/glossaire-rge.json"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                <FileJson className="h-6 w-6 flex-shrink-0 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-charcoal-900">JSON-LD</p>
                  <p className="mt-1 text-sm text-charcoal-500">
                    Schema.org DefinedTermSet — 1 entrée par qualification
                  </p>
                  <p className="mt-2 text-xs text-charcoal-400">
                    Streaming, jq, ETL programmatique
                  </p>
                </div>
              </a>
              <a
                href="/api/glossaire-rge.csv"
                className="flex items-start gap-3 rounded-xl border border-sand-300 bg-white p-5 hover:border-accent-500 hover:shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download
              >
                <FileSpreadsheet
                  className="h-6 w-6 flex-shrink-0 text-accent-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-charcoal-900">CSV</p>
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
                <dt className="text-sm text-charcoal-500">Qualifications</dt>
                <dd className="mt-1 text-2xl font-bold text-charcoal-900">{entries.length}</dd>
                <dd className="text-xs text-charcoal-400">RGE officielles France 2026</dd>
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
                  France métropolitaine + DOM
                </dd>
              </div>
              <div className="rounded-xl border border-sand-300 bg-white p-5">
                <dt className="text-sm text-charcoal-500">Vérification éditoriale</dt>
                <dd className="mt-1 text-base font-semibold text-charcoal-900">
                  {LAST_REVIEWED_AT}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-charcoal-600">
              Sources primaires : référentiel{' '}
              <a
                href="https://france-renov.gouv.fr/"
                className="text-clay-500 underline"
                rel="noopener nofollow"
                target="_blank"
              >
                france-renov.gouv.fr
              </a>{' '}
              et{' '}
              <a
                href="https://annuaire-rge.ademe.fr/"
                className="text-clay-500 underline"
                rel="noopener nofollow"
                target="_blank"
              >
                annuaire-rge.ademe.fr
              </a>
              .
            </p>
          </section>

          {/* Schema */}
          <section className="mt-12" id="schema">
            <h2 className="text-2xl font-bold text-charcoal-900">Schéma des données</h2>
            <p className="mt-2 text-charcoal-600">
              Schéma identique en JSON-LD (DefinedTermSet) et CSV (one-row-per-term).
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-sand-300 bg-white">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Schéma des champs du dataset Glossaire RGE — nom, type, description, exemple
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
              {`ServicesArtisans. (${LAST_REVIEWED_AT.slice(0, 4)}). Glossaire RGE — Définitions
canoniques des qualifications [Dataset]. Licence CC-BY-4.0. Récupéré sur
${canonicalUrl}`}
            </pre>

            <h3 className="mt-6 text-base font-semibold text-charcoal-900">BibTeX</h3>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-charcoal-900 p-4 text-xs leading-relaxed text-sand-100">
              {`@dataset{servicesartisans_glossaire_rge_${LAST_REVIEWED_AT.replace(/-/g, '_')},
  author       = {{ServicesArtisans}},
  title        = {Glossaire RGE — Définitions canoniques des qualifications},
  year         = {${LAST_REVIEWED_AT.slice(0, 4)}},
  publisher    = {${SITE_NAME}},
  url          = {${canonicalUrl}},
  license      = {CC-BY-4.0},
  version      = {${LAST_REVIEWED_AT}}
}`}
            </pre>
          </section>

          {/* Pages canoniques associées */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-charcoal-900">Pages canoniques associées</h2>
            <p className="mt-2 text-charcoal-600">
              Les pages éditoriales SA qui consomment ce dataset.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-clay-500" aria-hidden="true" />
                <Link href={RGE_GLOSSAIRE_PATH} className="text-clay-500 underline">
                  {RGE_GLOSSAIRE_PATH}
                </Link>
                <span className="text-charcoal-500">— entité éditoriale canonique (HTML)</span>
              </li>
              <li className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-clay-500" aria-hidden="true" />
                <Link href="/datasets/rge" className="text-clay-500 underline">
                  /datasets/rge
                </Link>
                <span className="text-charcoal-500">— dataset annuaire RGE (~49K fiches)</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mt-12 rounded-xl border border-sand-300 bg-white p-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Contact &amp; feedback</h2>
            <p className="mt-2 text-charcoal-600">
              Une qualification obsolète, un référentiel à corriger, un cas d’usage à discuter ?
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
