import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'

// SLA-99.9 : timeout dur Supabase 5s
const SUPABASE_TIMEOUT_MS = 5_000

// POST request schema
const resolveReportSchema = z.object({
  action: z.enum(['resolve', 'dismiss']),
  resolution: z.string().max(1000).optional(),
})

export const dynamic = 'force-dynamic'

// POST - Résoudre ou rejeter un signalement
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    // SLA-99.9 : rate-limit mutation 20/min — modération sensible
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-reports-resolve:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    // Verify admin with reviews:write permission
    const authResult = await requirePermission('reviews', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const result = resolveReportSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { action, resolution } = result.data

    const newStatus = action === 'resolve' ? 'reviewed' : 'dismissed'

    // SLA-99.9 : timeout 5s sur la mutation Supabase
    const mutationPromise = supabase
      .from('user_reports')
      .update({
        status: newStatus,
        reviewed_by: authResult.admin.id,
        resolution: resolution || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    const { data, error } = await Promise.race([
      mutationPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (error) {
      logger.error('Report resolve failed', { code: error.code, message: error.message })
      return NextResponse.json(
        { success: false, error: { message: 'Impossible de traiter le signalement' } },
        { status: 500 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur mutation modération
    await logAdminAction(authResult.admin.id, `report.${action}`, 'report', params.id, {
      status: newStatus,
      resolution,
    })

    return NextResponse.json({
      success: true,
      report: data,
      message: action === 'resolve' ? 'Signalement résolu' : 'Signalement rejeté',
    })
  } catch (error) {
    logger.error('admin-reports-resolve: error', error)
    captureError(error, {
      tags: { route: 'admin/reports/[id]/resolve', method: 'POST', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
