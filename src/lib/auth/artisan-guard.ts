import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

type Provider = { id: string }

type ArtisanGuardResult =
  | { error: NextResponse; user: null; provider: null; supabase: SupabaseClient }
  | { error: null; user: User; provider: Provider; supabase: SupabaseClient }

export async function requireArtisan(): Promise<ArtisanGuardResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      user: null,
      provider: null,
      supabase,
    }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'artisan') {
    return {
      error: NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 }),
      user: null,
      provider: null,
      supabase,
    }
  }
  // Verify artisan has an active provider profile
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .or('is_active.eq.true,is_active.is.null')
    .single()
  if (!provider) {
    return {
      error: NextResponse.json({ error: 'Profil artisan incomplet' }, { status: 403 }),
      user: null,
      provider: null,
      supabase,
    }
  }
  return { error: null, user, provider, supabase }
}
