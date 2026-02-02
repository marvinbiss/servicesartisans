import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const resolveReportSchema = z.object({
  action: z.enum(['resolve', 'dismiss']),
  resolution_notes: z.string().max(1000).optional(),
})

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

    const supabase = createAdminClient()
    const body = await request.json()
    const result = resolveReportSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { action, resolution_notes } = result.data

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
