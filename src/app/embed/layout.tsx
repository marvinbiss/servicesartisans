import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

/**
 * Embed layout — pillar 10 RGE-OS (widgets).
 *
 * This nested layout wraps every `/embed/**` route. Embed widgets are
 * technical surfaces consumed by third-party sites via `<iframe>`. They
 * are noindex/nofollow on purpose — never a SEO target — and should ship
 * with minimal markup so the host page controls visual context.
 *
 * Next.js 14 does not allow a second `<html>` outside of the root layout
 * (it would render invalid nested HTML). We therefore inherit the root
 * `<html>`/`<body>` shell and rely on the embed page itself for its own
 * minimal chrome. Header/Footer are visually neutralised on these routes
 * by rendering the page inside a full-bleed wrapper that overlays the
 * default chrome via the `embed-shell` data attribute; sites that frame
 * us only see the iframe document body.
 *
 * See: docs/EMBED-WIDGETS.md
 */

export const metadata: Metadata = {
  title: 'ServicesArtisans — Embed Widget',
  description: 'Widget embeddable ServicesArtisans (RGE-OS pillar 10).',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return <div data-embed-shell="true">{children}</div>
}
