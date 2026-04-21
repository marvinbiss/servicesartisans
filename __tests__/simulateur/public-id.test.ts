import { describe, it, expect } from 'vitest'
import { generatePublicId } from '@/lib/simulateur/utils/public-id'

describe('generatePublicId', () => {
  it('respecte le format EST-YYYY-MM-DD-xxxxxx', () => {
    const id = generatePublicId()
    expect(id).toMatch(/^EST-\d{4}-\d{2}-\d{2}-[0-9a-z]{6}$/)
  })

  it('utilise la date UTC fournie', () => {
    const fixed = new Date('2026-04-14T12:00:00Z')
    const id = generatePublicId(fixed)
    expect(id.startsWith('EST-2026-04-14-')).toBe(true)
  })

  it('pad correctement mois et jour < 10', () => {
    const d = new Date('2026-01-05T00:00:00Z')
    const id = generatePublicId(d)
    expect(id.startsWith('EST-2026-01-05-')).toBe(true)
  })

  it('génère 10 000 IDs quasi sans collision (P(collision) ~2% → on tolère 3)', () => {
    // Birthday paradox : 10 000² / (2 × 36^6) ≈ 0.023 collisions attendues
    // → probabilité d'au moins 1 collision ≈ 2.3%, d'au moins 3 ≈ <0.01%.
    // Tolérer 3 collisions garde la détection de bugs RNG systémiques (seed
    // fixe, entropie cassée → uniqueness < 95%) sans flaky test en CI.
    const fixed = new Date('2026-04-14T12:00:00Z')
    const set = new Set<string>()
    for (let i = 0; i < 10_000; i++) {
      set.add(generatePublicId(fixed))
    }
    expect(set.size).toBeGreaterThanOrEqual(9_997)
  })

  it('suffixe uniquement en minuscules alphanum', () => {
    const fixed = new Date('2026-04-14T12:00:00Z')
    for (let i = 0; i < 500; i++) {
      const id = generatePublicId(fixed)
      const suffix = id.slice('EST-2026-04-14-'.length)
      expect(suffix).toMatch(/^[0-9a-z]{6}$/)
    }
  })
})
