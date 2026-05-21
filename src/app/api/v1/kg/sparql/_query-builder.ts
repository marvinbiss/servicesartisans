/**
 * Minimal hand-rolled SPARQL parser — SPARQL-as-RPC subset, pillar 1 RGE-OS.
 *
 * Volontairement restreint pour éviter l'ajout des deps Comunica / rdflib / N3
 * au repo (zero-dep contraint, cf. CLAUDE.md du repo).
 *
 * Supporte (v0.1) :
 *   - PREFIX declarations
 *   - Operation root : `SELECT ?var ... WHERE { ... }` ou `ASK WHERE { ... }`
 *   - Basic graph patterns (BGP) : triples `?s ?p ?o .`
 *   - Variables `?var`, IRIs `<...>` ou prefixed `sa:Name`, literals `"..."`
 *   - `*` projection pour SELECT
 *   - LIMIT / OFFSET
 *
 * Ne supporte PAS (roadmap v0.2) :
 *   - FILTER, OPTIONAL, UNION, property paths
 *   - ORDER BY, GROUP BY, HAVING
 *   - CONSTRUCT, DESCRIBE
 *   - INSERT / DELETE (read-only par design — license CC-BY 4.0)
 *
 * Hard limits (DoS guard) :
 *   - 4000 chars source max
 *   - 10 triple patterns max
 *
 * Erreurs renvoyées en Result-style (ok/error) pour éviter les exceptions
 * non-typées dans le handler route.
 */

import type {
  SparqlVariable,
  SparqlTerm,
  SparqlLiteral,
  TriplePattern,
} from './_query-builder-types'

export type {
  SparqlVariable,
  SparqlIri,
  SparqlLiteral,
  SparqlTerm,
  TriplePattern,
  Binding,
} from './_query-builder-types'

export type ParsedSparql = {
  form: 'SELECT' | 'ASK'
  projection: SparqlVariable[] | 'STAR'
  patterns: TriplePattern[]
  limit?: number
  offset?: number
}

export type ParseSparqlResult = { ok: true; query: ParsedSparql } | { ok: false; error: string }

const MAX_PATTERNS = 10
const MAX_QUERY_LEN = 4000
const MAX_LIMIT = 1000
const MAX_OFFSET = 100_000

const DEFAULT_PREFIXES: Record<string, string> = {
  sa: 'https://servicesartisans.fr/ontology/rge#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  schema: 'https://schema.org/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  dcat: 'http://www.w3.org/ns/dcat#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
}

type Token =
  | { type: 'LBRACE' }
  | { type: 'RBRACE' }
  | { type: 'DOT' }
  | { type: 'SEMI' }
  | { type: 'COMMA' }
  | { type: 'STAR' }
  | { type: 'VAR'; name: string }
  | { type: 'IRI'; value: string }
  | { type: 'PNAME'; prefix: string; local: string }
  | { type: 'STRING'; value: string; datatype?: string; lang?: string }
  | { type: 'NUMBER'; value: string }
  | { type: 'KEYWORD'; value: string }
  | { type: 'NAME'; value: string }
  | { type: 'EOF' }

const KEYWORDS = new Set([
  'PREFIX',
  'BASE',
  'SELECT',
  'ASK',
  'WHERE',
  'LIMIT',
  'OFFSET',
  'DISTINCT',
  'REDUCED',
  'A',
])

function isLetter(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
}

function isDigit(c: string): boolean {
  return c >= '0' && c <= '9'
}

