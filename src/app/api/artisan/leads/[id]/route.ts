/**
 * GET /api/artisan/leads/:id — Single lead detail for authenticated artisan
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Fetch assignment with full lead data
    const { data: assignment, error: assignError } = await supabase
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
          budget,
          urgency,
          client_name,
          client_email,
          client_phone,
          created_at,
          status
        )
      `)
      .eq('id', id)
      .eq('provider_id', provider.id)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ error: 'Lead non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('Lead detail GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
