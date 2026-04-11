/**
 * CEE dispatcher — brique 3 du pipeline mandataire CEE.
 *
 * Point d'entrée unique pour router un devis entrant vers un artisan RGE
 * éligible CEE, et créer le dossier brouillon associé. Orchestre les briques
 * précédentes :
 *
 *   1. `enrichCeeQualification` — qualif + fiches FOS + prime estimée + délégataires
 *   2. `filterProvidersByCeeRge` — filtrage fail-CLOSED des providers candidats
 *   3. `createCeeDossier`        — persistance du dossier en statut 'brouillon'
 *
 * Design
 * ------
 * - **Point d'intégration** : c'est un module library pur, aucune route API
 *   n'est exposée ici. Le wrapping HTTP et l'ordering upstream des candidats
 *   (proximité / rating / charge) sont hors périmètre.
 * - **Fail-SAFE mais pas silencieux** : toute erreur intermédiaire retourne
 *   soit un `fallback_non_cee` explicite, soit un `{ kind: 'error' }`. Jamais
 *   de throw non catché. Chaque branche logge avec contexte (devisId,
 *   serviceSlug) — aucune PII (pas d'email/téléphone).
 * - **Pas d'effet de bord** si outcome ≠ `cee_routed`. En particulier, aucun
 *   dossier n'est créé en fallback.
 * - **Idempotence** : si un dossier brouillon existe déjà pour le devis, on
 *   le retourne au lieu d'en créer un nouveau.
 *
 * TODO (hors périmètre brique 3) :
 *   - Ordering intelligent des providers (proximité, rating, charge, SLA) ;
 *     ici on prend le premier provider RGE qui couvre le plus grand nombre
 *     de libellés (coverage.foundCodes.length maximum).
 *   - Wrapping en route API `/api/cee/dispatch` pour exposition au tunnel devis.
 *   - Retry logic sur échec de création (transient DB error) — pour le moment
 *     on renvoie `{ kind: 'error' }` et le caller décide.
 *   - Logique d'ordering délégataire fine (capacité volumétrique temps réel,
 *     cotation dynamique) : pour l'instant on prend le premier de la liste
 *     déjà triée par vague de priorité par `getDelegatairesByOperation`.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { enrichCeeQualification, type EnrichedCeeItem } from './enrich'
import { filterProvidersByCeeRge, type RgeCoverageCheck } from './rge-filter'
import { createCeeDossier } from './dossiers'
import type { ClimateZone } from './dossier-types'

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface DispatchInput {
  devisId: string
  clientId: string | null
  /** Métier SA ex: 'chauffagiste', 'couvreur'. */
  serviceSlug: string
  postalCode?: string | null
  /** Présélection géo déjà faite upstream. */
  candidateProviderIds: string[]
}

export interface DispatchPrimeEstimate {
  kwhc_min: number
  kwhc_max: number
  euros_classique_min: number
  euros_classique_max: number
  zone: ClimateZone | null
}

export interface DispatchJustificatif {
  code: string
  label: string
  obligatoire: boolean
}

export type DispatchFallbackReason =
  | 'not_eligible'
  | 'no_rge_provider'
  | 'audit_blocking'
  | 'no_candidate_provider'

export type DispatchOutcome =
  | {
      kind: 'cee_routed'
      operationCode: string
      providerId: string
      delegataireId: string | null
      dossierId: string
      /**
       * `null` uniquement en chemin idempotence avec `stale_operation_code` :
       * le dossier brouillon référence un code FOS qui n'est plus présent dans
       * l'enrichissement courant. L'UI doit gérer ce cas honnêtement plutôt
       * que d'afficher une prime calculée sur un autre item.
       */
      primeEstimate: DispatchPrimeEstimate | null
      justificatifsRequis: DispatchJustificatif[]
    }
  | {
      kind: 'fallback_non_cee'
      reason: DispatchFallbackReason
      providerId: string | null
      blockingAuditRequired?: string[]
    }
  | {
      kind: 'error'
      message: string
    }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Row partielle lue lors du check d'idempotence. */
interface ExistingBrouillonRow {
  id: string
  operation_code: string
  provider_id: string
  delegataire_id: string | null
}

