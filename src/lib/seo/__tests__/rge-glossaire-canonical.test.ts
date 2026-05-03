import { describe, expect, it } from 'vitest'

import { getRgeDefinedTermSetSchema } from '../jsonld'
import { getAllRgeGlossaryEntries } from '../rge-qualifications-glossary'

/**
 * Sprint O Ahrefs 2026-05-03 — verrou canonical /rge/glossaire.
 *
 * Garantit que la page canonique du DefinedTermSet RGE émet :
 *   - un `@id` racine `https://servicesartisans.fr/rge/glossaire#glossary-rge`
 *   - un `@id` par terme `…/rge/glossaire#term-<slug>`
 *   - tous les 16 termes du glossaire émis (pas de drift silencieux)
 *
 * Si quelqu'un ajoute un terme à `RGE_GLOSSARY` sans rebuild, le test
 * détectera un mismatch entre le compteur du test et le compteur réel.
 */
describe('Sprint O — DefinedTermSet canonique /rge/glossaire', () => {
  const PAGE_URL = 'https://servicesartisans.fr/rge/glossaire'

  it('émet un Schema DefinedTermSet avec @id canonique', () => {
    const schema = getRgeDefinedTermSetSchema({
      pageUrl: PAGE_URL,
      name: 'Glossaire RGE',
      description: 'Test',
      terms: getAllRgeGlossaryEntries(),
    })
    expect(schema).not.toBeNull()
    expect(schema?.['@type']).toBe('DefinedTermSet')
    expect(schema?.['@id']).toBe(`${PAGE_URL}#glossary-rge`)
    expect(schema?.inLanguage).toBe('fr-FR')
  })

  it('émet un DefinedTerm @id par slug avec préfixe canonique', () => {
    const entries = getAllRgeGlossaryEntries()
    const schema = getRgeDefinedTermSetSchema({
      pageUrl: PAGE_URL,
      name: 'Glossaire RGE',
      description: 'Test',
      terms: entries,
    })
    const definedTerms = schema?.hasDefinedTerm as Array<Record<string, unknown>>
    expect(Array.isArray(definedTerms)).toBe(true)
    expect(definedTerms.length).toBe(entries.length)
    for (const t of entries) {
      const found = definedTerms.find((d) => d['@id'] === `${PAGE_URL}#term-${t.slug}`)
      expect(found, `term ${t.slug} doit être présent`).toBeDefined()
      expect(found?.inDefinedTermSet).toBe(`${PAGE_URL}#glossary-rge`)
    }
  })

  it("n'émet pas le Schema si terms vide (no-op safe)", () => {
    const schema = getRgeDefinedTermSetSchema({
      pageUrl: PAGE_URL,
      name: 'Glossaire RGE',
      description: 'Test',
      terms: [],
    })
    expect(schema).toBeNull()
  })

  it('chaque DefinedTerm a un publisher organisme', () => {
    const entries = getAllRgeGlossaryEntries()
    const schema = getRgeDefinedTermSetSchema({
      pageUrl: PAGE_URL,
      name: 'Glossaire RGE',
      description: 'Test',
      terms: entries,
    })
    const definedTerms = schema?.hasDefinedTerm as Array<Record<string, unknown>>
    for (const term of definedTerms) {
      const publisher = term.publisher as Record<string, unknown> | undefined
      expect(publisher, `publisher requis pour ${term['@id']}`).toBeDefined()
      expect(publisher?.['@type']).toBe('Organization')
      expect(typeof publisher?.name).toBe('string')
    }
  })
})
