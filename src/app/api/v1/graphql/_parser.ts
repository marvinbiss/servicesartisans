/**
 * Minimal hand-rolled GraphQL parser — GraphQL-as-RPC subset.
 *
 * Volontairement restreint pour éviter l'ajout des deps `graphql` /
 * `graphql-yoga` au repo (zero-dep contraint, cf. CLAUDE.md du repo).
 *
 * Supporte :
 *   - Operation root : `query { ... }` ou shorthand `{ ... }`
 *   - Root fields : `name`, `name(arg: value)`, `name(arg: value) { sel }`
 *   - Arguments littéraux : String, Int, Float, Boolean, null, listes [],
 *     objets { k: v }
 *   - Selection sets imbriqués (depth garde-fou à l'execute)
 *
 * Ne supporte PAS :
 *   - Fragments, fragments spread
 *   - Aliases (`alias: field`)
 *   - Variables (`$var`)
 *   - Directives
 *   - Mutations (v0.2)
 *
 * Hard limits (DoS guard) :
 *   - 8000 chars source max
 *   - 5 selection depth max
 *   - 20 fields total max
 *
 * Erreurs renvoyées en Result-style (ok/error) pour éviter les exceptions
 * non-typées dans le handler route.
 */

export type ParsedField = {
  name: string
  args: Record<string, unknown>
  selections: ParsedField[]
}

export type ParsedQuery = {
  operation: 'query' | 'mutation'
  fields: ParsedField[]
}

export type ParseError = { ok: false; error: string }
export type ParseOk = { ok: true; query: ParsedQuery }

const MAX_SOURCE_LEN = 8000
const MAX_DEPTH = 5
const MAX_FIELDS = 20

type Token =
  | { type: 'LBRACE' }
  | { type: 'RBRACE' }
  | { type: 'LPAREN' }
  | { type: 'RPAREN' }
  | { type: 'LBRACKET' }
  | { type: 'RBRACKET' }
  | { type: 'COLON' }
  | { type: 'COMMA' }
  | { type: 'NAME'; value: string }
  | { type: 'STRING'; value: string }
  | { type: 'NUMBER'; value: number }
  | { type: 'BOOL'; value: boolean }
  | { type: 'NULL' }
  | { type: 'EOF' }

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = source.length
  while (i < len) {
    const c = source[i]
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ',') {
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
    if (c === '(') {
      tokens.push({ type: 'LPAREN' })
      i++
      continue
    }
    if (c === ')') {
      tokens.push({ type: 'RPAREN' })
      i++
      continue
    }
    if (c === '[') {
      tokens.push({ type: 'LBRACKET' })
      i++
      continue
    }
    if (c === ']') {
      tokens.push({ type: 'RBRACKET' })
      i++
      continue
    }
    if (c === ':') {
      tokens.push({ type: 'COLON' })
      i++
      continue
    }
    if (c === '"') {
      let value = ''
      i++
      while (i < len && source[i] !== '"') {
        if (source[i] === '\\' && i + 1 < len) {
          const next = source[i + 1]
          if (next === 'n') value += '\n'
          else if (next === 't') value += '\t'
          else if (next === 'r') value += '\r'
          else if (next === '"') value += '"'
          else if (next === '\\') value += '\\'
          else if (next === '/') value += '/'
          else value += next
          i += 2
          continue
        }
        value += source[i]
        i++
      }
      if (i >= len) throw new Error('Unterminated string literal')
      i++
      tokens.push({ type: 'STRING', value })
      continue
    }
    if (c === '-' || (c >= '0' && c <= '9')) {
      let raw = ''
      if (c === '-') {
        raw += c
        i++
      }
      while (i < len && source[i] >= '0' && source[i] <= '9') {
        raw += source[i]
        i++
      }
      if (i < len && source[i] === '.') {
        raw += '.'
        i++
        while (i < len && source[i] >= '0' && source[i] <= '9') {
          raw += source[i]
          i++
        }
      }
      if (i < len && (source[i] === 'e' || source[i] === 'E')) {
        raw += source[i]
        i++
        if (i < len && (source[i] === '+' || source[i] === '-')) {
          raw += source[i]
          i++
        }
        while (i < len && source[i] >= '0' && source[i] <= '9') {
          raw += source[i]
          i++
        }
      }
      const num = Number(raw)
      if (!Number.isFinite(num)) throw new Error(`Invalid number literal: ${raw}`)
      tokens.push({ type: 'NUMBER', value: num })
      continue
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let name = ''
      while (
        i < len &&
        ((source[i] >= 'a' && source[i] <= 'z') ||
          (source[i] >= 'A' && source[i] <= 'Z') ||
          (source[i] >= '0' && source[i] <= '9') ||
          source[i] === '_')
      ) {
        name += source[i]
        i++
      }
      if (name === 'true') tokens.push({ type: 'BOOL', value: true })
      else if (name === 'false') tokens.push({ type: 'BOOL', value: false })
      else if (name === 'null') tokens.push({ type: 'NULL' })
      else tokens.push({ type: 'NAME', value: name })
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
    const tok = this.tokens[this.pos]
    if (!tok) throw new Error('Unexpected end of input')
    return tok
  }

  next(): Token {
    const tok = this.tokens[this.pos++]
    if (!tok) throw new Error('Unexpected end of input')
    return tok
  }

  expect(type: Token['type']): Token {
    const tok = this.next()
    if (tok.type !== type) {
      throw new Error(`Expected ${type} but got ${tok.type}`)
    }
    return tok
  }
}

