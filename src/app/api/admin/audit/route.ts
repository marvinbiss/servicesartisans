import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import { getAuditLogs } from '@/lib/services/admin-stats-service'

// GET query params schema (custom limit default=50 for audit logs)
const auditQuerySchema = z.object({
  page: pageSchema,
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  action: z.string().max(100).optional().default('all'),
  entityType: z.string().max(50).optional().default('all'),
  adminId: z.string().uuid().optional().or(z.literal('')),
  dateFrom: z.string().datetime().optional().or(z.literal('')),
  dateTo: z.string().datetime().optional().or(z.literal('')),
})

export const dynamic = 'force-dynamic'

// GET - Liste des logs d'audit
export async function GET(request: NextRequest) {
  try {
    // Verify admin with audit:read permission
    const authResult = await requirePermission('audit', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      action: searchParams.get('action') || 'all',
      entityType: searchParams.get('entityType') || 'all',
      adminId: searchParams.get('adminId') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
    }
    const result = auditQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const auditResult = await getAuditLogs(result.data, sanitizeSearchQuery)

    return NextResponse.json({
      success: true,
      ...auditResult,
    })
  } catch (error) {
    logger.error('Admin audit logs error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
