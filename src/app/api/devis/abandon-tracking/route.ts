import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/devis/abandon-tracking
 * Track form abandonment when user fills email at step 2 but doesn't complete.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, service, city, step } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Deduplicate: don't insert if same email abandoned within 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('devis_abandons')
      .select('id')
      .eq('email', email)
      .gte('created_at', twentyFourHoursAgo)
      .is('completed_at', null)
      .limit(1)
      .single()

    if (existing) {
      // Update step reached if higher
      await supabase
        .from('devis_abandons')
        .update({ step_reached: step || 2 })
        .eq('id', existing.id)

      return NextResponse.json({ ok: true, deduplicated: true })
    }

    // Insert new abandon record
    const { error } = await supabase.from('devis_abandons').insert({
      email,
      service_slug: service || null,
      city_slug: city || null,
      step_reached: step || 2,
    })

    if (error) {
      console.error('[abandon-tracking] Insert error:', error)
      return NextResponse.json({ error: 'db error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[abandon-tracking] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
