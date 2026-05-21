/**
 * AskRequestBody validation — dependency-free (no Zod) to keep this
 * route's import graph as small as possible. The route is the most
 * latency-sensitive of the public v1 surface (LLM call dominates, but
 * the validation must add < 1 ms).
 *
 * Returns a discriminated union so the caller (route.ts) maps
 * `{ ok: false, errors }` to HTTP 400 with a structured error envelope
 * — never throws on user input.
 *
 * The enums (classifications / gestes / menage categories / zones) are
 * mirrored from the underlying domain types in `@/lib/llm` and
 * `@/lib/aides`. They are duplicated here intentionally to avoid
 * pulling those modules into the validation hot path — drift is
 * guarded by the route unit tests + the AnswerEngine itself (which
 * re-validates classification via its `chooseModel` step).
 */

export type AskAidesContext = {
  geste: string
  menageCategorie?: string
  rfr?: number
  nbPersonnes?: number
  zone?: 'idf' | 'hors_idf'
}

export type AskCitedSource = {
  url: string
  title: string
  retrievedAt: string
}

export type AskRequestBody = {
  query: string
  classification?: string
  aidesContext?: AskAidesContext
  citedSources?: AskCitedSource[]
  traceId?: string
  agentName?: string
}

export type ValidationOk = { ok: true; value: AskRequestBody }
export type ValidationErr = {
  ok: false
  errors: Array<{ field: string; message: string }>
}

const VALID_CLASSIFICATIONS = new Set([
  'rag_public',
  'ymyl_aides',
  'pii_user',
  'contract_legal',
  'bulk_seo',
  'multimodal',
  'long_context',
  'critic_ymyl',
  'generic',
])

const VALID_GESTES = new Set([
  'pac_air_eau',
  'pac_geothermique',
  'pac_air_air',
  'chauffe_eau_thermo',
  'isolation_combles',
  'isolation_ite',
  'isolation_planchers_bas',
  'vmc_double_flux',
  'chaudiere_biomasse',
  'audit_energetique',
])

const VALID_MENAGE_CAT = new Set(['tres_modeste', 'modeste', 'intermediaire', 'superieur'])

const MAX_QUERY_LEN = 4000
const MAX_CITED_SOURCES = 20

export function validateAskRequest(raw: unknown): ValidationOk | ValidationErr {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: [{ field: '_body', message: 'expected JSON object' }] }
  }

  const body = raw as Partial<AskRequestBody>
  const errors: Array<{ field: string; message: string }> = []

  if (typeof body.query !== 'string' || body.query.trim().length === 0) {
    errors.push({ field: 'query', message: 'required non-empty string' })
  } else if (body.query.length > MAX_QUERY_LEN) {
    errors.push({ field: 'query', message: `max ${MAX_QUERY_LEN} chars` })
  }

  if (body.classification !== undefined) {
    if (
      typeof body.classification !== 'string' ||
      !VALID_CLASSIFICATIONS.has(body.classification)
    ) {
      errors.push({
        field: 'classification',
        message: `must be one of ${Array.from(VALID_CLASSIFICATIONS).join(', ')}`,
      })
    }
  }

  if (body.aidesContext !== undefined) {
    if (
      typeof body.aidesContext !== 'object' ||
      body.aidesContext === null ||
      Array.isArray(body.aidesContext)
    ) {
      errors.push({ field: 'aidesContext', message: 'expected object' })
    } else {
      const ctx = body.aidesContext
      if (typeof ctx.geste !== 'string' || !VALID_GESTES.has(ctx.geste)) {
        errors.push({ field: 'aidesContext.geste', message: 'invalid geste' })
      }
      if (ctx.menageCategorie !== undefined && !VALID_MENAGE_CAT.has(ctx.menageCategorie)) {
        errors.push({
          field: 'aidesContext.menageCategorie',
          message: 'invalid menageCategorie',
        })
      }
      if (ctx.zone !== undefined && ctx.zone !== 'idf' && ctx.zone !== 'hors_idf') {
        errors.push({ field: 'aidesContext.zone', message: 'must be idf or hors_idf' })
      }
      if (
        ctx.rfr !== undefined &&
        (typeof ctx.rfr !== 'number' || !Number.isFinite(ctx.rfr) || ctx.rfr < 0)
      ) {
        errors.push({ field: 'aidesContext.rfr', message: 'must be non-negative number' })
      }
      if (
        ctx.nbPersonnes !== undefined &&
        (!Number.isInteger(ctx.nbPersonnes) || (ctx.nbPersonnes as number) < 1)
      ) {
        errors.push({ field: 'aidesContext.nbPersonnes', message: 'must be positive integer' })
      }
    }
  }

  if (body.citedSources !== undefined) {
    if (!Array.isArray(body.citedSources)) {
      errors.push({ field: 'citedSources', message: 'expected array' })
    } else if (body.citedSources.length > MAX_CITED_SOURCES) {
      errors.push({
        field: 'citedSources',
        message: `max ${MAX_CITED_SOURCES} entries`,
      })
    } else {
      body.citedSources.forEach((src, i) => {
        if (!src || typeof src !== 'object') {
          errors.push({ field: `citedSources[${i}]`, message: 'expected object' })
          return
        }
        if (typeof src.url !== 'string' || src.url.length === 0) {
          errors.push({ field: `citedSources[${i}].url`, message: 'required string' })
        }
        if (typeof src.title !== 'string' || src.title.length === 0) {
          errors.push({ field: `citedSources[${i}].title`, message: 'required string' })
        }
        if (typeof src.retrievedAt !== 'string' || src.retrievedAt.length === 0) {
          errors.push({ field: `citedSources[${i}].retrievedAt`, message: 'required string' })
        }
      })
    }
  }

  if (body.traceId !== undefined && typeof body.traceId !== 'string') {
    errors.push({ field: 'traceId', message: 'must be string' })
  }
  if (body.agentName !== undefined && typeof body.agentName !== 'string') {
    errors.push({ field: 'agentName', message: 'must be string' })
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, value: body as AskRequestBody }
}
