import { describe, it, expect } from 'vitest'
import { zoneFromCodePostal, deptFromCodePostal, __internal } from '@/lib/simulateur/zones'

describe('deptFromCodePostal', () => {
  it('extrait les 2 premiers chiffres pour un département métropole standard', () => {
    expect(deptFromCodePostal('75001')).toBe('75')
    expect(deptFromCodePostal('13008')).toBe('13')
    expect(deptFromCodePostal('29200')).toBe('29')
  })

  it('renvoie 2A pour un CP Corse < 20200', () => {
    expect(deptFromCodePostal('20000')).toBe('2A')
    expect(deptFromCodePostal('20100')).toBe('2A')
    expect(deptFromCodePostal('20199')).toBe('2A')
  })

  it('renvoie 2B pour un CP Corse >= 20200', () => {
    expect(deptFromCodePostal('20200')).toBe('2B')
    expect(deptFromCodePostal('20600')).toBe('2B')
    expect(deptFromCodePostal('20999')).toBe('2B')
  })

  it('renvoie les 3 premiers chiffres pour les DOM', () => {
    expect(deptFromCodePostal('97100')).toBe('971')
    expect(deptFromCodePostal('97200')).toBe('972')
    expect(deptFromCodePostal('97300')).toBe('973')
    expect(deptFromCodePostal('97400')).toBe('974')
    expect(deptFromCodePostal('97500')).toBe('975')
    expect(deptFromCodePostal('97600')).toBe('976')
  })

  it('renvoie vide pour un CP invalide', () => {
    expect(deptFromCodePostal('')).toBe('')
    expect(deptFromCodePostal('123')).toBe('')
    expect(deptFromCodePostal('abcde')).toBe('')
    expect(deptFromCodePostal('9800')).toBe('')
    expect(deptFromCodePostal('98000')).toBe('')
  })
})

describe('zoneFromCodePostal', () => {
  it('classe Paris (75) en H2 + IDF', () => {
    const r = zoneFromCodePostal('75001')
    expect(r).toEqual({ zone: 'H2', idf: true, dept: '75' })
  })

  it('classe Lille (59) en H1', () => {
    const r = zoneFromCodePostal('59000')
    expect(r.zone).toBe('H1')
    expect(r.idf).toBe(false)
  })

  it('classe Marseille (13) en H3', () => {
    const r = zoneFromCodePostal('13001')
    expect(r.zone).toBe('H3')
    expect(r.idf).toBe(false)
  })

  it('classe la Corse (2A + 2B) en H2', () => {
    expect(zoneFromCodePostal('20000').zone).toBe('H2')
    expect(zoneFromCodePostal('20200').zone).toBe('H2')
  })

  it('classe la Martinique (972) en H3', () => {
    expect(zoneFromCodePostal('97200').zone).toBe('H3')
  })

  it('classe Saint-Pierre-et-Miquelon (975) en H1', () => {
    expect(zoneFromCodePostal('97500').zone).toBe('H1')
  })

  it('fallback H3 + warning pour CP inconnu', () => {
    const r = zoneFromCodePostal('99999')
    expect(r.zone).toBe('H3')
    expect(r.warning).toBeDefined()
  })

  it('fallback pour CP invalide', () => {
    const r = zoneFromCodePostal('abcde')
    expect(r.zone).toBe('H3')
    expect(r.warning).toContain('invalide')
  })

  it('couvre les 96 départements métropole + 2A/2B + 6 DOM', () => {
    const allDepts = new Set<string>([
      ...__internal.H1_DEPTS,
      ...__internal.H2_DEPTS,
      ...__internal.H3_DEPTS,
    ])
    // 20 + 69 (H2 metro) + 10 (H1 metro) + 5 H3 metro + 2 Corse + 6 DOM + 1 SPM ...
    // On vérifie la couverture métropole : tous les codes 01..95 doivent être présents sauf 20 (remplacé par 2A/2B)
    const metropole = Array.from({ length: 95 }, (_, i) => String(i + 1).padStart(2, '0')).filter(
      (d) => d !== '20'
    )
    for (const d of metropole) {
      expect(allDepts.has(d), `département ${d} manquant`).toBe(true)
    }
    expect(allDepts.has('2A')).toBe(true)
    expect(allDepts.has('2B')).toBe(true)
    // DOM
    for (const dom of ['971', '972', '973', '974', '975', '976']) {
      expect(allDepts.has(dom), `DOM ${dom} manquant`).toBe(true)
    }
  })

  it('flag IDF uniquement pour 75/77/78/91/92/93/94/95', () => {
    const idfDepts = ['75', '77', '78', '91', '92', '93', '94', '95']
    for (const d of idfDepts) {
      const cp = `${d}000`
      expect(zoneFromCodePostal(cp).idf, `IDF ${d}`).toBe(true)
    }
    // Quelques non-IDF
    expect(zoneFromCodePostal('13001').idf).toBe(false)
    expect(zoneFromCodePostal('69001').idf).toBe(false)
    expect(zoneFromCodePostal('33000').idf).toBe(false)
  })

  it('chaque département H1/H2/H3 résout sans warning', () => {
    const all = [...__internal.H1_DEPTS, ...__internal.H2_DEPTS, ...__internal.H3_DEPTS]
    for (const d of all) {
      let cp: string
      if (d === '2A') cp = '20000'
      else if (d === '2B') cp = '20200'
      else if (d.length === 3) cp = `${d}00`
      else cp = `${d}000`
      const r = zoneFromCodePostal(cp)
      expect(r.warning, `warning inattendu pour ${d}`).toBeUndefined()
      expect(['H1', 'H2', 'H3']).toContain(r.zone)
    }
  })
})
