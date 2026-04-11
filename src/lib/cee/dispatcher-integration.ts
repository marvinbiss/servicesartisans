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

export interface CeeDispatchInput {
  devisId: string
  clientId: string | null
  serviceSlug: string
  postalCode?: string | null
  candidateProviderIds: string[]
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
    } else if (outcome.kind === 'fallback_non_cee') {
      logger.info('cee-dispatch: fallback non-CEE', {
        action: 'cee-dispatch',
        devisId,
        serviceSlug,
        reason: outcome.reason,
      })
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
