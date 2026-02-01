import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// POST - Résoudre ou rejeter un signalement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()
    const body = await request.json()
    const { action, resolution_notes } = body // action: 'resolve' ou 'dismiss'

    if (!['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { message: "Action invalide. Utilisez 'resolve' ou 'dismiss'" } },
        { status: 400 }
      )
    }

    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed'

    const { data, error } = await supabase
      .from('user_reports')
      .update({
        status: newStatus,
        resolved_by: authResult.admin.id,
        resolution_notes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await logAdminAction(
      authResult.admin.id,
      `report.${action}`,
      'report',
      params.id,
      { status: newStatus, resolution_notes }
    )

    return NextResponse.json({
      success: true,
      report: data,
      message: action === 'resolve' ? 'Signalement résolu' : 'Signalement rejeté',
    })
  } catch (error) {
    logger.error('Admin report resolve error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
