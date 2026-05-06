/**
 * Cron CEE — réconciliation des transitions de dossiers (mandataire CEE V3).
 *
 * Plan D — D-1 + D-2 (2026-05-06) : refonte complète pour statuts V3.
 *
 * Avant : ce cron scannait `engagement_signe`, `travaux_acheves`,
 *         `depose_delegataire` (statuts V2 droppés par mig 433). Inerte.
 *
 * Après : alertes ops sur dossiers stuck dans un statut V3 — Sonergia n'a PAS
 *         d'API publique, donc on n'auto-push PAS. Le rôle du cron est de
 *         signaler les actions humaines requises côté backoffice CEE.
 *
 * Règles V3 (DAG `src/lib/cee/dossier-transitions.ts`) :
 *
 *   Règle A — qa_approved_stale_to_deposit
 *     Scope   : `qa_approved` âgés > 24h
 *     Action  : Sentry warn + log structuré → ops doit dépose manuel chez
 *               Sonergia puis appeler /api/admin/cee/dossiers/[id]/transition
 *               pour passer en `deposited`. Aucun auto-transition.
 *
 *   Règle B — deposited_acquittement_overdue
 *     Scope   : `deposited` âgés > 14j (cycle moyen acquittement Sonergia)
 *     Action  : Sentry warn → ops doit relancer délégataire pour validation
 *               PNCEE.
 *
 *   Règle C — validated_pncee_payment_overdue
 *     Scope   : `validated_pncee` âgés > 7j
 *     Action  : Sentry warn → ops doit déclencher versement client.
 *
 *   Règle D — paid_client_to_commission_due (auto)
 *     Scope   : `paid_client` âgés > 1h (= virement client confirmé)
 *     Action  : auto-transition vers `commission_due` (pas d'action externe ;
 *               la commission devient due dès que le client est payé).
 *
 * Garanties :
 *   - PAS de régression d'état : transitions forward strictement validées par
 *     trigger SQL `cee_dossiers_check_status_transition` (mig 433).
 *   - Idempotent : 2e run trouve uniquement les dossiers restants.
 *   - Par-dossier try/catch isolé.
 *   - Cap 500 dossiers/run + lease anti-double-run.
 *   - Zéro PII dans les logs.
 *
 * Auth : fail-closed sur CRON_SECRET absent + timingSafeEqual.
 *
 * Schedule : 1 × par heure (cf. `vercel.json`).
 */

import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { transitionCeeDossierStatus } from '@/lib/cee/dossiers'
import type { CeeDossierV3Status } from '@/lib/cee/dossier-transitions'

export const dynamic = 'force-dynamic'

const MAX_DOSSIERS_PER_RUN = 500
const QA_APPROVED_STALE_HOURS = 24
const DEPOSITED_OVERDUE_DAYS = 14
const VALIDATED_PNCEE_OVERDUE_DAYS = 7
const PAID_CLIENT_AUTO_TRANSITION_HOURS = 1
// Plan D — SLA fix : Vercel maxDuration cron = 60s. Sécurité : sortir 10s
// avant le hard-timeout pour permettre release du lease + JSON response.
// 500 dossiers × 150ms RPC = 75s théorique → wall-clock guard obligatoire.
const MAX_RUNTIME_MS = 50_000

const LEASE_NAME = 'cee_dossier_transitions'
const LEASE_TTL_SECONDS = 15 * 60

type AlertCounters = {
  qa_approved_stale: number
  deposited_overdue: number
  validated_pncee_overdue: number
  paid_client_to_commission_due: number
}

