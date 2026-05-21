/**
 * GraphQL executor — Pillar 2 RGE-OS.
 *
 * Walk les root fields, invoke leur resolver, puis projette le
 * selection set sur le résultat. Per-field error isolation : si un
 * resolver throw, on log l'erreur dans `errors[]` et on met `data[field] = null`
 * sans interrompre les autres roots.
 *
 * Garde-fou DoS : MAX_DEPTH / MAX_FIELDS comptés AVANT exécution
 * (le parser les vérifie aussi, double-check ceinture+bretelles).
 *
 * Introspection minimale :
 *   - `__typename` → 'Query'
 *   - `__schema { queryType { fields { name } } }` → liste root fields
 */

import type { ParsedField, ParsedQuery } from './_parser'
import { resolvers, type Resolver, type ResolverContext } from './_resolvers'
import { ROOT_QUERY_FIELDS } from './_schema'

export type ExecutionError = { message: string; path?: Array<string | number> }
export type ExecutionResult = {
  data: Record<string, unknown> | null
  errors?: ExecutionError[]
}

const MAX_DEPTH = 5
const MAX_FIELDS = 20

function countFields(fields: ParsedField[], acc: { count: number }): void {
  for (const f of fields) {
    acc.count++
    if (acc.count > MAX_FIELDS) {
      throw new Error(`Query exceeds MAX_FIELDS=${MAX_FIELDS}`)
    }
    if (f.selections.length > 0) countFields(f.selections, acc)
  }
}

function projectSelection(value: unknown, selections: ParsedField[], depth: number): unknown {
  if (depth > MAX_DEPTH) {
    throw new Error(`Query exceeds MAX_DEPTH=${MAX_DEPTH}`)
  }
  if (value === null || value === undefined) return null
  if (selections.length === 0) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((v) => projectSelection(v, selections, depth + 1))
  }
  if (typeof value !== 'object') return value
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const sel of selections) {
    if (sel.name === '__typename') {
      out[sel.name] = inferTypename(obj)
      continue
    }
    const raw = obj[sel.name]
    out[sel.name] = projectSelection(raw, sel.selections, depth + 1)
  }
  return out
}

function inferTypename(_obj: Record<string, unknown>): string {
  return 'Object'
}

function resolveIntrospection(field: ParsedField): unknown {
  if (field.name === '__typename') {
    return 'Query'
  }
  if (field.name === '__schema') {
    const schema = {
      queryType: {
        name: 'Query',
        fields: ROOT_QUERY_FIELDS.map((name) => ({ name })),
      },
    }
    return projectSelection(schema, field.selections, 1)
  }
  return undefined
}

export async function executeQuery(
  query: ParsedQuery,
  ctx: ResolverContext
): Promise<ExecutionResult> {
  if (query.operation === 'mutation') {
    return {
      data: null,
      errors: [{ message: 'Mutations are not supported in v0.1 (read-only API).' }],
    }
  }
  try {
    countFields(query.fields, { count: 0 })
  } catch (err) {
    return {
      data: null,
      errors: [{ message: err instanceof Error ? err.message : String(err) }],
    }
  }

  const data: Record<string, unknown> = {}
  const errors: ExecutionError[] = []

  for (const field of query.fields) {
    if (field.name === '__typename' || field.name === '__schema') {
      try {
        data[field.name] = resolveIntrospection(field)
      } catch (err) {
        errors.push({
          message: err instanceof Error ? err.message : String(err),
          path: [field.name],
        })
        data[field.name] = null
      }
      continue
    }

    const resolver: Resolver | undefined = resolvers[field.name]
    if (!resolver) {
      errors.push({
        message: `Unknown field "${field.name}" on type "Query"`,
        path: [field.name],
      })
      data[field.name] = null
      continue
    }
    try {
      const raw = await resolver(field.args, ctx)
      data[field.name] = projectSelection(raw, field.selections, 1)
    } catch (err) {
      errors.push({
        message: err instanceof Error ? err.message : String(err),
        path: [field.name],
      })
      data[field.name] = null
    }
  }

  return errors.length > 0 ? { data, errors } : { data }
}

export const EXECUTOR_LIMITS = { MAX_DEPTH, MAX_FIELDS } as const
