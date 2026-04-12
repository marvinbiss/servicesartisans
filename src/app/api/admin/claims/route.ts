/**
 * Admin Claims API
 * GET: List provider claim requests (with filtering)
 * PATCH: Approve or reject a claim
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listClaims, approveClaim, rejectClaim } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

// GET query params
const claimsQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('pending'),
})

// PATCH body
const claimActionSchema = z.object({
  claimId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'unclaim']),
  rejectionReason: z.string().max(500).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const result = claimsQuerySchema.safeParse({
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

    const serviceResult = await listClaims(supabase, { status, page, limit })

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
  } catch {
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
    const validation = claimActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Données invalides', details: validation.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { claimId, action, rejectionReason } = validation.data
    const supabase = createAdminClient()

    if (action === 'approve') {
      const result = await approveClaim(supabase, claimId, authResult.admin.id)

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
      // reject or unclaim — both handled by rejectClaim (which checks claim.status)
      const result = await rejectClaim(supabase, claimId, authResult.admin.id, rejectionReason)

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
  } catch {
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
