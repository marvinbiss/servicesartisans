import * as Sentry from '@sentry/nextjs'

/**
 * Wrapper structuré pour `Sentry.captureException`.
 *
 * Signature unique : `captureError(err, { tags, extras, level })`. Tous les
 * appels passent par là pour homogénéiser le shape des events côté Sentry
 * (facette `integration`, tag `dead_letter`, etc.) et pour simplifier le
 * mock en tests unitaires.
 *
 * Idempotent : si Sentry n'est pas initialisé (pas de DSN en dev/test),
 * les appels sont no-op silencieux (Sentry SDK gère déjà ce cas).
 */
export interface CaptureOptions {
  tags?: Record<string, string>
  extras?: Record<string, unknown>
  level?: Sentry.SeverityLevel
}

/**
 * Normalise un throw arbitraire en `Error` exploitable par Sentry.
 *
 * Audit 2026-05-01 : Sentry remontait des dizaines d'events titrés
 * `[object Object]` parce que `new Error(String(err))` sur un PostgrestError
 * Supabase (`{message, code, details, hint}`) produit une Error de message
 * `"[object Object]"` (impossible à grouper / dégroupiller côté UI).
 *
 * Stratégie de normalisation :
 *   1. Error native → on garde tel quel (stack trace préservée).
 *   2. Objet avec `.message` string (PostgrestError, Resend error, fetch error
 *      sérialisé) → on construit une Error avec ce message + on attache code /
 *      details / hint / status comme propriétés indexables (Sentry les expose
 *      dans le panneau "Additional Data").
 *   3. Objet sans `.message` → JSON.stringify avec garde-fou contre les cycles.
 *   4. Primitive ou unserializable → fallback `String(err)`.
 *
 * Conserve la stack trace d'origine si présente (`obj.stack`).
 */
function normalizeToError(err: unknown): Error {
  if (err instanceof Error) return err

  if (err !== null && typeof err === 'object') {
    const obj = err as Record<string, unknown>
    // PostgrestError / Resend / fetch / Supabase shapes
    const message = typeof obj.message === 'string' ? obj.message : null
    if (message) {
      const e = new Error(message)
      // Preserve original stack if the object carries one (Supabase wraps).
      if (typeof obj.stack === 'string') e.stack = obj.stack
      // Attach common error metadata as enumerable props so Sentry surfaces them.
      for (const key of ['code', 'details', 'hint', 'status', 'statusCode', 'name'] as const) {
        if (obj[key] !== undefined) {
          Object.defineProperty(e, key, {
            value: obj[key],
            enumerable: true,
            writable: true,
            configurable: true,
          })
        }
      }
      return e
    }
    // Generic object — try JSON serialization with cycle guard.
    try {
      return new Error(JSON.stringify(err))
    } catch {
      return new Error('[unserializable error object]')
    }
  }

  return new Error(String(err))
}

export function captureError(err: unknown, options: CaptureOptions = {}): void {
  const error = normalizeToError(err)
  Sentry.withScope((scope) => {
    if (options.tags) scope.setTags(options.tags)
    // Attach the raw error object as extras so Sentry's UI shows the full
    // shape (PostgrestError code/details/hint, Resend body, etc.) even when
    // the normalized Error message is short.
    const rawExtras: Record<string, unknown> = { ...(options.extras ?? {}) }
    if (err !== null && typeof err === 'object' && !(err instanceof Error)) {
      rawExtras.raw_error = err
    }
    if (Object.keys(rawExtras).length > 0) scope.setExtras(rawExtras)
    if (options.level) scope.setLevel(options.level)
    Sentry.captureException(error)
  })
}
