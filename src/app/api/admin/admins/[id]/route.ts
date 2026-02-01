import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_PERMISSIONS, type AdminRole } from '@/types/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Admin fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

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
      return NextResponse.json({ error: 'Seuls les super admins peuvent modifier les rôles' }, { status: 403 })
    }

    const { role, permissions } = await request.json()

    // Get old data for audit
    const { data: oldAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (role) {
      updateData.role = role
      updateData.permissions = permissions || DEFAULT_PERMISSIONS[role as AdminRole]
    }

    const { data: updatedAdmin, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'admin_updated',
      entity_type: 'settings',
      entity_id: params.id,
      old_data: { role: oldAdmin?.role },
      new_data: { role },
    })

    return NextResponse.json({ admin: updatedAdmin })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

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
      return NextResponse.json({ error: 'Seuls les super admins peuvent supprimer des administrateurs' }, { status: 403 })
    }

    // Get admin data for audit
    const { data: adminToDelete } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'admin_deleted',
      entity_type: 'settings',
      entity_id: params.id,
      old_data: { email: adminToDelete?.email, role: adminToDelete?.role },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
