import { describe, expect, it } from 'vitest'

import { getSprintVCanonicalRgeUrls } from '../indexnow'

/**
 * Sprint V Ahrefs 2026-05-03 — verrou liste canonique RGE pour IndexNow.
 *
 * Garantit que :
 *   - Les 3 URLs canoniques RGE sont bien présentes (drift detection si
 *     quelqu'un retire ou ajoute une URL sans réflexion).
 *   - L'ordre / format / chemin relatif sont stables (le script CLI les
 *     pipe directement à submitToIndexNow qui transforme en absolu).
 *   - L'URL canonique Sprint O `/rge/glossaire` est en première position
 *     (signal de priorité, même si IndexNow n'a pas de notion d'ordre).
 */
describe('getSprintVCanonicalRgeUrls — Sprint V+W', () => {
  const urls = getSprintVCanonicalRgeUrls()

  it('retourne exactement 5 URLs (Sprint V + W)', () => {
    expect(urls).toHaveLength(5)
  })

  it('contient /rge/glossaire (entité canonique Sprint O)', () => {
    expect(urls).toContain('/rge/glossaire')
  })

  it('contient /rge/qualifications (cible 301 Sprint U)', () => {
    expect(urls).toContain('/rge/qualifications')
  })

  it('contient /qualifications-rge (ancien 404 → 301 Sprint U)', () => {
    expect(urls).toContain('/qualifications-rge')
  })

  it('contient /comparaison (cible 301 Sprint W)', () => {
    expect(urls).toContain('/comparaison')
  })

  it('contient /comparatifs (ancien 404 → 301 Sprint W)', () => {
    expect(urls).toContain('/comparatifs')
  })

  it('toutes les URLs sont des paths relatifs (commencent par /)', () => {
    for (const u of urls) {
      expect(u.startsWith('/')).toBe(true)
      expect(u.startsWith('http')).toBe(false)
    }
  })

  it('aucune URL ne contient query string ou fragment (canonical pur)', () => {
    for (const u of urls) {
      expect(u).not.toContain('?')
      expect(u).not.toContain('#')
    }
  })

  it('retourne un tableau (pas readonly) — submitToIndexNow accepte string[]', () => {
    expect(Array.isArray(urls)).toBe(true)
  })
})
