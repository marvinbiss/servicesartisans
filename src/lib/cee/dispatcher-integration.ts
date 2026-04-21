/**
 * CEE dispatcher integration — pont fire-and-forget entre `/api/devis` et
 * le dispatcher CEE (`src/lib/cee/dispatcher.ts`, brique 3).
 *
 * Design
 * ------
 * - **Fail-OPEN** : c'est la frontière tunnel devis ↔ brique CEE. Toute erreur
 *   interne doit être catchée ici (pas de re-throw). La soumission devis
 *   reste la source de vérité ; le dispatch CEE est une sur-couche best-effort.
 *   Le dispatcher lui-même est fail-SAFE (retourne `fallback_non_cee` ou
 *   `{ kind: 'error' }` au lieu de throw), mais on ceinture quand même à
 *   double tour au cas où une exception non prévue remonterait (typeerror, OOM,
 *   etc.).
 * - **Zéro PII dans les logs** : on ne log que devisId (UUID) et serviceSlug.
 *   Jamais de nom, email, téléphone, description — même en cas d'erreur.
 * - **Trace outcome sur le devis** : si le dispatcher retourne `cee_routed`,
 *   on UPDATE `devis_requests.cee_dossier_id = outcome.dossierId`. Sur
 *   `fallback_non_cee` ou `error`, aucune écriture (le devis reste "non CEE"
 *   côté colonne).
 * - **Idempotent vs Pipedrive** : ce helper est aligné sur le même pattern
 *   que la sync Pipedrive (try/catch, logger.error/warn, aucune erreur ne
 *   remonte au caller).
 *
 * Appel typique (depuis `src/app/api/devis/route.ts`) :
 *
 * ```ts
 * await runCeeDispatchFireAndForget(supabase, {
 *   devisId: lead.id,
 *   clientId: lead.client_id ?? lead.id,
 *   serviceSlug: data.service,
 *   postalCode: data.codePostal ?? null,
 *   candidateProviderIds: assignedProviders,
 * })
 * ```
 *
 * Le caller NE DOIT PAS attendre cette promesse pour retourner la réponse au
 * client : en pratique on l'`await`e quand même à cause de Vercel serverless
 * (les promesses non-awaited sont killed quand la réponse part), mais on la
 * wrap dans une race avec timeout court (voir `/api/devis/route.ts`).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { dispatchDevis, type DispatchOutcome } from './dispatcher'
import { sendCeeEligibilityEmail } from './emails'
import { sendCeeArtisanBriefing } from './artisan-notification'

export interface CeeDispatchInput {
  devisId: string
  clientId: string | null
  serviceSlug: string
  postalCode?: string | null
  candidateProviderIds: string[]
  /** Nom du client (pour l'email CEE éligibilité). */
  clientName?: string | null
  /** Email du client (pour l'email CEE éligibilité). */
  clientEmail?: string | null
  /** Nom lisible du service (ex: "Chauffagiste"). */
  serviceName?: string | null
  /** Ville du client. */
  ville?: string | null
}

/**
 * Persiste le lien devis → dossier CEE côté `devis_requests.cee_dossier_id`.
 *
 * Fail-OPEN : toute erreur d'écriture est loggée mais jamais propagée. Le
 * dossier CEE existe déjà côté `cee_dossiers` (créé par le dispatcher), donc
 * une désynchronisation temporaire ici est récupérable (reconcile via
 * `cee_dossiers.devis_id`).
 */
