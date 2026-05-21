import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { askCommand } from '../src/commands/ask.mjs'

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

describe('ask command', () => {
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

  it('returns exit 2 without query', async () => {
    const code = await askCommand([])
    assert.equal(code, 2)
    assert.ok(streams.stderr.join('').includes('query'))
  })

  it('returns exit 0 and POSTs query', async () => {
    let capturedBody = ''
    global.fetch = async (_url, opts) => {
      capturedBody = opts.body
      return {
        status: 200,
        text: async () => '{"answer":"hi","sources":[]}',
        headers: new Map(),
      }
    }
    const code = await askCommand(['comment installer une PAC ?'])
    assert.equal(code, 0)
    const parsed = JSON.parse(capturedBody)
    assert.equal(parsed.query, 'comment installer une PAC ?')
    assert.equal(parsed.aidesContext, undefined)
  })

  it('builds aidesContext when aides-* flags given', async () => {
    let capturedBody = ''
    global.fetch = async (_url, opts) => {
      capturedBody = opts.body
      return { status: 200, text: async () => '{}', headers: new Map() }
    }
    const code = await askCommand([
      'simule mes aides',
      '--aides-geste',
      'pac-air-eau',
      '--aides-menage',
      'bleu',
      '--aides-zone',
      'H1',
      '--aides-rfr',
      '18000',
      '--aides-nb',
      '3',
    ])
    assert.equal(code, 0)
    const parsed = JSON.parse(capturedBody)
    assert.equal(parsed.aidesContext.geste, 'pac-air-eau')
    assert.equal(parsed.aidesContext.menageCategorie, 'bleu')
    assert.equal(parsed.aidesContext.zone, 'H1')
    assert.equal(parsed.aidesContext.rfr, 18000)
    assert.equal(parsed.aidesContext.nbPersonnes, 3)
  })

  it('returns exit 1 on API error', async () => {
    global.fetch = async () => ({
      status: 503,
      text: async () => '{"error":"down"}',
      headers: new Map(),
    })
    const code = await askCommand(['hi'])
    assert.equal(code, 1)
    assert.ok(streams.stderr.join('').includes('503'))
  })
})