/**
 * Retourne un dossier brouillon préexistant pour ce devis, ou null.
 * Fail-SAFE : toute erreur DB → null (on laisse le flux continuer).
 */
async function findExistingBrouillon(
  supabase: SupabaseClient,
  devisId: string
): Promise<ExistingBrouillonRow | null> {
  const { data, error } = await supabase
    .from('cee_dossiers')
    .select('id, operation_code, provider_id, delegataire_id')
    .eq('devis_id', devisId)
    .eq('status', 'brouillon')
    .maybeSingle()

  if (error) {
    logger.warn('dispatcher: lookup brouillon existant a échoué, on continue', {
      action: 'cee-dispatch-idempotence',
      devisId,
      error: error.message,
    })
    return null
  }
  if (!data) return null
  return data as ExistingBrouillonRow
}

/**
 * Sélection du provider RGE final.
 *
 * Stratégie : parmi les providers éligibles, on garde ceux qui couvrent le plus
 * grand nombre de libellés RGE (maximum `coverage.foundCodes.length`). Cela
 * favorise les artisans multi-qualifs capables de porter plusieurs fiches FOS,
 * ce qui augmente la probabilité que la fiche la plus rentable soit elle aussi
 * dispatchable.
 *
 * Le tie-break est l'ordre d'entrée (stable) — l'ordering intelligent
 * (proximité, rating, charge) est hors périmètre de la brique 3.
 */
function pickBestProvider(
  eligible: Array<{ providerId: string; coverage: RgeCoverageCheck }>
): { providerId: string; coverage: RgeCoverageCheck } | null {
  if (eligible.length === 0) return null

  let bestIndex = 0
  let bestCount = eligible[0].coverage.foundCodes.length
  for (let i = 1; i < eligible.length; i++) {
    const count = eligible[i].coverage.foundCodes.length
    if (count > bestCount) {
      bestCount = count
      bestIndex = i
    }
  }
  return eligible[bestIndex]
}

/**
 * Sélection de l'opération principale à dispatcher.
 *
 * Stratégie : on prend l'item avec `prime_estimate.euros_classique_max` le
 * plus élevé (la fiche la plus rentable pour le client et donc le porteur
 * d'obligation). Si aucun item n'a de `prime_estimate`, on retombe sur le
 * premier item (ordre déjà décidé par `enrichCeeQualification` : items
 * avec estimation d'abord, puis alphabétique par code).
 *
 * Limite connue : en cas d'égalité stricte sur euros_classique_max, le premier
 * rencontré gagne (stable). L'arbitrage fin par confiance délégataire ou
 * volumétrie sera câblé plus tard.
 */
function pickBestItem(items: EnrichedCeeItem[]): EnrichedCeeItem | null {
  if (items.length === 0) return null

  let bestIndex = -1
  let bestValue = -Infinity
  for (let i = 0; i < items.length; i++) {
    const estimate = items[i].prime_estimate
    if (!estimate) continue
    if (estimate.euros_classique_max > bestValue) {
      bestValue = estimate.euros_classique_max
      bestIndex = i
    }
  }

  if (bestIndex === -1) {
    // Aucun item n'a de prime_estimate : fallback sur le premier.
    return items[0]
  }
  return items[bestIndex]
}

/**
 * Construit la fourchette de prime publique à partir de l'estimation enrichie.
 * On omet les colonnes précarité (non demandées par la brique 3).
 */
function toDispatchPrimeEstimate(item: EnrichedCeeItem): DispatchPrimeEstimate {
  const est = item.prime_estimate
  if (!est) {
    return {
      kwhc_min: 0,
      kwhc_max: 0,
      euros_classique_min: 0,
      euros_classique_max: 0,
      zone: null,
    }
  }
  return {
    kwhc_min: est.kwhc_min,
    kwhc_max: est.kwhc_max,
    euros_classique_min: est.euros_classique_min,
    euros_classique_max: est.euros_classique_max,
    zone: est.zone,
  }
}

