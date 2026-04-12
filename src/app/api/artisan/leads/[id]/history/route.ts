/**
 * GET /api/artisan/leads/:id/history — Lead event history for authenticated artisan
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  getProviderForUser,
  verifyAssignmentOwnership,
  getLeadHistory,
} from '@/lib/services/leads-service'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const provider = await getProviderForUser(supabase, user.id)

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun profil artisan' } },
        { status: 403 }
      )
    }

    // Verify assignment belongs to this provider
    const assignment = await verifyAssignmentOwnership(supabase, id, provider.id)

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: { message: 'Lead non trouvé' } },
        { status: 404 }
      )
    }

    // Fetch events for this lead (admin client to read lead_events)
    const adminClient = createAdminClient()
    const events = await getLeadHistory(adminClient, assignment.lead_id, provider.id)

    return NextResponse.json({ events })
  } catch (error) {
    logger.error('Lead history GET error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
