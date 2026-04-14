/**
 * Admin API — Funnel conversion simulateur
 * GET /api/admin/simulateur/funnel?days=30
 *
 * Retourne les métriques de conversion sur la période :
 *   - estimations_total : nombre d'estimations soumises
 *   - by_parcours / by_categorie : breakdown
 *   - consent_demarchage_rate : % opt-in
 *   - avg_reste_a_charge : moyenne mid-range
 *   - pipedrive_failures : rows en DLQ sur la période
 *
 * Côté client (GA/plausible) : simulateur_cta_click est déjà tracké via
 * trackEvent depuis <SimulateurCTA> ; cet endpoint expose le côté serveur
 * (submit → lead). Le ratio click/submit se calcule dans l'outil analytics.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

interface FunnelRow {
  parcours: string | null
  categorie_anah: string | null
  consent_demarchage: boolean | null
  reste_a_charge_bas: number | null
  reste_a_charge_haut: number | null
}

export async function GET(request: NextRequest) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success || !auth.admin) {
    return auth.error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 422 })
  }
  const { days } = parsed.data

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const supabase = createAdminClient()

  const { data: rows, error } = await supabase
    .from('simulateur_estimations')
    .select('parcours, categorie_anah, consent_demarchage, reste_a_charge_bas, reste_a_charge_haut')
    .gte('created_at', since)
    .is('deleted_at', null)

  if (error) {
    logger.error('admin/simulateur/funnel query failed', {
      component: 'api/admin/simulateur/funnel',
      error: error.message,
    })
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  const list = (rows ?? []) as FunnelRow[]
  const total = list.length

  const byParcours: Record<string, number> = {}
  const byCategorie: Record<string, number> = {}
  let consentCount = 0
  let resteSum = 0
  let resteCount = 0

  for (const r of list) {
    const p = r.parcours ?? 'inconnu'
    byParcours[p] = (byParcours[p] ?? 0) + 1
    const c = r.categorie_anah ?? 'inconnu'
    byCategorie[c] = (byCategorie[c] ?? 0) + 1
    if (r.consent_demarchage === true) consentCount++
    const bas = Number(r.reste_a_charge_bas)
    const haut = Number(r.reste_a_charge_haut)
    if (Number.isFinite(bas) && Number.isFinite(haut)) {
      resteSum += (bas + haut) / 2
      resteCount++
    }
  }

  const { count: dlqCount } = await supabase
    .from('simulateur_pipedrive_failures')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)

  return NextResponse.json({
    period: { days, since },
    estimations_total: total,
    by_parcours: byParcours,
    by_categorie: byCategorie,
    consent_demarchage_rate: total > 0 ? Math.round((consentCount / total) * 1000) / 10 : 0,
    avg_reste_a_charge: resteCount > 0 ? Math.round(resteSum / resteCount) : 0,
    pipedrive_failures: dlqCount ?? 0,
    note: 'Front-side funnel (simulateur_cta_click → submit) : consulter GA/Plausible pour variant/page. Ce endpoint expose le submit → lead côté serveur.',
  })
}
