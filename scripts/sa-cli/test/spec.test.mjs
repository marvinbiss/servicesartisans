import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, unlink, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { specCommand } from '../src/commands/spec.mjs'

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

describe('spec command', () => {
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

  it('default version v1.0 prints JSON to stdout', async () => {
    let capturedUrl = ''
    global.fetch = async (url) => {
      capturedUrl = url
      return {
        status: 200,
        text: async () => '{"$schema":"https://json-schema.org/draft/2020-12/schema","version":"v1.0"}',
        headers: new Map(),
      }
    }
    const code = await specCommand([])
    assert.equal(code, 0)
    assert.ok(capturedUrl.includes('/spec/rge/v1.0/rge.schema.json'))
    assert.ok(streams.stdout.join('').includes('"version": "v1.0"'))
  })

  it('writes output file when --output given', async () => {
    global.fetch = async () => ({
      status: 200,
      text: async () => '{"version":"v1.0"}',
      headers: new Map(),
    })
    const dir = await mkdtemp(join(tmpdir(), 'sa-rge-os-spec-'))
    const outPath = join(dir, 'rge.json')
    const code = await specCommand(['--output', outPath])
    assert.equal(code, 0)
    const written = await readFile(outPath, 'utf8')
    assert.ok(written.includes('"version": "v1.0"'))
    assert.ok(streams.stdout.join('').includes(`Wrote ${outPath}`))
    await unlink(outPath)
  })

  it('returns exit 1 on 500', async () => {
    global.fetch = async () => ({
      status: 500,
      text: async () => 'oops',
      headers: new Map(),
    })
    const code = await specCommand([])
    assert.equal(code, 1)
    assert.ok(streams.stderr.join('').includes('500'))
  })
})
