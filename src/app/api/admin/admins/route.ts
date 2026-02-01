import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_PERMISSIONS, type AdminRole } from '@/types/admin'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // Only super_admin can view admin list
    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Réservé aux super admins' } },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Fetch admins from admin_users table
    const { data: admins, error, count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching admins', error)
      return NextResponse.json({ error: 'Erreur lors de la récupération des administrateurs' }, { status: 500 })
    }

    return NextResponse.json({
      admins: admins || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      page,
    })
  } catch (error) {
    logger.error('Admin fetch error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // Only super_admin can add admins
    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Seuls les super admins peuvent ajouter des administrateurs' } },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: 'Email et rôle requis' }, { status: 400 })
    }

    // Find user by email
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    // Create admin entry
    const { data: newAdmin, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: targetUser?.id || null,
        email,
        role: role as AdminRole,
        permissions: DEFAULT_PERMISSIONS[role as AdminRole],
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating admin', error)
      return NextResponse.json({ error: 'Erreur lors de la création de l\'administrateur' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'admin_created', 'settings', newAdmin.id, { email, role })

    return NextResponse.json({ admin: newAdmin })
  } catch (error) {
    logger.error('Admin create error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
