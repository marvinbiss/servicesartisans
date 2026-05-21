/**
 * Tests — SPARQL triples store (`src/app/api/v1/kg/sparql/_triples-store.ts`)
 *
 * Couvre :
 *  - matchPatterns avec mock vide → 0 bindings
 *  - matchPatterns avec 1 provider + 2 qualifs → joins corrects
 *  - extractSiretHint pour subject IRI direct
 *  - extractSiretHint pour sa:siret literal constant
 *  - generateTriplesForProvider produit le set canonique
 *  - joinPatterns hash join
 *  - limit / offset honorés
 */

import { describe, it, expect } from 'vitest'

import {
  matchPatterns,
  generateTriplesForProvider,
  joinPatterns,
  extractSiretHint,
  type SupabaseLike,
} from '@/app/api/v1/kg/sparql/_triples-store'
import type { TriplePattern } from '@/app/api/v1/kg/sparql/_query-builder-types'
import { SA_NS, PROVIDER_IRI_BASE } from '@/app/api/v1/kg/sparql/_query-builder-types'

type ProviderRow = {
  siret: string | null
  name: string | null
  address_city: string | null
  address_department: string | null
  rge_qualifications: unknown
}

function fixedRow(): ProviderRow {
  return {
    siret: '12345678901234',
    name: 'Plomberie Dupont',
    address_city: 'Lyon',
    address_department: '69',
    rge_qualifications: [
      { code: '5911', libelle: 'Qualibat RGE 5911', date_fin: '2027-12-31' },
      { code: '7131', libelle: 'Qualibat RGE 7131', date_fin: '2026-12-31' },
    ],
  }
}

/**
 * Mock Supabase builder : retourne directement les rows fournies.
 *
 * On construit un builder fluent ET thenable : chaque méthode renvoie `this`,
 * mais `then` côté `await` résout le résultat. Cela satisfait l'interface
 * `SupabaseQueryBuilder` (PromiseLike + chainable) sans pull du SDK Supabase
 * complet en test.
 */
function mockSupabase(rows: ProviderRow[], errorMsg?: string): SupabaseLike {
  const result = {
    data: errorMsg ? null : rows,
    error: errorMsg ? { message: errorMsg } : null,
  }
  const builder: Record<string, unknown> = {
    select() {
      return builder
    },
    eq() {
      return builder
    },
    not() {
      return builder
    },
    limit() {
      return builder
    },
    range() {
      return builder
    },
    then(
      onFulfilled?: ((v: typeof result) => unknown) | null,
      onRejected?: ((e: unknown) => unknown) | null
    ) {
      return Promise.resolve(result).then(onFulfilled ?? undefined, onRejected ?? undefined)
    },
  }
  return {
    from() {
      return builder as never
    },
  }
}

describe('generateTriplesForProvider', () => {
  it('produces all canonical triples for a provider with 2 qualifs', () => {
    const triples = generateTriplesForProvider(fixedRow())
    // 1 rdf:type + 1 siret + 1 label + 1 ville + 1 departement = 5
    // + per qualif (2) : 1 hasQualification + 1 rdf:type + 1 code + 1 libelle + 1 validUntil = 5 × 2 = 10
    expect(triples.length).toBe(15)
    const subjects = new Set(triples.map((t) => (t.subject.type === 'iri' ? t.subject.value : '')))
    expect(subjects.has(`${PROVIDER_IRI_BASE}12345678901234`)).toBe(true)
  })

  it('returns empty array if siret missing', () => {
    const row: ProviderRow = {
      siret: null,
      name: 'x',
      address_city: 'x',
      address_department: 'x',
      rge_qualifications: [],
    }
    expect(generateTriplesForProvider(row)).toEqual([])
  })
})

describe('extractSiretHint', () => {
  it('extracts SIRET from subject IRI', () => {
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'iri', value: `${PROVIDER_IRI_BASE}12345678901234` },
        predicate: { type: 'var', name: 'p' },
        object: { type: 'var', name: 'o' },
      },
    ]
    expect(extractSiretHint(patterns)).toBe('12345678901234')
  })

  it('extracts SIRET from sa:siret literal constant', () => {
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'literal', value: '12345678901234' },
      },
    ]
    expect(extractSiretHint(patterns)).toBe('12345678901234')
  })

  it('returns null when no constant subject', () => {
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'var', name: 'p' },
        object: { type: 'var', name: 'o' },
      },
    ]
    expect(extractSiretHint(patterns)).toBeNull()
  })
})

describe('joinPatterns', () => {
  it('binds variables across triples', () => {
    const triples = generateTriplesForProvider(fixedRow())
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'var', name: 'siret' },
      },
    ]
    const bindings = joinPatterns(patterns, triples)
    expect(bindings).toHaveLength(1)
    expect(bindings[0]!.siret).toEqual({ type: 'literal', value: '12345678901234' })
  })

  it('returns empty array when patterns mismatch', () => {
    const triples = generateTriplesForProvider(fixedRow())
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'literal', value: 'no-match' },
      },
    ]
    expect(joinPatterns(patterns, triples)).toEqual([])
  })
})

describe('matchPatterns', () => {
  it('returns 0 bindings on empty providers', async () => {
    const supabase = mockSupabase([])
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'var', name: 'siret' },
      },
    ]
    const res = await matchPatterns(patterns, 100, 0, supabase)
    expect(res.bindings).toEqual([])
    expect(res.truncated).toBe(false)
  })

  it('returns provider triples on direct SIRET lookup', async () => {
    const supabase = mockSupabase([fixedRow()])
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'literal', value: '12345678901234' },
      },
    ]
    const res = await matchPatterns(patterns, 100, 0, supabase)
    expect(res.bindings.length).toBe(1)
    expect(res.bindings[0]!.s).toEqual({
      type: 'iri',
      value: `${PROVIDER_IRI_BASE}12345678901234`,
    })
  })

  it('honors LIMIT on scan path', async () => {
    const supabase = mockSupabase([fixedRow()])
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'var', name: 'p' },
        object: { type: 'var', name: 'o' },
      },
    ]
    const res = await matchPatterns(patterns, 5, 0, supabase)
    expect(res.bindings.length).toBeLessThanOrEqual(5)
    expect(res.truncated).toBe(true)
  })

  it('honors OFFSET', async () => {
    const supabase = mockSupabase([fixedRow()])
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'var', name: 'p' },
        object: { type: 'var', name: 'o' },
      },
    ]
    const all = await matchPatterns(patterns, 100, 0, supabase)
    const offset3 = await matchPatterns(patterns, 100, 3, supabase)
    expect(offset3.bindings.length).toBe(all.bindings.length - 3)
  })

  it('throws on supabase error', async () => {
    const supabase = mockSupabase([], 'connection failed')
    const patterns: TriplePattern[] = [
      {
        subject: { type: 'var', name: 's' },
        predicate: { type: 'iri', value: `${SA_NS}siret` },
        object: { type: 'literal', value: '12345678901234' },
      },
    ]
    await expect(matchPatterns(patterns, 10, 0, supabase)).rejects.toThrow(/connection failed/)
  })
})
