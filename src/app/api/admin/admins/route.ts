import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listAdmins, createAdmin } from '@/lib/services/admin-crud-service'

// GET query params schema — pagination only, no additional filters
const adminsQuerySchema = paginationSchema

// POST request schema — accepts email OR user_id
const createAdminSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    email: z.string().email().optional(),
    role: z.enum(['super_admin', 'admin', 'moderator', 'viewer']),
  })
  .refine((data) => data.user_id || data.email, {
    message: 'user_id ou email requis',
  })

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Réservé aux super admins' } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }
    const result = adminsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const serviceResult = await listAdmins(supabase, result.data)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json(serviceResult.data)
  } catch (error) {
    logger.error('Admin fetch error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Seuls les super admins peuvent ajouter des administrateurs',
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = createAdminSchema.safeParse(body)
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
    const serviceResult = await createAdmin(supabase, result.data)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    await logAdminAction(
      authResult.admin.id,
      'admin_created',
      'settings',
      serviceResult.data.admin.id,
      {
        role: result.data.role,
      }
    )

    return NextResponse.json({ admin: serviceResult.data.admin })
  } catch (error) {
    logger.error('Admin create error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
