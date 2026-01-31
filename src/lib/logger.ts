/**
 * Professional Logger - ServicesArtisans
 * Centralized logging with environment-aware output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
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

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message, context))
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, context))
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context))
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      const errorDetails = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error
      console.error(formatMessage('error', message, { ...context, error: errorDetails }))
    }
  },

  // API-specific helpers
  api: {
    request(route: string, method: string, context?: LogContext): void {
      logger.debug(`API ${method} ${route}`, context)
    },

    success(route: string, context?: LogContext): void {
      logger.info(`API success: ${route}`, context)
    },

    error(route: string, error: unknown, context?: LogContext): void {
      logger.error(`API error: ${route}`, error, context)
    },
  },
}

export default logger
