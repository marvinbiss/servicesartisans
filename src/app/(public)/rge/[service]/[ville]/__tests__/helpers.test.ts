import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  truncateTitle,
  isRgeUpgradeV2,
  currentMonthYearFr,
  safeJsonStringify,
  buildIntroParagraph,
  buildRgeTldrBullets,
} from '../helpers'

// ---------------------------------------------------------------------------
// truncateTitle
// ---------------------------------------------------------------------------

describe('truncateTitle', () => {
  it('returns a short title unchanged when below maxLen', () => {
    const title = 'Pompe à chaleur Lyon'
    expect(truncateTitle(title)).toBe(title)
  })

  it('returns a title unchanged when exactly maxLen (60)', () => {
    const title = 'a'.repeat(60)
    expect(truncateTitle(title)).toBe(title)
  })

  it('truncates a title that is 1 char over maxLen and appends ellipsis', () => {
    const title = 'a'.repeat(61)
    const result = truncateTitle(title)
    expect(result.length).toBeLessThanOrEqual(60)
    expect(result.endsWith('…')).toBe(true)
  })

  it('truncates a very long title (200 chars) and cuts on whitespace boundary', () => {
    const words = Array.from({ length: 30 }, (_, i) => `word${i}`)
    const title = words.join(' ')
    const result = truncateTitle(title)
    expect(result.length).toBeLessThanOrEqual(60)
    expect(result.endsWith('…')).toBe(true)
    expect(result).not.toMatch(/\s…$/)
  })

  it('respects a custom maxLen of 41', () => {
    const title = 'Isolation thermique par un artisan RGE qualifié'
    const result = truncateTitle(title, 41)
    expect(result.length).toBeLessThanOrEqual(41)
    expect(result.endsWith('…')).toBe(true)
  })

  it('hard-cuts a single long word without space (audit Sprint 0.2)', () => {
    // Mot unique de 80 chars : la regex `\s+\S*$` ne matche rien.
    // Sans guard, on obtenait `…` (1 char) seul. Désormais hard cut + ellipsis.
    const title = 'a'.repeat(80)
    const result = truncateTitle(title, 60)
    expect(result.length).toBeLessThanOrEqual(60)
    expect(result.length).toBeGreaterThan(1)
    expect(result.endsWith('…')).toBe(true)
  })

  it('returns empty string when maxLen is 0 or negative (guard)', () => {
    expect(truncateTitle('Plombier Lyon', 0)).toBe('')
    expect(truncateTitle('Plombier Lyon', -5)).toBe('')
  })

  it('returns empty string when maxLen is exactly 1 (guard)', () => {
    // maxLen=1 produirait `…` seul → guard retourne string vide
    expect(truncateTitle('Plombier Lyon', 1)).toBe('')
  })
})

// ---------------------------------------------------------------------------
// isRgeUpgradeV2
// ---------------------------------------------------------------------------

