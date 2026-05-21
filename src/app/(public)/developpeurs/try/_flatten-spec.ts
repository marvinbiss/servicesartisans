/**
 * Pure transformer — OpenAPI 3.1 spec → `OpLite[]`.
 *
 * The `/developpeurs/try` console needs a flat ordered list of operations
 * (one per method × path) to populate the endpoint `<select>`. We keep the
 * projection minimal: identity, parameters, JSON body marker, and a
 * pre-built body sample to seed the textarea. Everything not displayed by
 * the form (response schemas, security, externalDocs, server overrides…)
 * is intentionally dropped here.
 *
 * Tolerance: every input is treated as `unknown` and re-narrowed locally
 * so a malformed spec cannot crash the Client Component during hydration.
 */

import type { Method, OpLite, ParamLite } from './_types'

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function flattenSpec(spec: unknown): OpLite[] {
  if (!isObj(spec)) return []
  const paths = isObj(spec.paths) ? spec.paths : {}
  const out: OpLite[] = []
  for (const [pathKey, pathItemRaw] of Object.entries(paths)) {
    if (!isObj(pathItemRaw)) continue
    for (const m of METHODS) {
      const op = pathItemRaw[m.toLowerCase()]
      if (!isObj(op)) continue
      const tag = Array.isArray(op.tags) && typeof op.tags[0] === 'string' ? op.tags[0] : 'Misc'
      const summary = typeof op.summary === 'string' ? op.summary : `${m} ${pathKey}`
      const parameters = extractParams(op.parameters)
      const hasJsonBody = hasJsonRequestBody(op.requestBody)
      const bodySample = hasJsonBody ? buildBodySample(op.requestBody) : ''
      out.push({
        id: `${m.toLowerCase()}-${pathKey}`,
        method: m,
        path: pathKey,
        summary,
        tag,
        parameters,
        hasJsonBody,
        bodySample,
      })
    }
  }
  out.sort(
    (a, b) =>
      a.tag.localeCompare(b.tag) || a.path.localeCompare(b.path) || a.method.localeCompare(b.method)
  )
  return out
}

function extractParams(raw: unknown): ParamLite[] {
  if (!Array.isArray(raw)) return []
  const out: ParamLite[] = []
  for (const p of raw) {
    if (!isObj(p) || typeof p.name !== 'string' || typeof p.in !== 'string') continue
    if (p.in !== 'query' && p.in !== 'path' && p.in !== 'header') continue
    const schema = isObj(p.schema) ? p.schema : {}
    const param: ParamLite = {
      name: p.name,
      in: p.in,
      required: p.required === true,
      type: typeof schema.type === 'string' ? schema.type : 'string',
    }
    if (typeof p.description === 'string') param.description = p.description
    if (Array.isArray(schema.enum)) {
      param.enum = schema.enum.filter(
        (v): v is string | number => typeof v === 'string' || typeof v === 'number'
      )
    }
    if (p.example !== undefined) param.example = String(p.example)
    else if (schema.example !== undefined) param.example = String(schema.example)
    out.push(param)
  }
  return out
}

function hasJsonRequestBody(rb: unknown): boolean {
  if (!isObj(rb)) return false
  const content = isObj(rb.content) ? rb.content : {}
  return !!content['application/json']
}

function buildBodySample(rb: unknown): string {
  if (!isObj(rb)) return ''
  const content = isObj(rb.content) ? rb.content : {}
  const jsonContent = isObj(content['application/json'])
    ? (content['application/json'] as Record<string, unknown>)
    : null
  if (!jsonContent) return ''
  if ('example' in jsonContent) return JSON.stringify(jsonContent.example, null, 2)
  const examples = isObj(jsonContent.examples)
    ? (jsonContent.examples as Record<string, unknown>)
    : null
  if (examples) {
    const firstKey = Object.keys(examples)[0]
    const ex = firstKey ? examples[firstKey] : null
    if (isObj(ex) && 'value' in ex) return JSON.stringify(ex.value, null, 2)
  }
  return '{}'
}
