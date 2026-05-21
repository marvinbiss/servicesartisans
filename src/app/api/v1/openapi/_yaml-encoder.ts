/**
 * Hand-rolled YAML 1.2 subset encoder.
 *
 * Supports the shape OpenAPI 3.1 emits :
 *  - plain objects (block mapping)
 *  - arrays (block sequence)
 *  - strings (unquoted when safe, double-quoted otherwise, block scalar `|`
 *    for multi-line content)
 *  - numbers (finite only; NaN/Infinity collapsed to `null`)
 *  - booleans / null
 *
 * NOT supported (intentionally — zero npm deps target) :
 *  - anchors / aliases
 *  - explicit YAML tags
 *  - flow style for non-empty collections
 *  - integer keys (object keys are always strings in our spec)
 *
 * The output is consumable by every mainstream YAML 1.2 parser (PyYAML,
 * js-yaml, libyaml, snakeyaml, etc.) for the SA OpenAPI surface.
 */

export function encodeYaml(value: unknown, indent: number = 0): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null'
  if (typeof value === 'string') return encodeYamlString(value, indent)
  if (Array.isArray(value)) return encodeYamlArray(value, indent)
  if (typeof value === 'object') return encodeYamlObject(value as Record<string, unknown>, indent)
  return 'null'
}

function encodeYamlString(s: string, indent: number): string {
  if (s === '') return '""'
  if (
    /^[A-Za-z0-9_\-./:#]+$/.test(s) &&
    s !== 'null' &&
    s !== 'true' &&
    s !== 'false' &&
    !/^-?\d/.test(s)
  ) {
    return s
  }
  if (s.includes('\n')) {
    const pad = ' '.repeat(indent + 2)
    return (
      '|\n' +
      s
        .split('\n')
        .map((line) => pad + line)
        .join('\n')
    )
  }
  return JSON.stringify(s)
}

function encodeYamlArray(arr: unknown[], indent: number): string {
  if (arr.length === 0) return '[]'
  const pad = ' '.repeat(indent)
  return (
    '\n' +
    arr
      .map((item) => {
        const enc = encodeYaml(item, indent + 2)
        if (enc.startsWith('\n')) return pad + '-' + enc.replace(/^\n/, '\n  ')
        return pad + '- ' + enc
      })
      .join('\n')
  )
}

function encodeYamlObject(obj: Record<string, unknown>, indent: number): string {
  const keys = Object.keys(obj)
  if (keys.length === 0) return '{}'
  const pad = ' '.repeat(indent)
  const lines: string[] = []
  for (const key of keys) {
    const value = obj[key]
    const enc = encodeYaml(value, indent + 2)
    const safeKey = /^[A-Za-z0-9_\-./$]+$/.test(key) ? key : JSON.stringify(key)
    if (enc.startsWith('\n')) {
      lines.push(`${pad}${safeKey}:${enc}`)
    } else {
      lines.push(`${pad}${safeKey}: ${enc}`)
    }
  }
  return (indent > 0 ? '\n' : '') + lines.join('\n')
}