describe('isRgeUpgradeV2', () => {
  let originalValue: string | undefined

  beforeEach(() => {
    originalValue = process.env.RGE_UPGRADE_V2
  })

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.RGE_UPGRADE_V2
    } else {
      process.env.RGE_UPGRADE_V2 = originalValue
    }
  })

  it('returns false when RGE_UPGRADE_V2 is "false"', () => {
    process.env.RGE_UPGRADE_V2 = 'false'
    expect(isRgeUpgradeV2()).toBe(false)
  })

  it('returns true when RGE_UPGRADE_V2 is deleted (unset)', () => {
    delete process.env.RGE_UPGRADE_V2
    expect(isRgeUpgradeV2()).toBe(true)
  })

  it('returns true when RGE_UPGRADE_V2 is "true"', () => {
    process.env.RGE_UPGRADE_V2 = 'true'
    expect(isRgeUpgradeV2()).toBe(true)
  })

  it('returns true for any string that is not explicitly "false"', () => {
    process.env.RGE_UPGRADE_V2 = '0'
    expect(isRgeUpgradeV2()).toBe(true)
  })

  it('returns true when RGE_UPGRADE_V2 is "1"', () => {
    process.env.RGE_UPGRADE_V2 = '1'
    expect(isRgeUpgradeV2()).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// currentMonthYearFr
// ---------------------------------------------------------------------------

describe('currentMonthYearFr', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the French month-year string for the fixed date 2026-04-29', () => {
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'))
    const result = currentMonthYearFr()
    expect(result).toBe('avril 2026')
  })

  it('returns a result that is not in English', () => {
    vi.setSystemTime(new Date('2026-04-29T12:00:00Z'))
    const result = currentMonthYearFr()
    expect(result).not.toMatch(/april/i)
    expect(result).not.toMatch(/April/i)
  })

  it('returns January in French for month 1', () => {
    vi.setSystemTime(new Date('2026-01-15T00:00:00Z'))
    const result = currentMonthYearFr()
    expect(result).toBe('janvier 2026')
  })

  it('returns December in French for month 12', () => {
    vi.setSystemTime(new Date('2026-12-01T00:00:00Z'))
    const result = currentMonthYearFr()
    expect(result).toBe('décembre 2026')
  })

  it('uses Europe/Paris timezone (audit Sprint 0.2 — UTC runtime safety)', () => {
    // 1er mai 2026 à 00:30 UTC = 02:30 heure de Paris (CEST UTC+2) → mai
    vi.setSystemTime(new Date('2026-05-01T00:30:00Z'))
    expect(currentMonthYearFr()).toBe('mai 2026')
  })

  it('returns the Paris-local month for late-night UTC on month boundary', () => {
    // 30 avril 2026 à 23:00 UTC = 1er mai 01:00 heure Paris → mai
    vi.setSystemTime(new Date('2026-04-30T23:00:00Z'))
    expect(currentMonthYearFr()).toBe('mai 2026')
  })
})

// ---------------------------------------------------------------------------
// safeJsonStringify
// ---------------------------------------------------------------------------

describe('safeJsonStringify', () => {
  it('serializes a simple object without escaping', () => {
    const obj = { name: 'Artisan', count: 42 }
    const result = safeJsonStringify(obj)
    expect(result).toBe('{"name":"Artisan","count":42}')
  })

  it('escapes </script> to prevent XSS', () => {
    const obj = { tag: '</script>' }
    const result = safeJsonStringify(obj)
    expect(result).not.toContain('</script>')
    expect(result).toContain('\\u003c/script\\u003e')
  })

  it('escapes & to \\u0026', () => {
    const obj = { text: 'MaPrimeRénov & CEE' }
    const result = safeJsonStringify(obj)
    expect(result).not.toContain(' & ')
    expect(result).toContain('\\u0026')
  })

  it('escapes > to \\u003e', () => {
    const obj = { val: 'a > b' }
    const result = safeJsonStringify(obj)
    expect(result).not.toContain('>')
    expect(result).toContain('\\u003e')
  })

  it('round-trips: JSON.parse of safeJsonStringify recovers original object', () => {
    const obj = { name: 'test', value: 123, nested: { ok: true } }
    const parsed = JSON.parse(safeJsonStringify(obj))
    expect(parsed).toEqual(obj)
  })

  it('XSS regression: full </script><script>alert(1)</script> payload is neutralized', () => {
    const payload = { name: '</script><script>alert(1)</script>' }
    const result = safeJsonStringify(payload)
    expect(result).not.toContain('</script>')
    expect(result).not.toContain('<script>')
  })

  it('escapes U+2028 LINE SEPARATOR (audit Sprint 0.2)', () => {
    // U+2028 termine un littéral string en JS non-strict → peut casser <script>
    const payload = { val: 'before\u2028after' }
    const result = safeJsonStringify(payload)
    expect(result).not.toMatch(/\u2028/)
    expect(result).toContain('\\u2028')
  })

  it('escapes U+2029 PARAGRAPH SEPARATOR (audit Sprint 0.2)', () => {
    const payload = { val: 'before\u2029after' }
    const result = safeJsonStringify(payload)
    expect(result).not.toMatch(/\u2029/)
    expect(result).toContain('\\u2029')
  })

  it('returns "null" on circular reference instead of throwing (audit Sprint 0.2)', () => {
    const obj: Record<string, unknown> = { name: 'test' }
    obj.self = obj
    const result = safeJsonStringify(obj)
    expect(result).toBe('null')
  })

  it('returns "null" on BigInt input instead of throwing', () => {
    const payload = { siret: BigInt('83001931100026') }
    const result = safeJsonStringify(payload)
    expect(result).toBe('null')
  })

  it('returns "null" on undefined input (JSON.stringify quirk)', () => {
    const result = safeJsonStringify(undefined)
    expect(result).toBe('null')
  })
})

