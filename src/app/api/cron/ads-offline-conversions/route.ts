/**
 * Cron — Offline Conversion Import vers Google Ads (mig 551).
 *
 * Objectif
 * --------
 * Fermer la boucle d'attribution paid : un lead issu d'un clic Google Ads est
 * remonté à Ads AU MOMENT où il prend de la valeur (dispatché à un artisan,
 * puis devisé), et non au moment où le formulaire est soumis. Sans cela le
 * Smart Bidding enchérit sur du volume de formulaires — dont une partie n'est
 * jamais dispatchable (zone sans artisan, doublon, faux numéro).
 *
 * Événements remontés
 * -------------------
 *   `lead_dispatched` — au moins une ligne `lead_assignments` existe.
 *                       conversionAt = date de la 1re affectation.
 *   `lead_quoted`     — au moins une affectation en statut 'quoted'.
 *
 * Idempotence
 * -----------
 * `ads_conversion_uploads` porte UNIQUE(devis_request_id, conversion_action).
 * Un double envoi gonflerait le compteur de conversions côté Ads et fausserait
 * les enchères : le journal est écrit APRÈS confirmation d'upload, et les
 * conversions rejetées en partial-failure ne sont pas journalisées — elles
 * repassent au run suivant.
 *
 * Fenêtre
 * -------
 * Google refuse un click-ID de plus de 90 jours. On borne la requête en
 * conséquence : au-delà, la conversion est définitivement perdue et insister
 * ne ferait que consommer du quota.
 *
 * No-op propre si `GOOGLE_ADS_*` n'est pas configuré (retour 200 skipped).
 *
 * Schedule : horaire (cf. vercel.json).
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import {
  getAdsConfig,
  getEnabledActionKeys,
  uploadClickConversions,
  type ClickConversion,
  type ConversionActionKey,
} from '@/lib/ads/google-ads-oci'
import {
  buildPendingConversions,
  type LeadAssignmentRow,
  type LeadClickRow,
} from '@/lib/ads/pending-conversions'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Limite Google : un click-ID de plus de 90 jours est refusé. */
const CLICK_ID_MAX_AGE_DAYS = 90

/** Cap dur par run — évite un premier run massif après back-fill. */
const MAX_CONVERSIONS_PER_RUN = 500

/** Taille de lot envoyée à l'API (Google accepte davantage ; on reste prudent). */
const UPLOAD_BATCH_SIZE = 200

/** Nombre de leads candidats lus en base par run. */
const MAX_LEADS_SCANNED = 2_000

