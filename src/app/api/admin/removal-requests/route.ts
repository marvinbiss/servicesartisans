/**
 * Admin Removal Requests API
 * GET: List provider removal requests (with filtering, pagination)
 * PATCH: Approve or reject a removal request
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'

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
        { success: false, error: { message: 'Parametres invalides' } },
        { status: 400 }
      )
    }

    const { status, page, limit } = result.data
    const offset = (page - 1) * limit

    let query = supabase
      .from('provider_removal_requests')
      .select(
        `
        id,
        provider_id,
        requester_name,
        requester_email,
        requester_siret,
        reason,
        status,
        admin_notes,
        processed_at,
        processed_by,
        created_at,
        provider:provider_id(id, name, slug, stable_id, specialty, address_city)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: requests, error, count } = await query

    if (error) {
      logger.error('Error fetching removal requests', { error })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la recuperation des demandes' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
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
          error: { message: 'Donnees invalides', details: validation.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { requestId, action, adminNotes } = validation.data
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Reject requires admin notes
    if (action === 'reject' && !adminNotes?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: 'Les notes admin sont obligatoires pour un rejet' } },
        { status: 400 }
      )
    }

    // Fetch the request
    const { data: removalRequest, error: fetchError } = await supabase
      .from('provider_removal_requests')
      .select('id, provider_id, status, requester_name, requester_email')
      .eq('id', requestId)
      .single()

    if (fetchError || !removalRequest) {
      return NextResponse.json(
        { success: false, error: { message: 'Demande introuvable' } },
        { status: 404 }
      )
    }

    if (removalRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: { message: 'Cette demande a deja ete traitee' } },
        { status: 409 }
      )
    }

    if (action === 'approve') {
      // 1. Update the request status
      const { error: updateError } = await supabase
        .from('provider_removal_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes || null,
          processed_at: now,
          processed_by: authResult.admin.id,
        })
        .eq('id', requestId)

      if (updateError) {
        logger.error('Error approving removal request', { requestId, error: updateError })
        return NextResponse.json(
          { success: false, error: { message: 'Erreur lors de la mise a jour de la demande' } },
          { status: 500 }
        )
      }

      // 2. Deactivate and noindex the provider
      const { error: providerError } = await supabase
        .from('providers')
        .update({
          is_active: false,
          noindex: true,
          updated_at: now,
        })
        .eq('id', removalRequest.provider_id)

      if (providerError) {
        logger.error('Error deactivating provider after removal approval', {
          requestId,
          providerId: removalRequest.provider_id,
          error: providerError,
        })
        return NextResponse.json(
          {
            success: false,
            error: { message: `Erreur desactivation fiche: ${providerError.message}` },
          },
          { status: 500 }
        )
      }

      // 3. Revalidate affected pages (non-blocking)
      try {
        const { data: providerInfo } = await supabase
          .from('providers')
          .select('specialty, address_city, slug, stable_id')
          .eq('id', removalRequest.provider_id)
          .single()

        if (providerInfo) {
          const serviceSlug = slugify(providerInfo.specialty || 'artisan')
          const locationSlug = slugify(providerInfo.address_city || 'france')
          const publicId = providerInfo.slug || providerInfo.stable_id

          if (publicId) {
            revalidatePath(`/services/${serviceSlug}/${locationSlug}/${publicId}`, 'page')
          }
          revalidatePath(`/services/${serviceSlug}/${locationSlug}`, 'page')
          revalidatePath(`/services/${serviceSlug}`, 'page')
        }
      } catch (revalError) {
        logger.error('Revalidation failed after removal approval:', revalError)
      }

      logger.info('Removal request approved', {
        requestId,
        providerId: removalRequest.provider_id,
        adminId: authResult.admin.id,
        requesterEmail: removalRequest.requester_email,
      })

      return NextResponse.json({
        success: true,
        message: 'Demande approuvee. La fiche a ete desactivee et mise en noindex.',
      })
    } else {
      // Reject
      const { error: rejectError } = await supabase
        .from('provider_removal_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          processed_at: now,
          processed_by: authResult.admin.id,
        })
        .eq('id', requestId)

      if (rejectError) {
        logger.error('Error rejecting removal request', { requestId, error: rejectError })
        return NextResponse.json(
          { success: false, error: { message: 'Erreur lors du rejet' } },
          { status: 500 }
        )
      }

      logger.info('Removal request rejected', {
        requestId,
        providerId: removalRequest.provider_id,
        adminId: authResult.admin.id,
        adminNotes,
      })

      return NextResponse.json({
        success: true,
        message: 'Demande rejetee.',
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
