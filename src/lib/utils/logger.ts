/**
 * Centralized Logging System
 * Structured logging with levels, context, and external integration support
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelName: string
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  requestId?: string
  userId?: string
  duration?: number
}

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>
}

/**
 * Console Transport - Pretty print for development
 */
class ConsoleTransport implements LogTransport {
  private readonly useColors: boolean

  constructor(useColors: boolean = true) {
    this.useColors = useColors && typeof window === 'undefined'
  }

  log(entry: LogEntry): void {
    const { timestamp, levelName, message, context, error, duration } = entry

    const colors = {
      DEBUG: '\x1b[36m',   // Cyan
      INFO: '\x1b[32m',    // Green
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      FATAL: '\x1b[35m',   // Magenta
      RESET: '\x1b[0m',
    }

    const color = this.useColors ? colors[levelName as keyof typeof colors] || '' : ''
    const reset = this.useColors ? colors.RESET : ''

    // Format: [TIMESTAMP] LEVEL: Message
    let output = `${color}[${timestamp}] ${levelName}${reset}: ${message}`

    // Add duration if present
    if (duration !== undefined) {
      output += ` (${duration}ms)`
    }

    // Log based on level
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(output, context || '')
        break
      case LogLevel.INFO:
        console.info(output, context || '')
        break
      case LogLevel.WARN:
        console.warn(output, context || '')
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(output, context || '')
        if (error?.stack) {
          console.error(error.stack)
        }
        break
    }
  }
}

/**
 * JSON Transport - Structured logs for production
 */
class JSONTransport implements LogTransport {
  log(entry: LogEntry): void {
    console.log(JSON.stringify(entry))
  }
}

/**
 * Buffer Transport - Batch logs for external services
 */
class BufferTransport implements LogTransport {
  private buffer: LogEntry[] = []
  private readonly maxSize: number
  private readonly flushCallback: (entries: LogEntry[]) => Promise<void>
  private flushTimer?: NodeJS.Timeout
  private readonly flushInterval: number

  constructor(
    flushCallback: (entries: LogEntry[]) => Promise<void>,
    options: { maxSize?: number; flushInterval?: number } = {}
  ) {
    this.flushCallback = flushCallback
    this.maxSize = options.maxSize || 100
    this.flushInterval = options.flushInterval || 5000

    // Start flush timer
    this.startFlushTimer()
  }

  log(entry: LogEntry): void {
    this.buffer.push(entry)

    if (this.buffer.length >= this.maxSize) {
      this.flush()
    }
  }

  private startFlushTimer(): void {
    if (typeof setInterval !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval)
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return

    const entries = [...this.buffer]
    this.buffer = []

    try {
      await this.flushCallback(entries)
    } catch (error) {
      // Put entries back in buffer on failure
      this.buffer = [...entries, ...this.buffer].slice(0, this.maxSize)
      console.error('Failed to flush logs:', error)
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    this.flush()
  }
}

/**
 * Main Logger Class
 */
class Logger {
  private transports: LogTransport[] = []
  private minLevel: LogLevel = LogLevel.DEBUG
  private defaultContext: LogContext = {}
  private requestId?: string
  private userId?: string

  constructor() {
    // Default to console transport
    const isDev = process.env.NODE_ENV !== 'production'
    this.transports.push(
      isDev ? new ConsoleTransport() : new JSONTransport()
    )

    // Set min level based on environment
    this.minLevel = isDev ? LogLevel.DEBUG : LogLevel.INFO
  }

  /**
   * Add a transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * Set default context for all logs
   */
  setDefaultContext(context: LogContext): void {
    this.defaultContext = { ...this.defaultContext, ...context }
  }

  /**
   * Set request ID for correlation
   */
  setRequestId(requestId: string): void {
    this.requestId = requestId
  }

  /**
   * Set user ID for attribution
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    childLogger.transports = this.transports
    childLogger.minLevel = this.minLevel
    childLogger.defaultContext = { ...this.defaultContext, ...context }
    childLogger.requestId = this.requestId
    childLogger.userId = this.userId
    return childLogger
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (level < this.minLevel) return

    const levelNames: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
      [LogLevel.FATAL]: 'FATAL',
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: levelNames[level],
      message,
      context: context ? { ...this.defaultContext, ...context } :
               Object.keys(this.defaultContext).length > 0 ? this.defaultContext : undefined,
      requestId: this.requestId,
      userId: this.userId,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as { code?: string }).code,
      }
    }

    // Send to all transports
    for (const transport of this.transports) {
      try {
        transport.log(entry)
      } catch (err) {
        console.error('Transport error:', err)
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, context, error)
    } else {
      this.log(LogLevel.ERROR, message, error as LogContext)
    }
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context, error)
  }

  /**
   * Log API call with timing
   */
  api(
    method: string,
    url: string,
    options: {
      statusCode?: number
      duration?: number
      error?: Error
      context?: LogContext
    } = {}
  ): void {
    const { statusCode, duration, error, context } = options
    const level = error ? LogLevel.ERROR :
                  statusCode && statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO

    const message = `${method} ${url}${statusCode ? ` -> ${statusCode}` : ''}`

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: level === LogLevel.ERROR ? 'ERROR' :
                 level === LogLevel.WARN ? 'WARN' : 'INFO',
      message,
      context: { ...this.defaultContext, ...context, method, url, statusCode },
      duration,
      requestId: this.requestId,
      userId: this.userId,
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }

    for (const transport of this.transports) {
      transport.log(entry)
    }
  }

  /**
   * Time a function and log its duration
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.info(`${label} completed`, { ...context, duration })
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.error(`${label} failed`, error as Error, { ...context, duration })
      throw error
    }
  }
}

// Global logger instance
export const logger = new Logger()

// Convenience exports
export { ConsoleTransport, JSONTransport, BufferTransport }
export type { Logger }

// API-specific loggers
export const apiLogger = logger.child({ component: 'api' })
export const dbLogger = logger.child({ component: 'database' })
export const authLogger = logger.child({ component: 'auth' })
export const paymentLogger = logger.child({ component: 'payment' })
