import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { listUsers, createUser } from '@/lib/services/admin-crud-service'

// GET query params schema
const usersQuerySchema = paginationSchema.extend({
  filter: z.enum(['all', 'clients', 'artisans', 'banned']).optional().default('all'),
  plan: z.enum(['all', 'gratuit', 'pro', 'premium']).optional().default('all'),
  search: z.string().max(100).optional().default(''),
})

// POST request schema
const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  full_name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  user_type: z.enum(['client', 'artisan']).optional().default('client'),
})

export const dynamic = 'force-dynamic'

// GET - Liste des utilisateurs avec filtres et pagination
export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      filter: searchParams.get('filter') || 'all',
      plan: searchParams.get('plan') || 'all',
      search: searchParams.get('search') || '',
    }
    const result = usersQuerySchema.safeParse(queryParams)
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
    const authPage = parseInt(searchParams.get('page') || '1', 10)
    const authPerPage = Math.min(parseInt(searchParams.get('perPage') || '50', 10), 100)

    const serviceResult = await listUsers(supabase, {
      ...result.data,
      authPage,
      authPerPage,
    })

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, ...serviceResult.data })
  } catch (error) {
    logger.error('Admin users list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('users', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const result = createUserSchema.safeParse(body)
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
    const serviceResult = await createUser(supabase, result.data)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // Log d'audit
    if (serviceResult.data.user) {
      const userId = (serviceResult.data.user as Record<string, unknown>).id as string
      await logAdminAction(authResult.admin.id, 'user.create', 'user', userId, {
        email: result.data.email,
        user_type: result.data.user_type,
      })
    }

    return NextResponse.json({
      success: true,
      user: serviceResult.data.user,
      message: serviceResult.data.message,
    })
  } catch (error) {
    logger.error('Admin user creation error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
