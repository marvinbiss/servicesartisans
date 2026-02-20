/**
 * GET/PUT /api/artisan/settings — Artisan private settings
 * No SEO, INSEE, Pappers, or Google reviews data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id, name, phone, email, is_active, is_verified')
      .eq('user_id', user.id)
      .single()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      profile: profile || null,
      provider: provider || null,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, name } = body as { phone?: string; name?: string }

    const adminClient = createAdminClient()

    // Update provider if linked
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (provider) {
      const updates: Record<string, string> = {}
      if (phone !== undefined) updates.phone = phone
      if (name !== undefined) updates.name = name

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await adminClient
          .from('providers')
          .update(updates)
          .eq('id', provider.id)

        if (updateError) {
          return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
        }
      }
    }

    // Update profile name
    if (name !== undefined) {
      await adminClient
        .from('profiles')
        .update({ full_name: name })
        .eq('id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
