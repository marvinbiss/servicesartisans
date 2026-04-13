/**
 * Artisan Demandes (Quote Requests) API
 * GET: Fetch quote requests for the artisan
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { z } from 'zod'
import {
  getProviderIdMaybeSingle,
  getLeadAssignmentsByProviderId,
  getDevisRequestStatusByIds,
  getDevisRequestsByIds,
} from '@/lib/services/artisan-profile-service'

// GET query params schema
const demandesQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'sent', 'accepted', 'refused']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || 'all',
    }
    const result = demandesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { status } = result.data

    // Resolve provider for this artisan
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: provider } = await getProviderIdMaybeSingle(supabase, user!.id)

    if (!provider) {
      return NextResponse.json(
        { demandes: [], stats: { total: 0, nouveau: 0, devis_envoye: 0, accepte: 0, refuse: 0 } },
        {
          headers: { 'Cache-Control': 'private, no-store, max-age=0' },
        }
      )
    }

    // Get lead IDs assigned to this provider via lead_assignments
    const { data: assignments } = await getLeadAssignmentsByProviderId(supabase, provider.id)

    const leadIds = (assignments || []).map((a) => a.lead_id)

    if (leadIds.length === 0) {
      return NextResponse.json(
        { demandes: [], stats: { total: 0, nouveau: 0, devis_envoye: 0, accepte: 0, refuse: 0 } },
        {
          headers: { 'Cache-Control': 'private, no-store, max-age=0' },
        }
      )
    }

    // Fetch ALL devis_requests assigned to this provider (unfiltered) for accurate stats
    const { data: allDemandes, error: allDemandesError } = await getDevisRequestStatusByIds(
      supabase,
      leadIds
    )

    if (allDemandesError) {
      logger.error('Error fetching demandes for stats:', allDemandesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      )
    }

    // Stats calculated on ALL demandes (not filtered by status)
    const stats = {
      total: allDemandes?.length || 0,
      nouveau: allDemandes?.filter((d) => d.status === 'pending').length || 0,
      devis_envoye: allDemandes?.filter((d) => d.status === 'sent').length || 0,
      accepte: allDemandes?.filter((d) => d.status === 'accepted').length || 0,
      refuse: allDemandes?.filter((d) => d.status === 'refused').length || 0,
    }

    // Fetch only devis_requests assigned to this provider, filtered by status if requested
    const { data: demandes, error: demandesError } = await getDevisRequestsByIds(
      supabase,
      leadIds,
      status
    )

    if (demandesError) {
      logger.error('Error fetching demandes:', demandesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        demandes: demandes || [],
        stats,
      },
      {
        headers: { 'Cache-Control': 'private, no-store, max-age=0' },
      }
    )
  } catch (error) {
    logger.error('Demandes GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
