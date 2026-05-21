/**
 * Minimal example builder.
 *
 * Given a schema name and the full `components.schemas` dictionary, walks
 * the JSON Schema shape and synthesises a minimal valid example value:
 * - honours an explicit `example` field as the source of truth,
 * - resolves `$ref` recursively with a `visited` set to avoid infinite
 *   loops on cyclic schemas (e.g. tree-shaped responses),
 * - inlines the first `enum` value when present,
 * - picks a sensible literal for the common `format` codes
 *   (`date-time`, `date`, `uri`, `email`, `uuid`),
 * - for `object`, emits only required properties when `required` is set,
 *   otherwise emits every property (deterministic structural example),
 * - for `array`, emits a single-element array whose item is built from
 *   the schema's `items`.
 *
 * The output is JSON-serialisable so the page renderer can dump it
 * straight to a `<pre>` via `JSON.stringify(..., null, 2)`.
 */

type AnyRecord = Record<string, unknown>

function isObj(v: unknown): v is AnyRecord {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function buildMinimalExample(
  schemaName: string,
  allSchemas: AnyRecord,
  visited: Set<string> = new Set()
): unknown {
  if (visited.has(schemaName)) return null
  visited.add(schemaName)
  const schema = allSchemas[schemaName]
  return buildFromSchema(schema, allSchemas, visited)
}

function buildFromSchema(schema: unknown, allSchemas: AnyRecord, visited: Set<string>): unknown {
  if (!isObj(schema)) return null
  if ('example' in schema) return schema.example
  if (typeof schema.$ref === 'string') {
    const m = schema.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (m && m[1]) return buildMinimalExample(m[1], allSchemas, visited)
    return null
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0]
  if ('const' in schema) return schema.const
  if (schema.type === 'string') {
    if (typeof schema.format === 'string') {
      switch (schema.format) {
        case 'date-time':
          return '2026-05-21T16:00:00.000Z'
        case 'date':
          return '2026-05-21'
        case 'uri':
        case 'url':
          return 'https://example.com/'
        case 'email':
          return 'data@servicesartisans.fr'
        case 'uuid':
          return '11111111-1111-4111-8111-111111111111'
      }
    }
    return 'string'
  }
  if (schema.type === 'integer' || schema.type === 'number') return 0
  if (schema.type === 'boolean') return true
  if (schema.type === 'array') {
    const items = buildFromSchema(schema.items, allSchemas, visited)
    return items === null ? [] : [items]
  }
  if (schema.type === 'object' || isObj(schema.properties)) {
    const required = Array.isArray(schema.required)
      ? schema.required.filter((r): r is string => typeof r === 'string')
      : []
    const out: AnyRecord = {}
    if (isObj(schema.properties)) {
      for (const [name, propSchema] of Object.entries(schema.properties)) {
        if (required.length === 0 || required.includes(name)) {
          out[name] = buildFromSchema(propSchema, allSchemas, new Set(visited))
        }
      }
    }
    return out
  }
  return null
}
