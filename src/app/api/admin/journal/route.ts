/**
 * GET /api/admin/journal — Immutable admin action journal
 * Reads from audit_logs (immutable, append-only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { pageSchema } from '@/lib/validations/schemas'
import { getJournalEntries } from '@/lib/services/admin-stats-service'

const journalQuerySchema = z.object({
  page: pageSchema,
  action: z.string().max(100).nullable().default(null),
  user_id: z.string().uuid().nullable().default(null),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify admin with audit:read permission
  const auth = await requirePermission('audit', 'read')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const url = new URL(request.url)

    const parsed = journalQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      action: url.searchParams.get('action') || null,
      user_id: url.searchParams.get('user_id') || null,
    })

    if (!parsed.success) {
      return NextResponse.json({ logs: [], total: 0, page: 1, pageSize: 50 })
    }

    const result = await getJournalEntries({
      page: parsed.data.page,
      action: parsed.data.action,
      userId: parsed.data.user_id,
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Journal GET error', error)
    return NextResponse.json({ logs: [], total: 0, page: 1, pageSize: 50 })
  }
}