/** Projection publique des justificatifs (sans métadonnées internes). */
function toDispatchJustificatifs(item: EnrichedCeeItem): DispatchJustificatif[] {
  return item.justificatifs_requis.map((j) => ({
    code: j.code,
    label: j.label,
    obligatoire: j.obligatoire,
  }))
}

// ---------------------------------------------------------------------------
// API publique
// ---------------------------------------------------------------------------

/**
 * Dispatch un devis entrant vers une recommandation de routage CEE.
 *
 * Retourne soit une décision `cee_routed` avec provider + délégataire +
 * dossier brouillon créé, soit un `fallback_non_cee` explicite avec la
 * raison du fallback. Jamais de throw.
 *
 * Voir l'en-tête du module pour la stratégie d'ordering et les TODOs.
 */
export async function dispatchDevis(
  supabase: SupabaseClient,
  input: DispatchInput
): Promise<DispatchOutcome> {
  const { devisId, clientId, serviceSlug, postalCode, candidateProviderIds } = input

  // Étape 0 : pas de candidat → fallback immédiat.
  if (candidateProviderIds.length === 0) {
    return {
      kind: 'fallback_non_cee',
      reason: 'no_candidate_provider',
      providerId: null,
    }
  }

  // Étape 1 : qualification + enrichissement (zone + prime + délégataires).
  let enriched
  try {
    enriched = await enrichCeeQualification(supabase, { serviceSlug, postalCode })
  } catch (err) {
    logger.error('dispatcher: enrichCeeQualification a throw', err, {
      action: 'cee-dispatch-enrich',
      devisId,
      serviceSlug,
    })
    return {
      kind: 'fallback_non_cee',
      reason: 'not_eligible',
      providerId: candidateProviderIds[0] ?? null,
    }
  }

  if (!enriched.eligible || enriched.items.length === 0) {
    return {
      kind: 'fallback_non_cee',
      reason: 'not_eligible',
      providerId: candidateProviderIds[0] ?? null,
    }
  }

  // Étape 2 : filtre RGE fail-CLOSED.
  let rge
  try {
    rge = await filterProvidersByCeeRge(supabase, {
      providerIds: candidateProviderIds,
      operationCodes: enriched.codes,
    })
  } catch (err) {
    logger.error('dispatcher: filterProvidersByCeeRge a throw', err, {
      action: 'cee-dispatch-rge-filter',
      devisId,
      serviceSlug,
    })
    return {
      kind: 'fallback_non_cee',
      reason: 'no_rge_provider',
      providerId: candidateProviderIds[0] ?? null,
    }
  }

  // Étape 3 : audit bloquant → STOP dispatch CEE (pas de dossier).
  if (rge.blockingAuditRequired.length > 0) {
    logger.warn('dispatcher: audit bloquant, dispatch CEE impossible', {
      action: 'cee-dispatch-audit-blocking',
      devisId,
      serviceSlug,
      blocking: rge.blockingAuditRequired,
    })
    return {
      kind: 'fallback_non_cee',
      reason: 'audit_blocking',
      providerId: candidateProviderIds[0] ?? null,
      blockingAuditRequired: rge.blockingAuditRequired,
    }
  }

  // Étape 4 : aucun provider RGE éligible.
  if (rge.eligible.length === 0) {
    return {
      kind: 'fallback_non_cee',
      reason: 'no_rge_provider',
      providerId: candidateProviderIds[0] ?? null,
    }
  }

  // Étape 5 : sélection provider (couverture RGE maximale).
  const bestProvider = pickBestProvider(rge.eligible)
  if (!bestProvider) {
    // Branche défensive : eligible.length > 0 au-dessus garantit non-null,
    // mais on reste prudent.
    return {
      kind: 'fallback_non_cee',
      reason: 'no_rge_provider',
      providerId: candidateProviderIds[0] ?? null,
    }
  }

  // Étape 6 : sélection de l'opération la plus rentable.
  const bestItem = pickBestItem(enriched.items)
  if (!bestItem) {
    // Ne devrait jamais arriver (enriched.items.length > 0 vérifié plus haut).
    return {
      kind: 'fallback_non_cee',
      reason: 'not_eligible',
      providerId: bestProvider.providerId,
    }
  }

  // Étape 7 : premier délégataire (liste déjà triée par vague) — peut être undefined si aucun délégataire pour ce code → fallback sur null côté dossier.
  const delegataireId = bestItem.delegataires[0]?.id ?? null

  // Étape 8 : idempotence — si un brouillon existe déjà pour ce devis, le renvoyer.
  //
  // IMPORTANT : la prime et les justificatifs DOIVENT correspondre au code FOS
  // réellement stocké (existing.operation_code), pas à `bestItem` qui peut
  // diverger si la sélection n'est pas déterministe ou si la DB a évolué
  // entre la création et ce re-check. Si le code stocké n'existe plus dans
  // enriched.items (cas `stale_operation_code`), on fallback honnête avec
  // primeEstimate=null / justificatifsRequis=[] et un warn — mieux qu'une
  // UI menteuse.
  const existing = await findExistingBrouillon(supabase, devisId)
  if (existing) {
    const providerStillRge = rge.eligible.some((p) => p.providerId === existing.provider_id)
    if (!providerStillRge) {
      logger.warn('dispatcher: provider idempotent plus RGE, fallback non-CEE', {
        action: 'cee-dispatch-idempotence',
        devisId,
        dossierId: existing.id,
        providerId: existing.provider_id,
        reason: 'provider_no_longer_rge',
      })
      return {
        kind: 'fallback_non_cee',
        reason: 'no_rge_provider',
        providerId: existing.provider_id,
      }
    }

    const existingItem = enriched.items.find((i) => i.code === existing.operation_code)
    if (existingItem) {
      return {
        kind: 'cee_routed',
        operationCode: existing.operation_code,
        providerId: existing.provider_id,
        delegataireId: existing.delegataire_id,
        dossierId: existing.id,
        primeEstimate: toDispatchPrimeEstimate(existingItem),
        justificatifsRequis: toDispatchJustificatifs(existingItem),
      }
    }
    logger.warn('dispatcher: idempotence sur code FOS stale, prime/justificatifs indisponibles', {
      action: 'cee-dispatch-idempotence',
      devisId,
      operationCode: existing.operation_code,
      reason: 'stale_operation_code',
    })
    return {
      kind: 'cee_routed',
      operationCode: existing.operation_code,
      providerId: existing.provider_id,
      delegataireId: existing.delegataire_id,
      dossierId: existing.id,
      primeEstimate: null,
      justificatifsRequis: [],
    }
  }

  // Étape 9 : création du dossier brouillon.
  //
  // Acteur : si on a un clientId non-null, c'est le client qui soumet — on
  // trace `{type:'client', id:clientId}` pour le journal d'audit. Soumission
  // anonyme (clientId === null) → `{type:'system', id:null}`.
  const est = bestItem.prime_estimate
  const actor =
    clientId !== null
      ? ({ type: 'client', id: clientId } as const)
      : ({ type: 'system', id: null } as const)
  let dossier
  try {
    dossier = await createCeeDossier(
      supabase,
      {
        provider_id: bestProvider.providerId,
        operation_code: bestItem.code,
        devis_id: devisId,
        client_id: clientId,
        delegataire_id: delegataireId,
        postal_code: postalCode ?? null,
        zone_climatique: enriched.zone_climatique,
        kwhc_estime: est ? est.kwhc_max : null,
        prime_estimee_eur: est ? est.euros_classique_max : null,
      },
      actor
    )
  } catch (err) {
    logger.error('dispatcher: createCeeDossier a throw', err, {
      action: 'cee-dispatch-create',
      devisId,
      serviceSlug,
      operationCode: bestItem.code,
    })
    return { kind: 'error', message: 'dossier_creation_failed' }
  }

  if (!dossier) {
    // createCeeDossier est fail-closed : null = erreur DB déjà loggée côté dossiers.ts.
    return { kind: 'error', message: 'dossier_creation_failed' }
  }

  return {
    kind: 'cee_routed',
    operationCode: bestItem.code,
    providerId: bestProvider.providerId,
    delegataireId,
    dossierId: dossier.id,
    primeEstimate: toDispatchPrimeEstimate(bestItem),
    justificatifsRequis: toDispatchJustificatifs(bestItem),
  }
}
