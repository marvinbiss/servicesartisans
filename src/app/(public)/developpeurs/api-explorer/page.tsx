/**
 * Page TECHNIQUE — explorer interactif de la spec OpenAPI 3.1 publique.
 *
 * Lit directement le const `OPENAPI_SPEC` (Ralph 27) — pas de fetch
 * build-time, donc déterministe + pas de SPOF si la route /api/v1/openapi
 * 5xx. Sert de complément à `/developpeurs/api-catalog` (Ralph 33) :
 *   - catalog = panorama 1 ligne / endpoint
 *   - explorer = vue détaillée 1 carte / opération
 *
 * Non destinée au ranking SEO. noindex + nofollow. Grandfather dans
 * docs/ahrefs-first-grandfather.json.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { getAlternates } from '@/lib/seo/config'
import { getSpec } from './_spec-source'
import { flattenSpec, OperationBlock, anchorId } from './_renderer'
import type { OperationLite } from './_types'

const PAGE_PATH = '/developpeurs/api-explorer'
const PAGE_TITLE = 'API Explorer — ServicesArtisans Développeurs'
const PAGE_DESCRIPTION =
  'Explorer interactif de la spec OpenAPI 3.1 publique ServicesArtisans : path par path, paramètres + réponses + exemples curl. Licence CC-BY 4.0.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `https://servicesartisans.fr${PAGE_PATH}`,
    siteName: 'ServicesArtisans',
    locale: 'fr_FR',
  },
}

export const dynamic = 'force-static'
export const revalidate = 86400

export default function ApiExplorerPage() {
  const spec = getSpec()
  const operations = flattenSpec(spec)

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Développeurs', url: '/developpeurs' },
    { name: 'API Explorer', url: PAGE_PATH },
  ])

  const byTag = new Map<string, OperationLite[]>()
  for (const op of operations) {
    const tag = op.tags?.[0] ?? 'Misc'
    const list = byTag.get(tag) ?? []
    list.push(op)
    byTag.set(tag, list)
  }
  const sortedTags = Array.from(byTag.keys()).sort()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbs) }}
      />

      <nav aria-label="Fil d'Ariane" className="mb-4 text-sm text-charcoal-600">
        <Link href="/" className="hover:underline">
          Accueil
        </Link>
        {' / '}
        <Link href="/developpeurs" className="hover:underline">
          Développeurs
        </Link>
        {' / '}
        <span aria-current="page">API Explorer</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 sm:text-4xl">API Explorer</h1>
        <p className="mt-2 text-base text-charcoal-700">
          {operations.length} opérations OpenAPI 3.1. Spec source :{' '}
          <Link href="/api/v1/openapi/json" className="text-accent-700 underline">
            JSON
          </Link>{' '}
          /{' '}
          <Link href="/api/v1/openapi/yaml" className="text-accent-700 underline">
            YAML
          </Link>
          . Catalogue :{' '}
          <Link href="/developpeurs/api-catalog" className="text-accent-700 underline">
            /developpeurs/api-catalog
          </Link>
          .
        </p>
        <p className="mt-1 text-xs text-charcoal-500">
          Licence{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-accent-700 underline"
            target="_blank"
            rel="noopener"
          >
            CC-BY 4.0
          </a>{' '}
          — citez <em>Source : ServicesArtisans</em>.
        </p>
      </header>

      <nav aria-label="Tags" className="mb-6">
        <ul className="flex flex-wrap gap-2 text-xs">
          {sortedTags.map((tag) => (
            <li key={tag}>
              <a
                href={`#${anchorId('tag', tag)}`}
                className="rounded border border-charcoal-200 px-2 py-1 hover:border-accent-400"
              >
                {tag} ({byTag.get(tag)?.length ?? 0})
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {sortedTags.map((tag) => (
          <section
            key={tag}
            id={anchorId('tag', tag)}
            aria-labelledby={anchorId('tag-heading', tag)}
          >
            <h2
              id={anchorId('tag-heading', tag)}
              className="mb-3 text-xl font-semibold text-charcoal-900"
            >
              {tag}
            </h2>
            <div className="space-y-3">
              {byTag.get(tag)?.map((op) => (
                <OperationBlock key={`${op.method}-${op.path}`} op={op} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-charcoal-200 pt-6 text-sm text-charcoal-600">
        <p>
          Page technique non indexée. Signaler une régression :{' '}
          <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
            data@servicesartisans.fr
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
