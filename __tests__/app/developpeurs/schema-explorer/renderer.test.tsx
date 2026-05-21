/**
 * Tests — `_renderer.tsx` `SchemaBlock` server component.
 *
 * Rendered via `renderToStaticMarkup` (no jsdom) to keep the test stack
 * flat. Same harness shape as the api-explorer renderer tests.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

import { SchemaBlock } from '@/app/(public)/developpeurs/schema-explorer/_renderer'
import type { SchemaLite } from '@/app/(public)/developpeurs/schema-explorer/_types'

function render(schema: SchemaLite, example: unknown): string {
  return renderToStaticMarkup(React.createElement(SchemaBlock, { schema, example }))
}

describe('SchemaBlock', () => {
  it('renders the schema name and type in the header', () => {
    const html = render(
      {
        name: 'User',
        type: 'object',
        properties: [],
        required: [],
        example: null,
        usedBy: [],
      },
      null
    )
    expect(html).toMatch(/id="schema-User"/)
    expect(html).toMatch(/>User</)
    expect(html).toMatch(/>object</)
  })

  it('marks required properties with a red asterisk', () => {
    const html = render(
      {
        name: 'User',
        type: 'object',
        properties: [
          { name: 'id', type: 'string', required: true },
          { name: 'nickname', type: 'string', required: false },
        ],
        required: ['id'],
        example: null,
        usedBy: [],
      },
      null
    )
    // The required marker is a <span class="text-red-700">*</span> next
    // to the property name.
    expect(html).toMatch(/id<span class="text-red-700">\*<\/span>/)
    // The non-required prop must NOT carry the marker.
    expect(html).not.toMatch(/nickname<span class="text-red-700">\*<\/span>/)
  })

  it('renders the used-by list with method badges when usage exists', () => {
    const html = render(
      {
        name: 'User',
        type: 'object',
        properties: [],
        required: [],
        example: null,
        usedBy: [
          { method: 'get', path: '/api/v1/users/{id}', operationId: 'getUser' },
          { method: 'post', path: '/api/v1/users' },
        ],
      },
      null
    )
    expect(html).toMatch(/Used by/)
    expect(html).toMatch(/GET/)
    expect(html).toMatch(/POST/)
    expect(html).toMatch(/\/api\/v1\/users\/\{id\}/)
  })

  it('renders the example pre block when example is non-null', () => {
    const html = render(
      {
        name: 'User',
        type: 'object',
        properties: [],
        required: [],
        example: { id: 'abc' },
        usedBy: [],
      },
      { id: 'abc' }
    )
    expect(html).toMatch(/<pre /)
    expect(html).toMatch(/&quot;id&quot;/)
    expect(html).toMatch(/&quot;abc&quot;/)
  })

  it('renders $ref properties as anchor links to the target schema', () => {
    const html = render(
      {
        name: 'A',
        type: 'object',
        properties: [{ name: 'b', type: '$ref', refTo: 'B', required: false }],
        required: [],
        example: null,
        usedBy: [],
      },
      null
    )
    expect(html).toMatch(/href="#schema-B"/)
    expect(html).toMatch(/>B</)
  })

  it('uses only allowed design tokens (accent-/charcoal-/yellow-/red-)', () => {
    const html = render(
      {
        name: 'User',
        type: 'object',
        properties: [{ name: 'id', type: 'string', required: true }],
        required: ['id'],
        example: { id: 'abc' },
        usedBy: [{ method: 'delete', path: '/api/v1/users/{id}' }],
      },
      { id: 'abc' }
    )
    expect(html).not.toMatch(/(^|[^a-zA-Z])emerald-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])slate-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])gray-/)
  })
})
