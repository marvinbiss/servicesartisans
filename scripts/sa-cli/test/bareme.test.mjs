import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { baremeCommand } from '../src/commands/bareme.mjs'

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

describe('bareme command', () => {
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

  it('returns exit 2 without subcommand', async () => {
    const code = await baremeCommand([])
    assert.equal(code, 2)
    assert.ok(streams.stderr.join('').includes('mpr'))
  })

  it('returns exit 2 with invalid subcommand', async () => {
    const code = await baremeCommand(['foo'])
    assert.equal(code, 2)
  })

  it('bareme mpr returns exit 0 with full args', async () => {
    let capturedUrl = ''
    global.fetch = async (url) => {
      capturedUrl = url
      return {
        status: 200,
        text: async () => '{"montant":5000,"geste":"pac-air-eau"}',
        headers: new Map(),
      }
    }
    const code = await baremeCommand([
      'mpr',
      '--geste',
      'pac-air-eau',
      '--menage',
      'bleu',
      '--zone',
      'H1',
      '--rfr',
      '18000',
      '--nb',
      '3',
    ])
    assert.equal(code, 0)
    assert.ok(capturedUrl.includes('/api/v1/aides/mpr-bareme'))
    assert.ok(capturedUrl.includes('geste=pac-air-eau'))
    assert.ok(capturedUrl.includes('menage_categorie=bleu'))
    assert.ok(capturedUrl.includes('zone=H1'))
    assert.ok(capturedUrl.includes('rfr=18000'))
    assert.ok(capturedUrl.includes('nb_personnes=3'))
    assert.ok(streams.stdout.join('').includes('5000'))
  })

  it('bareme cee returns exit 0 with full args', async () => {
    let capturedUrl = ''
    global.fetch = async (url) => {
      capturedUrl = url
      return {
        status: 200,
        text: async () => '{"montant":1200,"geste":"isolation-combles"}',
        headers: new Map(),
      }
    }
    const code = await baremeCommand([
      'cee',
      '--geste',
      'isolation-combles',
      '--zone',
      'H2',
      '--type',
      'maison',
      '--menage',
      'jaune',
    ])
    assert.equal(code, 0)
    assert.ok(capturedUrl.includes('/api/v1/aides/cee-bareme'))
    assert.ok(capturedUrl.includes('zone_climatique=H2'))
    assert.ok(capturedUrl.includes('type_logement=maison'))
    assert.ok(capturedUrl.includes('menage_categorie=jaune'))
  })

  it('returns exit 1 when API responds 400', async () => {
    global.fetch = async () => ({
      status: 400,
      text: async () => '{"error":"missing geste"}',
      headers: new Map(),
    })
    const code = await baremeCommand(['mpr', '--zone', 'H1'])
    assert.equal(code, 1)
    assert.ok(streams.stderr.join('').includes('400'))
  })
})
