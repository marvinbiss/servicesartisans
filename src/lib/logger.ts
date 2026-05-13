/**
 * Professional Logger - ServicesArtisans
 * Centralized logging with environment-aware output
 *
 * Audit 2026-04-30 (incident "Cron 1h Error" invisibles à Sentry) :
 * `logger.error()` ne forwardait pas les erreurs à Sentry — seul
 * `console.error()` était appelé, ce qui laissait les Vercel logs
 * comme unique source de vérité (90j retention, pas d'alerting).
 * On branche désormais `captureError` automatiquement sur `logger.error()`
 * pour homogénéiser : 1 appel = 1 trace Vercel + 1 event Sentry.
 *
 * Idempotent : `captureError` est no-op si Sentry n'est pas initialisé
 * (pas de DSN en dev/test). Wrapped en try/catch pour ne JAMAIS faire
 * échouer un log à cause d'une erreur Sentry réseau/runtime.
 */

import { captureError } from './monitoring/sentry'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  bookingId?: string
  artisanId?: string
  action?: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Only log warnings and errors in production
const MIN_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

// PII masking — audit 2026-04-25 (security finding MEDIUM): logger contexts
// throughout the codebase routinely include `email`, `phone`, `phone_e164`,
// `token`, `password`, `siret`, `ip`, `ipHash`, `authorization` keys. Those
// values land in Vercel runtime logs (90j retention) and may surface in
// Sentry breadcrumbs if a later exception is captured in the same request.
// We mask the values at format time so the dev experience (logging the
// shape of the data) is preserved while the value never leaks.
// Audit 2026-04-25 (security agent #9 finding M1) : la liste précédente
// laissait passer en clair `bearer`, `cookie`, `set-cookie`, `x-api-key`,
// `csrf`, `signature`, `idempotency_key`, `webhook_secret`, `client_secret`,
// `refresh_token`, `access_token`, `api_token`, `stripe_key`. Étendue ici.
const SENSITIVE_KEY_RE =
  /^(email|phone|phone_e164|telephone|telephone_e164|token|password|secret|api[_-]?key|api[_-]?token|authorization|bearer|cookie|set[_-]?cookie|x[_-]?api[_-]?key|csrf|signature|idempotency[_-]?key|webhook[_-]?secret|client[_-]?secret|refresh[_-]?token|access[_-]?token|stripe[_-]?key|siret|ip|ipHash|ip_hash|user_agent|userAgent)$/i

function maskValue(value: unknown): unknown {
  if (typeof value !== 'string') return '[REDACTED]'
  if (value.length === 0) return ''
  if (value.includes('@')) {
    const [local, domain] = value.split('@')
    return `${local.slice(0, 2)}***@${domain ?? ''}`
  }
  if (value.length <= 4) return '***'
  return `${value.slice(0, 2)}***${value.slice(-2)}`
}

// F-10 security fix : les messages d'erreur Postgres / Stripe / Resend peuvent
// contenir des PII en clair (ex: "duplicate key ... claimant_email=foo@bar.com",
// "phone +33612345678 invalid"). Ces messages contournent SENSITIVE_KEY_RE
// (qui ne masque que les CLÉS d'objet). On scrub par regex toute occurrence
// de pattern PII trouvable dans la string.
const PII_PATTERNS: Array<[RegExp, string]> = [
  // emails — anywhere in a string
  [/([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1***@$2'],
  // phone numbers E.164 / FR formats
  [/(\+?33|0)\s*[1-9](?:[\s.-]?\d{2}){4}/g, '+33***'],
  // SIRET (14 digits) / SIREN (9 digits) — partial mask
  [/\b(\d{2})\d{5,12}\b/g, '$1***'],
  // bearer/auth tokens (long base64-ish or hex strings >= 20 chars)
  [/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[JWT_REDACTED]'],
  [/\b[a-f0-9]{32,}\b/gi, '[HEX_REDACTED]'],
]

function scrubPiiString(s: string): string {
  let out = s
  for (const [re, replacement] of PII_PATTERNS) {
    out = out.replace(re, replacement)
  }
  return out
}

function maskPiiDeep<T>(input: T, depth = 0): T {
  if (depth > 4 || input == null) return input
  if (Array.isArray(input)) return input.map((v) => maskPiiDeep(v, depth + 1)) as unknown as T
  if (typeof input !== 'object') return input
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY_RE.test(k)) {
      out[k] = maskValue(v)
    } else if (v && typeof v === 'object') {
      out[k] = maskPiiDeep(v, depth + 1)
    } else {
      out[k] = v
    }
  }
  return out as T
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const safeContext = context ? maskPiiDeep(context) : undefined
  const contextStr = safeContext ? ` ${JSON.stringify(safeContext)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

interface AppLogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: unknown, context?: LogContext): void
  child(defaultContext: LogContext): AppLogger
  api: {
    request(route: string, method: string, context?: LogContext): void
    success(route: string, context?: LogContext): void
    error(route: string, error: unknown, context?: LogContext): void
  }
}

function createLogger(defaultContext?: LogContext): AppLogger {
  const mergeContext = (context?: LogContext): LogContext | undefined => {
    if (!defaultContext && !context) return undefined
    return { ...defaultContext, ...context }
  }

  const instance: AppLogger = {
    debug(message: string, context?: LogContext): void {
      if (shouldLog('debug')) {
        // eslint-disable-next-line no-console -- logger implementation
        console.log(formatMessage('debug', message, mergeContext(context)))
      }
    },

    info(message: string, context?: LogContext): void {
      if (shouldLog('info')) {
        // eslint-disable-next-line no-console -- logger implementation
        console.log(formatMessage('info', message, mergeContext(context)))
      }
    },

    warn(message: string, context?: LogContext): void {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message, mergeContext(context)))
      }
    },

    error(message: string, error?: unknown, context?: LogContext): void {
      if (shouldLog('error')) {
        const errorDetails =
          error instanceof Error
            ? {
                name: error.name,
                message: scrubPiiString(error.message),
                stack: error.stack ? scrubPiiString(error.stack) : undefined,
              }
            : typeof error === 'string'
              ? scrubPiiString(error)
              : error
        console.error(
          formatMessage('error', message, { ...mergeContext(context), error: errorDetails })
        )
        // Forward to Sentry — only when an underlying error is provided.
        // Pure-message errors (logger.error('something happened')) restent en
        // console-only pour éviter de polluer Sentry de noise sans stack.
        if (error !== undefined && process.env.NODE_ENV === 'production') {
          try {
            captureError(error, {
              tags: { logger_message: message.slice(0, 80) },
              extras: { context: maskPiiDeep(mergeContext(context) ?? {}) },
              level: 'error',
            })
          } catch {
            // Sentry capture must NEVER break logging itself.
          }
        }
      }
    },

    child(childContext: LogContext): AppLogger {
      return createLogger({ ...defaultContext, ...childContext })
    },

    api: {
      request(route: string, method: string, context?: LogContext): void {
        instance.debug(`API ${method} ${route}`, context)
      },

      success(route: string, context?: LogContext): void {
        instance.info(`API success: ${route}`, context)
      },

      error(route: string, error: unknown, context?: LogContext): void {
        instance.error(`API error: ${route}`, error, context)
      },
    },
  }

  return instance
}

export const logger = createLogger()

// Named child loggers for specific subsystems
export const apiLogger = logger.child({ component: 'api' })
export const dbLogger = logger.child({ component: 'database' })
export const authLogger = logger.child({ component: 'auth' })
export const paymentLogger = logger.child({ component: 'payment' })

export default logger
