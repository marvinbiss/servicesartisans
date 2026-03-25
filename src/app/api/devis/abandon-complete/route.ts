import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/devis/abandon-complete
 * Mark abandonment as completed — stop sending recovery emails.
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mark the most recent abandon as completed
    const { error } = await supabase
      .from('devis_abandons')
      .update({ completed_at: new Date().toISOString() })
      .eq('email', email)
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[abandon-complete] Update error:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[abandon-complete] Error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
