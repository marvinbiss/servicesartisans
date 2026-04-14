/**
 * Cron: Simulateur Pipedrive sync retry
 *
 * Replays entries from simulateur_pipedrive_failures every 6h.
 * - retry_count < 5
 * - next_retry_at <= now()
 * Exponential backoff: 2^retry_count hours, capped at 24h.
 * On success → DELETE row.
 * On failure → increment retry_count + reschedule.
 *
 * See vercel.json for schedule.
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createSimulateurDeal,
  isSimulateurPipedriveConfigured,
  computeNextSimRetryAt,
  MAX_SIM_SYNC_ATTEMPTS,
  type SimulateurLeadInput,
} from '@/lib/simulateur/pipedrive'
import { createCallbackRequest, type CallbackPayload } from '@/lib/simulateur/callback-pipedrive'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const BATCH_SIZE = 8
const DEADLINE_MS = 50_000
// Worst-case row: 5 sequential pdFetch × 5s timeout = 25s. Refuse to start
// a row unless that much budget is left — otherwise a slow row can overrun
// maxDuration=60s, leaving Pipedrive writes uncommitted in the DLQ (DELETE
// not reached → ghost replays + duplicate Deals next cron).
const ROW_BUDGET_MS = 25_000

interface FailureRow {
  id: string
  estimation_id: string
  payload: unknown
  retry_count: number
}

export async function GET(request: Request) {
  // Toujours 401 si le header n'est pas valide — qu'il manque OU que CRON_SECRET
  // soit non-configuré côté serveur. Évite l'info-oracle : un client ne peut pas
  // distinguer "secret absent" de "mauvais secret" (500 vs 401 révèle l'état).
  const configured = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!configured || authHeader !== `Bearer ${configured}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  if (!isSimulateurPipedriveConfigured()) {
    return NextResponse.json({ skipped: true, reason: 'Pipedrive simulateur not configured' })
  }

  const supabase = createAdminClient()
  const nowIso = new Date().toISOString()

  const { data: pending, error } = await supabase
    .from('simulateur_pipedrive_failures')
    .select('id, estimation_id, payload, retry_count')
    .lt('retry_count', MAX_SIM_SYNC_ATTEMPTS)
    .lte('next_retry_at', nowIso)
    .order('next_retry_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    logger.error('simulateur-pipedrive-retry: query failed', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (pending ?? []) as FailureRow[]
  let synced = 0
  let failed = 0
  const startTs = Date.now()

  // Batch-prefetch estimations pour TOUTES les rows (callback + submit).
  // Les submit rows stockent désormais uniquement {kind:'submit'} dans payload
  // (migration RGPD : pas de PII dans la DLQ) — on rehydrate tout depuis la DB.
  const allEstimationIds = Array.from(new Set(rows.map((r) => r.estimation_id)))
  interface EstimationRow {
    prenom: string | null
    nom: string | null
    email: string | null
    telephone: string | null
    public_id: string
    categorie_anah: string | null
    zone_climatique: string | null
    parcours: string | null
    gestes: unknown
    bareme_ids: unknown
    mpr_total: number | null
    cee_fourchette_bas: number | null
    cee_fourchette_haut: number | null
    coup_pouce_estimation: number | null
    reste_a_charge_bas: number | null
    reste_a_charge_haut: number | null
    barometre_version: string | null
    code_postal: string | null
    surface_m2: number | null
    rfr: number | null
    rfr_exact: number | null
  }
  const estimationsMap = new Map<string, EstimationRow>()
  if (allEstimationIds.length > 0) {
    const { data: ests } = await supabase
      .from('simulateur_estimations')
      .select(
        'id, prenom, nom, email, telephone, public_id, categorie_anah, zone_climatique, parcours, gestes, bareme_ids, mpr_total, cee_fourchette_bas, cee_fourchette_haut, coup_pouce_estimation, reste_a_charge_bas, reste_a_charge_haut, barometre_version, code_postal, surface_m2, rfr, rfr_exact'
      )
      .in('id', allEstimationIds)
    for (const e of ests ?? []) {
      estimationsMap.set(e.id as string, e as unknown as EstimationRow)
    }
  }

  for (const row of rows) {
    // Pre-check includes worst-case row budget so we never START a row that
    // could overrun maxDuration. Simple `elapsed > DEADLINE_MS` was too lax.
    if (Date.now() - startTs + ROW_BUDGET_MS > DEADLINE_MS) {
      logger.warn('simulateur-pipedrive-retry: row budget exhausted, stopping batch', {
        elapsed: Date.now() - startTs,
        processed: synced + failed,
        remaining: rows.length - (synced + failed),
      })
      break
    }
    const rawPayload = row.payload as { kind?: string } & Record<string, unknown>
    const rawKind = rawPayload?.kind
    if (rawKind !== undefined && rawKind !== 'callback' && rawKind !== 'submit') {
      // Zombie : kind inconnu (corruption, ancienne version, injection).
      // On ne peut rien rejouer → DELETE plutôt que laisser la row bloquer
      // le cron indéfiniment (chaque run la re-voit, re-log, re-consomme le
      // budget). Mieux vaut perdre 1 lead potentiel que bloquer le batch.
      failed++
      logger.error('simulateur-pipedrive-retry: unknown kind — deleting zombie', {
        id: row.id,
        kind: rawKind,
      })
      await supabase.from('simulateur_pipedrive_failures').delete().eq('id', row.id)
      continue
    }
    const kind: 'callback' | 'submit' = rawKind === 'callback' ? 'callback' : 'submit'
    try {
      let dealId: number | string
      if (kind === 'callback') {
        const est = estimationsMap.get(row.estimation_id)
        if (!est || !est.email || !est.telephone) {
          throw new Error(
            `Cannot rehydrate callback: estimation ${row.estimation_id} missing email/telephone`
          )
        }
        const ctx = rawPayload as {
          preferredSlot?: string | null
          remarquesClient?: string | null
        }
        const cb: CallbackPayload = {
          publicId: est.public_id,
          prenom: est.prenom,
          nom: est.nom,
          email: est.email,
          telephone: est.telephone,
          preferredSlot: ctx.preferredSlot ?? null,
          remarquesClient: ctx.remarquesClient ?? null,
        }
        const result = await createCallbackRequest(cb)
        dealId = result.dealId
      } else {
        // Rehydrate SimulateurLeadInput depuis la DB (PII retirée du payload RGPD).
        const est = estimationsMap.get(row.estimation_id)
        if (
          !est ||
          !est.prenom ||
          !est.nom ||
          !est.email ||
          !est.telephone ||
          !est.categorie_anah ||
          !est.zone_climatique ||
          !est.parcours ||
          !est.barometre_version ||
          !est.code_postal ||
          est.surface_m2 == null ||
          est.mpr_total == null ||
          est.cee_fourchette_bas == null ||
          est.cee_fourchette_haut == null ||
          est.reste_a_charge_bas == null ||
          est.reste_a_charge_haut == null
        ) {
          throw new Error(
            `Cannot rehydrate submit: estimation ${row.estimation_id} missing required fields`
          )
        }
        const rfrVal = est.rfr ?? est.rfr_exact ?? 0
        const input: SimulateurLeadInput = {
          publicId: est.public_id,
          prenom: est.prenom,
          nom: est.nom,
          email: est.email,
          telephone: est.telephone,
          estimation: {
            publicId: est.public_id,
            categorieAnah: est.categorie_anah,
            zoneClimatique: est.zone_climatique,
            parcours: est.parcours,
            gestes: (est.gestes ?? []) as never,
            baremeIds: (est.bareme_ids ?? {}) as never,
            mprTotal: est.mpr_total,
            ceeFourchetteBas: est.cee_fourchette_bas,
            ceeFourchetteHaut: est.cee_fourchette_haut,
            coupPouceEstimation: est.coup_pouce_estimation ?? 0,
            resteAChargeBas: est.reste_a_charge_bas,
            resteAChargeHaut: est.reste_a_charge_haut,
            barometreVersion: est.barometre_version,
            codePostal: est.code_postal,
            surface: est.surface_m2,
            rfr: rfrVal,
          } as never,
        }
        const result = await createSimulateurDeal(input)
        dealId = result.dealId
        // Only submit kind writes pipedrive_deal_id on the estimation
        await supabase
          .from('simulateur_estimations')
          .update({ pipedrive_deal_id: String(result.dealId) })
          .eq('id', row.estimation_id)
      }

      // Remove from DLQ on success
      await supabase.from('simulateur_pipedrive_failures').delete().eq('id', row.id)
      synced++
      logger.info('simulateur-pipedrive-retry: synced', {
        id: row.id,
        estimationId: row.estimation_id,
        kind,
        dealId,
      })
    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : String(err)
      const nextAttempts = row.retry_count + 1
      const update: Record<string, unknown> = {
        retry_count: nextAttempts,
        last_retry_at: new Date().toISOString(),
        error: message.slice(0, 2000),
      }
      if (nextAttempts < MAX_SIM_SYNC_ATTEMPTS) {
        update.next_retry_at = computeNextSimRetryAt(nextAttempts).toISOString()
      }
      await supabase.from('simulateur_pipedrive_failures').update(update).eq('id', row.id)
      logger.error('simulateur-pipedrive-retry: retry failed', {
        id: row.id,
        estimationId: row.estimation_id,
        attempts: nextAttempts,
        message,
      })
    }
  }

  logger.info('simulateur-pipedrive-retry: done', { total: rows.length, synced, failed })
  return NextResponse.json({ total: rows.length, synced, failed })
}