function isNameChar(c: string): boolean {
  return isLetter(c) || isDigit(c) || c === '-' || c === '.'
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = source.length
  while (i < len) {
    const c = source.charAt(i)
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i++
      continue
    }
    if (c === '#') {
      while (i < len && source[i] !== '\n') i++
      continue
    }
    if (c === '{') {
      tokens.push({ type: 'LBRACE' })
      i++
      continue
    }
    if (c === '}') {
      tokens.push({ type: 'RBRACE' })
      i++
      continue
    }
    if (c === '.') {
      tokens.push({ type: 'DOT' })
      i++
      continue
    }
    if (c === ';') {
      tokens.push({ type: 'SEMI' })
      i++
      continue
    }
    if (c === ',') {
      tokens.push({ type: 'COMMA' })
      i++
      continue
    }
    if (c === '*') {
      tokens.push({ type: 'STAR' })
      i++
      continue
    }
    if (c === '?' || c === '$') {
      i++
      let name = ''
      while (i < len && isNameChar(source.charAt(i))) {
        name += source[i]
        i++
      }
      if (name.length === 0) throw new Error('Variable must have a name')
      tokens.push({ type: 'VAR', name })
      continue
    }
    if (c === '<') {
      i++
      let value = ''
      while (i < len && source[i] !== '>') {
        if (source[i] === '\n') throw new Error('Unterminated IRI')
        value += source[i]
        i++
      }
      if (i >= len) throw new Error('Unterminated IRI')
      i++
      tokens.push({ type: 'IRI', value })
      continue
    }
    if (c === '"' || c === "'") {
      const quote = c
      i++
      let value = ''
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\' && i + 1 < len) {
          const next = source.charAt(i + 1)
          if (next === 'n') value += '\n'
          else if (next === 't') value += '\t'
          else if (next === 'r') value += '\r'
          else if (next === '"') value += '"'
          else if (next === "'") value += "'"
          else if (next === '\\') value += '\\'
          else if (next === '/') value += '/'
          else value += next
          i += 2
          continue
        }
        if (source[i] === '\n') throw new Error('Unterminated string literal')
        value += source[i]
        i++
      }
      if (i >= len) throw new Error('Unterminated string literal')
      i++
      let lang: string | undefined
      let datatype: string | undefined
      if (i < len && source[i] === '@') {
        i++
        let langTag = ''
        while (i < len && (isLetter(source.charAt(i)) || source[i] === '-')) {
          langTag += source[i]
          i++
        }
        lang = langTag
      } else if (i + 1 < len && source[i] === '^' && source[i + 1] === '^') {
        i += 2
        if (source[i] === '<') {
          i++
          let dt = ''
          while (i < len && source[i] !== '>') {
            dt += source[i]
            i++
          }
          if (i >= len) throw new Error('Unterminated datatype IRI')
          i++
          datatype = dt
        } else if (i < len && isLetter(source.charAt(i))) {
          let prefix = ''
          while (i < len && isLetter(source.charAt(i))) {
            prefix += source[i]
            i++
          }
          if (source[i] !== ':') throw new Error('Datatype prefix must be followed by `:`')
          i++
          let local = ''
          while (i < len && isNameChar(source.charAt(i))) {
            local += source[i]
            i++
          }
          datatype = `__pname__:${prefix}:${local}`
        } else {
          throw new Error('Invalid datatype after ^^')
        }
      }
      tokens.push({ type: 'STRING', value, lang, datatype })
      continue
    }
    if (c === '-' || isDigit(c)) {
      let raw = ''
      if (c === '-') {
        raw += c
        i++
      }
      while (i < len && isDigit(source.charAt(i))) {
        raw += source[i]
        i++
      }
      if (i < len && source[i] === '.' && i + 1 < len && isDigit(source.charAt(i + 1))) {
        raw += '.'
        i++
        while (i < len && isDigit(source.charAt(i))) {
          raw += source[i]
          i++
        }
      }
      tokens.push({ type: 'NUMBER', value: raw })
      continue
    }
    if (isLetter(c)) {
      let name = ''
      while (i < len && isNameChar(source.charAt(i))) {
        name += source[i]
        i++
      }
      if (i < len && source[i] === ':') {
        i++
        let local = ''
        while (i < len && (isNameChar(source.charAt(i)) || source[i] === ':')) {
          local += source[i]
          i++
        }
        tokens.push({ type: 'PNAME', prefix: name, local })
        continue
      }
      const upper = name.toUpperCase()
      if (KEYWORDS.has(upper)) {
        tokens.push({ type: 'KEYWORD', value: upper })
      } else if (name === 'a') {
        tokens.push({ type: 'KEYWORD', value: 'A' })
      } else {
        tokens.push({ type: 'NAME', value: name })
      }
      continue
    }
    if (c === ':') {
      i++
      let local = ''
      while (i < len && isNameChar(source.charAt(i))) {
        local += source[i]
        i++
      }
      tokens.push({ type: 'PNAME', prefix: '', local })
      continue
    }
    throw new Error(`Unexpected character "${c}" at position ${i}`)
  }
  tokens.push({ type: 'EOF' })
  return tokens
}

class TokenStream {
  private pos = 0
  constructor(private readonly tokens: Token[]) {}
  peek(): Token {
    const t = this.tokens[this.pos]
    if (!t) throw new Error('Unexpected end of input')
    return t
  }
  next(): Token {
    const t = this.tokens[this.pos++]
    if (!t) throw new Error('Unexpected end of input')
    return t
  }
  expect(type: Token['type']): Token {
    const t = this.next()
    if (t.type !== type) {
      throw new Error(`Expected ${type} but got ${t.type}`)
    }
    return t
  }
  expectKeyword(value: string): void {
    const t = this.next()
    if (t.type !== 'KEYWORD' || t.value !== value) {
      throw new Error(`Expected keyword ${value} but got ${describe(t)}`)
    }
  }
  matchKeyword(value: string): boolean {
    const t = this.peek()
    if (t.type === 'KEYWORD' && t.value === value) {
      this.next()
      return true
    }
    return false
  }
}

