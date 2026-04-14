/**
 * Admin API — Détail d'une estimation simulateur
 * GET /api/admin/simulateur/:publicId
 * Retourne l'estimation complète (situation, projet, résultats, formule_debug).
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success || !auth.admin) return auth.error!

  const { publicId } = await params
  if (!/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/.test(publicId)) {
    return NextResponse.json(
      { success: false, error: 'Format public_id invalide' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('simulateur_estimations')
      .select('*')
      .eq('public_id', publicId)
      .maybeSingle()

    if (error) {
      logger.error('Admin simulateur detail error', error as unknown as Error)
      return NextResponse.json(
        { success: false, error: 'Erreur lecture estimation' },
        { status: 500 }
      )
    }
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Estimation introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    logger.error('Admin simulateur detail exception', error as Error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
