import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireArtisan() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }), user: null, supabase }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'artisan') {
    return { error: NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 }), user: null, supabase }
  }
  return { error: null, user, supabase }
}
