import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_PERMISSIONS, type AdminRole } from '@/types/admin'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PATCH request schema
const updateAdminSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'moderator', 'support']).optional(),
  permissions: z.record(z.string(), z.record(z.string(), z.boolean())).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // Only super_admin can view admin details
    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Réservé aux super admins' } },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      logger.error('Admin fetch error', error)
      return NextResponse.json({ error: 'Administrateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ admin })
  } catch (error) {
    logger.error('Admin fetch error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // Only super_admin can modify admins
    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Seuls les super admins peuvent modifier les rôles' } },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const result = updateAdminSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { role, permissions } = result.data

    // Get old data for audit
    const { data: _oldAdmin } = await supabase
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
      logger.error('Admin update error', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'admin_updated', 'settings', params.id, { role })

    return NextResponse.json({ admin: updatedAdmin })
  } catch (error) {
    logger.error('Admin update error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    // Only super_admin can delete admins
    if (authResult.admin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Seuls les super admins peuvent supprimer des administrateurs' } },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // Get admin data for audit
    const { data: _adminToDelete } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', params.id)

    if (error) {
      logger.error('Admin delete error', error)
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'admin_deleted', 'settings', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Admin delete error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
