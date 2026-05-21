/**
 * Pure render helpers for the API explorer.
 *
 * - `flattenSpec()`: paths object → array of `OperationLite` (one per
 *   method × path). Tolerant to malformed inputs (skips non-object
 *   pathItems, ignores unknown methods).
 * - `OperationBlock`: server-rendered card for one operation. No client
 *   JS, no hover-state — opens fully expanded.
 *
 * Kept separate from the page component so the unit tests can hit the
 * pure functions directly.
 */

import type { OperationLite, ParameterLite, ResponseLite, HttpMethod } from './_types'

const HTTP_METHODS: ReadonlyArray<HttpMethod> = [
  'get',
  'post',
  'put',
  'delete',
  'head',
  'options',
  'patch',
]

type SpecLike = {
  paths?: Record<string, unknown>
  components?: { schemas?: Record<string, unknown> }
}

export function flattenSpec(spec: SpecLike): OperationLite[] {
  const operations: OperationLite[] = []
  const paths = spec.paths ?? {}
  for (const [path, pathItemRaw] of Object.entries(paths)) {
    if (!pathItemRaw || typeof pathItemRaw !== 'object') continue
    const pathItem = pathItemRaw as Record<string, unknown>
    for (const method of HTTP_METHODS) {
      const op = pathItem[method]
      if (!op || typeof op !== 'object') continue
      const opObj = op as Record<string, unknown>
      operations.push({
        path,
        method,
        summary: typeof opObj.summary === 'string' ? opObj.summary : undefined,
        description: typeof opObj.description === 'string' ? opObj.description : undefined,
        operationId: typeof opObj.operationId === 'string' ? opObj.operationId : undefined,
        tags: Array.isArray(opObj.tags)
          ? opObj.tags.filter((t): t is string => typeof t === 'string')
          : [],
        parameters: extractParams(opObj.parameters),
        requestBodySample: extractRequestSample(opObj.requestBody),
        responses: extractResponses(opObj.responses),
      })
    }
  }
  return operations
}

function extractParams(raw: unknown): ParameterLite[] {
  if (!Array.isArray(raw)) return []
  const out: ParameterLite[] = []
  for (const p of raw) {
    if (!p || typeof p !== 'object') continue
    const obj = p as Record<string, unknown>
    if (typeof obj.name !== 'string' || typeof obj.in !== 'string') continue
    const inValue = obj.in
    if (inValue !== 'query' && inValue !== 'path' && inValue !== 'header' && inValue !== 'cookie') {
      continue
    }
    const schema =
      obj.schema && typeof obj.schema === 'object' ? (obj.schema as Record<string, unknown>) : {}
    out.push({
      name: obj.name,
      in: inValue,
      required: obj.required === true,
      type: typeof schema.type === 'string' ? schema.type : 'string',
      description: typeof obj.description === 'string' ? obj.description : undefined,
    })
  }
  return out
}

function extractRequestSample(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const content =
    obj.content && typeof obj.content === 'object' ? (obj.content as Record<string, unknown>) : null
  if (!content) return null
  const jsonContent =
    content['application/json'] && typeof content['application/json'] === 'object'
      ? (content['application/json'] as Record<string, unknown>)
      : null
  if (!jsonContent) return null
  const examples =
    jsonContent.examples && typeof jsonContent.examples === 'object'
      ? (jsonContent.examples as Record<string, unknown>)
      : null
  if (!examples) return null
  const firstKey = Object.keys(examples)[0]
  if (!firstKey) return null
  const ex = examples[firstKey]
  if (!ex || typeof ex !== 'object') return null
  const exObj = ex as Record<string, unknown>
  if (!('value' in exObj)) return null
  try {
    return JSON.stringify(exObj.value, null, 2)
  } catch {
    return null
  }
}

function extractResponses(raw: unknown): ResponseLite[] {
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  const out: ResponseLite[] = []
  for (const [status, val] of Object.entries(obj)) {
    if (val && typeof val === 'object' && 'description' in val) {
      const desc = (val as { description: unknown }).description
      out.push({ status, description: typeof desc === 'string' ? desc : undefined })
    } else {
      out.push({ status })
    }
  }
  return out
}

type MethodBadge = { bg: string; text: string; label: string }

function methodBadge(method: HttpMethod): MethodBadge {
  switch (method) {
    case 'get':
      return { bg: 'bg-accent-100', text: 'text-accent-800', label: 'GET' }
    case 'post':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'POST' }
    case 'put':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PUT' }
    case 'delete':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'DELETE' }
    case 'head':
      return { bg: 'bg-charcoal-100', text: 'text-charcoal-700', label: 'HEAD' }
    case 'options':
      return { bg: 'bg-charcoal-100', text: 'text-charcoal-700', label: 'OPTIONS' }
    case 'patch':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PATCH' }
  }
}

function anchorId(prefix: string, value: string): string {
  return `${prefix}-${value.replace(/[^A-Za-z0-9]+/g, '-')}`
}

export function OperationBlock({ op }: { op: OperationLite }) {
  const badge = methodBadge(op.method)
  const sampleUrl = `https://servicesartisans.fr${op.path}`
  return (
    <article
      id={anchorId(`op-${op.method}`, op.path)}
      className="rounded-lg border border-charcoal-200 bg-white p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-mono font-semibold ${badge.bg} ${badge.text}`}
        >
          {badge.label}
        </span>
        <code className="font-mono text-sm text-charcoal-900">{op.path}</code>
        {op.tags && op.tags.length > 0 ? (
          <span className="ml-auto text-xs text-charcoal-500">{op.tags.join(', ')}</span>
        ) : null}
      </header>
      {op.summary ? (
        <p className="mt-2 text-sm font-medium text-charcoal-900">{op.summary}</p>
      ) : null}
      {op.description ? <p className="mt-1 text-sm text-charcoal-700">{op.description}</p> : null}

      {op.parameters && op.parameters.length > 0 ? (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Parameters
          </h4>
          <table className="mt-1 w-full text-xs">
            <thead>
              <tr className="text-charcoal-600">
                <th className="text-left font-medium pr-3 py-1">Name</th>
                <th className="text-left font-medium pr-3 py-1">In</th>
                <th className="text-left font-medium pr-3 py-1">Type</th>
                <th className="text-left font-medium pr-3 py-1">Required</th>
              </tr>
            </thead>
            <tbody>
              {op.parameters.map((p) => (
                <tr key={`${p.in}-${p.name}`} className="border-t border-charcoal-100">
                  <td className="font-mono pr-3 py-1">{p.name}</td>
                  <td className="pr-3 py-1">{p.in}</td>
                  <td className="font-mono pr-3 py-1">{p.type}</td>
                  <td className="pr-3 py-1">{p.required ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {op.requestBodySample ? (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Request body example
          </h4>
          <pre className="mt-1 overflow-x-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
            {op.requestBodySample}
          </pre>
        </div>
      ) : null}

      <div className="mt-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
          Responses
        </h4>
        <ul className="mt-1 space-y-0.5 text-xs">
          {op.responses.map((r) => (
            <li key={r.status} className="text-charcoal-700">
              <span className="font-mono font-semibold">{r.status}</span>
              {r.description ? ` — ${r.description}` : ''}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
          Sample curl
        </h4>
        <pre className="mt-1 overflow-x-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
          {`curl -X ${op.method.toUpperCase()} "${sampleUrl}"`}
        </pre>
      </div>
    </article>
  )
}

export { anchorId }
