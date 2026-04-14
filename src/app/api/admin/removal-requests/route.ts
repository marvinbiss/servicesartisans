/**
 * Admin Removal Requests API
 * GET: List provider removal requests (with filtering, pagination)
 * PATCH: Approve or reject a removal request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import {
  listRemovalRequests,
  approveRemovalRequest,
  rejectRemovalRequest,
} from '@/lib/services/claims-service'

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

    const serviceResult = await listRemovalRequests(supabase, { status, page, limit })

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
    logger.error('Admin removal-requests GET error', { error: err })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
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
      const result = await approveRemovalRequest(
        supabase,
        requestId,
        authResult.admin.id,
        adminNotes
      )

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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result = await rejectRemovalRequest(
        supabase,
        requestId,
        authResult.admin.id,
        adminNotes!
      )

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
    logger.error('Admin removal-requests PATCH error', { error: err })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
