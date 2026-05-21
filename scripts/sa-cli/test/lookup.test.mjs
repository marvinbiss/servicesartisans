import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { lookupCommand } from '../src/commands/lookup.mjs'

function captureStreams() {
  const stdout = []
  const stderr = []
  const originalStdout = process.stdout.write.bind(process.stdout)
  const originalStderr = process.stderr.write.bind(process.stderr)
  process.stdout.write = (chunk) => {
    stdout.push(String(chunk))
    return true
  }
  process.stderr.write = (chunk) => {
    stderr.push(String(chunk))
    return true
  }
  return {
    stdout,
    stderr,
    restore() {
      process.stdout.write = originalStdout
      process.stderr.write = originalStderr
    },
  }
}

describe('lookup command', () => {
  let originalFetch
  let streams

  beforeEach(() => {
    originalFetch = global.fetch
    streams = captureStreams()
  })

  afterEach(() => {
    global.fetch = originalFetch
    streams.restore()
  })

  it('returns exit 2 without SIRET argument', async () => {
    const code = await lookupCommand([])
    assert.equal(code, 2)
    assert.ok(streams.stderr.join('').includes('14-digit SIRET'))
  })

  it('returns exit 2 with invalid SIRET (non 14 digits)', async () => {
    const code = await lookupCommand(['1234'])
    assert.equal(code, 2)
    assert.ok(streams.stderr.join('').includes('14-digit SIRET'))
  })

  it('returns exit 2 with non-numeric SIRET', async () => {
    const code = await lookupCommand(['ABCDEFGHIJKLMN'])
    assert.equal(code, 2)
  })

  it('returns exit 0 + JSON stdout for valid SIRET', async () => {
    global.fetch = async () => ({
      status: 200,
      text: async () => '{"siret":"12345678901234","name":"Acme RGE"}',
      headers: new Map(),
    })
    const code = await lookupCommand(['12345678901234'])
    assert.equal(code, 0)
    const out = streams.stdout.join('')
    assert.ok(out.includes('Acme RGE'))
    assert.ok(out.includes('12345678901234'))
  })

  it('returns exit 1 on API 404', async () => {
    global.fetch = async () => ({
      status: 404,
      text: async () => '{"error":"not found"}',
      headers: new Map(),
    })
    const code = await lookupCommand(['12345678901234'])
    assert.equal(code, 1)
    assert.ok(streams.stderr.join('').includes('404'))
  })
})
