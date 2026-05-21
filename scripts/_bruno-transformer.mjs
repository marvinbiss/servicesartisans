/**
 * scripts/_bruno-transformer.mjs
 * ------------------------------
 * Pure transformer : OpenAPI 3.1 spec -> Bruno .bru collection in memory.
 *
 * Returns a Map<filePath, fileText> the CLI can write to disk. Keeping the
 * transformer pure (no I/O) makes it trivially unit-testable and lets us
 * reuse it for other targets later (Insomnia, Hoppscotch) without
 * duplicating logic.
 *
 * Inputs are validated defensively : malformed sub-trees are skipped, never
 * thrown. The only hard requirement is that `spec` is an object.
 *
 * Bruno .bru file spec : https://docs.usebruno.com/bru-language-overview
 */

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

export function toBrunoCollection(spec, { baseUrl = '{{base_url}}' } = {}) {
  if (!spec || typeof spec !== 'object') throw new Error('spec required')
  const paths = spec.paths && typeof spec.paths === 'object' ? spec.paths : {}
  const files = new Map()

  const tagToOps = new Map()
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue
    for (const method of METHODS) {
      const op = pathItem[method]
      if (!op || typeof op !== 'object') continue
      const tag =
        Array.isArray(op.tags) && typeof op.tags[0] === 'string'
          ? op.tags[0]
          : 'Misc'
      const list = tagToOps.get(tag) ?? []
      list.push({ method, path: pathKey, op })
      tagToOps.set(tag, list)
    }
  }

  for (const [tag, ops] of tagToOps.entries()) {
    let seq = 1
    for (const { method, path: opPath, op } of ops) {
      const name = sanitizeFileName(
        op.summary || op.operationId || `${method.toUpperCase()} ${opPath}`,
      )
      const text = renderOp({
        method,
        path: opPath,
        op,
        baseUrl,
        seq,
        spec,
      })
      const filePath = `collection/${sanitizeDir(tag)}/${name}.bru`
      files.set(filePath, text)
      seq++
    }
  }

  return files
}

