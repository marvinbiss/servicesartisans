/**
 * SSRF URL validation for Yousign file URLs.
 *
 * Addresses CWE-918 (Server-Side Request Forgery) by ensuring that any URL
 * fetched or stored in the context of a Yousign webhook is:
 *   1. HTTPS-only (no http, no data:, no ftp:, etc.)
 *   2. From an approved Yousign hostname allowlist
 *   3. Not an IP address literal (IPv4 or IPv6)
 *   4. Not a RFC1918 / loopback / link-local address
 *
 * This module has zero runtime dependencies — it only uses the built-in URL
 * parser and pure regex/string logic.
 */

// ---------------------------------------------------------------------------
// Allowlist
// ---------------------------------------------------------------------------

/** Exact hostnames accepted as Yousign file origins. */
export const YOUSIGN_ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  'api.yousign.app',
  'api.yousign.com',
  'files.yousign.app',
])

// ---------------------------------------------------------------------------
// Rejection patterns
// ---------------------------------------------------------------------------

/**
 * Matches bare IPv4 addresses (e.g. "1.2.3.4").
 * Intentionally strict — no CIDR, no port.
 */
const IPV4_LITERAL_RE = /^\d{1,3}(\.\d{1,3}){3}$/

/**
 * Matches IPv6 literals as they appear in a URL host (with or without brackets).
 * The URL parser strips brackets, so we match the raw address.
 *
 * Pattern covers:
 *   - Full form:      x:x:x:x:x:x:x:x  (8 groups of 1-4 hex digits)
 *   - Compressed:     groups separated by :: (e.g. ::1, fe80::1, 2001:db8::1)
 *   - IPv4-mapped:    ::ffff:1.2.3.4
 *
 * The previous `/^[0-9a-fA-F:]+$/` was too broad — it matched strings like
 * "cafe:babe" which are not valid IPv6 addresses.
 */
const IPV6_LITERAL_RE =
  /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::$/

/** RFC1918 + loopback + link-local + APIPA octets (first octet rules). */
const RFC1918_PREFIXES: ReadonlyArray<(ip: string) => boolean> = [
  // 127.0.0.0/8 — loopback
  (ip) => ip.startsWith('127.'),
  // 10.0.0.0/8 — private
  (ip) => ip.startsWith('10.'),
  // 172.16.0.0/12 — private (172.16.x.x – 172.31.x.x)
  (ip) => {
    const parts = ip.split('.')
    if (parts.length < 2) return false
    const second = Number(parts[1])
    return parts[0] === '172' && second >= 16 && second <= 31
  },
  // 192.168.0.0/16 — private
  (ip) => ip.startsWith('192.168.'),
  // 169.254.0.0/16 — link-local / APIPA
  (ip) => ip.startsWith('169.254.'),
  // 0.0.0.0/8 — this-network
  (ip) => ip.startsWith('0.'),
]

/** Loopback hostnames (in addition to 127.x.x.x caught by RFC1918). */
const LOOPBACK_HOSTS = new Set(['localhost', '::1', '[::1]', '0.0.0.0'])

// ---------------------------------------------------------------------------
// Core validation
// ---------------------------------------------------------------------------

/**
 * Returns true if the given URL string is a safe Yousign file URL.
 *
 * Rejects:
 * - Non-HTTPS schemes
 * - Hostnames not in YOUSIGN_ALLOWED_HOSTS
 * - IP address literals (IPv4 and IPv6)
 * - RFC1918 / loopback / link-local addresses
 * - Malformed URLs (URL constructor throws)
 *
 * @param url Raw URL string from Yousign webhook payload.
 */
export function validateYousignFileUrl(url: string): boolean {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return false
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    // Malformed URL — reject
    return false
  }

  // Rule 1: HTTPS only
  if (parsed.protocol !== 'https:') {
    return false
  }

  const host = parsed.hostname.toLowerCase()

  // Rule 2: loopback hostname literals
  if (LOOPBACK_HOSTS.has(host)) {
    return false
  }

  // Rule 3: Reject IPv4 literals
  if (IPV4_LITERAL_RE.test(host)) {
    // Also check RFC1918 / loopback ranges
    for (const isPrivate of RFC1918_PREFIXES) {
      if (isPrivate(host)) return false
    }
    // Even if not RFC1918, we reject all IP literals
    return false
  }

  // Rule 4: Reject IPv6 literals (URL parser strips brackets → pure hex+colon)
  if (IPV6_LITERAL_RE.test(host) || host.startsWith('[')) {
    return false
  }

  // Rule 5: Allowlist check
  if (!YOUSIGN_ALLOWED_HOSTS.has(host)) {
    return false
  }

  return true
}
