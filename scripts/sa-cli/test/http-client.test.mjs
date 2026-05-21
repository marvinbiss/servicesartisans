import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { httpGet, httpPost } from '../src/lib/http-client.mjs'

describe('http-client', () => {
  let originalFetch

  beforeEach(() => {
    originalFetch = global.fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('httpGet builds URL with query', async () => {
    global.fetch = async (urlString, opts) => {
      assert.equal(opts.method, 'GET')
      assert.ok(urlString.includes('siret=12345678901234'))
      return {
        status: 200,
        text: async () => '{"ok":true}',
        headers: new Map([['content-type', 'application/json']]),
      }
    }
    const r = await httpGet('/api/v1/rge/lookup', { query: { siret: '12345678901234' } })
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true })
  })

  it('httpGet skips undefined/null query params', async () => {
    let capturedUrl = ''
    global.fetch = async (urlString) => {
      capturedUrl = urlString
      return { status: 200, text: async () => '{}', headers: new Map() }
    }
    await httpGet('/api/foo', { query: { a: 'one', b: undefined, c: null, d: 'two' } })
    assert.ok(capturedUrl.includes('a=one'))
    assert.ok(capturedUrl.includes('d=two'))
    assert.ok(!capturedUrl.includes('b='))
    assert.ok(!capturedUrl.includes('c='))
  })

  it('httpPost sends JSON body', async () => {
    global.fetch = async (urlString, opts) => {
      assert.equal(opts.method, 'POST')
      assert.equal(JSON.parse(opts.body).query, 'test')
      assert.equal(opts.headers['Content-Type'], 'application/json')
      return {
        status: 200,
        text: async () => '{"answer":"hi"}',
        headers: new Map(),
      }
    }
    const r = await httpPost('/api/v1/ask', { query: 'test' })
    assert.equal(r.status, 200)
    assert.equal(r.body.answer, 'hi')
  })

  it('handles non-JSON response', async () => {
    global.fetch = async () => ({
      status: 500,
      text: async () => 'not json',
      headers: new Map(),
    })
    const r = await httpGet('/foo')
    assert.equal(r.status, 500)
    assert.equal(r.body._raw, 'not json')
  })

  it('respects custom baseUrl', async () => {
    let capturedUrl = ''
    global.fetch = async (url) => {
      capturedUrl = url
      return { status: 200, text: async () => '{}', headers: new Map() }
    }
    await httpGet('/foo', { baseUrl: 'https://staging.example.com' })
    assert.ok(capturedUrl.startsWith('https://staging.example.com/'))
  })

  it('sets User-Agent header', async () => {
    let capturedHeaders = {}
    global.fetch = async (_url, opts) => {
      capturedHeaders = opts.headers
      return { status: 200, text: async () => '{}', headers: new Map() }
    }
    await httpGet('/foo')
    assert.equal(capturedHeaders['User-Agent'], 'sa-rge-os/0.1.0')
    assert.equal(capturedHeaders.Accept, 'application/json')
  })
})
