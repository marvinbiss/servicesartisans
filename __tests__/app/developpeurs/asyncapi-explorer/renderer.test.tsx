/**
 * Tests — `_renderer.tsx` `ChannelBlock` + `OperationView` server components.
 *
 * Rendered via `renderToStaticMarkup` (no jsdom). Same harness as the
 * schema-explorer renderer tests.
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'

import {
  ChannelBlock,
  OperationView,
  ServerRow,
} from '@/app/(public)/developpeurs/asyncapi-explorer/_renderer'
import type {
  ChannelLite,
  OperationLite,
  ServerLite,
} from '@/app/(public)/developpeurs/asyncapi-explorer/_types'

function renderChannel(ch: ChannelLite): string {
  return renderToStaticMarkup(React.createElement(ChannelBlock, { ch }))
}

function renderOp(op: OperationLite): string {
  return renderToStaticMarkup(React.createElement(OperationView, { op }))
}

function renderServer(s: ServerLite): string {
  return renderToStaticMarkup(React.createElement(ServerRow, { s }))
}

describe('ChannelBlock', () => {
  it('renders the channel id in the header with an anchor id', () => {
    const html = renderChannel({
      id: 'rge.snapshot.refreshed',
      messages: [],
      operations: [],
    })
    expect(html).toMatch(/id="channel-rge\.snapshot\.refreshed"/)
    expect(html).toMatch(/>rge\.snapshot\.refreshed</)
  })

  it('renders nested operations attached to the channel', () => {
    const html = renderChannel({
      id: 'c.x',
      messages: [],
      operations: [
        {
          id: 'receiveX',
          action: 'receive',
          channelRef: 'c.x',
          messages: [],
        },
      ],
    })
    expect(html).toMatch(/id="op-receiveX"/)
    expect(html).toMatch(/RECEIVE/)
  })

  it('uses only allowed design tokens (accent-/charcoal-/yellow-/red-)', () => {
    const html = renderChannel({
      id: 'c.x',
      messages: [],
      operations: [
        {
          id: 'rx',
          action: 'receive',
          channelRef: 'c.x',
          messages: [
            {
              name: 'M',
              payloadType: 'object',
              payloadProperties: [{ name: 'id', type: 'string', required: true }],
              payloadExample: { id: 'abc' },
            },
          ],
        },
      ],
    })
    expect(html).not.toMatch(/(^|[^a-zA-Z])emerald-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])slate-/)
    expect(html).not.toMatch(/(^|[^a-zA-Z])gray-/)
  })
})

describe('OperationView', () => {
  it('renders a send badge with accent tokens for action="send"', () => {
    const html = renderOp({
      id: 'sendIt',
      action: 'send',
      channelRef: 'c',
      messages: [],
    })
    expect(html).toMatch(/SEND/)
    expect(html).toMatch(/bg-accent-100/)
  })

  it('renders a receive badge with yellow tokens for action="receive"', () => {
    const html = renderOp({
      id: 'recvIt',
      action: 'receive',
      channelRef: 'c',
      messages: [],
    })
    expect(html).toMatch(/RECEIVE/)
    expect(html).toMatch(/bg-yellow-100/)
  })

  it('renders the required asterisk on required payload props', () => {
    const html = renderOp({
      id: 'rx',
      action: 'receive',
      channelRef: 'c',
      messages: [
        {
          name: 'M',
          payloadType: 'object',
          payloadProperties: [
            { name: 'id', type: 'string', required: true },
            { name: 'nickname', type: 'string', required: false },
          ],
        },
      ],
    })
    expect(html).toMatch(/id<span class="text-red-700">\*<\/span>/)
    expect(html).not.toMatch(/nickname<span class="text-red-700">\*<\/span>/)
  })

  it('renders an example pre block when payloadExample is present', () => {
    const html = renderOp({
      id: 'rx',
      action: 'receive',
      channelRef: 'c',
      messages: [
        {
          name: 'M',
          payloadType: 'object',
          payloadProperties: [],
          payloadExample: { hello: 'world' },
        },
      ],
    })
    expect(html).toMatch(/<pre /)
    expect(html).toMatch(/&quot;hello&quot;/)
    expect(html).toMatch(/&quot;world&quot;/)
  })
})

describe('ServerRow', () => {
  it('renders the server name, protocol and host', () => {
    const html = renderServer({
      name: 'production',
      host: 'servicesartisans.fr',
      protocol: 'https',
      description: 'Prod target',
    })
    expect(html).toMatch(/production/)
    expect(html).toMatch(/https/)
    expect(html).toMatch(/servicesartisans\.fr/)
    expect(html).toMatch(/Prod target/)
  })
})
