/**
 * Pure extractor — `components.schemas` → `SchemaLite[]` + reverse used-by
 * index across the spec's `paths`.
 *
 * The companion `/developpeurs/api-explorer` (Ralph 36) shows operations;
 * here we invert the projection and show every named schema with the list
 * of operations that reference it (via `$ref`). This lets an integrator
 * answer "what operations return a Provider?" in one click instead of
 * grepping the raw spec.
 *
 * Tolerance: every input is treated as `unknown` and re-narrowed locally.
 * A malformed spec must never throw at build time, because this code runs
 * inside a `force-static` Server Component during `next build`.
 */

import type { PropertyLite, SchemaLite, SchemaUsedBy } from './_types'

type AnyRecord = Record<string, unknown>

function isObj(v: unknown): v is AnyRecord {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function extractPropType(schemaProp: AnyRecord): {
  type: string
  format?: string
  refTo?: string
} {
  if (typeof schemaProp.$ref === 'string') {
    const refTo = schemaProp.$ref.replace(/^#\/components\/schemas\//, '')
    return { type: '$ref', refTo }
  }
  if (Array.isArray(schemaProp.type)) {
    const joined = schemaProp.type.filter((t): t is string => typeof t === 'string').join('|')
    return { type: joined || 'unknown' }
  }
  if (typeof schemaProp.type === 'string') {
    const out: { type: string; format?: string } = { type: schemaProp.type }
    if (typeof schemaProp.format === 'string') out.format = schemaProp.format
    return out
  }
  if (Array.isArray((schemaProp as { oneOf?: unknown[] }).oneOf)) return { type: 'oneOf' }
  if (Array.isArray((schemaProp as { anyOf?: unknown[] }).anyOf)) return { type: 'anyOf' }
  if (Array.isArray((schemaProp as { allOf?: unknown[] }).allOf)) return { type: 'allOf' }
  return { type: 'unknown' }
}

function buildProperty(
  name: string,
  propSchema: unknown,
  required: ReadonlyArray<string>
): PropertyLite {
  if (!isObj(propSchema)) {
    return { name, type: 'unknown', required: required.includes(name) }
  }
  const t = extractPropType(propSchema)
  const out: PropertyLite = {
    name,
    type: t.type,
    required: required.includes(name),
  }
  if (t.format) out.format = t.format
  if (t.refTo) out.refTo = t.refTo
  if (typeof propSchema.description === 'string') out.description = propSchema.description
  if (Array.isArray(propSchema.enum)) {
    out.enum = propSchema.enum.filter(
      (v): v is string | number => typeof v === 'string' || typeof v === 'number'
    )
  }
  if ('example' in propSchema) out.example = propSchema.example
  return out
}

export function flattenSchemas(spec: AnyRecord): SchemaLite[] {
  const components = isObj(spec.components) ? spec.components : {}
  const schemasRaw = isObj((components as AnyRecord).schemas)
    ? ((components as AnyRecord).schemas as AnyRecord)
    : {}

  const refIndex = buildRefIndex(spec)

  const out: SchemaLite[] = []
  for (const [name, schemaRaw] of Object.entries(schemasRaw)) {
    if (!isObj(schemaRaw)) continue
    const required = Array.isArray(schemaRaw.required)
      ? schemaRaw.required.filter((r): r is string => typeof r === 'string')
      : []
    const properties: PropertyLite[] = []
    if (isObj(schemaRaw.properties)) {
      for (const [pName, pSchema] of Object.entries(schemaRaw.properties)) {
        properties.push(buildProperty(pName, pSchema, required))
      }
    }
    const entry: SchemaLite = {
      name,
      type: typeof schemaRaw.type === 'string' ? schemaRaw.type : 'object',
      properties,
      required,
      example: 'example' in schemaRaw ? schemaRaw.example : null,
      usedBy: refIndex.get(name) ?? [],
    }
    if (typeof schemaRaw.description === 'string') entry.description = schemaRaw.description
    out.push(entry)
  }
  out.sort((a, b) => a.name.localeCompare(b.name))
  return out
}

function buildRefIndex(spec: AnyRecord): Map<string, SchemaUsedBy[]> {
  const map = new Map<string, SchemaUsedBy[]>()
  const paths = isObj(spec.paths) ? spec.paths : {}
  for (const [pathKey, pathItemRaw] of Object.entries(paths)) {
    if (!isObj(pathItemRaw)) continue
    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const op = pathItemRaw[method]
      if (!isObj(op)) continue
      const opIdRaw = op.operationId
      const opId = typeof opIdRaw === 'string' ? opIdRaw : undefined
      walkForRefs(op, (refName) => {
        const list = map.get(refName) ?? []
        if (!list.find((r) => r.path === pathKey && r.method === method)) {
          const usage: SchemaUsedBy = { method, path: pathKey }
          if (opId) usage.operationId = opId
          list.push(usage)
          map.set(refName, list)
        }
      })
    }
  }
  return map
}

function walkForRefs(node: unknown, onRef: (refName: string) => void, depth = 0): void {
  if (depth > 12) return
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) walkForRefs(item, onRef, depth + 1)
    return
  }
  const obj = node as AnyRecord
  if (typeof obj.$ref === 'string') {
    const m = obj.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (m && m[1]) onRef(m[1])
  }
  for (const v of Object.values(obj)) walkForRefs(v, onRef, depth + 1)
}
