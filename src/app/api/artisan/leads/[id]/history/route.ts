/**
 * GET /api/artisan/leads/:id/history — Lead event history for authenticated artisan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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
      return NextResponse.json({ error: 'Aucun profil artisan' }, { status: 403 })
    }

    // Verify assignment belongs to this provider
    const { data: assignment } = await supabase
      .from('lead_assignments')
      .select('lead_id')
      .eq('id', id)
      .eq('provider_id', provider.id)
      .single()

    if (!assignment) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }

    // Fetch events for this lead (admin client to read lead_events)
    const adminClient = createAdminClient()
    const { data: events, error: eventsError } = await adminClient
      .from('lead_events')
      .select('id, event_type, metadata, created_at')
      .eq('lead_id', assignment.lead_id)
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: true })

    if (eventsError) {
      console.error('Lead history error:', eventsError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error('Lead history GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
