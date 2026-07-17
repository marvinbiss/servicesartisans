import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { getExclusivityProofForAssignment } from '@/lib/leads/exclusivity-proof'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    // Audit 2026-06-06 : seule route leads/[id] qui contournait le guard
    // centralise (role artisan + gate 2FA) — alignee sur les autres.
    const guard = await requireArtisan()
    if (guard.error) return guard.error
    const { provider } = guard

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
