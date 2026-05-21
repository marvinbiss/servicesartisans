import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildChatGptPluginManifest } from '../src/manifests/chatgpt-plugin.mjs'

test('schema_version is v1', () => {
  const m = buildChatGptPluginManifest()
  assert.equal(m.schema_version, 'v1')
})

test('api.url points to /api/v1/openapi.json', () => {
  const m = buildChatGptPluginManifest()
  assert.equal(m.api.type, 'openapi')
  assert.ok(m.api.url.endsWith('/api/v1/openapi.json'))
  assert.equal(m.auth.type, 'none')
})

test('legal_info_url points to /transparence-ia', () => {
  const m = buildChatGptPluginManifest()
  assert.ok(m.legal_info_url.endsWith('/transparence-ia'))
  assert.equal(m.name_for_model, 'servicesartisans_rge')
})
