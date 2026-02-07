/**
 * Artisan Assigned Leads API
 * GET: Fetch leads assigned to the authenticated artisan via lead_assignments
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get provider linked to this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé' },
        { status: 403 }
      )
    }

    // Fetch assigned leads via lead_assignments → devis_requests join
    const { data: assignments, error: assignError } = await supabase
      .from('lead_assignments')
      .select(`
        id,
        status,
        assigned_at,
        viewed_at,
        lead:devis_requests (
          id,
          service_name,
          city,
          postal_code,
          description,
          urgency,
          client_name,
          client_phone,
          created_at,
          status
        )
      `)
      .eq('provider_id', provider.id)
      .order('assigned_at', { ascending: false })
      .limit(50)

    if (assignError) {
      console.error('Error fetching assigned leads:', assignError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      leads: assignments || [],
      count: assignments?.length || 0,
    })
  } catch (error) {
    console.error('Artisan leads GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
