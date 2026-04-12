/**
 * GDPR Data Export API - ServicesArtisans
 * Allows users to request and download their personal data
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { exportPostSchema, requestExport, getExportStatus } from '@/lib/services/gdpr-service'

// POST /api/gdpr/export - Request data export
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = exportPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { format } = result.data

    const adminSupabase = createAdminClient()
    const exportResult = await requestExport(supabase, adminSupabase, user.id, format)

    if (exportResult.error === 'EXISTING_REQUEST') {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Vous avez déjà une demande d'export en cours" },
          requestId: exportResult.existingRequestId,
        },
        { status: 400 }
      )
    }

    if (exportResult.error) throw new Error(exportResult.error)

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      requestId: exportResult.data!.requestId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data: exportResult.data!.exportData,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message: exportResult.data!.message,
    })
  } catch (error) {
    logger.error('GDPR export error:', error)
    return NextResponse.json(
      { success: false, error: { message: "Échec du traitement de la demande d'export" } },
      { status: 500 }
    )
  }
}

// GET /api/gdpr/export - Get export status or download
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    const result = await getExportStatus(adminSupabase, user.id, requestId)

    if (result.error === 'REQUEST_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { message: "Demande d'export introuvable" } },
        { status: 404 }
      )
    }

    if (requestId) {
      return NextResponse.json(result.data)
    }

    return NextResponse.json({ requests: result.data })
  } catch (error) {
    logger.error('GDPR export status error:', error)
    return NextResponse.json(
      { success: false, error: { message: "Échec de la récupération du statut d'export" } },
      { status: 500 }
    )
  }
}