async function persistCeeDossierLink(
  supabase: SupabaseClient,
  devisId: string,
  dossierId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('devis_requests')
      .update({ cee_dossier_id: dossierId })
      .eq('id', devisId)

    if (error) {
      logger.warn('cee-dispatch: échec persist lien dossier, soft-fail', {
        action: 'cee-dispatch-persist',
        devisId,
        dossierId,
        error: error.message,
      })
    }
  } catch (err) {
    logger.warn('cee-dispatch: exception persist lien dossier, soft-fail', {
      action: 'cee-dispatch-persist',
      devisId,
      dossierId,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

/**
 * Lance le dispatcher CEE en mode fire-and-forget et persiste le lien côté
 * devis si l'outcome est `cee_routed`.
 *
 * Ne throw JAMAIS — toute exception est catchée et loggée via `logger.warn`
 * avec `action: 'cee-dispatch'`. Le caller peut `await` cette promesse sans
 * try/catch : elle résout toujours.
 *
 * Retourne l'outcome pour les tests et le debug ; le caller applicatif peut
 * l'ignorer sans conséquence.
 */
export async function runCeeDispatchFireAndForget(
  supabase: SupabaseClient,
  input: CeeDispatchInput
): Promise<DispatchOutcome | null> {
  const { devisId, serviceSlug } = input

  try {
    const outcome = await dispatchDevis(supabase, {
      devisId: input.devisId,
      clientId: input.clientId,
      serviceSlug: input.serviceSlug,
      postalCode: input.postalCode ?? null,
      candidateProviderIds: input.candidateProviderIds,
    })

    if (outcome.kind === 'cee_routed') {
      await persistCeeDossierLink(supabase, devisId, outcome.dossierId)
      logger.info('cee-dispatch: devis routé en CEE', {
        action: 'cee-dispatch',
        devisId,
        serviceSlug,
        operationCode: outcome.operationCode,
        dossierId: outcome.dossierId,
      })

      // --- Analytics event serveur (fire-and-forget, fail-open strict) ---
      // Doit rester isolé : si la table n'existe pas ou RLS refuse, on log et
      // on continue — l'outcome cee_routed est déjà persisté.
      // `supabase.from(...).insert(...)` renvoie un PostgrestBuilder (PromiseLike
      // non-standard). On wrappe dans un IIFE async pour garder un vrai
      // Promise<void> et pouvoir .catch proprement.
      void (async () => {
        try {
          const { error: analyticsErr } = await supabase.from('analytics_events').insert({
            event_type: 'cee_dispatch_routed',
            metadata: {
              devisId,
              operationCode: outcome.operationCode,
              kwhcEstime: outcome.primeEstimate?.kwhc_max ?? null,
              primeEstimee: outcome.primeEstimate?.euros_classique_max ?? null,
            },
            created_at: new Date().toISOString(),
          })
          if (analyticsErr) {
            logger.warn('cee-dispatch: échec insert analytics cee_dispatch_routed', {
              action: 'cee-analytics',
              devisId,
              error: analyticsErr.message,
            })
          }
        } catch (err) {
          logger.warn('cee-dispatch: exception analytics routed', {
            action: 'cee-analytics',
            devisId,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      })()

      // --- Email éligibilité CEE au client (fire-and-forget) ---
      if (input.clientEmail) {
        sendCeeEligibilityEmail({
          clientName: input.clientName || 'Client',
          clientEmail: input.clientEmail,
          serviceName: input.serviceName || serviceSlug,
          ville: input.ville || '',
          operationCode: outcome.operationCode,
          operationName: outcome.operationName || outcome.operationCode,
          primeEstimateMin: outcome.primeEstimate?.euros_classique_min ?? null,
          primeEstimateMax: outcome.primeEstimate?.euros_classique_max ?? null,
          justificatifs: outcome.justificatifsRequis,
        }).catch((err) => {
          logger.warn('cee-dispatch: échec envoi email éligibilité CEE, soft-fail', {
            action: 'cee-email-eligibility',
            devisId,
            error: err instanceof Error ? err.message : String(err),
          })
        })
      }

      // --- Briefing CEE artisan RGE (fire-and-forget) ---
      sendCeeArtisanBriefing(supabase, {
        providerId: outcome.providerId,
        dossierId: outcome.dossierId,
        operationCode: outcome.operationCode,
        operationName: outcome.operationName ?? null,
        primeEstimate: outcome.primeEstimate ?? null,
        justificatifsRequis: outcome.justificatifsRequis,
      }).catch((err) => {
        logger.warn('cee-dispatch: échec envoi briefing artisan CEE, soft-fail', {
          action: 'cee-artisan-briefing',
          devisId,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    } else if (outcome.kind === 'fallback_non_cee') {
      logger.info('cee-dispatch: fallback non-CEE', {
        action: 'cee-dispatch',
        devisId,
        serviceSlug,
        reason: outcome.reason,
      })

      // --- Analytics event serveur (fire-and-forget, fail-open strict) ---
      void (async () => {
        try {
          const { error: analyticsErr } = await supabase.from('analytics_events').insert({
            event_type: 'cee_dispatch_fallback',
            metadata: {
              devisId,
              reason: outcome.reason,
            },
            created_at: new Date().toISOString(),
          })
          if (analyticsErr) {
            logger.warn('cee-dispatch: échec insert analytics cee_dispatch_fallback', {
              action: 'cee-analytics',
              devisId,
              error: analyticsErr.message,
            })
          }
        } catch (err) {
          logger.warn('cee-dispatch: exception analytics fallback', {
            action: 'cee-analytics',
            devisId,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      })()
    } else {
      // outcome.kind === 'error'
      logger.warn('cee-dispatch: erreur dispatcher, soft-fail', {
        action: 'cee-dispatch',
        devisId,
        serviceSlug,
        message: outcome.message,
      })
    }

    return outcome
  } catch (err) {
    // Filet ultime : le dispatcher est censé être fail-safe, mais on reste
    // défensif. Jamais de re-throw — la soumission devis ne doit pas casser.
    logger.warn('cee-dispatch: exception inattendue, soft-fail', {
      action: 'cee-dispatch',
      devisId,
      serviceSlug,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}
