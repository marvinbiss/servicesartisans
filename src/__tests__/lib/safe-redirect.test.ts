import { describe, it, expect } from 'vitest'
import { isSafeRedirectPath, getSafeRedirectPath } from '@/lib/safe-redirect'

describe('isSafeRedirectPath', () => {
  // Valid paths
  it('accepts /espace-client', () => {
    expect(isSafeRedirectPath('/espace-client')).toBe(true)
  })

  it('accepts /espace-artisan', () => {
    expect(isSafeRedirectPath('/espace-artisan')).toBe(true)
  })

  it('accepts /admin/dashboard', () => {
    expect(isSafeRedirectPath('/admin/dashboard')).toBe(true)
  })

  it('accepts root path /', () => {
    expect(isSafeRedirectPath('/')).toBe(true)
  })

  it('accepts deeply nested path /a/b/c/d/e', () => {
    expect(isSafeRedirectPath('/a/b/c/d/e')).toBe(true)
  })

  it('accepts path with query params /page?foo=bar&baz=1', () => {
    expect(isSafeRedirectPath('/page?foo=bar&baz=1')).toBe(true)
  })

  it('accepts path with hash /page#section', () => {
    expect(isSafeRedirectPath('/page#section')).toBe(true)
  })

  it('accepts path with query and hash /page?q=1#top', () => {
    expect(isSafeRedirectPath('/page?q=1#top')).toBe(true)
  })

  // Blocks absolute URLs
  it('blocks https://evil.com', () => {
    expect(isSafeRedirectPath('https://evil.com')).toBe(false)
  })

  it('blocks http://evil.com', () => {
    expect(isSafeRedirectPath('http://evil.com')).toBe(false)
  })

  // Blocks protocol-relative URLs
  it('blocks //evil.com', () => {
    expect(isSafeRedirectPath('//evil.com')).toBe(false)
  })

  // Blocks encoded double slashes
  it('blocks %2F%2Fevil.com (encoded //)', () => {
    expect(isSafeRedirectPath('%2F%2Fevil.com')).toBe(false)
  })

  it('blocks /%2Fevil.com (mixed encoded slash)', () => {
    expect(isSafeRedirectPath('/%2Fevil.com')).toBe(false)
  })

  // Blocks backslash tricks
  it('blocks \\/\\/evil.com (backslash trick)', () => {
    expect(isSafeRedirectPath('\\/\\/evil.com')).toBe(false)
  })

  it('blocks /\\evil.com (single backslash)', () => {
    // After replace \\ -> /, becomes //evil.com which starts with //
    expect(isSafeRedirectPath('/\\evil.com')).toBe(false)
  })

  // Blocks javascript: protocol
  it('blocks /javascript:alert(1)', () => {
    expect(isSafeRedirectPath('/javascript:alert(1)')).toBe(false)
  })

  // Blocks data: protocol
  it('blocks /data:text/html,<script>alert(1)</script>', () => {
    expect(isSafeRedirectPath('/data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  // Handles null, undefined, empty string
  it('returns false for null', () => {
    expect(isSafeRedirectPath(null as unknown as string)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isSafeRedirectPath(undefined as unknown as string)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isSafeRedirectPath('')).toBe(false)
  })

  // Edge: relative path without leading slash
  it('blocks relative path without leading slash', () => {
    expect(isSafeRedirectPath('espace-client')).toBe(false)
  })

  // Edge: malformed percent encoding
  it('blocks malformed percent encoding like %ZZ', () => {
    expect(isSafeRedirectPath('/%ZZ')).toBe(false)
  })
})

describe('getSafeRedirectPath', () => {
  it('returns the path when it is safe', () => {
    expect(getSafeRedirectPath('/espace-client')).toBe('/espace-client')
  })

  it('returns fallback / when path is invalid', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBe('/')
  })

  it('returns custom fallback when path is invalid', () => {
    expect(getSafeRedirectPath('//evil.com', '/connexion')).toBe('/connexion')
  })

  it('returns fallback when path is null', () => {
    expect(getSafeRedirectPath(null)).toBe('/')
  })

  it('returns fallback when path is undefined', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/')
  })

  it('returns fallback when path is empty string', () => {
    expect(getSafeRedirectPath('', '/home')).toBe('/home')
  })

  it('returns deep path when valid', () => {
    expect(getSafeRedirectPath('/admin/dashboard/users?page=2')).toBe(
      '/admin/dashboard/users?page=2'
    )
  })

  it('returns fallback for javascript: scheme', () => {
    expect(getSafeRedirectPath('/javascript:void(0)')).toBe('/')
  })
})
