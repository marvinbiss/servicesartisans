/**
 * POST /api/rgpd/delete/[publicId]
 * Body : { email: string, confirmation: "SUPPRIMER" }
 *
 * Droit à l'effacement (art. 17 RGPD).
 * V1 : pas d'envoi email réel. On vérifie que l'email passé correspond à
 * celui stocké, puis on marque `deleted_at = now()` et on vide les coords.
 * On garde les données agrégées pour stats (RFR déjà anonymisé via cron).
 *
 * TODO V2 : intégrer Resend pour double opt-in avec lien de confirmation
 *           envoyé à l'email stocké, délai 7 jours (cf. doc RGPD §5.1).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const BodySchema = z.object({
  email: z.string().email(),
  confirmation: z.literal('SUPPRIMER'),
})

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase()
}

export async function POST(req: NextRequest, props: { params: Promise<{ publicId: string }> }) {
  const params = await props.params
  try {
    const { publicId } = params

    if (!publicId || !/^EST-\d{4}-\d{2}-\d{2}-[a-z0-9]{6,12}$/.test(publicId)) {
      return NextResponse.json({ error: 'publicId invalide' }, { status: 400 })
    }

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
    }

    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Body invalide : { email, confirmation: "SUPPRIMER" } requis' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { data: row, error } = await supabase
      .from('simulateur_estimations')
      .select('id, email, deleted_at')
      .eq('public_id', publicId)
      .maybeSingle()

    if (error) {
      logger.error('rgpd-delete: query failed', error, { publicId })
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    if (!row) {
      return NextResponse.json({ error: 'Estimation introuvable' }, { status: 404 })
    }

    if (row.deleted_at) {
      return NextResponse.json({ ok: true, alreadyDeleted: true })
    }

    const storedEmail = row.email ? normalizeEmail(row.email) : null
    const providedEmail = normalizeEmail(parsed.data.email)

    if (!storedEmail || storedEmail !== providedEmail) {
      logger.warn('rgpd-delete: email mismatch', {
        component: 'api/rgpd/delete',
        publicId,
      })
      // Volontairement vague pour ne pas révéler l'état interne
      return NextResponse.json({ error: 'Email ne correspond pas' }, { status: 403 })
    }

    const nowIso = new Date().toISOString()
    const { error: updErr } = await supabase
      .from('simulateur_estimations')
      .update({
        email: null,
        telephone: null,
        prenom: null,
        nom: null,
        rfr_exact: null,
        ip_hash: null,
        anonymized_at: nowIso,
        deleted_at: nowIso,
      })
      .eq('id', row.id)

    if (updErr) {
      logger.error('rgpd-delete: update failed', updErr, { publicId })
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    logger.info('rgpd-delete: processed', {
      component: 'api/rgpd/delete',
      publicId,
      deletedAt: nowIso,
      // auditable : traçabilité de la demande, pas de coords
    })

    return NextResponse.json({ ok: true, deletedAt: nowIso })
  } catch (error) {
    logger.error('[api/rgpd/delete/[publicId]] POST failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