export function sanitizeFileName(input) {
  return (
    String(input)
      .replace(/[^\w\s\-.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || 'Request'
  )
}

export function sanitizeDir(input) {
  const cleaned = String(input)
    .replace(/[^\w\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
  return cleaned || 'Misc'
}

export function renderOp({ method, path: opPath, op, baseUrl, seq, spec }) {
  const name = sanitizeFileName(
    op.summary || op.operationId || `${method.toUpperCase()} ${opPath}`,
  )
  const url = buildUrl(baseUrl, opPath, op.parameters)
  const hasJsonBody =
    method !== 'get' && method !== 'head' && hasJsonRequestBody(op)
  const bodyKind = hasJsonBody ? 'json' : 'none'
  const docs = String(op.description || op.summary || '').slice(0, 600)

  const lines = []
  lines.push('meta {')
  lines.push(`  name: ${name}`)
  lines.push(`  type: http`)
  lines.push(`  seq: ${seq}`)
  lines.push('}')
  lines.push('')
  lines.push(`${method} {`)
  lines.push(`  url: ${url}`)
  lines.push(`  body: ${bodyKind}`)
  lines.push(`  auth: none`)
  lines.push('}')
  lines.push('')

  const queryParams = (op.parameters || []).filter(
    (p) => p && p.in === 'query',
  )
  if (queryParams.length > 0) {
    lines.push('params:query {')
    for (const p of queryParams) {
      const placeholder = paramPlaceholder(p, spec)
      const disabled = p.required ? '' : '~'
      lines.push(`  ${disabled}${p.name}: ${placeholder}`)
    }
    lines.push('}')
    lines.push('')
  }

  lines.push('headers {')
  lines.push('  Accept: application/json')
  if (hasJsonBody) lines.push('  Content-Type: application/json')
  lines.push('}')
  lines.push('')

  if (hasJsonBody) {
    const sample = extractJsonExample(op, spec)
    lines.push('body:json {')
    lines.push(
      JSON.stringify(sample, null, 2)
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n'),
    )
    lines.push('}')
    lines.push('')
  }

  if (docs) {
    lines.push('docs {')
    lines.push(`  ${docs.replace(/\n+/g, ' ')}`)
    lines.push('}')
  }

  return lines.join('\n') + '\n'
}

export function buildUrl(baseUrl, opPath, parameters) {
  const queryNames = (parameters || [])
    .filter((p) => p && p.in === 'query')
    .map((p) => p.name)
  let qs = ''
  if (queryNames.length > 0) qs = '?' + queryNames.map((n) => `${n}=`).join('&')
  return `${baseUrl}${opPath}${qs}`
}

export function paramPlaceholder(p, spec) {
  if (Array.isArray(p?.schema?.enum) && p.schema.enum.length > 0) {
    return String(p.schema.enum[0])
  }
  if (p?.example !== undefined && p.example !== null) return String(p.example)
  if (p?.schema?.example !== undefined) return String(p.schema.example)
  if (typeof p?.schema?.$ref === 'string' && spec) {
    const inferred = inferFromSchema(p.schema, spec, new Set())
    if (inferred !== null && inferred !== undefined && typeof inferred !== 'object') {
      return String(inferred)
    }
  }
  if (p?.schema?.type === 'integer' || p?.schema?.type === 'number') return '0'
  if (p?.schema?.type === 'boolean') return 'true'
  return ''
}

export function hasJsonRequestBody(op) {
  if (!op?.requestBody || typeof op.requestBody !== 'object') return false
  const content = op.requestBody.content
  return !!(
    content &&
    typeof content === 'object' &&
    content['application/json']
  )
}

export function extractJsonExample(op, spec) {
  const content = op?.requestBody?.content?.['application/json']
  if (!content || typeof content !== 'object') return {}
  if (content.example && typeof content.example === 'object') {
    return content.example
  }
  if (content.examples && typeof content.examples === 'object') {
    const firstKey = Object.keys(content.examples)[0]
    const ex = firstKey ? content.examples[firstKey] : null
    if (ex && typeof ex === 'object' && 'value' in ex) return ex.value
  }
  if (content.schema && typeof content.schema === 'object') {
    return inferFromSchema(content.schema, spec, new Set())
  }
  return {}
}

export function inferFromSchema(schema, spec, visited) {
  if (!schema || typeof schema !== 'object') return null
  if ('example' in schema) return schema.example
  if (typeof schema.$ref === 'string') {
    const m = schema.$ref.match(/^#\/components\/schemas\/(.+)$/)
    if (!m) return null
    if (visited.has(m[1])) return null
    visited.add(m[1])
    const target = spec?.components?.schemas?.[m[1]]
    return inferFromSchema(target, spec, visited)
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0]
  if (schema.type === 'string') {
    return schema.format === 'uuid'
      ? '11111111-1111-4111-8111-111111111111'
      : 'string'
  }
  if (schema.type === 'integer' || schema.type === 'number') return 0
  if (schema.type === 'boolean') return true
  if (schema.type === 'array') {
    return schema.items ? [inferFromSchema(schema.items, spec, visited)] : []
  }
  if (schema.type === 'object' || schema.properties) {
    const obj = {}
    if (schema.properties && typeof schema.properties === 'object') {
      const req = Array.isArray(schema.required) ? schema.required : []
      for (const [name, prop] of Object.entries(schema.properties)) {
        if (req.length === 0 || req.includes(name)) {
          obj[name] = inferFromSchema(prop, spec, new Set(visited))
        }
      }
    }
    return obj
  }
  return null
}

export function buildCollectionMeta() {
  return (
    JSON.stringify(
      {
        version: '1',
        name: 'ServicesArtisans RGE-OS',
        type: 'collection',
        ignore: ['node_modules', '.git'],
      },
      null,
      2,
    ) + '\n'
  )
}

export function buildEnvironment(_name, baseUrlValue) {
  return ['vars {', `  base_url: ${baseUrlValue}`, '}', ''].join('\n')
}
