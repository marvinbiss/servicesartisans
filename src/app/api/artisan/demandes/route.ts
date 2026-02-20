/**
 * Artisan Demandes (Quote Requests) API
 * GET: Fetch quote requests for the artisan
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const demandesQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'sent', 'accepted', 'refused']).optional().default('all'),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const queryParams = {
      status: searchParams.get('status') || 'all',
    }
    const result = demandesQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { status } = result.data

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Build query for devis_requests
    // TODO: zone/service filtering disabled — profiles no longer stores zones/services columns
    let query = supabase
      .from('devis_requests')
      .select('id, client_id, service_id, service_name, postal_code, city, description, budget, urgency, status, client_name, client_email, client_phone, created_at, updated_at')
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: demandes, error: demandesError } = await query

    if (demandesError) {
      logger.error('Error fetching demandes:', demandesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      )
    }

    // Get stats
    const stats = {
      total: demandes?.length || 0,
      nouveau: demandes?.filter(d => d.status === 'pending').length || 0,
      devis_envoye: demandes?.filter(d => d.status === 'sent').length || 0,
      accepte: demandes?.filter(d => d.status === 'accepted').length || 0,
      refuse: demandes?.filter(d => d.status === 'refused').length || 0,
    }

    return NextResponse.json({
      demandes: demandes || [],
      stats
    })
  } catch (error) {
    logger.error('Demandes GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
