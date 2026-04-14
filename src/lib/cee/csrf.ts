/**
 * CSRF / Origin validation for CEE partner POST routes.
 *
 * Mirrors the pattern used by `src/lib/admin-auth.ts::validateOrigin` but
 * exposed as a standalone helper so non-admin artisan routes can enforce it
 * without pulling the full `requirePermission` machinery.
 *
 * Policy
 * ------
 * - Reject cross-site requests identified via `Sec-Fetch-Site: cross-site`.
 * - If `Origin` / `Referer` is present, it must match `NEXT_PUBLIC_SITE_URL`
 *   or `NEXTAUTH_URL`.
 * - If no allowed URLs are configured (dev mode), allow all.
 * - Missing Origin header → allow (curl, server-to-server, same-origin from
 *   some Safari versions). Session auth provides primary protection.
 */

import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || request.headers.get('referer')
  const secFetchSite = request.headers.get('sec-fetch-site')

  if (secFetchSite === 'cross-site') {
    logger.warn('cee-csrf: blocked cross-site via Sec-Fetch-Site', {
      action: 'cee-csrf-cross-site',
    })
    return false
  }

  if (!origin) {
    return true
  }

  const allowedUrls = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL].filter(
    Boolean
  ) as string[]

  if (allowedUrls.length === 0) {
    return true
  }

  let originHost: string
  try {
    originHost = new URL(origin).origin
  } catch {
    logger.warn('cee-csrf: malformed origin rejected', {
      action: 'cee-csrf-malformed',
    })
    return false
  }

  const allowed = allowedUrls.some((url) => {
    try {
      return new URL(url).origin === originHost
    } catch {
      return false
    }
  })

  if (!allowed) {
    logger.warn('cee-csrf: origin mismatch', {
      action: 'cee-csrf-mismatch',
      origin: originHost,
    })
  }

  return allowed
}
