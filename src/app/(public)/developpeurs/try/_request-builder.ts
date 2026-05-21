/**
 * Pure builder — `(OpLite, FormState)` → `BuiltRequest` ready for `fetch()`.
 *
 * Centralises every transformation that turns the form widgets into an
 * actual HTTP request:
 *  - path parameter substitution (`/users/{id}` → `/users/42`, encoded)
 *  - query parameter assembly with URL encoding
 *  - header collection (operation-defined headers + free-form lines)
 *  - JSON body validation
 *  - early-error reporting so the Client Component can show a banner
 *    without ever leaving the browser
 *
 * Pairs with `buildCurl(...)` to render the equivalent terminal command so
 * an integrator can copy it verbatim into a script after experimenting in
 * the console.
 */

import type { FormState, Method, OpLite } from './_types'

export type BuiltRequest = {
  method: Method
  url: string
  headers: Record<string, string>
  body: string | null
  error?: string
}

export function buildRequest(op: OpLite, form: FormState): BuiltRequest {
  let path = op.path
  const query: string[] = []
  const headers: Record<string, string> = { Accept: 'application/json' }

  for (const p of op.parameters) {
    const raw = form.paramValues[p.name] ?? ''
    if (!raw && p.required) {
      return {
        method: op.method,
        url: '',
        headers,
        body: null,
        error: `Required parameter missing: ${p.name}`,
      }
    }
    if (!raw) continue
    if (p.in === 'path') {
      path = path.replace(new RegExp(`\\{${p.name}\\}`, 'g'), encodeURIComponent(raw))
    } else if (p.in === 'query') {
      query.push(`${encodeURIComponent(p.name)}=${encodeURIComponent(raw)}`)
    } else if (p.in === 'header') {
      headers[p.name] = raw
    }
  }

  const customHeaderLines = form.customHeaders
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  for (const line of customHeaderLines) {
    const idx = line.indexOf(':')
    if (idx === -1) {
      return {
        method: op.method,
        url: '',
        headers,
        body: null,
        error: `Invalid header line: ${line}`,
      }
    }
    const name = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!name) continue
    headers[name] = value
  }

  let body: string | null = null
  if (op.hasJsonBody && form.bodyText.trim()) {
    try {
      JSON.parse(form.bodyText)
    } catch {
      return {
        method: op.method,
        url: '',
        headers,
        body: null,
        error: 'Body is not valid JSON',
      }
    }
    headers['Content-Type'] = 'application/json'
    body = form.bodyText
  }

  const base = form.baseUrl.replace(/\/$/, '')
  const url = `${base}${path}${query.length ? '?' + query.join('&') : ''}`
  return { method: op.method, url, headers, body }
}

export function buildCurl(req: BuiltRequest): string {
  if (req.error) return ''
  const parts = [`curl -X ${req.method} '${req.url.replace(/'/g, "'\\''")}'`]
  for (const [k, v] of Object.entries(req.headers)) {
    parts.push(`  -H '${k}: ${v.replace(/'/g, "'\\''")}'`)
  }
  if (req.body !== null) {
    parts.push(`  --data '${req.body.replace(/'/g, "'\\''")}'`)
  }
  return parts.join(' \\\n')
}
