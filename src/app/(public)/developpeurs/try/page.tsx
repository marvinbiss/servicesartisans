/**
 * Page TECHNIQUE — interactive Try-it-now console for the SA public API.
 *
 * Server Component shell that imports the OpenAPI 3.1 const (Ralph 27) and
 * hands it to `<TryClient>`. The Client Component handles every
 * interactive bit — endpoint selection, parameter editing, body editing,
 * Send button, response viewer, localStorage history.
 *
 * Companion to the read-only surfaces:
 *  - `/developpeurs/api-catalog` (Ralph 33) — one-line panorama
 *  - `/developpeurs/api-explorer` (Ralph 36) — operation cards
 *  - `/developpeurs/schema-explorer` (Ralph 38) — schema browser
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

import { TryClient } from './TryClient'

const PAGE_PATH = '/developpeurs/try'
const PAGE_TITLE = 'Try API — ServicesArtisans Développeurs'
const PAGE_DESCRIPTION =
  "Console interactive pour essayer l'API publique RGE-OS ServicesArtisans directement depuis le navigateur. Aucun compte requis."

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

export default function TryPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: 'https://servicesartisans.fr/' },
    { name: 'Développeurs', url: 'https://servicesartisans.fr/developpeurs' },
    { name: 'Try', url: `https://servicesartisans.fr${PAGE_PATH}` },
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
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
        <span aria-current="page">Try</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-charcoal-900 sm:text-4xl">Try API</h1>
        <p className="mt-2 text-base text-charcoal-700">
          Console interactive : choisir un endpoint, éditer les paramètres + body, envoyer la
          requête depuis votre navigateur. Voir aussi :{' '}
          <Link href="/developpeurs/api-explorer" className="text-accent-700 underline">
            explorer
          </Link>
          ,{' '}
          <Link href="/developpeurs/schema-explorer" className="text-accent-700 underline">
            schemas
          </Link>
          ,{' '}
          <Link href="/developpeurs/api-catalog" className="text-accent-700 underline">
            catalogue
          </Link>
          .
        </p>
        <p className="mt-1 text-xs text-charcoal-500">
          Aucune donnée n&apos;est envoyée à ServicesArtisans hors de la requête que vous lancez
          vous-même. L&apos;historique est stocké uniquement dans votre <code>localStorage</code>.
        </p>
      </header>

      <TryClient spec={OPENAPI_SPEC} />

      <footer className="mt-12 border-t border-charcoal-200 pt-6 text-sm text-charcoal-600">
        Page technique non indexée. Bug ?{' '}
        <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
          data@servicesartisans.fr
        </a>
        .
      </footer>
    </main>
  )
}
