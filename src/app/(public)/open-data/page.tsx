/**
 * Hub Open Data — landing publique exposant les datasets ServicesArtisans.
 *
 * Plan v2 ULTRA DOMINATION SEO synthèse 10-agents 2026-04-28 #4 :
 *   "Dataset data.gouv.fr (DR 92, +5-8 DR), 2j".
 *
 * Stratégie SEO :
 *   - Schema.org Dataset × 2 (DataCatalog conteneur)
 *   - Soumission data.gouv.fr → backlink DR 92
 *   - Réutilisateurs opendata (insee.fr, observatoire-tpe-pme.fr) crawlent le hub
 *   - Licence Etalab 2.0 (compatible ouverture maximale)
 *
 * Stratégie E-E-A-T :
 *   - Méthodologie publiée (k-anonymat ≥ 10 sur agrégats locaux)
 *   - Sources sourcées (ADEME / France Rénov')
 *   - Format machine-readable (CSV + NDJSON + DCAT manifest)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileText, Download, Shield } from 'lucide-react'
import { SITE_URL, SITE_NAME, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { safeJsonStringify } from '@/lib/seo/safe-json'

export const revalidate = 86400
export const dynamic = 'force-static'

const PATH = '/open-data'
// Title court : root template ajoute ` | ServicesArtisans` (17 chars),
// objectif final ≤ 60 chars (audit Meta Quality 2026-04-30 : 66 → 50).
const TITLE = 'Open Data — RGE & stats locales France'
const TITLE_SOCIAL = 'Open Data — annuaire RGE & stats locales France'
const DESCRIPTION =
  'Annuaire artisans RGE (ADEME) + statistiques locales par commune et métier. CSV / NDJSON / DCAT. Licence Etalab 2.0.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    ...getOgDefaults(),
    title: TITLE_SOCIAL,
    description: DESCRIPTION,
    type: 'website',
    locale: 'fr_FR',
    url: `${SITE_URL}${PATH}`,
  },
  twitter: { card: 'summary_large_image', title: TITLE_SOCIAL, description: DESCRIPTION },
  alternates: getAlternates(PATH),
}

const PAGE_URL = `${SITE_URL}${PATH}`

function buildCatalogSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: `${SITE_NAME} — Catalogue Open Data`,
    description:
      'Datasets publics ServicesArtisans : annuaire RGE + statistiques locales agrégées par commune × métier.',
    url: PAGE_URL,
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    inLanguage: 'fr',
    license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/',
    isAccessibleForFree: true,
    dataset: [
      {
        '@type': 'Dataset',
        name: 'Annuaire artisans RGE certifiés (mise à jour mensuelle)',
        description:
          "Liste des artisans certifiés RGE (Reconnu Garant de l'Environnement) sourcée depuis l'annuaire officiel ADEME / France Rénov', enrichie d'un slug stable et d'une URL canonique. Format CSV + NDJSON. Mise à jour mensuelle automatique.",
        creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        sourceOrganization: {
          '@type': 'GovernmentOrganization',
          name: 'ADEME — Agence de la transition écologique',
          url: 'https://france-renov.gouv.fr/',
        },
        datePublished: '2026-04-29',
        spatialCoverage: { '@type': 'Country', name: 'France' },
        temporalCoverage: '2026/..',
        accrualPeriodicity: 'http://purl.org/cld/freq/monthly',
        license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/',
        isAccessibleForFree: true,
        url: `${SITE_URL}/datasets/rge/rge-latest.csv`,
        keywords: ['rge', 'rénovation énergétique', 'artisans', 'ademe', 'maprimerenov', 'cee'],
        variableMeasured: [
          'SIRET',
          'Nom commercial',
          'Adresse géocodée',
          'Qualifications RGE actives',
          'Date validité',
          'Organisme certificateur',
        ],
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/csv',
            contentUrl: `${SITE_URL}/datasets/rge/rge-latest.csv`,
          },
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/x-ndjson',
            contentUrl: `${SITE_URL}/datasets/rge/rge-latest.json`,
          },
        ],
      },
      {
        '@type': 'Dataset',
        name: 'Statistiques locales artisanales agrégées (commune × métier)',
        description:
          "Agrégats par commune et spécialité métier : nombre d'artisans actifs, nombre RGE, note moyenne, volume d'avis. Filtré par k-anonymat ≥ 10 (aucune ré-identification possible d'un artisan unique). Mise à jour quotidienne.",
        creator: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        datePublished: '2026-04-29',
        spatialCoverage: { '@type': 'Country', name: 'France' },
        accrualPeriodicity: 'http://purl.org/cld/freq/daily',
        license: 'https://www.etalab.gouv.fr/licence-ouverte-open-licence/',
        isAccessibleForFree: true,
        url: `${SITE_URL}/api/open-data/local-stats.csv`,
        keywords: ['artisans', 'statistiques locales', 'commune', 'métier', 'avis', 'rge'],
        variableMeasured: [
          "Nombre d'artisans actifs",
          'Nombre RGE certifiés',
          'Note moyenne (1-5)',
          "Volume d'avis cumulé",
        ],
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'text/csv',
            contentUrl: `${SITE_URL}/api/open-data/local-stats.csv`,
          },
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/x-ndjson',
            contentUrl: `${SITE_URL}/api/open-data/local-stats.json`,
          },
        ],
      },
    ],
  }
}

function buildBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Open Data', item: PAGE_URL },
    ],
  }
}

export default function OpenDataPage() {
  const catalog = buildCatalogSchema()
  const breadcrumb = buildBreadcrumbSchema()

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(catalog) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumb) }}
      />

      <header className="bg-charcoal-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-amber-400 font-semibold uppercase tracking-wider mb-3">
            Open Data
          </p>
          <h1
            data-speakable="true"
            className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            Catalogue ouvert ServicesArtisans
          </h1>
          <p className="text-lg text-charcoal-200 max-w-3xl">
            Datasets publics réutilisables sous licence Etalab 2.0 : annuaire des artisans RGE
            certifiés (sourcé ADEME) et statistiques locales agrégées par commune et métier.
          </p>
        </div>
      </header>

      <section className="py-10 bg-accent-50/40 border-b border-accent-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-accent-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-semibold text-charcoal-900 mb-1">
                Licence Etalab 2.0
              </h2>
              <p className="text-sm text-charcoal-600">
                Réutilisation libre, y compris commerciale, avec mention de la source.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Database className="w-6 h-6 text-accent-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-semibold text-charcoal-900 mb-1">Formats ouverts</h2>
              <p className="text-sm text-charcoal-600">
                CSV (UTF-8) + NDJSON streaming-friendly + manifest DCAT-AP.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-accent-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-semibold text-charcoal-900 mb-1">K-anonymat ≥ 10</h2>
              <p className="text-sm text-charcoal-600">
                Aucun bucket avec moins de 10 entreprises. Aucune PII publiée.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <article className="rounded-2xl border border-sand-300 bg-white p-6 md:p-8">
            <header className="mb-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-1">
                Dataset 1 — Annuaire artisans RGE certifiés
              </h2>
              <p className="text-sm text-charcoal-500">
                Source : ADEME / France Rénov'. Mise à jour mensuelle. Couverture nationale.
              </p>
            </header>
            <p className="text-charcoal-700 mb-5 leading-relaxed">
              Liste des artisans certifiés RGE (Reconnu Garant de l'Environnement), sourcée
              directement depuis l'annuaire officiel ADEME publié sur france-renov.gouv.fr, enrichie
              d'un slug stable + URL canonique pour chaque artisan. Indispensable pour les outils de
              simulateur d'aides, comparateurs et réutilisateurs opendata.
            </p>
            <h3 className="font-semibold text-charcoal-900 mb-2">Champs disponibles</h3>
            <ul className="text-sm text-charcoal-600 mb-5 grid md:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5">
              <li>SIRET (14 chiffres)</li>
              <li>Nom commercial</li>
              <li>Adresse géocodée (lat/lon)</li>
              <li>Qualifications RGE actives</li>
              <li>Date de validité</li>
              <li>Organisme certificateur</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="/datasets/rge/rge-latest.csv"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download
              >
                <Download className="w-4 h-4" aria-hidden="true" /> CSV (rge-latest.csv)
              </a>
              <a
                href="/datasets/rge/rge-latest.json"
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 hover:border-primary-400 hover:bg-primary-50 px-5 py-2.5 text-sm font-semibold text-charcoal-800 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download
              >
                <Download className="w-4 h-4" aria-hidden="true" /> NDJSON
              </a>
              <a
                href="/datasets/rge/rge-latest.meta.json"
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 hover:border-primary-400 hover:bg-primary-50 px-5 py-2.5 text-sm font-semibold text-charcoal-800 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                Métadonnées
              </a>
            </div>
          </article>

          <article className="rounded-2xl border border-sand-300 bg-white p-6 md:p-8">
            <header className="mb-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-1">
                Dataset 2 — Statistiques locales agrégées
              </h2>
              <p className="text-sm text-charcoal-500">
                K-anonymat ≥ 10 sur la jointure (commune × métier). Mise à jour quotidienne.
                Couverture nationale.
              </p>
            </header>
            <p className="text-charcoal-700 mb-5 leading-relaxed">
              Statistiques agrégées par commune et spécialité métier : nombre d'artisans actifs,
              nombre RGE certifiés, note moyenne et volume d'avis cumulé. Aucun nom, SIRET ou donnée
              personnelle publiés. Filtré par k-anonymat ≥ 10. Idéal pour les études territoriales
              sur l'artisanat, les déserts énergétiques et l'attractivité locale.
            </p>
            <h3 className="font-semibold text-charcoal-900 mb-2">Champs disponibles</h3>
            <ul className="text-sm text-charcoal-600 mb-5 grid md:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-5">
              <li>Code commune (slug + nom)</li>
              <li>Code département</li>
              <li>Région</li>
              <li>Spécialité métier</li>
              <li>Nombre d'artisans actifs</li>
              <li>Nombre RGE certifiés</li>
              <li>Note moyenne (1-5)</li>
              <li>Volume d'avis cumulé</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/open-data/local-stats.csv"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 text-sm transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download="servicesartisans-local-stats.csv"
              >
                <Download className="w-4 h-4" aria-hidden="true" /> CSV
              </a>
              <a
                href="/api/open-data/local-stats.json"
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 hover:border-primary-400 hover:bg-primary-50 px-5 py-2.5 text-sm font-semibold text-charcoal-800 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                download="servicesartisans-local-stats.ndjson"
              >
                <Download className="w-4 h-4" aria-hidden="true" /> NDJSON
              </a>
              <a
                href="/api/open-data/manifest.json"
                className="inline-flex items-center gap-2 rounded-lg border border-sand-300 hover:border-primary-400 hover:bg-primary-50 px-5 py-2.5 text-sm font-semibold text-charcoal-800 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              >
                Manifest DCAT
              </a>
            </div>
          </article>

          <article className="rounded-2xl border border-accent-200 bg-accent-50/40 p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-3">
              Méthodologie & garanties
            </h2>
            <ul className="space-y-2 text-sm text-charcoal-700 list-disc pl-5">
              <li>
                <strong>Source RGE</strong> : annuaire officiel ADEME publié sur{' '}
                <a
                  href="https://france-renov.gouv.fr/"
                  className="underline hover:text-accent-700"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  france-renov.gouv.fr
                </a>{' '}
                (Licence Etalab 2.0). Sync hebdomadaire automatisée.
              </li>
              <li>
                <strong>K-anonymat ≥ 10</strong> : les agrégats locaux ne publient que les buckets
                contenant au moins 10 artisans actifs. Aucune ré-identification possible d'un
                artisan unique d'une commune × spécialité rare, même par triangulation avec d'autres
                sources publiques.
              </li>
              <li>
                <strong>PII-free</strong> : aucun nom, email, téléphone ou adresse précise dans les
                agrégats. Le dataset RGE ne publie que les champs déjà publics dans l'annuaire
                ADEME.
              </li>
              <li>
                <strong>Format machine-readable</strong> : CSV UTF-8 BOM (Excel-friendly) + NDJSON
                streaming-friendly + manifest DCAT-AP conforme W3C.
              </li>
              <li>
                <strong>Réutilisation</strong> : licence Etalab 2.0, mention « Source :{' '}
                ServicesArtisans » obligatoire.
              </li>
              <li>
                <strong>Responsabilité de traitement (RGPD)</strong> : le dataset RGE est issu de
                l'annuaire ADEME publié sur{' '}
                <a
                  href="https://france-renov.gouv.fr/"
                  className="underline hover:text-accent-700"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  france-renov.gouv.fr
                </a>{' '}
                sous Licence Etalab 2.0. ServicesArtisans en est <em>distributeur</em> avec
                enrichissement (slug stable + URL canonique), mais{' '}
                <strong>n'est pas responsable de traitement originel</strong>. Toute demande
                d'exercice des droits RGPD relative aux données ADEME doit être adressée à l'ADEME
                directement. Les agrégats locaux (Dataset 2) sont de notre seule responsabilité et
                garantis sans PII par construction (k-anonymat ≥ 10).
              </li>
            </ul>
          </article>

          <div className="text-sm text-charcoal-600">
            <p>
              Question, retour, anomalie sur les données ?{' '}
              <Link
                href="/contact"
                className="font-semibold text-primary-700 hover:text-primary-900 underline underline-offset-2"
              >
                Contactez-nous
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
