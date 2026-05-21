/**
 * Minimal OpenAPI type definitions for the explorer renderer.
 *
 * We deliberately keep these `*Lite` types instead of pulling the full
 * `openapi-types` package: the explorer only renders a tiny subset of
 * fields (method, summary, params, sample), so a typed projection lets
 * the renderer stay zero-dep + easy to unit test on synthetic specs.
 */

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'

export type ParameterLite = {
  name: string
  in: 'query' | 'path' | 'header' | 'cookie'
  required: boolean
  type: string
  description?: string
}

export type ResponseLite = {
  status: string
  description?: string
}

export type OperationLite = {
  path: string
  method: HttpMethod
  summary?: string
  description?: string
  operationId?: string
  tags?: string[]
  parameters?: ParameterLite[]
  requestBodySample?: string | null
  responses: ResponseLite[]
}
