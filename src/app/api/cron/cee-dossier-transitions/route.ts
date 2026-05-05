/**
 * Cron CEE — réconciliation des transitions de dossiers (brique 6 mandataire CEE).
 *
 * Objectif :
 *   Aucun worker ne fait avancer automatiquement les dossiers CEE dans le DAG
 *   à 12 états défini par la migration 402. Ce cron scanne les dossiers en
 *   statut intermédiaire et déclenche les transitions "mécaniques" évidentes :
 *
 *     Règle A — detect_missing_justificatifs
 *       Scope   : `engagement_signe` âgés > 24 h
 *       Action  : pas de transition (aucun état "incomplets" dans le DAG),
 *                 log.warn structuré listant les codes manquants pour alerter
 *                 le backoffice mandataire.
 *
 *     Règle B — travaux_acheves_ready_to_sign_ah
 *       Scope   : `travaux_acheves` avec `getJustificatifsGap.complete === true`
 *       Action  : transition `travaux_acheves` → `ah_signee`
 *                 (= justificatifs prêts, dossier peut passer à la signature AH)
 *
 *     Règle C — depose_delegataire_acquittement_assumed
 *       Scope   : `depose_delegataire` âgés > 48 h
 *       Action  : transition `depose_delegataire` → `depose_pncee`
 *                 (= acquittement délégataire présumé reçu)
 *
 * Règles transverses (garanties par le code et le trigger SQL migration 402) :
 *   - PAS de régression d'état : on ne cible que des transitions forward
 *     autorisées par `cee_dossiers_validate_status_transition`.
 *   - Idempotent : une 2e exécution dans la même heure ne trouvera que les
 *     dossiers restants (ceux déjà transités ne matchent plus le filtre de
 *     statut source).
 *   - Par-dossier try/catch : l'erreur d'un dossier n'annule pas les autres.
 *   - Cap 500 dossiers/run pour borner la durée d'exécution et la charge DB.
 *   - Zéro PII dans les logs.
 *
 * Auth :
 *   - Fail-closed sur `CRON_SECRET` absent.
 *   - Comparaison en temps constant via `crypto.timingSafeEqual`.
 *
 * Schedule : 1 × par heure (cf. `vercel.json`).
 */

import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import { transitionCeeDossierStatus } from '@/lib/cee/dossiers'
import { getJustificatifsGap } from '@/lib/cee/justificatifs'
import type { CeeDossierStatus } from '@/lib/cee/dossier-types'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Borne dure par run pour éviter qu'un cron bloque > maxDuration. */

const MAX_DOSSIERS_PER_RUN = 500

/** Âge minimum pour la règle A (détection justificatifs manquants). */
const ENGAGEMENT_STALE_HOURS = 24

/** Âge minimum pour la règle C (acquittement délégataire présumé). */
const DEPOSE_STALE_HOURS = 48

/** Nom du lease anti-double-run pour ce cron. */
const LEASE_NAME = 'cee_dossier_transitions'

/** TTL du lease : 15 min >> durée typique d'un run, < écart entre 2 crons horaires. */
const LEASE_TTL_SECONDS = 15 * 60

/**
 * Clés de compteur de transitions renvoyées dans la réponse JSON.
 * Format : `{from}_to_{to}` — stable pour monitoring externe.
 */
type TransitionKey = 'travaux_acheves_to_ah_signee' | 'depose_delegataire_to_depose_pncee'

type TransitionCounters = Record<TransitionKey, number>

// ---------------------------------------------------------------------------
// Auth helpers (fail-closed, temps constant)
// ---------------------------------------------------------------------------

/**
 * Compare deux secrets en temps constant. Retourne false si l'une des valeurs
 * est absente ou si les longueurs diffèrent (timingSafeEqual throw sinon).
 */
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

/**
 * Extrait le bearer depuis le header Authorization. Retourne null si absent
 * ou malformé.
 */
