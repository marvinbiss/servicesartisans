import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { formatOutput } from '../src/lib/output.mjs'

describe('output formatter', () => {
  it('json default indents 2 spaces', () => {
    const result = formatOutput({ a: 1, b: 'two' })
    assert.equal(result, '{\n  "a": 1,\n  "b": "two"\n}')
  })

  it('table on object prints key: value lines', () => {
    const result = formatOutput({ siret: '12345678901234', name: 'Acme' }, 'table')
    assert.ok(result.includes('siret: 12345678901234'))
    assert.ok(result.includes('name: Acme'))
  })

  it('table on array prints header + rows', () => {
    const result = formatOutput([{ a: 1, b: 2 }, { a: 3, b: 4 }], 'table')
    assert.ok(result.includes('a | b'))
    assert.ok(result.includes('1 | 2'))
    assert.ok(result.includes('3 | 4'))
  })

  it('table on empty array returns (empty)', () => {
    assert.equal(formatOutput([], 'table'), '(empty)')
  })

  it('csv escapes quotes and commas per RFC 4180', () => {
    const result = formatOutput([{ name: 'Acme, Inc.', note: 'has "quotes"' }], 'csv')
    assert.ok(result.includes('"Acme, Inc."'))
    assert.ok(result.includes('"has ""quotes"""'))
  })

  it('csv on single object treats it as one row', () => {
    const result = formatOutput({ a: 1, b: 2 }, 'csv')
    const lines = result.split('\n')
    assert.equal(lines.length, 2)
    assert.equal(lines[0], 'a,b')
    assert.equal(lines[1], '1,2')
  })

  it('throws on unknown format', () => {
    assert.throws(() => formatOutput({ a: 1 }, 'xml'), /Unknown output format/)
  })

  it('handles nested objects as JSON cell', () => {
    const result = formatOutput([{ a: { x: 1 } }], 'table')
    assert.ok(result.includes('{"x":1}'))
  })
})
