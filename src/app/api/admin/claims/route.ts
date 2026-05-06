/**
 * Admin Claims API
 * GET: List provider claim requests (with filtering)
 * PATCH: Approve or reject a claim
 *
 * SLA-99.9 : rate-limit + timeout Supabase + audit_logs sur mutation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listClaims, approveClaim, rejectClaim } from '@/lib/services/claims-service'

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout 5s pour borner les appels Supabase.
const SUPABASE_TIMEOUT_MS = 5_000

function withSupabaseTimeout<T>(p: PromiseLike<T>): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
    ),
  ])
}

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
    // SLA-99.9 : rate limit lecture 60/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-claims-list:${ip}`, {
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

    // SLA-99.9 : Promise.race timeout 5s.
    const serviceResult = await withSupabaseTimeout(listClaims(supabase, { status, page, limit }))

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
  } catch (error) {
    logger.error('admin-claims-list: error', error)
    captureError(error, {
      tags: { route: 'admin/claims', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // SLA-99.9 : rate limit décision claim 20/min/IP fail-open (action sensible mais doit
    // jamais bloquer un admin qui traite la file de claims).
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-claims-patch:${ip}`, {
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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Corps de requête JSON invalide' } },
        { status: 400 }
      )
    }

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

    // SLA-99.9 : snapshot du claim avant mutation pour audit_logs.old_value.
    const { data: oldClaim } = await withSupabaseTimeout(
      supabase
        .from('provider_claims')
        .select('id, provider_id, user_id, status, rejection_reason, siret_provided')
        .eq('id', claimId)
        .single()
    )

    if (action === 'approve') {
      // SLA-99.9 : Promise.race timeout 5s.
      const result = await withSupabaseTimeout(approveClaim(supabase, claimId, authResult.admin.id))

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: { message: result.error } },
          { status: result.status }
        )
      }

      // SLA-99.9 : audit_logs OBLIGATOIRE sur approve.
      try {
        await withSupabaseTimeout(
          supabase.from('audit_logs').insert({
            user_id: authResult.admin.id,
            action: 'claim.approve',
            resource_type: 'provider_claim',
            resource_id: claimId,
            old_value: oldClaim ?? {},
            new_value: { status: 'approved', approved_by: authResult.admin.id },
          })
        )
      } catch (auditError) {
        logger.warn('admin-claims-patch: audit log failed (approve)', { error: String(auditError) })
        captureError(auditError, {
          tags: { route: 'admin/claims', method: 'PATCH', audit: 'failed' },
        })
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      // reject or unclaim — both handled by rejectClaim (which checks claim.status)
      // SLA-99.9 : Promise.race timeout 5s.
      const result = await withSupabaseTimeout(
        rejectClaim(supabase, claimId, authResult.admin.id, rejectionReason)
      )

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: { message: result.error } },
          { status: result.status }
        )
      }

      // SLA-99.9 : audit_logs OBLIGATOIRE sur reject/unclaim.
      try {
        await withSupabaseTimeout(
          supabase.from('audit_logs').insert({
            user_id: authResult.admin.id,
            action: action === 'reject' ? 'claim.reject' : 'claim.unclaim',
            resource_type: 'provider_claim',
            resource_id: claimId,
            old_value: oldClaim ?? {},
            new_value: {
              status: action === 'reject' ? 'rejected' : 'pending',
              rejection_reason: rejectionReason ?? null,
            },
          })
        )
      } catch (auditError) {
        logger.warn('admin-claims-patch: audit log failed (reject/unclaim)', {
          error: String(auditError),
        })
        captureError(auditError, {
          tags: { route: 'admin/claims', method: 'PATCH', audit: 'failed' },
        })
      }

      return NextResponse.json({
        success: true,
        message: result.message,
      })
    }
  } catch (error) {
    logger.error('admin-claims-patch: error', error)
    captureError(error, {
      tags: { route: 'admin/claims', method: 'PATCH', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
