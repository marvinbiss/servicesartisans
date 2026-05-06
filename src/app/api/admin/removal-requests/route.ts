/**
 * Admin Removal Requests API
 * GET: List provider removal requests (with filtering, pagination)
 * PATCH: Approve or reject a removal request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import {
  listRemovalRequests,
  approveRemovalRequest,
  rejectRemovalRequest,
} from '@/lib/services/claims-service'

// SLA-99.9 : timeout dur Supabase 5s
const SUPABASE_TIMEOUT_MS = 5_000

export const dynamic = 'force-dynamic'

// GET query params
const querySchema = paginationSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('pending'),
})

// PATCH body
const actionSchema = z.object({
  requestId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().max(1000).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // SLA-99.9 : rate-limit lecture 60/min/IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-removal-list:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const result = querySchema.safeParse({
      status: searchParams.get('status') || 'pending',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides' } },
        { status: 400 }
      )
    }

    const { status, page, limit } = result.data

    // SLA-99.9 : timeout 5s sur la liste
    const serviceResult = await Promise.race([
      listRemovalRequests(supabase, { status, page, limit }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (!serviceResult.success) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error } },
        { status: serviceResult.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: serviceResult.data.data,
      pagination: serviceResult.data.pagination,
    })
  } catch (err) {
    logger.error('admin-removal-list: error', { error: err })
    captureError(err, {
      tags: { route: 'admin/removal-requests', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // SLA-99.9 : rate-limit mutation 20/min — décision RGPD irréversible
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-removal-patch:${ip}`, {
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

    const authResult = await requirePermission('providers', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const validation = actionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Données invalides', details: validation.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { requestId, action, adminNotes } = validation.data
    const supabase = createAdminClient()

    // Reject requires admin notes
    if (action === 'reject' && !adminNotes?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Les notes admin sont obligatoires pour un rejet' } },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // SLA-99.9 : timeout 5s — service interne audit_logs déjà
      const result = await Promise.race([
        approveRemovalRequest(supabase, requestId, authResult.admin.id, adminNotes),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
        ),
      ])

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: { message: result.error } },
          { status: result.status }
        )
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      // action === 'reject' — adminNotes presence already validated above
      const notes = adminNotes ?? ''
      // SLA-99.9 : timeout 5s
      const result = await Promise.race([
        rejectRemovalRequest(supabase, requestId, authResult.admin.id, notes),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
        ),
      ])

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: { message: result.error } },
          { status: result.status }
        )
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      })
    }
  } catch (err) {
    logger.error('admin-removal-patch: error', { error: err })
    captureError(err, {
      tags: { route: 'admin/removal-requests', method: 'PATCH', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