function describe(t: Token): string {
  if (t.type === 'KEYWORD' || t.type === 'NAME' || t.type === 'NUMBER')
    return `${t.type} "${t.value}"`
  if (t.type === 'STRING') return `STRING "${t.value}"`
  if (t.type === 'VAR') return `VAR ?${t.name}`
  if (t.type === 'IRI') return `IRI <${t.value}>`
  if (t.type === 'PNAME') return `PNAME ${t.prefix}:${t.local}`
  return t.type
}

function resolvePname(prefix: string, local: string, prefixes: Record<string, string>): string {
  const base = prefixes[prefix]
  if (base === undefined) {
    throw new Error(`Unknown prefix "${prefix}:"`)
  }
  return base + local
}

function parseTerm(stream: TokenStream, prefixes: Record<string, string>): SparqlTerm {
  const t = stream.peek()
  if (t.type === 'VAR') {
    stream.next()
    return { type: 'var', name: t.name }
  }
  if (t.type === 'IRI') {
    stream.next()
    return { type: 'iri', value: t.value }
  }
  if (t.type === 'PNAME') {
    stream.next()
    return { type: 'iri', value: resolvePname(t.prefix, t.local, prefixes) }
  }
  if (t.type === 'STRING') {
    stream.next()
    let datatype = t.datatype
    if (datatype && datatype.startsWith('__pname__:')) {
      const rest = datatype.slice('__pname__:'.length)
      const colonIdx = rest.indexOf(':')
      const prefix = rest.slice(0, colonIdx)
      const local = rest.slice(colonIdx + 1)
      datatype = resolvePname(prefix, local, prefixes)
    }
    const lit: SparqlLiteral = { type: 'literal', value: t.value }
    if (datatype) lit.datatype = datatype
    if (t.lang) lit.lang = t.lang
    return lit
  }
  if (t.type === 'NUMBER') {
    stream.next()
    return {
      type: 'literal',
      value: t.value,
      datatype: t.value.includes('.')
        ? 'http://www.w3.org/2001/XMLSchema#decimal'
        : 'http://www.w3.org/2001/XMLSchema#integer',
    }
  }
  if (t.type === 'KEYWORD' && t.value === 'A') {
    stream.next()
    return { type: 'iri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' }
  }
  throw new Error(`Unexpected token in triple : ${describe(t)}`)
}

function parsePrefixes(stream: TokenStream, prefixes: Record<string, string>): void {
  while (
    stream.peek().type === 'KEYWORD' &&
    (stream.peek() as { value: string }).value === 'PREFIX'
  ) {
    stream.next()
    const name = stream.next()
    if (name.type !== 'PNAME' || name.local !== '') {
      throw new Error('PREFIX must be followed by `name:`')
    }
    const iri = stream.next()
    if (iri.type !== 'IRI') {
      throw new Error('PREFIX `name:` must be followed by <IRI>')
    }
    prefixes[name.prefix] = iri.value
  }
}

function parseProjection(stream: TokenStream): SparqlVariable[] | 'STAR' {
  // Skip optional DISTINCT/REDUCED
  if (stream.matchKeyword('DISTINCT') || stream.matchKeyword('REDUCED')) {
    // both unsupported semantically but we accept them syntactically
  }
  const first = stream.peek()
  if (first.type === 'STAR') {
    stream.next()
    return 'STAR'
  }
  const vars: SparqlVariable[] = []
  while (stream.peek().type === 'VAR') {
    const v = stream.next() as { type: 'VAR'; name: string }
    vars.push({ type: 'var', name: v.name })
  }
  if (vars.length === 0) {
    throw new Error('SELECT must project at least one variable or *')
  }
  return vars
}

