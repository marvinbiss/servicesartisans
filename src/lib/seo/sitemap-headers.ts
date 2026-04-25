import 'server-only'
import { createHash } from 'node:crypto'

/**
 * Build cache-friendly headers for sitemap responses.
 *
 * Audit 2026-04-25 (agent #3 SEO M3 + L8) : sans ETag ni Last-Modified, Google
 * re-fetch les sitemaps en full à chaque cycle (~700 fetchs/jour observés).
 * Avec ETag, Google envoie `If-None-Match` et le CDN renvoie 304 Not Modified
 * → économie directe de budget crawl sur 459K pages indexées.
 *
 * Usage :
 *   const xml = renderSitemap(...)
 *   const headers = sitemapHeaders(xml, request, { lastModified: latestUpdate })
 *   if (headers.notModified) return new NextResponse(null, { status: 304, headers: headers.responseHeaders })
 *   return new NextResponse(xml, { headers: headers.responseHeaders })
 */
export interface SitemapHeadersInput {
  cacheControl?: string
  /** Latest content date for `Last-Modified` (Date or ISO string). Falls back to now. */
  lastModified?: Date | string
}

export interface SitemapHeadersResult {
  notModified: boolean
  responseHeaders: Record<string, string>
}

const DEFAULT_CACHE = 'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400'

/** SHA-256 of the body, truncated to 16 hex chars — collision-safe enough for ETag. */
function bodyEtag(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex').slice(0, 16)
}

function toHttpDate(d: Date | string): string {
  return (typeof d === 'string' ? new Date(d) : d).toUTCString()
}

export function sitemapHeaders(
  body: string,
  request: Request,
  input: SitemapHeadersInput = {}
): SitemapHeadersResult {
  const etag = `"${bodyEtag(body)}"`
  const lastModified = input.lastModified
    ? toHttpDate(input.lastModified)
    : new Date().toUTCString()

  const ifNoneMatch = request.headers.get('if-none-match')
  const ifModifiedSince = request.headers.get('if-modified-since')

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': input.cacheControl ?? DEFAULT_CACHE,
    ETag: etag,
    'Last-Modified': lastModified,
  }

  // Strong match on ETag — preferred signal.
  if (ifNoneMatch && ifNoneMatch === etag) {
    return { notModified: true, responseHeaders }
  }

  // Fallback : If-Modified-Since within 1s tolerance of Last-Modified.
  if (ifModifiedSince) {
    const since = Date.parse(ifModifiedSince)
    const last = Date.parse(lastModified)
    if (!Number.isNaN(since) && !Number.isNaN(last) && last <= since + 1000) {
      return { notModified: true, responseHeaders }
    }
  }

  return { notModified: false, responseHeaders }
}
