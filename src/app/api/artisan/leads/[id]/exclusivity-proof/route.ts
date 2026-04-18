import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getExclusivityProofForAssignment } from '@/lib/leads/exclusivity-proof'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!provider) {
      return NextResponse.json({ error: 'Artisan introuvable' }, { status: 403 })
    }

    const proof = await getExclusivityProofForAssignment(params.id)

    if (!proof) {
      return NextResponse.json({ error: 'Assignation introuvable' }, { status: 404 })
    }

    if (proof.providerId !== provider.id) {
      return NextResponse.json({ error: 'Acces refuse' }, { status: 403 })
    }

    return NextResponse.json({ proof })
  } catch (error) {
    logger.error('[exclusivity-proof API] error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
