/**
 * Minimal types for the schema explorer.
 *
 * We keep `SchemaLite` and `PropertyLite` deliberately narrow rather than
 * pulling the full `openapi-types` package. The explorer only renders a
 * fraction of the JSON Schema 2020-12 surface (the bits authored in our
 * Ralph 27 spec), and a typed projection lets the flattener stay zero-dep
 * and trivially unit-testable on synthetic component dictionaries.
 */

export type PropertyLite = {
  name: string
  type: string
  format?: string
  description?: string
  required: boolean
  enum?: ReadonlyArray<string | number>
  example?: unknown
  refTo?: string
}

export type SchemaUsedBy = {
  method: string
  path: string
  operationId?: string
}

export type SchemaLite = {
  name: string
  description?: string
  type: string
  properties: PropertyLite[]
  required: ReadonlyArray<string>
  example: unknown
  usedBy: ReadonlyArray<SchemaUsedBy>
}
