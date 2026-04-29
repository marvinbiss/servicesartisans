/**
 * Tests `getAlternates` — guard contre la régression literal-vs-template
 * détectée dans `/blog/[slug]/page.tsx` (`getAlternates('/blog/${slug}')`
 * en single quotes au lieu de backticks → canonical cassé sur tous les
 * articles). Couverture minimum recommandée par test-architect 2026-04-29.
 */
import { describe, it, expect } from 'vitest'
import { getAlternates, SITE_URL } from '@/lib/seo/config'

describe('getAlternates', () => {
  it('canonical resolves the literal path interpolated by the caller', () => {
    const result = getAlternates('/blog/guide-artisan-rge')
    expect(result.canonical).toBe(`${SITE_URL}/blog/guide-artisan-rge`)
  })

  it('canonical NEVER contains a route segment placeholder', () => {
    // Si quelqu'un passe '/blog/[slug]' au lieu d'interpoler, fail.
    // Idem pour ${...} qui aurait fuité d'un literal mal écrit.
    const result = getAlternates('/blog/some-real-slug')
    expect(result.canonical).not.toContain('[')
    expect(result.canonical).not.toContain('${')
  })

  it('languages fr-FR and x-default match canonical exactly', () => {
    const result = getAlternates('/services/plombier/paris')
    expect(result.languages['fr-FR']).toBe(result.canonical)
    expect(result.languages['x-default']).toBe(result.canonical)
  })

  it('handles deep nested paths', () => {
    const result = getAlternates('/services/electricien/saint-etienne')
    expect(result.canonical).toBe(`${SITE_URL}/services/electricien/saint-etienne`)
  })

  it('preserves leading slash without doubling', () => {
    const result = getAlternates('/blog/test')
    // Avoid `https://servicesartisans.fr//blog/test`
    expect(result.canonical).not.toMatch(/[^:]\/\//)
  })
})