// SLA-99.9 : wall-clock sous le maxDuration Vercel + lease anti-double-run.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_ads_offline_conversions'
const LEASE_TTL_SECONDS = 15 * 60

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const GET = withCronCheckIn('cron-ads-offline-conversions', async (request: Request) => {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const cfg = getAdsConfig()
  if (!cfg) {
    logger.info('ads-offline-conversions: Google Ads not configured, skipping', {
      action: 'ads-offline-conversions',
    })
    return NextResponse.json({ skipped: true, reason: 'not_configured' })
  }

  const enabledActions = getEnabledActionKeys(cfg)
  if (enabledActions.length === 0) {
    logger.warn('ads-offline-conversions: no conversion action resource name configured', {
      action: 'ads-offline-conversions',
    })
    return NextResponse.json({ skipped: true, reason: 'no_conversion_action' })
  }

  const supabase = createAdminClient()

  // -- Lease anti-double-run -------------------------------------------------
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
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('ads-offline-conversions: lease acquisition failed', undefined, {
      action: 'ads-offline-conversions',
      error: leaseErr.message,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    return NextResponse.json({ skipped: true, reason: 'lease_not_acquired' })
  }

  const startedAt = Date.now()
  let uploadedCount = 0
  let rejectedCount = 0

  try {
    // -- Candidats -----------------------------------------------------------
    const windowStart = new Date(
      Date.now() - CLICK_ID_MAX_AGE_DAYS * 24 * 3600 * 1000
    ).toISOString()

    const { data: leads, error: leadsError } = await supabase
      .from('devis_requests')
      .select('id, gclid, gbraid, wbraid, created_at')
      .gte('created_at', windowStart)
      .or('gclid.not.is.null,gbraid.not.is.null,wbraid.not.is.null')
      .order('created_at', { ascending: false })
      .limit(MAX_LEADS_SCANNED)
      .abortSignal(AbortSignal.timeout(10_000))

    if (leadsError) {
      logger.error('ads-offline-conversions: lead query failed', undefined, {
        action: 'ads-offline-conversions',
        error: leadsError.message,
      })
      return NextResponse.json({ error: 'query_failed' }, { status: 500 })
    }

    const leadRows = (leads ?? []) as LeadClickRow[]
    if (leadRows.length === 0) {
      return NextResponse.json({ ok: true, scanned: 0, uploaded: 0, rejected: 0 })
    }

    const leadIds = leadRows.map((l) => l.id)

    // -- Affectations + journal existant -------------------------------------
    const [assignmentsRes, uploadsRes] = await Promise.all([
      supabase
        .from('lead_assignments')
        .select('lead_id, status, assigned_at')
        .in('lead_id', leadIds)
        .eq('source_table', 'devis_requests')
        .abortSignal(AbortSignal.timeout(10_000)),
      supabase
        .from('ads_conversion_uploads')
        .select('devis_request_id, conversion_action')
        .in('devis_request_id', leadIds)
        .abortSignal(AbortSignal.timeout(10_000)),
    ])

    if (assignmentsRes.error || uploadsRes.error) {
      logger.error('ads-offline-conversions: join query failed', undefined, {
        action: 'ads-offline-conversions',
        error: assignmentsRes.error?.message ?? uploadsRes.error?.message,
      })
      return NextResponse.json({ error: 'query_failed' }, { status: 500 })
    }

    const assignmentsByLead = new Map<string, LeadAssignmentRow[]>()
    for (const row of (assignmentsRes.data ?? []) as LeadAssignmentRow[]) {
      const list = assignmentsByLead.get(row.lead_id)
      if (list) list.push(row)
      else assignmentsByLead.set(row.lead_id, [row])
    }

    const uploadedByLead = new Map<string, Set<ConversionActionKey>>()
    for (const row of (uploadsRes.data ?? []) as Array<{
      devis_request_id: string
      conversion_action: string
    }>) {
      const set = uploadedByLead.get(row.devis_request_id) ?? new Set<ConversionActionKey>()
      set.add(row.conversion_action as ConversionActionKey)
      uploadedByLead.set(row.devis_request_id, set)
    }

    // -- Construction de la file ---------------------------------------------
    const pending: Array<{ leadId: string; conversion: ClickConversion }> = []
    for (const lead of leadRows) {
      if (pending.length >= MAX_CONVERSIONS_PER_RUN) break
      const conversions = buildPendingConversions(
        lead,
        assignmentsByLead.get(lead.id) ?? [],
        uploadedByLead.get(lead.id) ?? new Set<ConversionActionKey>(),
        enabledActions
      )
      for (const conversion of conversions) {
        pending.push({ leadId: lead.id, conversion })
      }
    }

    if (pending.length === 0) {
      return NextResponse.json({
        ok: true,
        scanned: leadRows.length,
        uploaded: 0,
        rejected: 0,
      })
    }

    // -- Upload par lots ------------------------------------------------------
    for (let i = 0; i < pending.length; i += UPLOAD_BATCH_SIZE) {
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        logger.warn('ads-offline-conversions: wall-clock budget reached, stopping early', {
          action: 'ads-offline-conversions',
          processed: i,
          total: pending.length,
        })
        break
      }

      const batch = pending.slice(i, i + UPLOAD_BATCH_SIZE)
      const outcome = await uploadClickConversions(batch.map((b) => b.conversion))
      rejectedCount += outcome.rejected.length

      // Journalisation APRÈS confirmation. Les rejets ne sont pas journalisés
      // et repasseront au prochain run.
      const uploadedSet = new Set(outcome.uploaded)
      const journalRows = batch
        .filter((b) => uploadedSet.has(b.conversion))
        .map((b) => ({
          devis_request_id: b.leadId,
          conversion_action: b.conversion.actionKey,
          click_id: b.conversion.clickId,
          click_id_type: b.conversion.clickIdType,
          conversion_value_eur: b.conversion.valueEur ?? null,
          conversion_at: b.conversion.conversionAt.toISOString(),
        }))

      if (journalRows.length > 0) {
        const { error: insertError } = await supabase
          .from('ads_conversion_uploads')
          .upsert(journalRows, {
            onConflict: 'devis_request_id,conversion_action',
            ignoreDuplicates: true,
          })

        if (insertError) {
          // Le journal a échoué mais Google a bien reçu les conversions : le
          // run suivant les ré-enverrait. On remonte en erreur pour que ce cas
          // soit visible plutôt que silencieusement dupliqué.
          logger.error('ads-offline-conversions: journal insert failed after upload', undefined, {
            action: 'ads-offline-conversions',
            error: insertError.message,
            count: journalRows.length,
          })
          return NextResponse.json({ error: 'journal_insert_failed' }, { status: 500 })
        }
        uploadedCount += journalRows.length
      }
    }

    logger.info('ads-offline-conversions: run complete', {
      action: 'ads-offline-conversions',
      scanned: leadRows.length,
      uploaded: uploadedCount,
      rejected: rejectedCount,
    })

    return NextResponse.json({
      ok: true,
      scanned: leadRows.length,
      uploaded: uploadedCount,
      rejected: rejectedCount,
    })
  } catch (error) {
    logger.error('ads-offline-conversions: unexpected error', error, {
      action: 'ads-offline-conversions',
    })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  } finally {
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : le TTL sert de filet
    }
  }
})