// ---------------------------------------------------------------------------
// buildIntroParagraph
// ---------------------------------------------------------------------------

describe('buildIntroParagraph', () => {
  it('includes the qualification label when service has a known RGE qualif', () => {
    const result = buildIntroParagraph('Pompe à chaleur', 'Lyon', 'pompe-a-chaleur')
    expect(result).toContain('QualiPAC')
    expect(result).toContain('Qualit’EnR')
  })

  it('uses a generic fallback when service has no specific qualification', () => {
    const result = buildIntroParagraph('Artisan inconnu', 'Paris', 'service-inconnu')
    expect(result).toContain('Reconnu Garant de l’Environnement')
    expect(result).not.toContain('undefined')
  })

  it('always contains RGE in the output', () => {
    const result = buildIntroParagraph('Chauffagiste', 'Bordeaux', 'chauffagiste')
    expect(result).toContain('RGE')
  })

  it('always mentions MaPrimeRénov’', () => {
    const result = buildIntroParagraph('Menuisier', 'Toulouse', 'menuisier')
    expect(result).toContain('MaPrimeRénov’')
  })

  it("always mentions CEE (Certificats d'Économies d'Énergie)", () => {
    const result = buildIntroParagraph('Électricien', 'Marseille', 'electricien')
    expect(result).toContain('CEE')
  })

  it('always contains the ville name in the output', () => {
    const villeName = 'Montpellier'
    const result = buildIntroParagraph('Couvreur', villeName, 'couvreur')
    expect(result).toContain(villeName)
  })

  it('electricien service outputs Qualifelec label', () => {
    const result = buildIntroParagraph('Électricien', 'Nantes', 'electricien')
    expect(result).toContain('Qualifelec')
  })

  it('isolation-thermique service outputs Qualibat label', () => {
    const result = buildIntroParagraph('Isolation', 'Strasbourg', 'isolation-thermique')
    expect(result).toContain('Qualibat')
  })
})

// ---------------------------------------------------------------------------
// buildRgeTldrBullets — 11 edge cases pré-FAQ TldrBlock
// ---------------------------------------------------------------------------

