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

export function captureError(err: unknown, options: CaptureOptions = {}): void {
  const error = err instanceof Error ? err : new Error(String(err))
  Sentry.withScope((scope) => {
    if (options.tags) scope.setTags(options.tags)
    if (options.extras) scope.setExtras(options.extras)
    if (options.level) scope.setLevel(options.level)
    Sentry.captureException(error)
  })
}
