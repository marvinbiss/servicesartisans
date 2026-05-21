/**
 * Minimal types for the AsyncAPI explorer.
 *
 * Mirrors the shape projected by `_flatten-asyncapi.ts` so that the
 * renderer and tests can pin down server-side rendering output without
 * pulling the full `@asyncapi/parser` runtime. Kept deliberately narrow
 * to the slice of AsyncAPI 3.0 that the Ralph 30 spec exercises.
 */

export type PropertyLite = {
  name: string
  type: string
  required: boolean
  description?: string
}

export type MessageLite = {
  name: string
  contentType?: string
  title?: string
  summary?: string
  payloadType: string
  payloadProperties: PropertyLite[]
  payloadExample?: unknown
}

export type OperationLite = {
  id: string
  action: 'send' | 'receive'
  summary?: string
  description?: string
  channelRef: string
  messages: MessageLite[]
}

export type ChannelLite = {
  id: string
  address?: string
  title?: string
  description?: string
  messages: MessageLite[]
  operations: OperationLite[]
}

export type ServerLite = {
  name: string
  host?: string
  protocol?: string
  description?: string
}

export type AsyncApiInfoLite = {
  title?: string
  version?: string
  description?: string
}

export type FlattenedAsyncApi = {
  info: AsyncApiInfoLite
  servers: ServerLite[]
  channels: ChannelLite[]
}
