/**
 * POST /api/admin/cee/dossiers/[id]/transition
 *
 * Plan D — D-1 (2026-05-06) : route admin pour transitions manuelles de
 * dossiers CEE V3. Sonergia n'a PAS d'API publique → les ops déposent
 * manuellement chez le délégataire puis appellent cette route pour matérialiser
 * la transition (ex `qa_approved → deposited`).
 *
 * Sécurité :
 *   - requirePermission('cee_partners', 'write') (CSRF + role check)
 *   - Transition validée par RPC `transition_cee_dossier_status` qui re-check
 *     contre le DAG SQL (mig 433). Aucune transition illégale possible.
 *   - actorId = admin.user_id, actorType = 'admin' → trace audit_logs.
 *
 * Request body : { toStatus: CeeDossierV3Status, comment?: string }
 *
 * Codes réponse :
 *   200 — transition appliquée
 *   400 — body invalide
 *   401 — non auth
 *   403 — perm insuffisante
 *   409 — transition illégale (état actuel ou DAG)
 *   500 — erreur DB
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { transitionCeeDossierStatus } from '@/lib/cee/dossiers'
import { DOSSIER_TRANSITIONS, type CeeDossierV3Status } from '@/lib/cee/dossier-transitions'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic'

const V3_STATUSES = Object.keys(DOSSIER_TRANSITIONS) as CeeDossierV3Status[]

const bodySchema = z.object({
  toStatus: z.enum(V3_STATUSES as [CeeDossierV3Status, ...CeeDossierV3Status[]]),
  comment: z.string().max(2000).optional(),
})

// Plan D — SLA fix : rate-limit défense-en-profondeur sur route admin.
// 60/min/IP couvre ops batch normal mais bloque scripts compromis.
const RL_WINDOW_MS = 60 * 1000
const RL_MAX = 60

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: dossierId } = await params
  if (!dossierId) {
    return NextResponse.json({ error: 'Missing dossier id' }, { status: 400 })
  }

  const ip = getClientIp(request.headers)
  const rl = await checkRateLimit(`admin-cee-transition:${ip}`, {
    window: RL_WINDOW_MS,
    max: RL_MAX,
    failOpen: true,
  })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
      }
    )
  }

  const auth = await requirePermission('cee_partners', 'write')
  if (!auth.success) return auth.error

  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Body invalide', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    const result = await transitionCeeDossierStatus(
      supabase,
      dossierId,
      // Cast nécessaire : transitionCeeDossierStatus utilise CeeDossierStatus (V2 legacy).
      // La RPC SQL valide réellement contre le DAG V3 (mig 433).
      body.toStatus as never,
      auth.admin?.id ?? null,
      'admin'
    )

    if (!result.ok) {
      const isIllegalTransition =
        result.error?.includes('illegal') ||
        result.error?.includes('transition') ||
        result.error === 'invalid_transition'
      logger.warn('admin/cee/transition: rejected', {
        dossier_id: dossierId,
        to_status: body.toStatus,
        error: result.error,
        admin_user: auth.admin?.id,
      })
      return NextResponse.json(
        { error: result.error ?? 'Transition refusée' },
        { status: isIllegalTransition ? 409 : 500 }
      )
    }

    logger.info('admin/cee/transition: ok', {
      dossier_id: dossierId,
      to_status: body.toStatus,
      admin_user: auth.admin?.id,
      has_comment: !!body.comment,
    })

    return NextResponse.json({ ok: true, dossier_id: dossierId, status: body.toStatus })
  } catch (err) {
    captureError(err, {
      tags: { route: 'admin/cee/dossiers/transition', critical: 'true' },
      extras: { dossier_id: dossierId, to_status: body.toStatus },
    })
    logger.error('admin/cee/transition: unexpected', err as Error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
