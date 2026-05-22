/**
 * Defensive guard against env pollution in `NEXT_PUBLIC_SITE_URL`.
 *
 * Incident 2026-05-22 : a literal `\n` was baked into the Vercel deployment
 * env. That trailing newline cascaded into every JSON-LD `@id` field on
 * 45 677 RGE provider pages (`https://servicesartisans.fr\n` — invalid IRI),
 * triggering Google structured-data warnings and risking soft-404s on
 * `/rge/[service]/[ville]/[publicId]`.
 *
 * Two layers must be defensive :
 *   - `SITE_URL` from `@/lib/seo/config` (canonical export, used by 200+ files)
 *   - `companyIdentity.url` from `@/lib/config/company-identity` (JSON-LD `@id` root)
 *
 * Both consume `sanitizeUrl` from `@/lib/utils/sanitize-url`.
 *
 * Tests reset modules between cases because `SITE_URL` is computed at import
 * time (top-level `const`). Setting `process.env` AFTER import has no effect.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL = process.env.NEXT_PUBLIC_SITE_URL

async function loadSiteUrl(): Promise<string> {
  vi.resetModules()
  const mod = await import('@/lib/seo/config')
  return mod.SITE_URL
}

async function loadCompanyUrl(): Promise<string> {
  vi.resetModules()
  const mod = await import('@/lib/config/company-identity')
  return mod.companyIdentity.url
}

describe('sanitizeUrl — pure function', () => {
  it('strips trailing \\n (root incident 2026-05-22)', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('https://servicesartisans.fr\n')).toBe('https://servicesartisans.fr')
  })

  it('strips CRLF \\r\\n', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('https://servicesartisans.fr\r\n')).toBe('https://servicesartisans.fr')
  })

  it('strips embedded \\n mid-string (env paste accident)', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('https://services\nartisans.fr')).toBe('https://servicesartisans.fr')
  })

  it('strips TAB and trailing slash', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('\thttps://servicesartisans.fr/\t')).toBe('https://servicesartisans.fr')
  })

  it('strips multiple trailing slashes', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('https://servicesartisans.fr///')).toBe('https://servicesartisans.fr')
  })

  it('falls back to default when undefined', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl(undefined)).toBe('https://servicesartisans.fr')
  })

  it('falls back to default when null', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl(null)).toBe('https://servicesartisans.fr')
  })

  it('falls back to default when empty string', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('')).toBe('https://servicesartisans.fr')
  })

  it('falls back to default when whitespace-only', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('  \n\r\t  ')).toBe('https://servicesartisans.fr')
  })

  it('strips ASCII control chars (NUL, DEL)', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl('https://servicesartisans.fr\x00\x7F')).toBe('https://servicesartisans.fr')
  })

  it('honours custom fallback', async () => {
    vi.resetModules()
    const { sanitizeUrl } = await import('@/lib/utils/sanitize-url')
    expect(sanitizeUrl(undefined, 'https://staging.example.com')).toBe(
      'https://staging.example.com'
    )
  })
})

describe('SITE_URL (@/lib/seo/config) — env-driven', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL
  })

  it('strips literal \\n baked into env (2026-05-22 incident)', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr\n'
    expect(await loadSiteUrl()).toBe('https://servicesartisans.fr')
  })

  it('strips CRLF \\r\\n', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr\r\n'
    expect(await loadSiteUrl()).toBe('https://servicesartisans.fr')
  })

  it('strips trailing slash', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr/'
    expect(await loadSiteUrl()).toBe('https://servicesartisans.fr')
  })

  it('falls back to canonical when env unset', async () => {
    expect(await loadSiteUrl()).toBe('https://servicesartisans.fr')
  })

  it('falls back to canonical when env is whitespace-only', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = '   \n\r\t   '
    expect(await loadSiteUrl()).toBe('https://servicesartisans.fr')
  })
})

describe('companyIdentity.url (@/lib/config/company-identity) — JSON-LD @id root', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL
  })

  it('strips \\n — guards JSON-LD @id on 45K+ RGE pages', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr\n'
    const url = await loadCompanyUrl()
    expect(url).toBe('https://servicesartisans.fr')
    // Belt + suspenders : @id must NEVER contain raw control chars.
    // eslint-disable-next-line no-control-regex
    expect(url).not.toMatch(/[\s\x00-\x1F\x7F]/)
  })

  it('strips trailing slash', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://servicesartisans.fr/'
    expect(await loadCompanyUrl()).toBe('https://servicesartisans.fr')
  })

  it('falls back to canonical when env unset', async () => {
    expect(await loadCompanyUrl()).toBe('https://servicesartisans.fr')
  })
})