function parseValue(stream: TokenStream): unknown {
  const tok = stream.peek()
  if (tok.type === 'STRING') {
    stream.next()
    return tok.value
  }
  if (tok.type === 'NUMBER') {
    stream.next()
    return tok.value
  }
  if (tok.type === 'BOOL') {
    stream.next()
    return tok.value
  }
  if (tok.type === 'NULL') {
    stream.next()
    return null
  }
  if (tok.type === 'LBRACKET') {
    stream.next()
    const list: unknown[] = []
    while (stream.peek().type !== 'RBRACKET') {
      list.push(parseValue(stream))
      if (stream.peek().type === 'COMMA') stream.next()
    }
    stream.expect('RBRACKET')
    return list
  }
  if (tok.type === 'LBRACE') {
    stream.next()
    const obj: Record<string, unknown> = {}
    while (stream.peek().type !== 'RBRACE') {
      const key = stream.expect('NAME') as { type: 'NAME'; value: string }
      stream.expect('COLON')
      obj[key.value] = parseValue(stream)
      if (stream.peek().type === 'COMMA') stream.next()
    }
    stream.expect('RBRACE')
    return obj
  }
  if (tok.type === 'NAME') {
    stream.next()
    return tok.value
  }
  throw new Error(`Unexpected token ${tok.type} when parsing value`)
}

function parseArguments(stream: TokenStream): Record<string, unknown> {
  if (stream.peek().type !== 'LPAREN') return {}
  stream.expect('LPAREN')
  const args: Record<string, unknown> = {}
  while (stream.peek().type !== 'RPAREN') {
    const key = stream.expect('NAME') as { type: 'NAME'; value: string }
    stream.expect('COLON')
    args[key.value] = parseValue(stream)
  }
  stream.expect('RPAREN')
  return args
}

function parseSelectionSet(
  stream: TokenStream,
  depth: number,
  counter: { count: number }
): ParsedField[] {
  if (depth > MAX_DEPTH) {
    throw new Error(`Query exceeds MAX_DEPTH=${MAX_DEPTH}`)
  }
  stream.expect('LBRACE')
  const fields: ParsedField[] = []
  while (stream.peek().type !== 'RBRACE') {
    const nameTok = stream.expect('NAME') as { type: 'NAME'; value: string }
    counter.count++
    if (counter.count > MAX_FIELDS) {
      throw new Error(`Query exceeds MAX_FIELDS=${MAX_FIELDS}`)
    }
    const args = parseArguments(stream)
    let selections: ParsedField[] = []
    if (stream.peek().type === 'LBRACE') {
      selections = parseSelectionSet(stream, depth + 1, counter)
    }
    fields.push({ name: nameTok.value, args, selections })
  }
  stream.expect('RBRACE')
  return fields
}

function parseDocument(stream: TokenStream): ParsedQuery {
  const first = stream.peek()
  let operation: 'query' | 'mutation' = 'query'
  if (first.type === 'NAME' && (first.value === 'query' || first.value === 'mutation')) {
    operation = first.value
    stream.next()
    const maybeName = stream.peek()
    if (maybeName.type === 'NAME') stream.next()
  }
  const counter = { count: 0 }
  const fields = parseSelectionSet(stream, 1, counter)
  if (stream.peek().type !== 'EOF') {
    throw new Error('Unexpected tokens after selection set (multiple operations not supported)')
  }
  return { operation, fields }
}

export function parseGraphQL(source: string): ParseOk | ParseError {
  if (typeof source !== 'string') {
    return { ok: false, error: 'Source must be a string' }
  }
  if (source.length === 0) {
    return { ok: false, error: 'Source is empty' }
  }
  if (source.length > MAX_SOURCE_LEN) {
    return { ok: false, error: `Source exceeds ${MAX_SOURCE_LEN} chars` }
  }
  try {
    const tokens = tokenize(source)
    const stream = new TokenStream(tokens)
    const query = parseDocument(stream)
    if (query.fields.length === 0) {
      return { ok: false, error: 'Empty selection set' }
    }
    return { ok: true, query }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export const PARSER_LIMITS = {
  MAX_SOURCE_LEN,
  MAX_DEPTH,
  MAX_FIELDS,
} as const