function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  try {
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

function extractBearer(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}

type DossierRow = {
  id: string
  status: CeeDossierV3Status
  operation_code: string
  created_at: string
  updated_at: string
}

const DOSSIER_MIN_SELECT = 'id,status,operation_code,created_at,updated_at'

function ageBeforeIso(amount: number, unit: 'hours' | 'days', now: Date = new Date()): string {
  const ms = unit === 'hours' ? amount * 3600 * 1000 : amount * 24 * 3600 * 1000
  return new Date(now.getTime() - ms).toISOString()
}

async function handleCeeDossierTransitions(request: Request): Promise<Response> {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    logger.error('cee-dossier-transitions: CRON_SECRET not configured', undefined, {
      action: 'cee-dossier-transitions',
    })
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const provided = extractBearer(request)
  if (!safeCompare(provided, expected)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()

  // Plan D — SLA fix : abort lease acquisition après 5s. Si Supabase stall ici,
  // le cron meurt en silence (Sentry checkin ne fire pas). Fail-fast → release
  // implicite via TTL 15min puis retry au prochain tick.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = {
      message:
        err instanceof Error
          ? err.name === 'AbortError' || err.message.includes('aborted')
            ? 'lease_acquire_timeout'
            : err.message
          : String(err),
    }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('cee-dossier-transitions: lease acquisition failed', leaseErr, {
      action: 'cee-dossier-transitions',
      lease: LEASE_NAME,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }

  if (acquired !== true) {
    logger.info('cee-dossier-transitions: skipped (lease already held)', {
      action: 'cee-dossier-transitions',
      lease: LEASE_NAME,
    })
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  const counters: AlertCounters = {
    qa_approved_stale: 0,
    deposited_overdue: 0,
    validated_pncee_overdue: 0,
    paid_client_to_commission_due: 0,
  }
  let processed = 0
  let remainingBudget = MAX_DOSSIERS_PER_RUN

  // Plan D — SLA fix : wall-clock guard global. Si une règle précédente brûle
  // tout le budget (Supabase 503 + retry, etc.), les règles suivantes doivent
  // s'auto-skip pour relâcher le lease + retourner une réponse JSON avant le
  // hard-timeout Vercel 60s.
  const isOverWallClock = (): boolean => Date.now() - startedAt > MAX_RUNTIME_MS

  try {
    // -- Règle A — qa_approved âgés > 24h → alerte ops (manual depose Sonergia) --
    if (remainingBudget > 0 && !isOverWallClock()) {
      const staleBefore = ageBeforeIso(QA_APPROVED_STALE_HOURS, 'hours')
      const { data, error } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'qa_approved')
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (error) {
        logger.error('cee-dossier-transitions: list qa_approved failed', error, {
          rule: 'A_qa_approved_stale',
        })
      } else {
        const rows = (data ?? []) as DossierRow[]
        counters.qa_approved_stale = rows.length
        processed += rows.length
        remainingBudget -= rows.length
        if (rows.length > 0) {
          // Sentry capture pour visibilité ops backoffice
          Sentry.captureMessage('CEE: dossiers qa_approved stuck (manual depose required)', {
            level: rows.length > 50 ? 'error' : 'warning',
            tags: {
              cron: 'cee-dossier-transitions',
              rule: 'qa_approved_stale',
              action_required: 'manual_sonergia_depose',
            },
            extra: {
              count: rows.length,
              oldest_dossier_id: rows[0].id,
              oldest_age_hours: Math.round(
                (Date.now() - new Date(rows[0].updated_at).getTime()) / 3600000
              ),
              stale_threshold_hours: QA_APPROVED_STALE_HOURS,
            },
          })
          logger.warn('cee-dossier-transitions: qa_approved stuck', {
            rule: 'A_qa_approved_stale',
            count: rows.length,
            dossier_ids: rows.map((r) => r.id),
          })
        }
      }
    }

    // -- Règle B — deposited > 14j → alerte ops (relancer délégataire) ----------
    if (remainingBudget > 0 && !isOverWallClock()) {
      const staleBefore = ageBeforeIso(DEPOSITED_OVERDUE_DAYS, 'days')
      const { data, error } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'deposited')
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (error) {
        logger.error('cee-dossier-transitions: list deposited failed', error, {
          rule: 'B_deposited_overdue',
        })
      } else {
        const rows = (data ?? []) as DossierRow[]
        counters.deposited_overdue = rows.length
        processed += rows.length
        remainingBudget -= rows.length
        if (rows.length > 0) {
          Sentry.captureMessage('CEE: dossiers deposited overdue (relancer délégataire)', {
            level: 'warning',
            tags: {
              cron: 'cee-dossier-transitions',
              rule: 'deposited_overdue',
              action_required: 'chase_delegataire',
            },
            extra: {
              count: rows.length,
              oldest_dossier_id: rows[0].id,
              overdue_threshold_days: DEPOSITED_OVERDUE_DAYS,
            },
          })
          logger.warn('cee-dossier-transitions: deposited overdue', {
            rule: 'B_deposited_overdue',
            count: rows.length,
            dossier_ids: rows.map((r) => r.id),
          })
        }
      }
    }

    // -- Règle C — validated_pncee > 7j → alerte ops (versement client) ---------
    if (remainingBudget > 0 && !isOverWallClock()) {
      const staleBefore = ageBeforeIso(VALIDATED_PNCEE_OVERDUE_DAYS, 'days')
      const { data, error } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'validated_pncee')
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (error) {
        logger.error('cee-dossier-transitions: list validated_pncee failed', error, {
          rule: 'C_validated_pncee_overdue',
        })
      } else {
        const rows = (data ?? []) as DossierRow[]
        counters.validated_pncee_overdue = rows.length
        processed += rows.length
        remainingBudget -= rows.length
        if (rows.length > 0) {
          Sentry.captureMessage('CEE: dossiers validated_pncee overdue (versement client)', {
            level: 'warning',
            tags: {
              cron: 'cee-dossier-transitions',
              rule: 'validated_pncee_overdue',
              action_required: 'pay_client',
            },
            extra: {
              count: rows.length,
              oldest_dossier_id: rows[0].id,
              overdue_threshold_days: VALIDATED_PNCEE_OVERDUE_DAYS,
            },
          })
          logger.warn('cee-dossier-transitions: validated_pncee overdue', {
            rule: 'C_validated_pncee_overdue',
            count: rows.length,
            dossier_ids: rows.map((r) => r.id),
          })
        }
      }
    }

    // -- Règle D — paid_client > 1h → auto-transition commission_due ------------
    // Aucun appel externe : marquer la commission comme due ne dépend que de
    // l'état interne (le client est payé). Auto-transition safe.
    if (remainingBudget > 0 && !isOverWallClock()) {
      const staleBefore = ageBeforeIso(PAID_CLIENT_AUTO_TRANSITION_HOURS, 'hours')
      const { data, error } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'paid_client')
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (error) {
        logger.error('cee-dossier-transitions: list paid_client failed', error, {
          rule: 'D_paid_client_auto',
        })
      } else {
        const rows = (data ?? []) as DossierRow[]
        for (const row of rows) {
          if (remainingBudget <= 0) break
          // Plan D — SLA wall-clock guard : sortir avant timeout Vercel 60s.
          if (Date.now() - startedAt > MAX_RUNTIME_MS) {
            logger.warn('cee-dossier-transitions: wall-clock budget exhausted', {
              rule: 'D_paid_client_auto',
              processed,
              remaining_dossiers: rows.length - rows.indexOf(row),
            })
            break
          }
          remainingBudget--
          processed++
          try {
            const result = await transitionCeeDossierStatus(
              supabase,
              row.id,
              'commission_due' as never,
              null,
              'system'
            )
            if (result.ok) {
              counters.paid_client_to_commission_due++
              logger.info('cee-dossier-transitions: transition ok', {
                rule: 'D_paid_client_auto',
                dossier_id: row.id,
                from: 'paid_client',
                to: 'commission_due',
              })
            } else {
              logger.warn('cee-dossier-transitions: transition rejected', {
                rule: 'D_paid_client_auto',
                dossier_id: row.id,
                error: result.error ?? 'unknown',
              })
            }
          } catch (err) {
            logger.warn('cee-dossier-transitions: rule D dossier aborted', {
              rule: 'D_paid_client_auto',
              dossier_id: row.id,
              error: err instanceof Error ? err.message : 'unknown',
            })
          }
        }
      }
    }

    const durationMs = Date.now() - startedAt
    logger.info('cee-dossier-transitions: run complete', {
      action: 'cee-dossier-transitions',
      processed,
      counters,
      duration_ms: durationMs,
      cap_reached: remainingBudget === 0,
    })

    return NextResponse.json({
      ok: true,
      processed,
      counters,
      cap: MAX_DOSSIERS_PER_RUN,
      duration_ms: durationMs,
    })
  } finally {
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch (releaseErr) {
      logger.warn('cee-dossier-transitions: lease release failed', {
        lease: LEASE_NAME,
        error: releaseErr instanceof Error ? releaseErr.message : 'unknown',
      })
    }
  }
}

export const GET = withCronCheckIn('cron-cee-dossier-transitions', handleCeeDossierTransitions)
