import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_PERMISSIONS, type AdminRole } from '@/types/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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
      console.error('Error fetching admins:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      admins: admins || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      page,
    })
  } catch (error) {
    console.error('Admin fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if current user is super_admin
    const { data: currentAdmin } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Seuls les super admins peuvent ajouter des administrateurs' }, { status: 403 })
    }

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
      console.error('Error creating admin:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'admin_created',
      entity_type: 'settings',
      entity_id: newAdmin.id,
      new_data: { email, role },
    })

    return NextResponse.json({ admin: newAdmin })
  } catch (error) {
    console.error('Admin create error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
