import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import { moderateReview } from '@/lib/services/admin-crud-service'

// SLA-99.9 : timeout dur Supabase 5s — coupe court à un hang DB
const SUPABASE_TIMEOUT_MS = 5_000

// PATCH request schema — maps to reviews.status column
const moderateReviewSchema = z.object({
  moderation_status: z.enum(['pending', 'approved', 'rejected']),
  is_visible: z.boolean().optional(),
})

export const dynamic = 'force-dynamic'

// PATCH - Moderate review
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // SLA-99.9 : rate-limit mutation 30/min — bride une session admin compromise
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-reviews-mod:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

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

    const body = await request.json()
    const result = moderateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    // SLA-99.9 : timeout 5s sur la mutation
    const serviceResult = await Promise.race([
      moderateReview(supabase, params.id, result.data.moderation_status),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur mutation modération
    await logAdminAction(
      authResult.admin.id,
      `review.${result.data.moderation_status}`,
      'review',
      params.id,
      { moderation_status: result.data.moderation_status, is_visible: result.data.is_visible }
    )

    return NextResponse.json({ success: true, data: serviceResult.data.data })
  } catch (error) {
    logger.error('admin-reviews-mod: error', error)
    captureError(error, {
      tags: { route: 'admin/reviews/[id]', method: 'PATCH', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
