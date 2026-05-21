import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { run, VERSION } from '../src/index.mjs'

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

describe('cli dispatcher', () => {
  let streams

  beforeEach(() => {
    streams = captureStreams()
  })

  afterEach(() => {
    streams.restore()
  })

  it('--help prints HELP and exits 0', async () => {
    const code = await run(['--help'])
    assert.equal(code, 0)
    assert.ok(streams.stdout.join('').includes('sa-rge-os'))
    assert.ok(streams.stdout.join('').includes('Usage:'))
  })

  it('-h alias prints HELP', async () => {
    const code = await run(['-h'])
    assert.equal(code, 0)
    assert.ok(streams.stdout.join('').includes('Usage:'))
  })

  it('empty args prints HELP', async () => {
    const code = await run([])
    assert.equal(code, 0)
    assert.ok(streams.stdout.join('').includes('Usage:'))
  })

  it('--version prints version', async () => {
    const code = await run(['--version'])
    assert.equal(code, 0)
    assert.ok(streams.stdout.join('').includes(VERSION))
  })

  it('-v alias prints version', async () => {
    const code = await run(['-v'])
    assert.equal(code, 0)
    assert.ok(streams.stdout.join('').includes(VERSION))
  })

  it('unknown command exits 1 with HELP on stderr', async () => {
    const code = await run(['nope'])
    assert.equal(code, 1)
    assert.ok(streams.stderr.join('').includes('Unknown command'))
  })
})
