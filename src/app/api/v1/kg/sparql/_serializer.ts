/**
 * SPARQL results serializers (W3C-spec compliant).
 *
 * Formats supportés :
 *   - `json`  : SPARQL Query Results JSON Format (W3C, application/sparql-results+json)
 *   - `csv`   : SPARQL Results CSV (W3C, text/csv)
 *   - `tsv`   : SPARQL Results TSV (W3C, text/tab-separated-values)
 *   - `xml`   : SPARQL Query Results XML Format (W3C, application/sparql-results+xml)
 *
 * Implémentation hand-rolled, zero-dep. Échappement XML/CSV/TSV minimal mais
 * conforme aux spec W3C (CSV: doublement de quotes ; TSV: \t → \\t).
 */

import type { Binding, SparqlTerm, SparqlVariable } from './_query-builder-types'

export type SerializationFormat = 'json' | 'csv' | 'tsv' | 'xml'

export type Serialized = { body: string; contentType: string }

const XML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => XML_ESCAPE_MAP[c] ?? c)
}

function escapeCsv(value: string): string {
  // RFC 4180 + W3C SPARQL Results CSV : quote any field containing comma,
  // quote, CR or LF, and escape inner quotes by doubling.
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function escapeTsv(value: string): string {
  // W3C SPARQL Results TSV : escape \t, \n, \r, \\.
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

function termToTsv(term: SparqlTerm | undefined): string {
  if (!term) return ''
  if (term.type === 'iri') return `<${escapeTsv(term.value)}>`
  if (term.type === 'literal') {
    const base = `"${escapeTsv(term.value)}"`
    if (term.lang) return `${base}@${term.lang}`
    if (term.datatype) return `${base}^^<${term.datatype}>`
    return base
  }
  // Variable should not be exposed in results — fall back gracefully.
  return ''
}

function termToCsv(term: SparqlTerm | undefined): string {
  if (!term) return ''
  if (term.type === 'iri') return escapeCsv(term.value)
  if (term.type === 'literal') return escapeCsv(term.value)
  return ''
}

function termToJson(term: SparqlTerm): Record<string, string> {
  if (term.type === 'iri') return { type: 'uri', value: term.value }
  if (term.type === 'literal') {
    const out: Record<string, string> = { type: 'literal', value: term.value }
    if (term.lang) out['xml:lang'] = term.lang
    if (term.datatype) out.datatype = term.datatype
    return out
  }
  return { type: 'literal', value: '' }
}

function termToXml(term: SparqlTerm | undefined): string {
  if (!term) return ''
  if (term.type === 'iri') return `<uri>${escapeXml(term.value)}</uri>`
  if (term.type === 'literal') {
    const attrs: string[] = []
    if (term.lang) attrs.push(`xml:lang="${escapeXml(term.lang)}"`)
    if (term.datatype) attrs.push(`datatype="${escapeXml(term.datatype)}"`)
    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''
    return `<literal${attrStr}>${escapeXml(term.value)}</literal>`
  }
  return ''
}

function projectionNames(bindings: Binding[], projection: SparqlVariable[] | 'STAR'): string[] {
  if (projection === 'STAR') {
    const seen = new Set<string>()
    const out: string[] = []
    for (const b of bindings) {
      for (const name of Object.keys(b)) {
        if (!seen.has(name)) {
          seen.add(name)
          out.push(name)
        }
      }
    }
    return out
  }
  return projection.map((v) => v.name)
}

export function serializeSelectResults(
  bindings: Binding[],
  projection: SparqlVariable[] | 'STAR',
  format: SerializationFormat
): Serialized {
  const vars = projectionNames(bindings, projection)
  if (format === 'json') {
    const payload = {
      head: { vars },
      results: {
        bindings: bindings.map((b) => {
          const row: Record<string, Record<string, string>> = {}
          for (const v of vars) {
            const term = b[v]
            if (term) row[v] = termToJson(term)
          }
          return row
        }),
      },
    }
    return {
      body: JSON.stringify(payload),
      contentType: 'application/sparql-results+json; charset=utf-8',
    }
  }
  if (format === 'csv') {
    const lines: string[] = []
    lines.push(vars.map((v) => escapeCsv(v)).join(','))
    for (const b of bindings) {
      lines.push(vars.map((v) => termToCsv(b[v])).join(','))
    }
    return {
      body: lines.join('\r\n'),
      contentType: 'text/csv; charset=utf-8',
    }
  }
  if (format === 'tsv') {
    const lines: string[] = []
    lines.push(vars.map((v) => `?${v}`).join('\t'))
    for (const b of bindings) {
      lines.push(vars.map((v) => termToTsv(b[v])).join('\t'))
    }
    return {
      body: lines.join('\n'),
      contentType: 'text/tab-separated-values; charset=utf-8',
    }
  }
  // xml
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push('<sparql xmlns="http://www.w3.org/2005/sparql-results#">')
  lines.push('  <head>')
  for (const v of vars) lines.push(`    <variable name="${escapeXml(v)}"/>`)
  lines.push('  </head>')
  lines.push('  <results>')
  for (const b of bindings) {
    lines.push('    <result>')
    for (const v of vars) {
      const term = b[v]
      if (term) {
        lines.push(`      <binding name="${escapeXml(v)}">${termToXml(term)}</binding>`)
      }
    }
    lines.push('    </result>')
  }
  lines.push('  </results>')
  lines.push('</sparql>')
  return {
    body: lines.join('\n'),
    contentType: 'application/sparql-results+xml; charset=utf-8',
  }
}

export function serializeAskResult(answer: boolean, format: SerializationFormat): Serialized {
  if (format === 'json') {
    return {
      body: JSON.stringify({ head: {}, boolean: answer }),
      contentType: 'application/sparql-results+json; charset=utf-8',
    }
  }
  if (format === 'csv') {
    return {
      body: `_askResult\r\n${answer}`,
      contentType: 'text/csv; charset=utf-8',
    }
  }
  if (format === 'tsv') {
    return {
      body: `?_askResult\n"${answer}"`,
      contentType: 'text/tab-separated-values; charset=utf-8',
    }
  }
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sparql xmlns="http://www.w3.org/2005/sparql-results#">',
    '  <head/>',
    `  <boolean>${answer}</boolean>`,
    '</sparql>',
  ].join('\n')
  return { body: xml, contentType: 'application/sparql-results+xml; charset=utf-8' }
}
