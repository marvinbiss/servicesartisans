import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * Monthly cron: Purge RGPD des contacts de prospection
 *
 * Conformité CNIL / RGPD Art. 5.1.e (limitation de conservation) :
 *   - Seuil soft : 3 ans après dernier contact actif
 *     → archive intermédiaire + anonymisation du contact en place
 *   - Seuil hard : 5 ans après archivage
 *     → suppression définitive de la table archive
 *
 * "Dernier contact actif" =
 *   GREATEST(contact.updated_at, MAX(prospection_messages.sent_at)).
 *
 * Le soft-delete conserve l'id du contact pour préserver la cohérence des FK
 * avec prospection_messages (preuve d'envoi en cas de contrôle).
 *
 * Schedule Vercel : "0 3 1 * *" (3h UTC le 1er de chaque mois)
 * Auth : header `Authorization: Bearer ${CRON_SECRET}`
 * Debug : `?dry_run=true` — retourne le count sans muter.
 */

export const maxDuration = 60

// Safeguards
// BATCH_LIMIT réduit à 2000 pour tenir dans les 60s Vercel avec marge :
// 2000 contacts / chunks de 200 = 10 roundtrips archive + 10 soft-delete + 10 fetch
// = ~30 roundtrips Supabase, largement sous la limite.
const BATCH_LIMIT = 2_000
const WARN_THRESHOLD = 50_000
// Chunks de 200 : moins de roundtrips qu'avec 100, plus de débit, payload
// archive encore raisonnable (~200 rows × ~30 colonnes).
const ARCHIVE_CHUNK = 200

type Candidate = {
  id: string
  last_activity: string | null
}

/**
 * Construit le payload d'anonymisation RGPD pour un contact.
 *
 * Stratégie (conforme CNIL : anonymisation = données non réidentifiables) :
 *   - email          → placeholder `anonymized-${id}@deleted.invalid` (domaine .invalid RFC 2606)
 *   - phone          → chaîne vide (colonne nullable mais on préfère un placeholder explicite)
 *   - phone_e164     → null (respecte le format E.164, null = pas de numéro)
 *   - custom_fields  → '{}'::jsonb (vide mais structure préservée)
 *   - is_active      → false
 *   - anonymized_at  → now() (colonne ajoutée par migration 396)
 *
 * Note : les colonnes email/phone/phone_e164/custom_fields sont toutes NULLABLE
 * dans le schéma (migration 300), mais on utilise des placeholders plutôt que
 * null pour :
 *   1. Tracer visuellement qu'un contact a été anonymisé (vs un contact vide)
 *   2. Éviter les collisions sur l'unique index partial email_canonical si
 *      jamais le contact est réactivé par erreur
 *   3. Faciliter les audits (grep 'anonymized-' trouve tous les anonymisés)
 */
function buildAnonymizedPayload(contactId: string): Record<string, unknown> {
  return {
    is_active: false,
    email: `anonymized-${contactId}@deleted.invalid`,
    phone: '',
    phone_e164: null,
    custom_fields: {},
    anonymized_at: new Date().toISOString(),
  }
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dry_run') === 'true'
  const startTime = Date.now()
  const supabase = createAdminClient()

  // Cutoff : 3 ans en arrière (fin de journée pour inclusivité)
  const cutoffDate = new Date()
  cutoffDate.setUTCFullYear(cutoffDate.getUTCFullYear() - 3)
  const cutoffIso = cutoffDate.toISOString()
  const cutoffDay = cutoffIso.slice(0, 10)

  let softDeleted = 0
  let hardDeleted = 0
  let candidateCount = 0
  let errorMessage: string | null = null
  // Traçabilité reprise manuelle : contacts archivés mais dont l'anonymisation
  // a échoué. À rejouer manuellement (ou au prochain run si updated_at non touché).
  const archivedButNotAnonymized: string[] = []
  // Collecte de toutes les erreurs de soft-delete sur tout le run (pas juste la
  // première) pour éviter le masquage silencieux.
  const softDeleteErrors: { contactId: string; message: string }[] = []

  try {
    // -------------------------------------------------------------------
    // Step 1 — SELECT candidats
    // Critère : is_active = true ET updated_at < cutoff
    // Puis raffinement : vérifier MAX(prospection_messages.sent_at) > cutoff
    // pour exclure les contacts recemment relances.
    // -------------------------------------------------------------------
    const { data: rawCandidates, error: selectError } = await supabase
      .from('prospection_contacts')
      .select('id, updated_at')
      .eq('is_active', true)
      .lt('updated_at', cutoffIso)
      .order('updated_at', { ascending: true })
      .limit(BATCH_LIMIT)

    if (selectError) {
      throw new Error(`SELECT candidats: ${selectError.message}`)
    }

    const initialIds = (rawCandidates ?? []).map((r) => r.id as string)

    // Filtrage via prospection_messages : exclure ceux avec sent_at >= cutoff
    let candidates: Candidate[] = []
    if (initialIds.length > 0) {
      const { data: recentMessages, error: msgError } = await supabase
        .from('prospection_messages')
        .select('contact_id, sent_at')
        .in('contact_id', initialIds)
        .gte('sent_at', cutoffIso)

      if (msgError) {
        throw new Error(`SELECT prospection_messages: ${msgError.message}`)
      }

      const recentlyContacted = new Set((recentMessages ?? []).map((m) => m.contact_id as string))

      candidates = (rawCandidates ?? [])
        .filter((r) => !recentlyContacted.has(r.id as string))
        .map((r) => ({
          id: r.id as string,
          last_activity: (r.updated_at as string) ?? null,
        }))
    }

    candidateCount = candidates.length

    if (candidateCount === 0 && !dryRun) {
      // Log informatif — l'insert purge_log final (Step 5) tracera quand même
      // ce run avec contacts_soft_deleted=0 pour l'audit trail.
      logger.info('[purge-prospection] runtime: 0 contacts à purger', {
        action: 'purge-prospection',
        cutoff: cutoffDay,
      })
    }

    if (candidateCount >= WARN_THRESHOLD) {
      logger.warn('[purge-prospection] Seuil critique atteint', {
        action: 'purge-prospection',
        count: candidateCount,
        threshold: WARN_THRESHOLD,
        hint: "Le cron n'a probablement pas tourné depuis longtemps.",
      })
    }

    // DRY RUN : on retourne sans muter
    if (dryRun) {
      const durationMs = Date.now() - startTime
      logger.info('[purge-prospection] DRY RUN', {
        action: 'purge-prospection',
        candidates: candidateCount,
        cutoff: cutoffDay,
        durationMs,
      })

      // Audit trail du dry run (utile pour monitoring)
      await supabase.from('prospection_purge_log').insert({
        contacts_soft_deleted: 0,
        contacts_hard_deleted: 0,
        oldest_activity_cutoff: cutoffDay,
        duration_ms: durationMs,
        dry_run: true,
      })

      return NextResponse.json({
        ok: true,
        dryRun: true,
        candidates: candidateCount,
        cutoff: cutoffDay,
        durationMs,
      })
    }

    // -------------------------------------------------------------------
    // Step 2 + 3 — Archive puis soft-delete, par chunks
    // Ordre critique : archive AVANT soft-delete, ET le soft-delete n'est
    // exécuté QUE si l'archive a réussi (fail-close).
    //
    // Trade-off sans transaction : supabase-js ne supporte pas les
    // transactions SQL natives côté client. Mitigation :
    //   - L'UPSERT archive est idempotent (ON CONFLICT id) → un crash
    //     mi-run relance safely (les contacts déjà archivés ne sont pas
    //     dupliqués, les contacts déjà anonymisés seront ignorés par la
    //     query initiale car leur updated_at est now()).
    //   - Un contact peut théoriquement être archivé sans être soft-deleted
    //     si le process crash entre les deux. Le prochain run le reprendra.
    // -------------------------------------------------------------------
    for (let i = 0; i < candidates.length; i += ARCHIVE_CHUNK) {
      const chunk = candidates.slice(i, i + ARCHIVE_CHUNK)
      const chunkIds = chunk.map((c) => c.id)

      // Fetch full rows pour l'archive
      const { data: fullRows, error: fetchError } = await supabase
        .from('prospection_contacts')
        .select('*')
        .in('id', chunkIds)

      if (fetchError) {
        throw new Error(`Fetch chunk ${i}: ${fetchError.message}`)
      }
      if (!fullRows || fullRows.length === 0) continue

      // Étape 2 : UPSERT dans l'archive (idempotent)
      const archiveRows = fullRows.map((row) => ({
        ...row,
        archived_at: new Date().toISOString(),
      }))

      const { error: archiveError } = await supabase
        .from('prospection_contacts_archive')
        .upsert(archiveRows, { onConflict: 'id' })

      if (archiveError) {
        throw new Error(`Archive chunk ${i}: ${archiveError.message}`)
      }

      // Étape 3 : soft-delete + anonymisation (seulement si archive OK).
      // On update ligne par ligne car le placeholder email contient l'id
      // du contact (`anonymized-${id}@deleted.invalid`). Les updates du
      // chunk sont émis en parallèle via Promise.all pour limiter la
      // latence cumulée.
      //
      // Traçabilité drift archive/soft-delete : on log le batch en cours
      // AVANT l'update. Si un crash survient entre l'archive (déjà commitée
      // ci-dessus) et l'update, les logs permettent de retrouver les ids
      // archivés mais toujours actifs pour une reprise manuelle.
      logger.info('[purge-prospection] Soft-delete chunk en cours', {
        action: 'purge-prospection',
        chunkIndex: i,
        chunkSize: chunkIds.length,
        contactIds: chunkIds,
      })

      const softDeleteResults = await Promise.all(
        chunkIds.map(async (contactId) => {
          const { error } = await supabase
            .from('prospection_contacts')
            .update(buildAnonymizedPayload(contactId))
            .eq('id', contactId)
          return { contactId, error }
        })
      )

      // Compter les succès réels (pas chunkIds.length) + collecter toutes
      // les erreurs (pas juste la première) pour éviter le masquage.
      for (const result of softDeleteResults) {
        if (result.error) {
          softDeleteErrors.push({
            contactId: result.contactId,
            message: result.error.message,
          })
          archivedButNotAnonymized.push(result.contactId)
        } else {
          softDeleted += 1
        }
      }
    }

    // Log consolidé de toutes les erreurs de soft-delete sur tout le run.
    // On ne throw qu'après la boucle complète : les chunks suivants ont
    // pu être traités, et on a besoin de la liste complète pour la reprise.
    if (softDeleteErrors.length > 0) {
      logger.error('[purge-prospection] Erreurs soft-delete (toutes)', {
        action: 'purge-prospection',
        totalErrors: softDeleteErrors.length,
        errors: softDeleteErrors,
        archived_but_not_anonymized: archivedButNotAnonymized,
        hint: 'Ces contacts sont archivés mais toujours actifs. Reprise manuelle requise.',
      })
      throw new Error(
        `Soft-delete: ${softDeleteErrors.length} erreur(s), premier échec contact=${softDeleteErrors[0]?.contactId ?? 'unknown'}: ${softDeleteErrors[0]?.message ?? 'unknown'}`
      )
    }

    // -------------------------------------------------------------------
    // Step 4 — Hard-delete de l'archive (> 5 ans)
    // -------------------------------------------------------------------
    const hardCutoff = new Date()
    hardCutoff.setUTCFullYear(hardCutoff.getUTCFullYear() - 5)
    const hardCutoffIso = hardCutoff.toISOString()

    const { data: hardDeletedRows, error: hardDeleteError } = await supabase
      .from('prospection_contacts_archive')
      .delete()
      .lt('archived_at', hardCutoffIso)
      .select('id')

    if (hardDeleteError) {
      throw new Error(`Hard-delete archive: ${hardDeleteError.message}`)
    }

    hardDeleted = hardDeletedRows?.length ?? 0

    // -------------------------------------------------------------------
    // Step 5 — Log succès
    // -------------------------------------------------------------------
    const durationMs = Date.now() - startTime

    await supabase.from('prospection_purge_log').insert({
      contacts_soft_deleted: softDeleted,
      contacts_hard_deleted: hardDeleted,
      oldest_activity_cutoff: cutoffDay,
      duration_ms: durationMs,
      dry_run: false,
    })

    logger.info('[purge-prospection] Terminé', {
      action: 'purge-prospection',
      softDeleted,
      hardDeleted,
      cutoff: cutoffDay,
      durationMs,
    })

    return NextResponse.json({
      ok: true,
      softDeleted,
      hardDeleted,
      cutoff: cutoffDay,
      durationMs,
    })
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error)
    const durationMs = Date.now() - startTime

    logger.error('[purge-prospection] Erreur', {
      action: 'purge-prospection',
      error: errorMessage,
      softDeletedBeforeError: softDeleted,
      softDeleteErrorsCount: softDeleteErrors.length,
      softDeleteErrors,
      archived_but_not_anonymized: archivedButNotAnonymized,
      cutoff: cutoffDay,
      durationMs,
    })

    // Fail-close : on log l'erreur dans purge_log AVANT de retourner
    try {
      await supabase.from('prospection_purge_log').insert({
        contacts_soft_deleted: softDeleted,
        contacts_hard_deleted: hardDeleted,
        oldest_activity_cutoff: cutoffDay,
        duration_ms: durationMs,
        error_message: errorMessage,
        dry_run: dryRun,
      })
    } catch (logError) {
      logger.error("[purge-prospection] Impossible de logger l'erreur dans purge_log", {
        action: 'purge-prospection',
        error: logError instanceof Error ? logError.message : String(logError),
      })
    }

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        softDeleted,
        hardDeleted,
        cutoff: cutoffDay,
        durationMs,
      },
      { status: 500 }
    )
  }
}