describe('buildRgeTldrBullets', () => {
  it('omits rating bullet when aggregateRating is null', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      aggregateRating: null,
      eligibleCeeOpsCount: 0,
    })
    expect(bullets.some((b) => b.startsWith('Note moyenne'))).toBe(false)
  })

  it('omits rating bullet when aggregateRating is undefined (field absent)', () => {
    const bullets = buildRgeTldrBullets({ serviceSlug: 'pompe-a-chaleur' })
    expect(bullets.some((b) => b.startsWith('Note moyenne'))).toBe(false)
  })

  it('includes rating + dept suffix when fallbackDeptUsed=true with department_name', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      aggregateRating: { ratingValue: '4.6', reviewCount: '127' },
      fallbackDeptUsed: true,
      departmentName: 'Loire-Atlantique',
      eligibleCeeOpsCount: 2,
    })
    const ratingBullet = bullets.find((b) => b.startsWith('Note moyenne'))
    expect(ratingBullet).toBeDefined()
    expect(ratingBullet).toContain('4.6/5')
    expect(ratingBullet).toContain('127 avis')
    expect(ratingBullet).toContain('Loire-Atlantique')
  })

  it('omits dept suffix when fallbackDeptUsed=true but department_name is null', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      aggregateRating: { ratingValue: '4.2', reviewCount: '50' },
      fallbackDeptUsed: true,
      departmentName: null,
    })
    const ratingBullet = bullets.find((b) => b.startsWith('Note moyenne'))
    expect(ratingBullet).toBeDefined()
    expect(ratingBullet).not.toContain('département')
    expect(ratingBullet).not.toContain('(')
  })

  it('omits qualification bullet when serviceSlug is unknown', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'service-inconnu-xyz',
    })
    expect(bullets.some((b) => b.startsWith('Qualification de référence'))).toBe(false)
  })

  it('includes qualification label + organisme for known service slugs', () => {
    const bullets = buildRgeTldrBullets({ serviceSlug: 'pompe-a-chaleur' })
    const qualifBullet = bullets.find((b) => b.startsWith('Qualification de référence'))
    expect(qualifBullet).toBeDefined()
    // Couvre les deux organismes RGE possibles selon le métier.
    expect(qualifBullet).toMatch(/QualiPAC|Qualibat|Qualifelec|Qualit'EnR|Qualibois/)
  })

  it('omits CEE bullet when eligibleCeeOpsCount=0', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      eligibleCeeOpsCount: 0,
    })
    expect(bullets.some((b) => b.includes('opération'))).toBe(false)
  })

  it('uses singular for eligibleCeeOpsCount=1', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      eligibleCeeOpsCount: 1,
    })
    const ceeBullet = bullets.find((b) => b.includes('opération'))
    expect(ceeBullet).toBe('1 opération CEE éligible pour ce métier')
  })

  it('uses plural for eligibleCeeOpsCount > 1', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      eligibleCeeOpsCount: 4,
    })
    const ceeBullet = bullets.find((b) => b.includes('opération'))
    expect(ceeBullet).toBe('4 opérations CEE éligibles pour ce métier')
  })

  it('always includes Eco-PTZ + source data.gouv + CTA bullets', () => {
    const bullets = buildRgeTldrBullets({ serviceSlug: 'foo' })
    expect(bullets.some((b) => b.startsWith('Éco-PTZ'))).toBe(true)
    expect(bullets.some((b) => b.includes('data.gouv.fr'))).toBe(true)
    expect(bullets.some((b) => b.startsWith('Devis gratuit'))).toBe(true)
  })

  it('rejects NaN ratingValue (e.g. providers with rating=0)', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      aggregateRating: { ratingValue: 'NaN', reviewCount: '10' },
    })
    expect(bullets.some((b) => b.startsWith('Note moyenne'))).toBe(false)
  })

  it('rejects rating <= 0 or reviewCount <= 0', () => {
    const cases = [
      { ratingValue: '0', reviewCount: '5' },
      { ratingValue: '0.0', reviewCount: '5' },
      { ratingValue: '4.5', reviewCount: '0' },
      { ratingValue: '-1', reviewCount: '10' },
    ]
    for (const aggregateRating of cases) {
      const bullets = buildRgeTldrBullets({ serviceSlug: 'pompe-a-chaleur', aggregateRating })
      expect(bullets.some((b) => b.startsWith('Note moyenne'))).toBe(false)
    }
  })

  it('does not duplicate MaPrimeRénov / CEE / TVA values (avoid speakable overlap with EnBrefBox)', () => {
    const bullets = buildRgeTldrBullets({
      serviceSlug: 'pompe-a-chaleur',
      eligibleCeeOpsCount: 3,
    })
    // EnBrefBox keyPoints porte déjà : "Éligible MaPrimeRénov’ jusqu'à 11 000 €",
    // "Cumul CEE + TVA 5,5 % possible". Le TldrBlock ne doit PAS dupliquer ces
    // valeurs — uniquement Éco-PTZ (montant 50 000 €), distinct.
    const joined = bullets.join(' | ')
    expect(joined).toContain('Éco-PTZ')
    expect(joined).not.toContain('11 000')
    expect(joined).not.toContain('TVA')
    expect(joined).not.toContain('5,5')
    expect(joined).not.toMatch(/Cumul CEE/)
  })
})
