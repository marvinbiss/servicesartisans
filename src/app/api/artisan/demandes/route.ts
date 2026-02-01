/**
 * Artisan Demandes (Quote Requests) API
 * GET: Fetch quote requests for the artisan
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Get artisan profile to check zones/services
    const { data: profile } = await supabase
      .from('profiles')
      .select('services, zones, city, postal_code')
      .eq('id', user.id)
      .single()

    // Build query for devis_requests matching artisan's services/zones
    let query = supabase
      .from('devis_requests')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Filter by zones that match artisan's zones
    if (profile?.zones && profile.zones.length > 0) {
      // Match postal codes or cities
      const zoneConditions = profile.zones.map((zone: string) => {
        const postalMatch = zone.match(/\d{2,5}/)
        if (postalMatch) {
          return `postal_code.ilike.${postalMatch[0]}%`
        }
        return `city.ilike.%${zone}%`
      })
      // For now, get all requests (zone filtering can be done client-side or with RPC)
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
