/**
 * Tests — SPARQL serializers (`src/app/api/v1/kg/sparql/_serializer.ts`)
 *
 * Couvre :
 *  - JSON SELECT (W3C SPARQL Query Results JSON)
 *  - CSV SELECT (W3C, escaping comma/quote/CR/LF)
 *  - TSV SELECT (W3C, escaping \t \n)
 *  - XML SELECT (W3C SPARQL Query Results XML)
 *  - IRI vs literal type discrimination
 *  - Language-tagged literal
 *  - STAR projection
 *  - ASK JSON / CSV / XML
 */

import { describe, it, expect } from 'vitest'

import { serializeSelectResults, serializeAskResult } from '@/app/api/v1/kg/sparql/_serializer'
import type { Binding, SparqlVariable } from '@/app/api/v1/kg/sparql/_query-builder-types'

const VARS: SparqlVariable[] = [
  { type: 'var', name: 's' },
  { type: 'var', name: 'label' },
]

const ONE_BINDING: Binding[] = [
  {
    s: { type: 'iri', value: 'https://servicesartisans.fr/r/p/12345678901234' },
    label: { type: 'literal', value: 'Plomberie Dupont' },
  },
]

describe('serializeSelectResults — JSON', () => {
  it('produces W3C SPARQL Query Results JSON shape', () => {
    const res = serializeSelectResults(ONE_BINDING, VARS, 'json')
    expect(res.contentType).toMatch(/sparql-results\+json/)
    const parsed = JSON.parse(res.body) as {
      head: { vars: string[] }
      results: {
        bindings: Array<Record<string, { type: string; value: string }>>
      }
    }
    expect(parsed.head.vars).toEqual(['s', 'label'])
    expect(parsed.results.bindings).toHaveLength(1)
    expect(parsed.results.bindings[0]!.s).toEqual({
      type: 'uri',
      value: 'https://servicesartisans.fr/r/p/12345678901234',
    })
    expect(parsed.results.bindings[0]!.label).toEqual({
      type: 'literal',
      value: 'Plomberie Dupont',
    })
  })

  it('emits @lang and datatype on literals', () => {
    const bindings: Binding[] = [
      {
        l: { type: 'literal', value: 'Bonjour', lang: 'fr' },
        d: {
          type: 'literal',
          value: '2027-01-01',
          datatype: 'http://www.w3.org/2001/XMLSchema#date',
        },
      },
    ]
    const vars: SparqlVariable[] = [
      { type: 'var', name: 'l' },
      { type: 'var', name: 'd' },
    ]
    const res = serializeSelectResults(bindings, vars, 'json')
    const parsed = JSON.parse(res.body) as {
      results: {
        bindings: Array<Record<string, Record<string, string>>>
      }
    }
    expect(parsed.results.bindings[0]!.l!['xml:lang']).toBe('fr')
    expect(parsed.results.bindings[0]!.d!.datatype).toBe('http://www.w3.org/2001/XMLSchema#date')
  })

  it('supports STAR projection by inferring variables from bindings', () => {
    const res = serializeSelectResults(ONE_BINDING, 'STAR', 'json')
    const parsed = JSON.parse(res.body) as { head: { vars: string[] } }
    expect(parsed.head.vars).toEqual(['s', 'label'])
  })
})

describe('serializeSelectResults — CSV', () => {
  it('emits header + one row with comma separator', () => {
    const res = serializeSelectResults(ONE_BINDING, VARS, 'csv')
    expect(res.contentType).toMatch(/text\/csv/)
    expect(res.body.split('\r\n')[0]).toBe('s,label')
    expect(res.body.split('\r\n')[1]).toBe(
      'https://servicesartisans.fr/r/p/12345678901234,Plomberie Dupont'
    )
  })

  it('escapes commas and quotes per RFC 4180', () => {
    const bindings: Binding[] = [
      {
        x: { type: 'literal', value: 'a,b "quoted"' },
      },
    ]
    const vars: SparqlVariable[] = [{ type: 'var', name: 'x' }]
    const res = serializeSelectResults(bindings, vars, 'csv')
    const row = res.body.split('\r\n')[1]!
    expect(row).toBe('"a,b ""quoted"""')
  })
})

describe('serializeSelectResults — TSV', () => {
  it('emits header with ?var + tab-separated values', () => {
    const res = serializeSelectResults(ONE_BINDING, VARS, 'tsv')
    expect(res.contentType).toMatch(/tab-separated-values/)
    const lines = res.body.split('\n')
    expect(lines[0]).toBe('?s\t?label')
    expect(lines[1]).toContain('<https://servicesartisans.fr/r/p/12345678901234>')
    expect(lines[1]).toContain('"Plomberie Dupont"')
  })

  it('escapes tabs and newlines in values', () => {
    const bindings: Binding[] = [
      {
        x: { type: 'literal', value: 'col1\tcol2\nline2' },
      },
    ]
    const vars: SparqlVariable[] = [{ type: 'var', name: 'x' }]
    const res = serializeSelectResults(bindings, vars, 'tsv')
    expect(res.body).toContain('\\t')
    expect(res.body).toContain('\\n')
  })
})

describe('serializeSelectResults — XML', () => {
  it('produces well-formed SPARQL Results XML', () => {
    const res = serializeSelectResults(ONE_BINDING, VARS, 'xml')
    expect(res.contentType).toMatch(/sparql-results\+xml/)
    expect(res.body).toMatch(/^<\?xml/)
    expect(res.body).toContain('<sparql xmlns="http://www.w3.org/2005/sparql-results#">')
    expect(res.body).toContain('<variable name="s"/>')
    expect(res.body).toContain('<uri>https://servicesartisans.fr/r/p/12345678901234</uri>')
    expect(res.body).toContain('<literal>Plomberie Dupont</literal>')
    expect(res.body).toMatch(/<\/sparql>$/)
  })

  it('escapes XML special chars', () => {
    const bindings: Binding[] = [
      {
        x: { type: 'literal', value: 'a <b> & "c"' },
      },
    ]
    const vars: SparqlVariable[] = [{ type: 'var', name: 'x' }]
    const res = serializeSelectResults(bindings, vars, 'xml')
    expect(res.body).toContain('&lt;b&gt;')
    expect(res.body).toContain('&amp;')
  })
})

describe('serializeAskResult', () => {
  it('emits true/false in JSON', () => {
    const yes = serializeAskResult(true, 'json')
    expect(yes.contentType).toMatch(/sparql-results\+json/)
    expect(JSON.parse(yes.body)).toEqual({ head: {}, boolean: true })
    const no = serializeAskResult(false, 'json')
    expect(JSON.parse(no.body)).toEqual({ head: {}, boolean: false })
  })

  it('emits boolean row in CSV', () => {
    const res = serializeAskResult(true, 'csv')
    expect(res.body).toContain('true')
  })

  it('emits <boolean> in XML', () => {
    const res = serializeAskResult(true, 'xml')
    expect(res.body).toContain('<boolean>true</boolean>')
  })

  it('emits boolean in TSV', () => {
    const res = serializeAskResult(false, 'tsv')
    expect(res.body).toContain('?_askResult')
    expect(res.body).toContain('false')
  })
})
