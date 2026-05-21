/**
 * Pure extractor — AsyncAPI 3.0 spec const → `ChannelLite[]` +
 * `ServerLite[]` + `info{}`.
 *
 * Reads the Ralph 30 `ASYNCAPI_SPEC` const directly (import-only — never
 * mutated). Resolves `$ref` lookups against `components.messages` and
 * `components.schemas` so that channels can be rendered without the
 * caller knowing about the spec's internal layout. Alphabetically sorts
 * channels for deterministic build output.
 *
 * Tolerance: every input is treated as `unknown` and re-narrowed locally.
 * A malformed spec must never throw at build time, because this code
 * runs inside a `force-static` Server Component during `next build`.
 */

import type {
  ChannelLite,
  FlattenedAsyncApi,
  MessageLite,
  OperationLite,
  PropertyLite,
  ServerLite,
} from './_types'

type AnyRecord = Record<string, unknown>

function isObj(v: unknown): v is AnyRecord {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

export function flattenAsyncApi(spec: unknown): FlattenedAsyncApi {
  if (!isObj(spec)) return { info: {}, servers: [], channels: [] }

  const info = isObj(spec.info) ? spec.info : {}
  const servers = isObj(spec.servers) ? extractServers(spec.servers) : []
  const components = isObj(spec.components) ? spec.components : {}
  const schemas = isObj(components.schemas) ? (components.schemas as AnyRecord) : {}
  const messagesByName = buildMessagesByName(
    isObj(components.messages) ? (components.messages as AnyRecord) : {},
    schemas
  )

  const channels = isObj(spec.channels) ? extractChannels(spec.channels, messagesByName) : []
  const operations = isObj(spec.operations) ? extractOperations(spec.operations) : []

  for (const op of operations) {
    if (!op.channelRef) continue
    const ch = channels.find((c) => c.id === op.channelRef)
    if (!ch) continue
    // Operation inherits the channel-declared messages unless we ever
    // surface an operation-level `messages[]` (Ralph 30 currently never
    // does, but this keeps the projection well-defined for future specs).
    op.messages = ch.messages
    ch.operations.push(op)
  }

  channels.sort((a, b) => a.id.localeCompare(b.id))

  return {
    info: {
      title: asString(info.title),
      version: asString(info.version),
      description: asString(info.description),
    },
    servers,
    channels,
  }
}

function extractServers(raw: AnyRecord): ServerLite[] {
  const out: ServerLite[] = []
  for (const [name, s] of Object.entries(raw)) {
    if (!isObj(s)) continue
    out.push({
      name,
      host: asString(s.host),
      protocol: asString(s.protocol),
      description: asString(s.description),
    })
  }
  return out
}

function resolveSchemaRef(node: unknown, schemas: AnyRecord, depth = 0): AnyRecord | null {
  if (depth > 6) return null
  if (!isObj(node)) return null
  if (typeof node.$ref === 'string') {
    const m = node.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (!m || !m[1]) return null
    const target = schemas[m[1]]
    return resolveSchemaRef(target, schemas, depth + 1)
  }
  return node
}

function buildMessagesByName(rawMessages: AnyRecord, schemas: AnyRecord): Map<string, MessageLite> {
  const map = new Map<string, MessageLite>()
  for (const [name, m] of Object.entries(rawMessages)) {
    if (!isObj(m)) continue
    map.set(name, buildMessage(name, m, schemas))
  }
  return map
}

function buildMessage(name: string, m: AnyRecord, schemas: AnyRecord): MessageLite {
  const payloadRaw = m.payload
  const payload = resolveSchemaRef(payloadRaw, schemas) ?? (isObj(payloadRaw) ? payloadRaw : {})
  const payloadType =
    asString(payload.type) ??
    (isObj(payloadRaw) && typeof (payloadRaw as AnyRecord).$ref === 'string' ? '$ref' : 'unknown')

  const required = Array.isArray(payload.required)
    ? payload.required.filter((r): r is string => typeof r === 'string')
    : []
  const properties: PropertyLite[] = []
  if (isObj(payload.properties)) {
    for (const [pName, pSchema] of Object.entries(payload.properties as AnyRecord)) {
      if (!isObj(pSchema)) {
        properties.push({ name: pName, type: 'unknown', required: required.includes(pName) })
        continue
      }
      const resolved = resolveSchemaRef(pSchema, schemas) ?? pSchema
      const prop: PropertyLite = {
        name: pName,
        type: asString(resolved.type) ?? 'string',
        required: required.includes(pName),
      }
      const desc = asString(resolved.description)
      if (desc !== undefined) prop.description = desc
      properties.push(prop)
    }
  }

  let payloadExample: unknown
  if ('example' in m) {
    payloadExample = m.example
  } else if (Array.isArray(m.examples) && m.examples.length > 0) {
    const first = m.examples[0]
    if (isObj(first)) {
      payloadExample = 'payload' in first ? first.payload : first
    }
  }

  const out: MessageLite = {
    name,
    payloadType,
    payloadProperties: properties,
  }
  const contentType = asString(m.contentType)
  if (contentType !== undefined) out.contentType = contentType
  const title = asString(m.title)
  if (title !== undefined) out.title = title
  const summary = asString(m.summary)
  if (summary !== undefined) out.summary = summary
  if (payloadExample !== undefined) out.payloadExample = payloadExample
  return out
}

function extractChannels(raw: AnyRecord, messagesByName: Map<string, MessageLite>): ChannelLite[] {
  const out: ChannelLite[] = []
  for (const [id, ch] of Object.entries(raw)) {
    if (!isObj(ch)) continue
    const messages: MessageLite[] = []
    if (isObj(ch.messages)) {
      for (const msgRaw of Object.values(ch.messages as AnyRecord)) {
        if (!isObj(msgRaw)) continue
        if (typeof msgRaw.$ref === 'string') {
          const m = msgRaw.$ref.match(/^#\/components\/messages\/(.+)$/)
          const target = m && m[1] ? messagesByName.get(m[1]) : undefined
          if (target) messages.push(target)
        }
      }
    }
    const entry: ChannelLite = {
      id,
      messages,
      operations: [],
    }
    const address = asString(ch.address)
    if (address !== undefined) entry.address = address
    const title = asString(ch.title)
    if (title !== undefined) entry.title = title
    const description = asString(ch.description)
    if (description !== undefined) entry.description = description
    out.push(entry)
  }
  return out
}

function extractOperations(raw: AnyRecord): OperationLite[] {
  const out: OperationLite[] = []
  for (const [id, op] of Object.entries(raw)) {
    if (!isObj(op)) continue
    const action = op.action === 'send' ? 'send' : op.action === 'receive' ? 'receive' : null
    if (!action) continue
    const channelRefRaw =
      isObj(op.channel) && typeof (op.channel as AnyRecord).$ref === 'string'
        ? ((op.channel as AnyRecord).$ref as string)
        : ''
    const channelRef = extractChannelId(channelRefRaw)
    const entry: OperationLite = {
      id,
      action,
      channelRef,
      messages: [],
    }
    const summary = asString(op.summary)
    if (summary !== undefined) entry.summary = summary
    const description = asString(op.description)
    if (description !== undefined) entry.description = description
    out.push(entry)
  }
  return out
}

function extractChannelId(ref: string): string {
  const m = ref.match(/^#\/channels\/(.+)$/)
  return m && m[1] ? m[1] : ''
}
