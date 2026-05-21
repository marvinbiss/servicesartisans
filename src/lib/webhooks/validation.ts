/**
 * Input validation for /api/v1/webhooks/* — URL + email guards.
 *
 * URL hardening (SSRF prevention) :
 *   - Reject anything that does not parse as `URL`.
 *   - In production : only `https://` accepted; `http://` is allowed
 *     exclusively for `localhost` / `127.0.0.1` (dev/CI loopback).
 *   - Reject RFC1918 private ranges + link-local in production so a
 *     malicious subscriber can't pivot the prod worker into the internal
 *     network (Postgres host, metadata endpoints, etc.).
 *   - Reject URLs > 500 chars (DoS prevention + DB column safety).
 *
 * Email is optional. Validation is intentionally lenient (RFC 5322 is a
 * minefield) — we only need a coarse format gate; deliverability is the
 * subscriber's problem.
 */

export type ValidationResult = { ok: true; value: string } | { ok: false; reason: string }

export function validateWebhookUrl(raw: unknown): ValidationResult {
  if (typeof raw !== 'string') return { ok: false, reason: 'url must be a string' }
  if (raw.length === 0) return { ok: false, reason: 'url must be a non-empty string' }
  if (raw.length > 500) return { ok: false, reason: 'url max 500 chars' }

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { ok: false, reason: 'url must be valid URL' }
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, reason: 'url must be http(s)://' }
  }

  if (
    parsed.protocol === 'http:' &&
    parsed.hostname !== 'localhost' &&
    parsed.hostname !== '127.0.0.1'
  ) {
    return { ok: false, reason: 'http:// only allowed for localhost; use https:// for prod' }
  }

  if (isPrivateHost(parsed.hostname) && process.env.NODE_ENV === 'production') {
    return { ok: false, reason: 'private/loopback hostnames not allowed in prod' }
  }

  return { ok: true, value: parsed.toString() }
}

function isPrivateHost(host: string): boolean {
  if (/^10\./.test(host)) return true
  if (/^192\.168\./.test(host)) return true
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return true
  if (/^169\.254\./.test(host)) return true
  return false
}

export function validateEmail(raw: unknown): ValidationResult {
  if (raw === undefined || raw === null) return { ok: true, value: '' }
  if (typeof raw !== 'string') return { ok: false, reason: 'email must be a string' }
  if (raw.length === 0) return { ok: true, value: '' }
  if (raw.length > 254) return { ok: false, reason: 'email max 254 chars' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) {
    return { ok: false, reason: 'email format invalid' }
  }
  return { ok: true, value: raw }
}
