import { describe, it, expect } from 'vitest'
import {
  loadLongTailKeywords,
  getLongTailBySlug,
  getTopLongTailKeywords,
  getTopicHubForSeed,
  slugifyKeyword,
} from '@/lib/seo/bloc3-longtail'

describe('bloc3-longtail loader', () => {
  it('loads at least one keyword from the snapshot CSV', () => {
    const all = loadLongTailKeywords()
    expect(all.length).toBeGreaterThan(0)
  })

  it('returns keywords sorted by descending volume then ascending KD', () => {
    const top = getTopLongTailKeywords(10)
    for (let i = 1; i < top.length; i++) {
      const a = top[i - 1]
      const b = top[i]
      const aHigher = a.volume > b.volume
      const aTieEasier = a.volume === b.volume && a.kd <= b.kd
      expect(aHigher || aTieEasier).toBe(true)
    }
  })

  it('caps the top list to the requested limit', () => {
    expect(getTopLongTailKeywords(5).length).toBeLessThanOrEqual(5)
    expect(getTopLongTailKeywords(50).length).toBeLessThanOrEqual(50)
  })

  it('finds known KW by slug (vmc-salle-de-bain easy win KD 0)', () => {
    const found = getLongTailBySlug('vmc-salle-de-bain')
    expect(found).toBeDefined()
    expect(found?.seed).toBe('vmc')
    expect(found?.volume).toBeGreaterThanOrEqual(1000)
  })

  it('returns undefined for unknown slug', () => {
    expect(getLongTailBySlug('not-a-real-keyword-zzz-2026')).toBeUndefined()
  })

  it('maps known seeds to topic hub URLs', () => {
    expect(getTopicHubForSeed('vmc')?.href).toBe('/renovation-energetique/travaux/vmc')
    expect(getTopicHubForSeed('cee')?.href).toBe('/cee')
    expect(getTopicHubForSeed('dpe')?.href).toBe('/diagnostic/dpe')
    expect(getTopicHubForSeed('panneau solaire')?.label).toBe('Solaire')
  })

  it('returns null for unknown seed', () => {
    expect(getTopicHubForSeed('unknown-seed-zzz')).toBeNull()
  })
})

describe('slugifyKeyword', () => {
  it('strips accents and quotes, kebabs ASCII output', () => {
    expect(slugifyKeyword("isolation par l'extérieur")).toBe('isolation-par-l-exterieur')
    expect(slugifyKeyword('vmc hygroréglable')).toBe('vmc-hygroreglable')
    expect(slugifyKeyword('vmc salle de bain')).toBe('vmc-salle-de-bain')
  })

  it('collapses multiple spaces and trims', () => {
    expect(slugifyKeyword('  pompe   à  chaleur  ')).toBe('pompe-a-chaleur')
  })

  it('handles all-symbol fallback gracefully', () => {
    expect(slugifyKeyword('!!!')).toBe('')
  })
})
