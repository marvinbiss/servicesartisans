/**
 * Tests — `_flatten-asyncapi.ts` extractor.
 *
 * Covers the well-formed shape used by the Ralph 30 AsyncAPI const plus
 * a battery of edge cases (no channels, malformed actions, $ref cycles,
 * non-string entries). The flattener must never throw.
 */
import { describe, it, expect } from 'vitest'
import { flattenAsyncApi } from '@/app/(public)/developpeurs/asyncapi-explorer/_flatten-asyncapi'
import { ASYNCAPI_SPEC } from '@/app/api/v1/asyncapi/_spec'

describe('flattenAsyncApi — defensive shape', () => {
  it('returns empty arrays for a non-object spec', () => {
    expect(flattenAsyncApi(null)).toEqual({ info: {}, servers: [], channels: [] })
    expect(flattenAsyncApi(undefined)).toEqual({ info: {}, servers: [], channels: [] })
    expect(flattenAsyncApi('not-a-spec')).toEqual({ info: {}, servers: [], channels: [] })
  })

  it('returns empty channels when the spec has no channels key', () => {
    const out = flattenAsyncApi({ info: { title: 'X' } })
    expect(out.channels).toEqual([])
    expect(out.info.title).toBe('X')
  })
})

describe('flattenAsyncApi — well-formed', () => {
  it('passes through info.title, version, description', () => {
    const out = flattenAsyncApi({
      info: { title: 'My Events', version: '2.1.0', description: 'desc' },
    })
    expect(out.info).toEqual({ title: 'My Events', version: '2.1.0', description: 'desc' })
  })

  it('extracts servers with name + host + protocol + description', () => {
    const out = flattenAsyncApi({
      servers: {
        prod: { host: 'example.com', protocol: 'https', description: 'Production' },
      },
    })
    expect(out.servers).toEqual([
      { name: 'prod', host: 'example.com', protocol: 'https', description: 'Production' },
    ])
  })

  it('lists channels sorted alphabetically by id', () => {
    const out = flattenAsyncApi({
      channels: {
        'z.event': { address: 'z.event' },
        'a.event': { address: 'a.event' },
        'm.event': { address: 'm.event' },
      },
    })
    expect(out.channels.map((c) => c.id)).toEqual(['a.event', 'm.event', 'z.event'])
  })

  it('attaches operations to their channel via $ref', () => {
    const out = flattenAsyncApi({
      channels: { 'rge.x': { address: 'rge.x' } },
      operations: {
        receiveX: { action: 'receive', channel: { $ref: '#/channels/rge.x' } },
      },
    })
    const ch = out.channels.find((c) => c.id === 'rge.x')
    expect(ch?.operations.length).toBe(1)
    expect(ch?.operations[0]?.id).toBe('receiveX')
  })

  it('recognizes both send and receive actions, ignores malformed', () => {
    const out = flattenAsyncApi({
      channels: { 'c.a': {}, 'c.b': {}, 'c.c': {} },
      operations: {
        opSend: { action: 'send', channel: { $ref: '#/channels/c.a' } },
        opRecv: { action: 'receive', channel: { $ref: '#/channels/c.b' } },
        opBad: { action: 'banana', channel: { $ref: '#/channels/c.c' } },
      },
    })
    const a = out.channels.find((c) => c.id === 'c.a')
    const b = out.channels.find((c) => c.id === 'c.b')
    const c = out.channels.find((c) => c.id === 'c.c')
    expect(a?.operations[0]?.action).toBe('send')
    expect(b?.operations[0]?.action).toBe('receive')
    expect(c?.operations.length).toBe(0)
  })

  it('builds messages from components.messages with payload properties', () => {
    const out = flattenAsyncApi({
      channels: {
        'evt.x': {
          messages: { m: { $ref: '#/components/messages/MyMsg' } },
        },
      },
      operations: {
        rx: { action: 'receive', channel: { $ref: '#/channels/evt.x' } },
      },
      components: {
        messages: {
          MyMsg: {
            name: 'MyMsg',
            contentType: 'application/json',
            payload: {
              type: 'object',
              required: ['id'],
              properties: {
                id: { type: 'string', description: 'The id' },
                count: { type: 'integer' },
              },
            },
          },
        },
      },
    })
    const ch = out.channels.find((c) => c.id === 'evt.x')
    const msg = ch?.operations[0]?.messages[0]
    expect(msg?.name).toBe('MyMsg')
    expect(msg?.contentType).toBe('application/json')
    const id = msg?.payloadProperties.find((p) => p.name === 'id')
    const count = msg?.payloadProperties.find((p) => p.name === 'count')
    expect(id?.required).toBe(true)
    expect(id?.type).toBe('string')
    expect(id?.description).toBe('The id')
    expect(count?.required).toBe(false)
  })

  it('propagates the required flag from payload.required[] strings only', () => {
    const out = flattenAsyncApi({
      channels: { c: { messages: { m: { $ref: '#/components/messages/M' } } } },
      operations: { rx: { action: 'receive', channel: { $ref: '#/channels/c' } } },
      components: {
        messages: {
          M: {
            payload: {
              type: 'object',
              required: ['a', 42, null, 'b'],
              properties: { a: { type: 'string' }, b: { type: 'string' }, c: { type: 'string' } },
            },
          },
        },
      },
    })
    const ch = out.channels[0]
    const props = ch?.operations[0]?.messages[0]?.payloadProperties ?? []
    expect(props.find((p) => p.name === 'a')?.required).toBe(true)
    expect(props.find((p) => p.name === 'b')?.required).toBe(true)
    expect(props.find((p) => p.name === 'c')?.required).toBe(false)
  })

  it('resolves channel-level $ref messages against components.messages', () => {
    const out = flattenAsyncApi({
      channels: {
        'rge.snapshot': {
          messages: { m: { $ref: '#/components/messages/Snap' } },
        },
      },
      components: {
        messages: { Snap: { name: 'Snap', payload: { type: 'object', properties: {} } } },
      },
    })
    expect(out.channels[0]?.messages[0]?.name).toBe('Snap')
  })

  it('flattens the Ralph 30 ASYNCAPI_SPEC into 4 channels with messages', () => {
    const out = flattenAsyncApi(ASYNCAPI_SPEC as unknown)
    expect(out.channels.length).toBe(4)
    for (const ch of out.channels) {
      expect(ch.messages.length).toBeGreaterThanOrEqual(1)
      expect(ch.operations.length).toBeGreaterThanOrEqual(1)
      expect(ch.operations[0]?.action).toBe('receive')
    }
    expect(out.servers.length).toBe(1)
    expect(out.servers[0]?.name).toBe('production')
  })

  it('extracts info.title and info.version from the Ralph 30 spec', () => {
    const out = flattenAsyncApi(ASYNCAPI_SPEC as unknown)
    expect(out.info.title).toBe('ServicesArtisans RGE-OS Events')
    expect(out.info.version).toBe('1.0.0')
  })
})
