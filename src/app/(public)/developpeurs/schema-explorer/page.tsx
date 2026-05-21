/**
 * Page TECHNIQUE — browse `components.schemas` of the public OpenAPI 3.1
 * spec (Ralph 27).
 *
 * Companion to `/developpeurs/api-explorer` (Ralph 36): the explorer
 * shows paths/operations, this page inverts the projection and shows
 * every named data shape with an auto-generated minimal example and a
 * reverse used-by index pointing back at the operations that $ref it.
 *
 * Not a SEO target. noindex + nofollow. Grandfather entry in
 * `docs/ahrefs-first-grandfather.json`.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { OPENAPI_SPEC } from '@/app/api/v1/openapi/_spec'
import { getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { safeJsonStringify } from '@/lib/seo/safe-json'

import { buildMinimalExample } from './_example-builder'
import { flattenSchemas } from './_flatten-schemas'
import { SchemaBlock } from './_renderer'

const PAGE_PATH = '/developpeurs/schema-explorer'
const PAGE_TITLE = 'Schema Explorer — ServicesArtisans Développeurs'
const PAGE_DESCRIPTION =
  'Explorer interactif des schémas OpenAPI 3.1 publique ServicesArtisans : properties + required + exemples auto-générés + used-by reverse index.'

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

export default function SchemaExplorerPage() {
  const spec = OPENAPI_SPEC as unknown as Record<string, unknown>
  const schemas = flattenSchemas(spec)
  const allSchemasMap = (() => {
    const comp =
      spec.components && typeof spec.components === 'object'
        ? (spec.components as Record<string, unknown>)
        : {}
    return comp.schemas && typeof comp.schemas === 'object'
      ? (comp.schemas as Record<string, unknown>)
      : {}
  })()

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Développeurs', url: '/developpeurs' },
    { name: 'Schema Explorer', url: PAGE_PATH },
  ])

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
        <span aria-current="page">Schema Explorer</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 sm:text-4xl">Schema Explorer</h1>
        <p className="mt-2 text-base text-charcoal-700">
          {schemas.length} schemas <code className="font-mono">components.schemas</code>. Spec :{' '}
          <Link href="/api/v1/openapi/json" className="text-accent-700 underline">
            JSON
          </Link>{' '}
          /{' '}
          <Link href="/api/v1/openapi/yaml" className="text-accent-700 underline">
            YAML
          </Link>
          . Opérations :{' '}
          <Link href="/developpeurs/api-explorer" className="text-accent-700 underline">
            /developpeurs/api-explorer
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

      <nav aria-label="Index schemas" className="mb-6">
        <ul className="flex flex-wrap gap-2 text-xs">
          {schemas.map((s) => (
            <li key={s.name}>
              <a
                href={`#schema-${s.name}`}
                className="rounded border border-charcoal-200 px-2 py-1 font-mono hover:border-accent-400"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        {schemas.map((schema) => (
          <SchemaBlock
            key={schema.name}
            schema={schema}
            example={buildMinimalExample(schema.name, allSchemasMap)}
          />
        ))}
      </div>

      <footer className="mt-12 border-t border-charcoal-200 pt-6 text-sm text-charcoal-600">
        <p>
          Page technique non indexée. Signaler un drift de schéma :{' '}
          <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
            data@servicesartisans.fr
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
