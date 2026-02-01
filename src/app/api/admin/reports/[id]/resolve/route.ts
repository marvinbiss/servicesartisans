import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Résoudre ou rejeter un signalement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

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
        resolved_by: user.id,
        resolution_notes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: `report.${action}`,
      entity_type: 'report',
      entity_id: params.id,
      new_data: { status: newStatus, resolution_notes },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      report: data,
      message: action === 'resolve' ? 'Signalement résolu' : 'Signalement rejeté',
    })
  } catch (error) {
    console.error('Admin report resolve error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
