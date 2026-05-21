import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildMcpRegistryApplication } from '../src/manifests/mcp-registry.mjs'

test('MCP application points to /api/v1/mcp endpoint', () => {
  const app = buildMcpRegistryApplication()
  assert.ok(app.endpoint.endsWith('/api/v1/mcp'))
  assert.equal(app.transport, 'http')
})

test('MCP application pins protocol_version', () => {
  const app = buildMcpRegistryApplication()
  assert.equal(app.protocol_version, '2025-03-26')
})

test('MCP application advertises safety disclosure /transparence-ia', () => {
  const app = buildMcpRegistryApplication()
  assert.ok(app.safety_disclosure.endsWith('/transparence-ia'))
  assert.equal(app.auth, 'none')
  assert.equal(app.license, 'CC-BY-4.0')
})
