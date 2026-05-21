import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { searchCommand } from '../src/commands/search.mjs'

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

describe('search command', () => {
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

  it('returns exit 2 without metier+ville', async () => {
    const code = await searchCommand([])
    assert.equal(code, 2)
    assert.ok(streams.stderr.join('').includes('metier'))
  })

  it('returns exit 2 with only metier', async () => {
    const code = await searchCommand(['plombier'])
    assert.equal(code, 2)
  })

  it('returns exit 0 with metier+ville', async () => {
    let capturedUrl = ''
    global.fetch = async (url) => {
      capturedUrl = url
      return {
        status: 200,
        text: async () => '[{"siret":"12345678901234","name":"Acme"}]',
        headers: new Map(),
      }
    }
    const code = await searchCommand(['plombier', 'lyon'])
    assert.equal(code, 0)
    assert.ok(capturedUrl.includes('metier=plombier'))
    assert.ok(capturedUrl.includes('ville=lyon'))
    assert.ok(streams.stdout.join('').includes('Acme'))
  })
})
