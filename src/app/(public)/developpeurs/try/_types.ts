/**
 * Shared type aliases for the `/developpeurs/try` interactive console.
 *
 * The page hydrates a Client Component that needs a much smaller projection
 * of the OpenAPI 3.1 spec than the api-explorer / schema-explorer use. We
 * surface here only what the form needs: identity (id, tag, summary), the
 * method/path tuple, the flat parameter list and whether the operation
 * expects a JSON body — plus a pre-rendered body sample to seed the
 * textarea on mount.
 *
 * `FormState` is the shape persisted by React `useState`; `HistoryEntry`
 * is the shape persisted to `localStorage`.
 */

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export type ParamLite = {
  name: string
  in: 'query' | 'path' | 'header'
  required: boolean
  type: string
  description?: string
  enum?: ReadonlyArray<string | number>
  example?: string
}

export type OpLite = {
  id: string
  method: Method
  path: string
  summary: string
  tag: string
  parameters: ParamLite[]
  hasJsonBody: boolean
  bodySample: string
}

export type FormState = {
  opId: string
  baseUrl: string
  paramValues: Record<string, string>
  bodyText: string
  customHeaders: string
}

export type HistoryEntry = {
  ts: number
  opId: string
  method: Method
  url: string
  status: number
  durationMs: number
  responseExcerpt: string
}
