/**
 * Message Reactions API
 * Reactions were removed (message_reactions table dropped in migration 100)
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    return NextResponse.json(
      { success: false, error: { message: 'Fonctionnalité non disponible' } },
      { status: 501 }
    )
  } catch (error) {
    logger.error('[api/messages/[id]/reactions] POST failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    return NextResponse.json(
      { success: false, error: { message: 'Fonctionnalité non disponible' } },
      { status: 501 }
    )
  } catch (error) {
    logger.error('[api/messages/[id]/reactions] DELETE failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
