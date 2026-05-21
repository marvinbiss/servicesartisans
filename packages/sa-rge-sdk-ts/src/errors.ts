/**
 * Typed error hierarchy for the @servicesartisans/rge-sdk client.
 *
 * Consumers can branch on `instanceof SARgeRateLimitError` etc. without
 * sniffing string codes. All errors extend SARgeError.
 */

export type SARgeErrorOptions = {
  statusCode?: number
  details?: unknown
}

export class SARgeError extends Error {
  readonly code: string
  readonly statusCode: number | undefined
  readonly details: unknown

  constructor(code: string, message: string, opts: SARgeErrorOptions = {}) {
    super(message)
    this.name = 'SARgeError'
    this.code = code
    this.statusCode = opts.statusCode
    this.details = opts.details
  }
}

export class SARgeValidationError extends SARgeError {
  constructor(message: string, details: unknown) {
    super('VALIDATION_ERROR', message, { statusCode: 400, details })
    this.name = 'SARgeValidationError'
  }
}

export class SARgeRateLimitError extends SARgeError {
  constructor() {
    super('RATE_LIMIT', 'Rate limit exceeded.', { statusCode: 429 })
    this.name = 'SARgeRateLimitError'
  }
}

export class SARgeServiceUnavailableError extends SARgeError {
  constructor(message: string) {
    super('SERVICE_UNAVAILABLE', message, { statusCode: 503 })
    this.name = 'SARgeServiceUnavailableError'
  }
}

export class SARgeNetworkError extends SARgeError {
  constructor(message: string) {
    super('NETWORK_ERROR', message)
    this.name = 'SARgeNetworkError'
  }
}
