/**
 * GET /api/v1/embed/rge-snippet
 *
 * Serves the standalone JS loader for the RGE search widget (pillar 10
 * RGE-OS, embed widgets v1). Identical byte-for-byte to
 * `public/embed/rge-v1.js` — that file is the canonical artefact (served
 * straight from the CDN) and this route exists for environments where a
 * dynamic endpoint with explicit Cache-Control + CORS is preferable
 * (e.g. tighter caching policies, future personalisation).
 *
 * Sync invariant : the response body MUST equal `public/embed/rge-v1.js`
 * byte-for-byte. Enforced by `__tests__/app/embed/snippet.test.ts`.
 *
 * License : CC-BY 4.0 — attribution required (Powered by ServicesArtisans).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 86400

const SNIPPET_PATH = join(process.cwd(), 'public', 'embed', 'rge-v1.js')

// Read once at module init (file is in the build artefact). Falls back to
// an empty string in the unlikely event the file is missing so the route
// never throws at request time.
let snippetCache: string | null = null

function getSnippet(): string {
  if (snippetCache !== null) return snippetCache
  try {
    snippetCache = readFileSync(SNIPPET_PATH, 'utf8')
  } catch {
    snippetCache = ''
  }
  return snippetCache
}

export async function GET(): Promise<NextResponse> {
  const body = getSnippet()
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'X-License': 'CC-BY-4.0',
      'X-RGE-OS-Pillar': '10',
    },
  })
}
