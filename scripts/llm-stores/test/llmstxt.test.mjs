import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateLlmsTxt } from '../src/manifests/llmstxt.mjs'
import { DATASETS } from '../src/config.mjs'

test('generateLlmsTxt returns non-empty string', () => {
  const out = generateLlmsTxt()
  assert.equal(typeof out, 'string')
  assert.ok(out.length > 200)
})

test('llms.txt contains every dataset title', () => {
  const out = generateLlmsTxt()
  for (const d of DATASETS) {
    assert.ok(
      out.includes(d.title),
      `llms.txt missing dataset title: ${d.title}`,
    )
  }
})

test('llms.txt includes /transparence-ia disclosure link', () => {
  const out = generateLlmsTxt()
  assert.ok(out.includes('/transparence-ia'))
  assert.ok(out.includes('## APIs'))
  assert.ok(out.includes('## Datasets'))
})
