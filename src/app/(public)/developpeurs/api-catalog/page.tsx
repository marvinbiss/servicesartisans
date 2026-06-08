/**
 * Page TECHNIQUE — catalogue browsable de toute la surface API v1 SA RGE-OS.
 *
 * Non destinée au ranking SEO. noindex + nofollow. Grandfather dans
 * docs/ahrefs-first-grandfather.json.
 *
 * Audience : journalistes data, devs intégrateurs, agency partners.
 * Sert de discovery hub : un GET, et le visiteur voit les 24 endpoints
 * (REST + GraphQL + SPARQL + MCP + Webhooks + SDK + CLI + Embed + …).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { getAlternates } from '@/lib/seo/config'
import { API_CATALOG, CATEGORY_ORDER, groupByCategory, type ApiEntry } from './_catalog'

const PAGE_PATH = '/developpeurs/api-catalog'
const PAGE_TITLE = 'Catalogue API RGE-OS — ServicesArtisans'
const PAGE_DESCRIPTION =
  "Catalogue complet des 24 endpoints publics de l'API v1 ServicesArtisans : AI, MaPrimeRénov, CEE, RGE, GraphQL, SPARQL, MCP, Webhooks, SDK, CLI, Embed. Licence CC-BY 4.0."

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

function statusBadge(status: ApiEntry['status']): {
  label: string
  bg: string
  text: string
} {
  if (status === 'stable') return { label: 'stable', bg: 'bg-accent-100', text: 'text-accent-800' }
  if (status === 'beta') return { label: 'beta', bg: 'bg-yellow-100', text: 'text-yellow-800' }
  return { label: 'experimental', bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
}

export default function ApiCatalogPage() {
  const grouped = groupByCategory()
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Développeurs', url: '/developpeurs' },
    { name: 'Catalogue API', url: PAGE_PATH },
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
        <span aria-current="page">Catalogue API</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 sm:text-4xl">Catalogue API RGE-OS</h1>
        <p className="mt-2 text-base text-charcoal-700">
          {API_CATALOG.length} endpoints publics, licence{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-accent-700 underline"
            rel="noopener"
            target="_blank"
          >
            CC-BY 4.0
          </a>
          . Citez <em>Source : ServicesArtisans</em>.
        </p>
        <p className="mt-2 text-sm text-charcoal-600">
          Spec OpenAPI :{' '}
          <Link href="/api/v1/openapi/json" className="text-accent-700 underline">
            JSON
          </Link>{' '}
          /{' '}
          <Link href="/api/v1/openapi/yaml" className="text-accent-700 underline">
            YAML
          </Link>
          . Spec AsyncAPI :{' '}
          <Link href="/api/v1/asyncapi/json" className="text-accent-700 underline">
            JSON
          </Link>{' '}
          /{' '}
          <Link href="/api/v1/asyncapi/yaml" className="text-accent-700 underline">
            YAML
          </Link>
          . Transparence IA :{' '}
          <Link href="/transparence-ia" className="text-accent-700 underline">
            /transparence-ia
          </Link>
          .
        </p>
      </header>

      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const entries = grouped.get(category)
          if (!entries || entries.length === 0) return null
          return (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <h2 id={`cat-${category}`} className="mb-3 text-xl font-semibold text-charcoal-900">
                {category}
              </h2>
              <ul className="divide-y divide-charcoal-200 rounded-lg border border-charcoal-200 bg-white">
                {entries.map((entry) => {
                  const badge = statusBadge(entry.status)
                  return (
                    <li key={entry.id} className="px-4 py-3 sm:px-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-base font-semibold text-charcoal-900">{entry.title}</h3>
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                        {entry.ralphRef ? (
                          <span className="text-xs text-charcoal-500">{entry.ralphRef}</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-charcoal-700">{entry.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-charcoal-600">
                        {entry.methods.length > 0 ? (
                          <span className="font-mono">
                            {entry.methods.join(' ')} {entry.path}
                          </span>
                        ) : (
                          <span className="font-mono">{entry.path}</span>
                        )}
                        {entry.docsPath ? (
                          // Fichier statique (public/docs/*.md), pas une route App —
                          // <a> natif évite le prefetch RSC (404 + fallback console).
                          <a
                            href={entry.docsPath}
                            className="text-accent-700 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Docs
                          </a>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <footer className="mt-12 border-t border-charcoal-200 pt-6 text-sm text-charcoal-600">
        <p>
          Page technique non indexée. Pour signaler une régression ou demander un endpoint manquant
          :{' '}
          <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
            data@servicesartisans.fr
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
