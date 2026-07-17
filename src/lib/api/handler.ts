import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  formatErrorResponse,
} from '@/lib/errors'
import { logger } from '@/lib/logger'

interface HandlerContext {
  request: NextRequest
  user?: { id: string; email: string }
  artisan?: { provider_id: string }
  body?: unknown
  params?: Record<string, string>
}

interface HandlerOptions<T = unknown> {
  bodySchema?: ZodSchema<T>
  requireAuth?: boolean
  requireArtisan?: boolean
  requireAdmin?: boolean
}

type HandlerFunction<T = unknown> = (context: HandlerContext & { body: T }) => Promise<NextResponse>

/**
 * Create a standardized API handler with validation and auth
 */
export function createApiHandler<T = unknown>(
  handler: HandlerFunction<T>,
  options: HandlerOptions<T> = {}
) {
  return async (
    request: NextRequest,
    routeContext?: { params?: Promise<Record<string, string>> }
  ) => {
    try {
      const context: HandlerContext = {
        request,
        params: routeContext?.params ? await routeContext.params : undefined,
      }

      // Parse body if needed
      if (options.bodySchema) {
        try {
          const rawBody = await request.json()
          context.body = options.bodySchema.parse(rawBody)
        } catch (error) {
          if (error instanceof ZodError) {
            const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
            throw new ValidationError(messages.join(', '))
          }
          throw new ValidationError('Corps de requête invalide')
        }
      }

      // Auth check
      if (options.requireAuth || options.requireArtisan || options.requireAdmin) {
        const supabase = await createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new AuthenticationError()
        }

        context.user = { id: user.id, email: user.email || '' }

        // Artisan check
        if (options.requireArtisan) {
          const { data: artisan } = await supabase
            .from('providers')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (!artisan) {
            throw new AuthorizationError('Profil artisan requis')
          }

          context.artisan = { provider_id: artisan.id }
        }

        // Admin check
        if (options.requireAdmin) {
          const { data: admin } = await supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!admin) {
            throw new AuthorizationError('Accès administrateur requis')
          }
        }
      }

      return await handler(context as HandlerContext & { body: T })
    } catch (error) {
      logger.error('API Error', error as Error)

      if (error instanceof AppError) {
        return NextResponse.json(formatErrorResponse(error), {
          status: error.statusCode,
        })
      }

      return NextResponse.json(formatErrorResponse(error), { status: 500 })
    }
  }
}

/**
 * Create a JSON response
 */
export function jsonResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Parse JSON body avec gestion d'erreur explicite.
 *
 * Audit Sprint 1 vague 4 (2026-05-04) — anti-pattern récurrent : `await
 * request.json()` au top level des handlers déclenche une exception non
 * catchée si le body est malformé/vide → 500 Sentry spam alors que la
 * réponse correcte est 400. Cette helper retourne 400 explicit avec un
 * message FR, ou la valeur typée à utiliser ensuite.
 *
 * Usage :
 *   const parsed = await safeJsonBody<MyType>(request)
 *   if (!parsed.ok) return parsed.response
 *   const body = parsed.data
 */
export async function safeJsonBody<T = unknown>(
  request: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await request.json()) as T
    return { ok: true, data }
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Corps de requête JSON invalide ou vide' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  }
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total,
    },
  })
}
