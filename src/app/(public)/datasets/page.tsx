import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileBox, BookOpen } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_NAME, SITE_URL, getAlternates, getOgDefaults } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'

/**
 * /datasets — Sprint AI Wave G 2026-05-03.
 *
 * Hub canonique des datasets open-data ServicesArtisans (CC-BY 4.0).
 * Avant ce sprint, /datasets retournait 404 alors que les breadcrumbs des
 * pages enfants pointaient vers ce chemin → erreur structurelle Schema.org
 * BreadcrumbList. Ce hub regroupe :
 *   - /datasets/rge (annuaire ~49K artisans RGE)
 *   - /datasets/cee-regional-aids (13 régions × dispositifs CEE)
 *   - /rge/glossaire (glossaire DefinedTermSet, exposé aussi en JSON+CSV)
 */

export const revalidate = 86400

const PAGE_PATH = '/datasets'
const canonicalUrl = `${SITE_URL}${PAGE_PATH}`

export const metadata: Metadata = {
  title: 'Datasets open-data — CC-BY 4.0',
  description:
    'Datasets open-data ServicesArtisans : annuaire RGE ~49K fiches, aides CEE régionales 13 régions, glossaire qualifications. Tous CC-BY 4.0.',
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
    title: `Datasets open-data ServicesArtisans | ${SITE_NAME}`,
    description: `Annuaire RGE, aides CEE régionales, glossaire qualifications. Licence CC-BY 4.0.`,
    url: canonicalUrl,
    type: 'website',
  },
}

interface DatasetCard {
  href: string
  title: string
  description: string
  count: string
  format: string
  icon: typeof Database
}

const DATASETS: DatasetCard[] = [
  {
    href: '/datasets/rge',
    title: 'Annuaire des artisans RGE de France',
    description:
      "Liste exhaustive des entreprises certifiées RGE (Reconnu Garant de l'Environnement) sourcée ADEME / France Rénov’, enrichie géolocalisation et services. Mise à jour mensuelle.",
    count: '~49 000 fiches',
    format: 'CSV · NDJSON · Parquet',
    icon: Database,
  },
  {
    href: '/datasets/cee-regional-aids',
    title: 'Aides CEE régionales France 2026',
    description:
      'Inventaire structuré des aides régionales cumulables avec la prime CEE nationale. 13 régions métropole + Corse. Pour chaque région : zone climatique RT2012, mix résidentiel INSEE, et chaque aide avec montant et URL officielle source.',
    count: '13 régions',
    format: 'JSON-LD · CSV',
    icon: FileBox,
  },
  {
    href: '/rge/glossaire',
    title: 'Glossaire RGE — Définitions canoniques',
    description:
      'Vocabulaire canonique des 16 qualifications RGE officielles (QualiPAC, QualiSol, Qualibat, Qualifelec, OPQIBI…) avec organismes certificateurs, domaines de travaux et primes débloquées.',
    count: '16 qualifications',
    format: 'JSON-LD · CSV · HTML',
    icon: BookOpen,
  },
]

export default function DatasetsHubPage() {
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Datasets', url: PAGE_PATH },
  ]

  // Schema.org DataCatalog : signal explicite à Google que cette page est
  // un index de Datasets — déclenche affichage rich result Dataset Discovery.
  const dataCatalogSchema = {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    name: `Datasets open-data ${SITE_NAME}`,
    description:
      'Catalogue des datasets open-data ServicesArtisans : annuaires métiers, aides énergétiques, glossaires de qualifications. Tous publiés sous licence CC-BY 4.0.',
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'fr-FR',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    dataset: DATASETS.map((d) => ({
      '@type': 'Dataset',
      name: d.title,
      description: d.description,
      url: `${SITE_URL}${d.href}`,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
    })),
  }

  return (
    <>
      <JsonLd data={[getBreadcrumbSchema(breadcrumbs), dataCatalogSchema]} />

      <div className="min-h-screen bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb items={[{ label: 'Datasets', href: PAGE_PATH }]} />

          <header className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold text-accent-800">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Tous les datasets sont publiés sous licence CC-BY 4.0
            </div>
            <h1 data-speakable="true" className="mt-4 text-4xl font-extrabold text-charcoal-900">
              Datasets open-data ServicesArtisans
            </h1>
            <p className="mt-3 text-lg text-charcoal-600">
              Données structurées librement réutilisables pour la recherche, le journalisme data,
              les acteurs publics et les outils tiers de la rénovation énergétique. Sources
              officielles (ADEME, France Rénov’, INSEE, conseils régionaux) enrichies par
              ServicesArtisans (géolocalisation, normalisation, attribution métier).
            </p>
          </header>

          <section className="mt-10 grid grid-cols-1 gap-5">
            {DATASETS.map((d) => {
              const Icon = d.icon
              return (
                <Link
                  key={d.href}
                  href={d.href}
                  className="block rounded-xl border border-sand-300 bg-white p-6 hover:border-accent-500 hover:shadow transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50">
                      <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-charcoal-900">{d.title}</h2>
                      <p className="mt-2 text-sm text-charcoal-600 leading-relaxed">
                        {d.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-1 font-semibold text-charcoal-700">
                          {d.count}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-1 font-mono text-charcoal-700">
                          {d.format}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-1 font-semibold text-accent-700">
                          CC-BY 4.0
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </section>

          <section className="mt-12 rounded-xl border border-sand-300 bg-white p-6">
            <h2 className="text-2xl font-bold text-charcoal-900">Politique d’ouverture</h2>
            <p className="mt-2 text-charcoal-600">
              Tous nos datasets sont publiés sous licence{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-clay-500 underline"
              >
                Creative Commons Attribution 4.0
              </a>
              . Cela vous autorise à les copier, redistribuer, modifier et exploiter commercialement
              à condition de créditer ServicesArtisans et de pointer la page canonique du dataset.
              Pour les besoins programmatiques (vérification SIRET unitaire, recherche), préférer
              les{' '}
              <Link href="/developpeurs" className="text-clay-500 underline">
                APIs publiques
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
