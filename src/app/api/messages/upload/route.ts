/**
 * Message Attachments Upload API — gelé.
 *
 * Messagerie en lecture seule depuis la fermeture de l'espace particulier
 * (2026-06-05). Aucune UI n'appelle cette route. De plus l'implémentation
 * était doublement cassée (audit 2026-06-05) : path `${conversationId}/...`
 * incompatible avec la policy storage `uid = foldername[1]` + `getPublicUrl()`
 * sur bucket privé + insert `message_attachments` bloqué RLS service_role.
 * Si la feature revient : path scopé user.id, `createSignedUrl()`, validation
 * magic bytes (cf. /api/portfolio/upload), policy RLS membership.
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  return NextResponse.json(
    { success: false, error: { message: 'Messagerie en lecture seule' } },
    { status: 501 }
  )
}
