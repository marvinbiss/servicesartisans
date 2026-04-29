/**
 * Tests `shouldNoindex` — fonction pure au cœur de la logique noindex pSEO.
 * Une régression ici noindex silencieusement 5K+ pages — couverture minimum
 * obligatoire (recommandation test-architect 2026-04-29).
 */
import { describe, it, expect } from 'vitest'
import { shouldNoindex } from '@/lib/seo/pruning'

describe('shouldNoindex', () => {
  it('static noindex pattern (/connexion) → noindex', () => {
    expect(shouldNoindex('/connexion')).toBe(true)
    expect(shouldNoindex('/admin/dashboard')).toBe(true)
    expect(shouldNoindex('/espace-artisan/profil')).toBe(true)
  })

  it('quartier page → noindex (thin content)', () => {
    expect(shouldNoindex('/villes/paris/marais', { isQuartierPage: true })).toBe(true)
  })

  it('providerCount=0 + hasUniqueData=false → noindex (the target case)', () => {
    expect(
      shouldNoindex('/services/plombier/unknown-village', {
        providerCount: 0,
        hasUniqueData: false,
      })
    ).toBe(true)
  })

  it('providerCount=0 + hasUniqueData=true → INDEX (Bug 1 fix — fallback dept saved the page)', () => {
    expect(
      shouldNoindex('/services/plombier/brive-la-gaillarde', {
        providerCount: 0,
        hasUniqueData: true,
      })
    ).toBe(false)
  })

  it('providerCount > 0 always indexes regardless of hasUniqueData', () => {
    expect(
      shouldNoindex('/services/plombier/paris', { providerCount: 5, hasUniqueData: false })
    ).toBe(false)
    expect(
      shouldNoindex('/services/plombier/paris', { providerCount: 1, hasUniqueData: true })
    ).toBe(false)
  })

  it('context omitted → fail-open (build-time / DB-down safety)', () => {
    expect(shouldNoindex('/services/plombier/paris')).toBe(false)
  })

  it('static + low-priority signal: pattern wins over context', () => {
    expect(shouldNoindex('/connexion', { providerCount: 100, hasUniqueData: true })).toBe(true)
  })
})