function parseTriples(
  stream: TokenStream,
  prefixes: Record<string, string>,
  patterns: TriplePattern[]
): void {
  stream.expect('LBRACE')
  while (stream.peek().type !== 'RBRACE') {
    const subject = parseTerm(stream, prefixes)
    let predicate = parseTerm(stream, prefixes)
    let object = parseTerm(stream, prefixes)
    patterns.push({ subject, predicate, object })
    if (patterns.length > MAX_PATTERNS) {
      throw new Error(`Query exceeds MAX_PATTERNS=${MAX_PATTERNS}`)
    }
    // Triple terminator handling for ;, , and .
    while (true) {
      const next = stream.peek()
      if (next.type === 'DOT') {
        stream.next()
        break
      }
      if (next.type === 'SEMI') {
        stream.next()
        // Same subject, new predicate-object
        predicate = parseTerm(stream, prefixes)
        object = parseTerm(stream, prefixes)
        patterns.push({ subject, predicate, object })
        if (patterns.length > MAX_PATTERNS) {
          throw new Error(`Query exceeds MAX_PATTERNS=${MAX_PATTERNS}`)
        }
        continue
      }
      if (next.type === 'COMMA') {
        stream.next()
        // Same subject + predicate, new object
        object = parseTerm(stream, prefixes)
        patterns.push({ subject, predicate, object })
        if (patterns.length > MAX_PATTERNS) {
          throw new Error(`Query exceeds MAX_PATTERNS=${MAX_PATTERNS}`)
        }
        continue
      }
      // Either RBRACE or implicit end without dot — accept both per SPARQL 1.1 spec
      break
    }
  }
  stream.expect('RBRACE')
}

function parseSolutionModifiers(stream: TokenStream): { limit?: number; offset?: number } {
  const out: { limit?: number; offset?: number } = {}
  while (true) {
    const t = stream.peek()
    if (t.type !== 'KEYWORD') break
    if (t.value === 'LIMIT') {
      stream.next()
      const n = stream.next()
      if (n.type !== 'NUMBER') throw new Error('LIMIT must be followed by an integer')
      const parsed = Number(n.value)
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`Invalid LIMIT: ${n.value}`)
      }
      out.limit = Math.min(parsed, MAX_LIMIT)
      continue
    }
    if (t.value === 'OFFSET') {
      stream.next()
      const n = stream.next()
      if (n.type !== 'NUMBER') throw new Error('OFFSET must be followed by an integer')
      const parsed = Number(n.value)
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`Invalid OFFSET: ${n.value}`)
      }
      out.offset = Math.min(parsed, MAX_OFFSET)
      continue
    }
    break
  }
  return out
}

function parseDocument(stream: TokenStream): ParsedSparql {
  const prefixes: Record<string, string> = { ...DEFAULT_PREFIXES }
  parsePrefixes(stream, prefixes)

  const headTok = stream.peek()
  if (headTok.type !== 'KEYWORD') {
    throw new Error(`Expected SELECT or ASK, got ${describe(headTok)}`)
  }

  if (headTok.value === 'SELECT') {
    stream.next()
    const projection = parseProjection(stream)
    // WHERE keyword is optional in SPARQL 1.1
    stream.matchKeyword('WHERE')
    const patterns: TriplePattern[] = []
    parseTriples(stream, prefixes, patterns)
    const mods = parseSolutionModifiers(stream)
    if (stream.peek().type !== 'EOF') {
      throw new Error('Unexpected tokens after query body')
    }
    if (patterns.length === 0) {
      throw new Error('SELECT must contain at least one triple pattern')
    }
    return {
      form: 'SELECT',
      projection,
      patterns,
      limit: mods.limit,
      offset: mods.offset,
    }
  }

  if (headTok.value === 'ASK') {
    stream.next()
    stream.matchKeyword('WHERE')
    const patterns: TriplePattern[] = []
    parseTriples(stream, prefixes, patterns)
    if (stream.peek().type !== 'EOF') {
      throw new Error('Unexpected tokens after ASK body')
    }
    if (patterns.length === 0) {
      throw new Error('ASK must contain at least one triple pattern')
    }
    return {
      form: 'ASK',
      projection: [],
      patterns,
    }
  }

  throw new Error(`Unsupported query form "${headTok.value}" (v0.1 supports SELECT and ASK)`)
}

export function parseSparql(source: string): ParseSparqlResult {
  if (typeof source !== 'string') {
    return { ok: false, error: 'Source must be a string' }
  }
  const trimmed = source.trim()
  if (trimmed.length === 0) {
    return { ok: false, error: 'Source is empty' }
  }
  if (source.length > MAX_QUERY_LEN) {
    return { ok: false, error: `Source exceeds ${MAX_QUERY_LEN} chars` }
  }
  try {
    const tokens = tokenize(source)
    const stream = new TokenStream(tokens)
    const query = parseDocument(stream)
    return { ok: true, query }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export const PARSER_LIMITS = {
  MAX_PATTERNS,
  MAX_QUERY_LEN,
  MAX_LIMIT,
  MAX_OFFSET,
} as const

export const SA_NAMESPACES = DEFAULT_PREFIXES
