/**
 * Page TECHNIQUE — browseable view of the AsyncAPI 3.0 spec (Ralph 30).
 *
 * Reads `ASYNCAPI_SPEC` directly — no fetch, no AsyncAPI Studio runtime
 * cost, no client JS. Lists every channel + operation + message with
 * payload schema, required fields, and example payloads.
 *
 * Companion to the REST surface (`/developpeurs/api-explorer`, Ralph 36)
 * — closes the parity gap so subscribers can browse the async (webhook)
 * half of the public API.
 *
 * Not a SEO target. noindex + nofollow. Grandfather entry in
 * `docs/ahrefs-first-grandfather.json`.
 */

import type { Metadata } from 'next'
import Link from 'next/link'

import { ASYNCAPI_SPEC } from '@/app/api/v1/asyncapi/_spec'
import { getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { safeJsonStringify } from '@/lib/seo/safe-json'

import { flattenAsyncApi } from './_flatten-asyncapi'
import { ChannelBlock, ServerRow } from './_renderer'

const PAGE_PATH = '/developpeurs/asyncapi-explorer'
const PAGE_TITLE = 'AsyncAPI Explorer — ServicesArtisans Développeurs'
const PAGE_DESCRIPTION =
  'Explorer interactif de la spec AsyncAPI 3.0.0 ServicesArtisans : channels, messages, payloads pour les webhooks RGE-OS.'

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

export default function AsyncApiExplorerPage() {
  const { channels, servers, info } = flattenAsyncApi(ASYNCAPI_SPEC as unknown)

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Développeurs', url: '/developpeurs' },
    { name: 'AsyncAPI Explorer', url: PAGE_PATH },
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
        <span aria-current="page">AsyncAPI Explorer</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-900 sm:text-4xl">AsyncAPI Explorer</h1>
        <p className="mt-2 text-base text-charcoal-700">
          {info.title ?? 'ServicesArtisans RGE-OS'}
          {info.version ? ` v${info.version}` : ''} — {channels.length} channels. Spec :{' '}
          <Link href="/api/v1/asyncapi/json" className="text-accent-700 underline">
            JSON
          </Link>{' '}
          /{' '}
          <Link href="/api/v1/asyncapi/yaml" className="text-accent-700 underline">
            YAML
          </Link>
          . REST companion :{' '}
          <Link href="/developpeurs/api-explorer" className="text-accent-700 underline">
            /developpeurs/api-explorer
          </Link>
          .
        </p>
        {info.description ? (
          <p className="mt-2 text-sm text-charcoal-700">{info.description}</p>
        ) : null}
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

      {servers.length > 0 ? (
        <section aria-labelledby="servers-h" className="mb-8">
          <h2 id="servers-h" className="mb-2 text-xl font-semibold text-charcoal-900">
            Servers
          </h2>
          <ul className="space-y-1">
            {servers.map((s) => (
              <ServerRow key={s.name} s={s} />
            ))}
          </ul>
        </section>
      ) : null}

      <nav aria-label="Index channels" className="mb-6">
        <ul className="flex flex-wrap gap-2 text-xs">
          {channels.map((c) => (
            <li key={c.id}>
              <a
                href={`#channel-${c.id}`}
                className="rounded border border-charcoal-200 px-2 py-1 font-mono hover:border-accent-400"
              >
                {c.id}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        {channels.map((c) => (
          <ChannelBlock key={c.id} ch={c} />
        ))}
      </div>

      <footer className="mt-12 border-t border-charcoal-200 pt-6 text-sm text-charcoal-600">
        <p>
          Page technique non indexée. Signaler un drift :{' '}
          <a href="mailto:data@servicesartisans.fr" className="text-accent-700 underline">
            data@servicesartisans.fr
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