function extractBearer(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

/**
 * Représentation minimale d'un dossier retournée par nos requêtes batch.
 * On ne lit que les colonnes strictement nécessaires aux règles.
 */
interface DossierRow {
  id: string
  status: CeeDossierStatus
  operation_code: string
  created_at: string
  updated_at: string
}

const DOSSIER_MIN_SELECT = 'id,status,operation_code,created_at,updated_at'

/**
 * Calcule un ISO timestamp `now - hours`. Factorisé pour le test.
 */
function hoursAgoIso(hours: number, now: Date = new Date()): string {
  return new Date(now.getTime() - hours * 3600 * 1000).toISOString()
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

async function handleCeeDossierTransitions(request: Request): Promise<Response> {
  // -- Auth fail-closed -----------------------------------------------------
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

  // -- Lease anti-double-run ------------------------------------------------
  // Appel RPC atomique `acquire_cron_lease` (migration 411). Le précédent
  // pattern PostgREST `.upsert(...).lt(...).select()` était cassé : le `.lt()`
  // filtre la ligne retournée côté PostgREST, mais n'est PAS injecté dans le
  // `WHERE` du `ON CONFLICT DO UPDATE`. Ici, le `WHERE expires_at < NOW()` est
  // poussé dans le corps de la fonction plpgsql → atomicité garantie.
  const { data: acquired, error: leaseErr } = await supabase.rpc('acquire_cron_lease', {
    p_name: LEASE_NAME,
    p_ttl_seconds: LEASE_TTL_SECONDS,
  })

  if (leaseErr) {
    logger.error('cee-dossier-transitions: lease acquisition failed', leaseErr, {
      action: 'cee-dossier-transitions',
      lease: LEASE_NAME,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }

  if (acquired !== true) {
    // Lease actif détenu par un autre run → skip idempotent.
    logger.info('cee-dossier-transitions: skipped (lease already held)', {
      action: 'cee-dossier-transitions',
      lease: LEASE_NAME,
    })
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'already_running',
    })
  }

  const counters: TransitionCounters = {
    travaux_acheves_to_ah_signee: 0,
    depose_delegataire_to_depose_pncee: 0,
  }
  let processed = 0
  let remainingBudget = MAX_DOSSIERS_PER_RUN

  try {
    // -- Règle A — engagement_signe stale → log gap (no transition) ----------
    // Pas de transition DAG possible (aucun état "justificatifs_incomplets"),
    // mais on alerte le backoffice via log structuré.
    if (remainingBudget > 0) {
      const staleBefore = hoursAgoIso(ENGAGEMENT_STALE_HOURS)
      const { data: engagementRows, error: engagementErr } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'engagement_signe')
        // updated_at est TIMESTAMPTZ (migration 402) — comparaison ISO UTC safe
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (engagementErr) {
        logger.error('cee-dossier-transitions: list engagement_signe failed', engagementErr, {
          action: 'cee-dossier-transitions',
          rule: 'A_engagement_gap',
        })
      } else {
        const rows = (engagementRows ?? []) as DossierRow[]
        for (const row of rows) {
          if (remainingBudget <= 0) break
          remainingBudget--
          processed++
          try {
            const gap = await getJustificatifsGap(supabase, row.id)
            if (!gap.complete && gap.missing.length > 0) {
              logger.warn('cee-dossier-transitions: engagement_signe with missing justificatifs', {
                action: 'cee-dossier-transitions',
                rule: 'A_engagement_gap',
                dossier_id: row.id,
                operation_code: row.operation_code,
                missing_count: gap.missing.length,
                missing_codes: gap.missing,
              })
            }
          } catch (err) {
            logger.warn('cee-dossier-transitions: engagement gap check failed', {
              action: 'cee-dossier-transitions',
              rule: 'A_engagement_gap',
              dossier_id: row.id,
              error: err instanceof Error ? err.message : 'unknown',
            })
          }
        }
      }
    }

    // -- Règle B — travaux_acheves + gap complet → ah_signee ------------------
    if (remainingBudget > 0) {
      const { data: travauxRows, error: travauxErr } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'travaux_acheves')
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (travauxErr) {
        logger.error('cee-dossier-transitions: list travaux_acheves failed', travauxErr, {
          action: 'cee-dossier-transitions',
          rule: 'B_ready_to_sign_ah',
        })
      } else {
        const rows = (travauxRows ?? []) as DossierRow[]
        for (const row of rows) {
          if (remainingBudget <= 0) break
          remainingBudget--
          processed++
          try {
            const gap = await getJustificatifsGap(supabase, row.id)
            if (!gap.complete) continue

            const result = await transitionCeeDossierStatus(
              supabase,
              row.id,
              'ah_signee',
              null,
              'system'
            )
            if (result.ok) {
              counters.travaux_acheves_to_ah_signee++
              logger.info('cee-dossier-transitions: transition ok', {
                action: 'cee-dossier-transitions',
                rule: 'B_ready_to_sign_ah',
                dossier_id: row.id,
                from: 'travaux_acheves',
                to: 'ah_signee',
              })
            } else {
              logger.warn('cee-dossier-transitions: transition rejected', {
                action: 'cee-dossier-transitions',
                rule: 'B_ready_to_sign_ah',
                dossier_id: row.id,
                error: result.error ?? 'unknown',
              })
            }
          } catch (err) {
            logger.warn('cee-dossier-transitions: rule B dossier aborted', {
              action: 'cee-dossier-transitions',
              rule: 'B_ready_to_sign_ah',
              dossier_id: row.id,
              error: err instanceof Error ? err.message : 'unknown',
            })
          }
        }
      }
    }

    // -- Règle C — depose_delegataire > 48h → depose_pncee --------------------
    if (remainingBudget > 0) {
      const staleBefore = hoursAgoIso(DEPOSE_STALE_HOURS)
      const { data: deposeRows, error: deposeErr } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_MIN_SELECT)
        .eq('status', 'depose_delegataire')
        // updated_at est TIMESTAMPTZ (migration 402) — comparaison ISO UTC safe
        .lte('updated_at', staleBefore)
        .order('updated_at', { ascending: true })
        .limit(remainingBudget)

      if (deposeErr) {
        logger.error('cee-dossier-transitions: list depose_delegataire failed', deposeErr, {
          action: 'cee-dossier-transitions',
          rule: 'C_depose_acquittement',
        })
      } else {
        const rows = (deposeRows ?? []) as DossierRow[]
        for (const row of rows) {
          if (remainingBudget <= 0) break
          remainingBudget--
          processed++
          try {
            const result = await transitionCeeDossierStatus(
              supabase,
              row.id,
              'depose_pncee',
              null,
              'system'
            )
            if (result.ok) {
              counters.depose_delegataire_to_depose_pncee++
              logger.info('cee-dossier-transitions: transition ok', {
                action: 'cee-dossier-transitions',
                rule: 'C_depose_acquittement',
                dossier_id: row.id,
                from: 'depose_delegataire',
                to: 'depose_pncee',
              })
            } else {
              logger.warn('cee-dossier-transitions: transition rejected', {
                action: 'cee-dossier-transitions',
                rule: 'C_depose_acquittement',
                dossier_id: row.id,
                error: result.error ?? 'unknown',
              })
            }
          } catch (err) {
            logger.warn('cee-dossier-transitions: rule C dossier aborted', {
              action: 'cee-dossier-transitions',
              rule: 'C_depose_acquittement',
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
      transitions: counters,
      duration_ms: durationMs,
      cap_reached: remainingBudget === 0,
    })

    return NextResponse.json({
      ok: true,
      processed,
      transitions: counters,
      cap: MAX_DOSSIERS_PER_RUN,
      duration_ms: durationMs,
    })
  } finally {
    // Release du lease : on appelle le RPC `release_cron_lease` qui force
    // `expires_at = NOW()` côté Postgres. Best-effort : en cas d'erreur DB,
    // le lease expirera naturellement après LEASE_TTL_SECONDS.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch (releaseErr) {
      logger.warn('cee-dossier-transitions: lease release failed', {
        action: 'cee-dossier-transitions',
        lease: LEASE_NAME,
        error: releaseErr instanceof Error ? releaseErr.message : 'unknown',
      })
    }
  }
}

export const GET = withCronCheckIn('cron-cee-dossier-transitions', handleCeeDossierTransitions)
