/**
 * Tests — title length contract
 * -------------------------------
 * Garantit que `selectFittingTitle` et `truncateTitle` respectent la limite
 * imposée par le brand suffix injecté par le root layout :
 *
 *   `${rawTitle} | ServicesArtisans`  (suffix = 19 char)
 *
 * Pour rester ≤ 65 char rendus (cutoff visuel Google SERP desktop ~580px),
 * le `rawTitle` doit faire ≤ 46 char. Le pattern documenté dans
 * `src/lib/seo/title-selector.ts` est `truncate(text, 41)` (60c rendus, safe).
 *
 * Ces tests fixent le contrat et préviennent une régression accidentelle vers
 * `selectFittingTitle(variants, hash, 60)` qui produirait des titres tronqués
 * à 79c rendus (perte CTR).
 */

import { describe, it, expect } from 'vitest'
import { selectFittingTitle, truncateTitle } from '@/lib/seo/title-selector'

const BRAND_SUFFIX = ' | ServicesArtisans'
const MAX_RENDERED = 65
const MAX_RAW = MAX_RENDERED - BRAND_SUFFIX.length // 46

describe('Title length contract — rendered ≤ 65 char (raw + brand suffix)', () => {
  describe('truncateTitle', () => {
    it('passe une chaîne courte (≤ 46c) inchangée', () => {
      const result = truncateTitle('Plombier Lyon 2026', 46)
      expect(result).toBe('Plombier Lyon 2026')
      expect((result + BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX_RENDERED)
    })

    it('tronque une chaîne moyenne (50c) à 46c avec ellipsis sur frontière de mot', () => {
      const longTitle = 'Plombier RGE Saint-Étienne-du-Rouvray 2026 — France'
      const result = truncateTitle(longTitle, MAX_RAW)
      expect(result.length).toBeLessThanOrEqual(MAX_RAW)
      expect((result + BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX_RENDERED)
    })

    it('tronque une chaîne très longue (80c) à 46c', () => {
      const veryLong =
        'Chauffagiste pompe à chaleur RGE certifié Saint-Étienne-du-Rouvray 2026 + devis'
      const result = truncateTitle(veryLong, MAX_RAW)
      expect(result.length).toBeLessThanOrEqual(MAX_RAW)
      expect((result + BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX_RENDERED)
      expect(result.endsWith('…')).toBe(true)
    })

    it('default maxLen reste ≤ 46c', () => {
      const longTitle = 'Chauffagiste pompe à chaleur RGE certifié Saint-Étienne-du-Rouvray 2026'
      // default = 41 d'après le contrat doc title-selector.ts ligne 41.
      const result = truncateTitle(longTitle)
      expect(result.length).toBeLessThanOrEqual(MAX_RAW)
    })
  })

  describe('selectFittingTitle', () => {
    it('sélectionne le 1er variant ≤ 46c via rotation hash', () => {
      const variants = [
        'Chauffagiste pompe à chaleur RGE certifié Saint-Étienne-du-Rouvray 2026 — devis gratuit 24h', // 90c
        'Chauffagiste pompe à chaleur RGE Saint-Étienne 2026', // 51c
        'Chauffagiste PAC RGE Saint-Étienne 2026', // 39c
        'Chauffagiste PAC RGE 2026', // 25c
      ]
      const result = selectFittingTitle(variants, 12345, MAX_RAW)
      expect(result.length).toBeLessThanOrEqual(MAX_RAW)
      expect((result + BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX_RENDERED)
    })

    it('garantit ≤ 46c pour tous les hashs (rotation deterministe)', () => {
      const variants = [
        'Plombier RGE Saint-Étienne-du-Rouvray 2026 — devis', // 50c
        'Plombier RGE Saint-Étienne 2026', // 31c
        'Plombier RGE 2026', // 17c
      ]
      for (let hash = 0; hash < 100; hash++) {
        const result = selectFittingTitle(variants, hash, MAX_RAW)
        expect(result.length).toBeLessThanOrEqual(MAX_RAW)
        expect((result + BRAND_SUFFIX).length).toBeLessThanOrEqual(MAX_RENDERED)
      }
    })

    it('truncate le 1er variant si aucun ne rentre (cas extrême)', () => {
      const variants = [
        'Pompe à chaleur Saint-Pierre-d-Aurillac extra long 2026', // 56c
        'Pompe à chaleur Saint-Pierre-d-Aurillac extra long 2027', // 56c
      ]
      const result = selectFittingTitle(variants, 0, MAX_RAW)
      expect(result.length).toBeLessThanOrEqual(MAX_RAW)
    })
  })

  describe('Rendered title budget', () => {
    it('46 char raw + 19 char brand = 65 char rendu', () => {
      const raw = 'a'.repeat(MAX_RAW)
      const rendered = raw + BRAND_SUFFIX
      expect(rendered.length).toBe(MAX_RENDERED)
    })

    it('47 char raw franchit le seuil rendered', () => {
      const raw = 'a'.repeat(MAX_RAW + 1)
      const rendered = raw + BRAND_SUFFIX
      expect(rendered.length).toBeGreaterThan(MAX_RENDERED)
    })
  })
})
