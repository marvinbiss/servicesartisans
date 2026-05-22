/**
 * URL sanitization helper - defensive guard against env pollution.
 *
 * Root incident (2026-05-22) : NEXT_PUBLIC_SITE_URL had a literal `\n`
 * baked into the Vercel deployment env. That trailing newline cascaded
 * into every JSON-LD `@id` field across 45 677 RGE provider pages, which
 * Google rejected as invalid IRIs (soft-404 risk + structured data warnings).
 *
 * `String.prototype.trim()` alone strips `\n` from the outer edges, but it
 * does NOT strip control chars embedded mid-string (e.g. user paste
 * `https://example.com\n/path`). We strip ALL whitespace AND ASCII control
 * characters anywhere in the string to be fully defensive.
 *
 * The contract :
 *   - Return a fully-cleaned URL with no trailing slash.
 *   - Strip ALL whitespace (\s : space, TAB, LF, CR, FF, NBSP, ...) and
 *     ASCII control chars (\x00-\x1F\x7F) anywhere in the string.
 *   - Fall back to the canonical `https://servicesartisans.fr` if the env
 *     is unusable (undefined, null, empty, or whitespace-only).
 *
 * Used by :
 *   - `src/lib/seo/config.ts` (`SITE_URL` - canonical export)
 *   - `src/lib/config/company-identity.ts` (`companyIdentity.url` - JSON-LD @id)
 *
 * Other call sites that still read `process.env.NEXT_PUBLIC_SITE_URL`
 * directly inherit the same sanitization once they migrate to `SITE_URL`
 * from `@/lib/seo/config`. Audit script flagging direct reads :
 *   `node scripts/audit-env-pollution.mjs`
 */
const DEFAULT_SITE_URL = 'https://servicesartisans.fr'

// Regex covers all Unicode whitespace (JS \s = space, TAB, LF, CR, FF, NBSP,
// and Unicode separators) plus ASCII C0 control chars and DEL. We intentionally
// match raw control chars here - that is the entire point of the helper.
// eslint-disable-next-line no-control-regex
const URL_NOISE_RE = /[\s\x00-\x1F\x7F]+/g

export function sanitizeUrl(raw: string | undefined | null, fallback = DEFAULT_SITE_URL): string {
  if (raw === undefined || raw === null) return fallback
  const cleaned = raw.replace(URL_NOISE_RE, '').replace(/\/+$/, '')
  return cleaned.length > 0 ? cleaned : fallback
}

export { DEFAULT_SITE_URL }
