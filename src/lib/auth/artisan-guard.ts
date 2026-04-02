import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireArtisan() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }), user: null, provider: null, supabase }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'artisan') {
    return { error: NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 }), user: null, provider: null, supabase }
  }
  // Verify artisan has an active provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .or('is_active.eq.true,is_active.is.null')
    .single()
  if (!provider) {
    return { error: NextResponse.json({ error: 'Profil artisan incomplet' }, { status: 403 }), user: null, provider: null, supabase }
  }
  return { error: null, user, provider, supabase }
}
