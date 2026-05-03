import { describe, it, expect } from 'vitest'

import {
  getAllRgeGlossaryEntries,
  getRgeGlossaryEntry,
  getRgeGlossarySlugs,
} from '../rge-qualifications-glossary'
import { getRgeDefinedTermSetSchema } from '../jsonld'
import { SITE_URL } from '../config'

describe('rge-qualifications-glossary — Sprint J Ahrefs 2026-05-03', () => {
  const SLUGS = getRgeGlossarySlugs()
  const ENTRIES = getAllRgeGlossaryEntries()

  it('expose au minimum 12 qualifications RGE de référence', () => {
    expect(SLUGS.length).toBeGreaterThanOrEqual(12)
  })

  it('couvre les qualifications haute volume (Qualibat 7141 / QualiPAC / IRVE P1 / OPQIBI 1905)', () => {
    expect(SLUGS).toContain('qualibat-7141')
    expect(SLUGS).toContain('qualipac')
    expect(SLUGS).toContain('qualifelec-irve-p1')
    expect(SLUGS).toContain('opqibi-1905')
  })

  it('chaque entrée a code + name + organisme + definition non vides', () => {
    for (const e of ENTRIES) {
      expect(e.code, `Slug "${e.slug}" : code manquant`).toBeTruthy()
      expect(e.name.length, `Slug "${e.slug}" : name vide`).toBeGreaterThan(0)
      expect(e.organisme, `Slug "${e.slug}" : organisme manquant`).toBeTruthy()
      expect(e.definition.length, `Slug "${e.slug}" : definition vide`).toBeGreaterThan(0)
    }
  })

  it('definition est entre 100 et 400 chars (densité YMYL)', () => {
    for (const e of ENTRIES) {
      expect(
        e.definition.length,
        `Slug "${e.slug}" : definition trop courte (${e.definition.length} < 100)`
      ).toBeGreaterThanOrEqual(100)
      expect(
        e.definition.length,
        `Slug "${e.slug}" : definition trop longue (${e.definition.length} > 400)`
      ).toBeLessThanOrEqual(400)
    }
  })

  it('name est ≤ 80 chars (snippet Google)', () => {
    for (const e of ENTRIES) {
      expect(e.name.length, `Slug "${e.slug}" : name trop long`).toBeLessThanOrEqual(80)
    }
  })

  it('slug est en kebab-case et identique à la clé du record', () => {
    const kebabRe = /^[a-z0-9]+(-[a-z0-9]+)*$/
    for (const e of ENTRIES) {
      expect(kebabRe.test(e.slug), `Slug "${e.slug}" pas kebab-case`).toBe(true)
    }
  })

  it('aucun code dupliqué (chaque qualification est unique)', () => {
    const codes = ENTRIES.map((e) => e.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('getRgeGlossaryEntry renvoie null pour un slug inconnu (safe)', () => {
    expect(getRgeGlossaryEntry('slug-inexistant')).toBeNull()
  })
})

describe('getRgeDefinedTermSetSchema — Sprint J Ahrefs 2026-05-03', () => {
  const pageUrl = `${SITE_URL}/rge/pompe-a-chaleur`
  const ENTRIES = getAllRgeGlossaryEntries()
  const baseParams = {
    pageUrl,
    name: 'Glossaire RGE — PAC',
    description: 'Vocabulaire technique des qualifications RGE PAC.',
    terms: ENTRIES,
  }

  it('returns null when terms array is empty', () => {
    expect(
      getRgeDefinedTermSetSchema({
        pageUrl,
        name: 'X',
        description: 'Y',
        terms: [],
      })
    ).toBeNull()
  })

  it('emits @context schema.org and @type DefinedTermSet with stable @id', () => {
    const s = getRgeDefinedTermSetSchema(baseParams)
    expect(s?.['@context']).toBe('https://schema.org')
    expect(s?.['@type']).toBe('DefinedTermSet')
    expect(s?.['@id']).toBe(`${pageUrl}#glossary-rge`)
    expect(s?.inLanguage).toBe('fr-FR')
  })

  it('hasDefinedTerm contains one DefinedTerm per entry with stable @id', () => {
    const s = getRgeDefinedTermSetSchema(baseParams)
    const terms = s?.hasDefinedTerm as Array<Record<string, unknown>>
    expect(terms).toHaveLength(ENTRIES.length)
    terms.forEach((t, i) => {
      const entry = ENTRIES[i]
      expect(t['@type']).toBe('DefinedTerm')
      expect(t['@id']).toBe(`${pageUrl}#term-${entry.slug}`)
      expect(t.name).toBe(entry.name)
      expect(t.description).toBe(entry.definition)
      expect(t.inDefinedTermSet).toBe(`${pageUrl}#glossary-rge`)
      expect(t.termCode).toBe(entry.termCode ?? entry.code)
    })
  })

  it('publisher is emitted as Organization when organisme provided', () => {
    const s = getRgeDefinedTermSetSchema({
      pageUrl,
      name: 'X',
      description: 'Y',
      terms: [
        {
          slug: 'q1',
          code: 'Q1',
          name: 'Q1',
          definition: 'D1 long enough definition with substance.',
          organisme: 'TestOrg',
        },
      ],
    })
    const term = (s?.hasDefinedTerm as Array<Record<string, unknown>>)[0]
    const publisher = term.publisher as Record<string, unknown>
    expect(publisher['@type']).toBe('Organization')
    expect(publisher.name).toBe('TestOrg')
  })

  it('falls back to code when termCode not provided', () => {
    const s = getRgeDefinedTermSetSchema({
      pageUrl,
      name: 'X',
      description: 'Y',
      terms: [
        {
          slug: 'q',
          code: 'Q-CODE',
          name: 'Q',
          definition: 'D long enough definition.',
          organisme: 'O',
        },
      ],
    })
    const term = (s?.hasDefinedTerm as Array<Record<string, unknown>>)[0]
    expect(term.termCode).toBe('Q-CODE')
  })
})
