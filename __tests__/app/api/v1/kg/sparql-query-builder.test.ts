/**
 * Tests — SPARQL parser (`src/app/api/v1/kg/sparql/_query-builder.ts`)
 *
 * Couvre :
 *  - Empty source / non-string
 *  - Source > 4000 chars
 *  - Simple `SELECT ?s WHERE { ?s a sa:RgeProvider }` with prefix expansion
 *  - PREFIX declarations override default
 *  - SELECT * projection
 *  - ASK query form
 *  - LIMIT + OFFSET
 *  - MAX_PATTERNS guard
 *  - Malformed query (missing brace)
 *  - Variable / IRI / literal discrimination
 *  - Lang tag + datatype on literals
 */

import { describe, it, expect } from 'vitest'
import { parseSparql, PARSER_LIMITS } from '@/app/api/v1/kg/sparql/_query-builder'

describe('parseSparql — invalid input', () => {
  it('returns error on empty string', () => {
    const res = parseSparql('')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/empty/i)
  })

  it('returns error on whitespace-only source', () => {
    const res = parseSparql('   \n\t')
    expect(res.ok).toBe(false)
  })

  it('returns error when source exceeds MAX_QUERY_LEN', () => {
    const huge = 'SELECT ?s WHERE { ?s ?p "' + 'x'.repeat(PARSER_LIMITS.MAX_QUERY_LEN + 10) + '" }'
    const res = parseSparql(huge)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/exceeds/i)
  })

  it('returns error on malformed query (missing close brace)', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s ?p ?o ')
    expect(res.ok).toBe(false)
  })

  it('returns error on unknown query form', () => {
    const res = parseSparql('CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/CONSTRUCT|SELECT|ASK/i)
  })

  it('returns error on unknown prefix', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s a foo:Bar }')
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/prefix/i)
  })

  it('returns error when too many triple patterns', () => {
    const tps = Array.from({ length: 15 }, (_, i) => `?s${i} ?p${i} ?o${i} .`).join(' ')
    const res = parseSparql(`SELECT * WHERE { ${tps} }`)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/MAX_PATTERNS/)
  })
})

describe('parseSparql — SELECT queries', () => {
  it('parses simple type-filter query with default prefix', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s a sa:RgeProvider }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.form).toBe('SELECT')
    expect(Array.isArray(res.query.projection)).toBe(true)
    expect((res.query.projection as Array<{ name: string }>)[0]!.name).toBe('s')
    expect(res.query.patterns).toHaveLength(1)
    const p = res.query.patterns[0]!
    expect(p.subject).toEqual({ type: 'var', name: 's' })
    expect(p.predicate).toEqual({
      type: 'iri',
      value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    })
    expect(p.object).toEqual({
      type: 'iri',
      value: 'https://servicesartisans.fr/ontology/rge#RgeProvider',
    })
  })

  it('resolves user-declared PREFIX', () => {
    const res = parseSparql('PREFIX ex: <http://example.org/> SELECT ?s WHERE { ?s ex:test "x" }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.patterns[0]!.predicate).toEqual({
      type: 'iri',
      value: 'http://example.org/test',
    })
  })

  it('parses literal with constant siret', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s sa:siret "12345678901234" }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const obj = res.query.patterns[0]!.object
    expect(obj.type).toBe('literal')
    if (obj.type === 'literal') expect(obj.value).toBe('12345678901234')
  })

  it('parses SELECT * as STAR projection', () => {
    const res = parseSparql('SELECT * WHERE { ?s ?p ?o }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.projection).toBe('STAR')
  })

  it('parses multi-pattern BGP with dot separator', () => {
    const res = parseSparql(
      'SELECT ?s ?label WHERE { ?s a sa:RgeProvider . ?s rdfs:label ?label . }'
    )
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.patterns).toHaveLength(2)
  })

  it('parses LIMIT and OFFSET clauses', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s ?p ?o } LIMIT 50 OFFSET 10')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.limit).toBe(50)
    expect(res.query.offset).toBe(10)
  })

  it('caps LIMIT at MAX_LIMIT', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s ?p ?o } LIMIT 999999')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.limit).toBe(PARSER_LIMITS.MAX_LIMIT)
  })

  it('parses language-tagged literal', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s rdfs:label "Plombier"@fr }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const obj = res.query.patterns[0]!.object
    expect(obj.type).toBe('literal')
    if (obj.type === 'literal') expect(obj.lang).toBe('fr')
  })

  it('parses typed literal with xsd datatype', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s sa:validUntil "2027-01-01"^^xsd:date }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    const obj = res.query.patterns[0]!.object
    if (obj.type === 'literal') {
      expect(obj.datatype).toBe('http://www.w3.org/2001/XMLSchema#date')
    }
  })

  it('handles comments (# ...)', () => {
    const res = parseSparql('# header comment\nSELECT ?s WHERE { ?s ?p ?o } # trailing')
    expect(res.ok).toBe(true)
  })

  it('handles ; predicate-list shorthand', () => {
    const res = parseSparql(
      'SELECT ?s ?label ?ville WHERE { ?s rdfs:label ?label ; sa:ville ?ville . }'
    )
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.patterns).toHaveLength(2)
    expect(res.query.patterns[0]!.subject).toEqual(res.query.patterns[1]!.subject)
  })
})

describe('parseSparql — ASK queries', () => {
  it('parses ASK form', () => {
    const res = parseSparql('ASK { ?s sa:siret "12345678901234" }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.form).toBe('ASK')
  })

  it('parses ASK WHERE keyword', () => {
    const res = parseSparql('ASK WHERE { ?s a sa:RgeProvider }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.form).toBe('ASK')
  })
})

describe('parseSparql — IRI vs PNAME', () => {
  it('parses absolute IRI in angle brackets', () => {
    const res = parseSparql('SELECT ?s WHERE { ?s <http://example.org/p> "x" }')
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.query.patterns[0]!.predicate).toEqual({
      type: 'iri',
      value: 'http://example.org/p',
    })
  })
})
