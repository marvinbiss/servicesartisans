/**
 * Helper unifié pour signaler proprement un fail-open silencieux.
 *
 * Pourquoi : les pipelines RGE/CEE retombent sur une réponse vide quand la DB
 * est down/lente. Sans signal Sentry filtrable, l'incident reste invisible :
 *   - les pages YMYL passent en noindex (count=0) sans alerte
 *   - les sitemaps perdent des URLs sans qu'on le sache
 *   - les leads CEE/RGE ne sont plus dispatchés
 *
 * Cette fonction :
 *   1. Loggue l'erreur côté Vercel (logger.error → captureError automatique)
 *   2. Force un tag Sentry `fail_open_domain=<domain>` + `fail_open_key=<key>`
 *      pour grouper les alertes dans la même issue (1 issue par domaine, pas
 *      1 par couple slug/ville).
 *   3. Reste idempotent en environnement non-prod (les tags sont émis quand
 *      même côté logger pour audit local).
 */

import { captureError } from './sentry'

export type FailOpenDomain =
  | 'rge-list-by-service-city'
  | 'rge-list-by-service-dept'
  | 'rge-list-by-city'
  | 'rge-count-by-city'
  | 'rge-stats-national'
  | 'rge-stats-service'
  | 'rge-last-sync'
  | 'cee-catalog'
  | 'cee-operation-by-code'

export type FailOpenContext = {
  /** Identifiant unique de l'invocation (ex: `plombier:paris` ou `BAR-EN-101`). */
  key?: string
  /** Données additionnelles pour debug Sentry (JSON-safe, sans PII). */
  extras?: Record<string, unknown>
}

/**
 * Signale un fail-open. À appeler dans le bloc catch JUST AVANT le `return []`
 * (ou `return null`) pour s'assurer que :
 *   - L'incident est tracé Vercel + Sentry simultanément
 *   - Les alertes Sentry sont groupées par domain (pas par instance)
 *   - Le call site reste fail-open (cette fonction ne re-throw jamais)
 */
export function notifyFailOpen(
  domain: FailOpenDomain,
  err: unknown,
  context: FailOpenContext = {}
): void {
  const tagSuffix = context.key ? `[${context.key}]` : ''
  const message = `[fail-open] ${domain}${tagSuffix}`
  const errDetail =
    err instanceof Error ? `${err.name}: ${err.message}` : JSON.stringify(err ?? null)

  // Console first — observable in Vercel logs even when Sentry is down.
  console.error(`${message} — ${errDetail}`, context.extras ?? '')

  if (process.env.NODE_ENV === 'production') {
    try {
      captureError(err, {
        tags: {
          fail_open: 'true',
          fail_open_domain: domain,
          // Sanitize tag value : Sentry tags reject newlines/tabs (envelope split).
          ...(context.key
            ? { fail_open_key: context.key.slice(0, 200).replace(/[\n\r\t]/g, '_') }
            : {}),
        },
        extras: context.extras,
        level: 'warning',
      })
    } catch {
      // Sentry capture must NEVER break the fail-open contract.
    }
  }
}
