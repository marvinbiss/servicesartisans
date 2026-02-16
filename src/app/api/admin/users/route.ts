import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
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
    // Verify admin with users:read permission
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

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
        { success: false, error: { message: 'Paramètres invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { page, limit, filter, plan, search } = result.data

    // Fetch users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit,
    })

    if (authError) {
      logger.warn('Auth users list failed', { message: authError.message })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des utilisateurs' } },
        { status: 502 }
      )
    }

    // Try to get profiles only for the returned users (avoid fetching entire table)
    const profilesMap = new Map<string, Record<string, unknown>>()
    try {
      const userIds = authUsers.users.map(u => u.id)
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (profiles) {
          profiles.forEach(p => profilesMap.set(p.id, p))
        }
      }
    } catch {
      // profiles table doesn't exist, continue without it
    }

    // Transform users
    let users = authUsers.users.map(user => {
      const profile = profilesMap.get(user.id) || {}
      return {
        id: user.id,
        email: user.email || '',
        full_name: (profile.full_name as string) || user.user_metadata?.full_name || user.user_metadata?.name || null,
        phone: (profile.phone as string) || user.user_metadata?.phone || null,
        user_type: (profile.user_type as string) || (user.user_metadata?.is_artisan ? 'artisan' : 'client'),
        is_verified: !!user.email_confirmed_at,
        is_banned: (profile.is_banned as boolean) || user.banned_until !== null,
        subscription_plan: (profile.subscription_plan as string) || 'gratuit',
        subscription_status: (profile.subscription_status as string) || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      }
    })

    // Apply filters
    if (filter === 'clients') {
      users = users.filter(u => u.user_type === 'client')
    } else if (filter === 'artisans') {
      users = users.filter(u => u.user_type === 'artisan')
    } else if (filter === 'banned') {
      users = users.filter(u => u.is_banned)
    }

    // Apply plan filter
    if (plan !== 'all') {
      users = users.filter(u => u.subscription_plan === plan)
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(u =>
        u.email.toLowerCase().includes(searchLower) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
        (u.phone && u.phone.includes(search))
      )
    }

    const total = users.length

    return NextResponse.json({
      success: true,
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
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
    // Verify admin with users:write permission
    const authResult = await requirePermission('users', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const body = await request.json()
    const result = createUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Erreur de validation', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { email, full_name, phone, user_type, password } = result.data

    // Create user with Supabase Auth Admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
        is_artisan: user_type === 'artisan',
      },
    })

    if (authError) {
      logger.error('Auth creation error', authError)
      return NextResponse.json(
        { success: false, error: { message: authError.message } },
        { status: 400 }
      )
    }

    // Try to create/update profile if table exists
    if (authData.user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email,
            full_name,
            phone,
            user_type: user_type || 'client',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
      } catch {
        // profiles table doesn't exist, that's OK
      }
    }

    // Log d'audit
    if (authData.user) {
      await logAdminAction(authResult.admin.id, 'user.create', 'user', authData.user.id, { email, user_type })
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Utilisateur créé avec succès',
    })
  } catch (error) {
    logger.error('Admin user creation error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
