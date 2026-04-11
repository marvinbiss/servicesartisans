/**
 * CEE dossiers — data access layer (brique 2 mandataire CEE).
 *
 * Source de vérité : table `cee_dossiers` + `cee_dossier_events` (migration 402).
 * Utilisé par :
 *   - Le tunnel dossier CEE (création à la signature du devis)
 *   - Le backoffice mandataire (listing artisan / admin)
 *   - Le worker de dépose délégataire (transitions de statut)
 *
 * Règles :
 *   - Fail-open sur list/get (retourne [] / null sur erreur DB)
 *   - Fail-closed sur create/transition (retourne null / { ok:false } + log)
 *   - Zéro PII dans les logs (pas d'email, pas de téléphone)
 *   - TypeScript strict, aucun `any`
 *   - Patterns alignés sur `src/lib/cee/delegataires.ts`
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type {
  CeeDossier,
  CeeDossierStatus,
  CeeDossierActorType,
  CreateCeeDossierInput,
  TransitionResult,
} from './dossier-types'

/**
 * Colonnes publiques sélectionnables — miroir exact de l'interface CeeDossier.
 * Listées explicitement pour empêcher tout drift silencieux.
 */
const DOSSIER_SELECT = [
  'id',
  'devis_id',
  'client_id',
  'provider_id',
  'delegataire_id',
  'operation_code',
  'status',
  'date_engagement',
  'date_pre_visite',
  'date_debut_travaux',
  'date_fin_travaux',
  'date_ah_signature',
  'date_depot_delegataire',
  'date_depot_pncee',
  'date_validation',
  'zone_climatique',
  'postal_code',
  'kwhc_estime',
  'kwhc_depose',
  'prime_estimee_eur',
  'prime_versee_eur',
  'precarite',
  'justificatifs',
  'rejection_reason',
  'notes',
  'metadata',
  'created_at',
  'updated_at',
].join(',')

/**
 * Crée un nouveau dossier CEE. Fail-closed : retourne `null` en cas d'erreur DB.
 *
 * L'acteur à l'origine de la création doit être passé via `actor` pour
 * alimenter le trigger d'audit (`cee_dossiers_audit_log`) qui lit
 * `metadata._actor_type` / `metadata._actor_id`.
 */
export async function createCeeDossier(
  supabase: SupabaseClient,
  input: CreateCeeDossierInput,
  actor: { type: CeeDossierActorType; id: string | null } = { type: 'system', id: null }
): Promise<CeeDossier | null> {
  // Injection acteur dans metadata pour le trigger d'audit.
  const metadata = {
    ...(input.metadata ?? {}),
    _actor_type: actor.type,
    _actor_id: actor.id,
  }

  const { data, error } = await supabase
    .from('cee_dossiers')
    .insert({
      provider_id: input.provider_id,
      operation_code: input.operation_code,
      devis_id: input.devis_id ?? null,
      client_id: input.client_id ?? null,
      delegataire_id: input.delegataire_id ?? null,
      date_engagement: input.date_engagement ?? null,
      zone_climatique: input.zone_climatique ?? null,
      postal_code: input.postal_code ?? null,
      kwhc_estime: input.kwhc_estime ?? null,
      prime_estimee_eur: input.prime_estimee_eur ?? null,
      precarite: input.precarite ?? false,
      metadata,
    })
    .select(DOSSIER_SELECT)
    .single()

  if (error || !data) {
    logger.error('createCeeDossier: DB error', error, {
      action: 'cee-dossier-create',
      provider_id: input.provider_id,
      operation_code: input.operation_code,
    })
    return null
  }

  return data as unknown as CeeDossier
}

/**
 * Récupère un dossier par son id. Fail-open : retourne `null` si non trouvé
 * ou en cas d'erreur DB.
 */
export async function getCeeDossierById(
  supabase: SupabaseClient,
  id: string
): Promise<CeeDossier | null> {
  if (!id) return null

  const { data, error } = await supabase
    .from('cee_dossiers')
    .select(DOSSIER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    logger.warn('getCeeDossierById: DB error — returning null', {
      action: 'cee-dossier-get',
      dossier_id: id,
      error: error.message,
    })
    return null
  }

  return (data as unknown as CeeDossier | null) ?? null
}

/**
 * Liste les dossiers CEE d'un artisan, triés par date de création descendante.
 * Fail-open : retourne `[]` sur erreur DB.
 */
export async function listCeeDossiersForProvider(
  supabase: SupabaseClient,
  providerId: string
): Promise<CeeDossier[]> {
  if (!providerId) return []

  const { data, error } = await supabase
    .from('cee_dossiers')
    .select(DOSSIER_SELECT)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.warn('listCeeDossiersForProvider: DB error — returning empty', {
      action: 'cee-dossier-list-provider',
      provider_id: providerId,
      error: error.message,
    })
    return []
  }

  return (data ?? []) as unknown as CeeDossier[]
}

/**
 * Transitionne un dossier vers un nouveau statut via la RPC atomique
 * `transition_cee_dossier_status` (migration 410).
 *
 * Fail-closed : retourne `{ ok:false, error }` sur erreur DB, transition
 * illégale (bloquée par le trigger `cee_dossiers_validate_status_transition`),
 * dossier introuvable, ou RPC manquante. L'acteur est passé via les
 * paramètres RPC et mergé atomiquement dans `metadata` côté Postgres
 * (fix race condition select-then-update — audit Phase 2 mandataire CEE).
 *
 * Signature publique préservée : le wrapping applicatif reste identique
 * pour ne pas casser les callers (cron, API routes).
 */
export async function transitionCeeDossierStatus(
  supabase: SupabaseClient,
  id: string,
  toStatus: CeeDossierStatus,
  actorId: string | null,
  actorType: CeeDossierActorType
): Promise<TransitionResult> {
  if (!id) {
    return { ok: false, error: 'dossier id manquant' }
  }

  const { data, error } = await supabase.rpc('transition_cee_dossier_status', {
    p_dossier_id: id,
    p_to_status: toStatus,
    p_actor_id: actorId,
    p_actor_type: actorType,
  })

  if (error) {
    logger.error('transitionCeeDossierStatus: RPC error', error, {
      action: 'cee-dossier-transition',
      dossier_id: id,
      to_status: toStatus,
    })
    return { ok: false, error: error.message }
  }

  // La RPC renvoie un jsonb { ok, reason?, dossier_id?, status? }.
  // PostgREST peut wrapper la réponse d'une fonction scalaire en array selon
  // la version (`rpc()` + setof vs retour direct). On normalise défensivement.
  const rawPayload = Array.isArray(data) ? data[0] : data
  const payload = (rawPayload ?? null) as {
    ok: boolean
    reason?: string
    dossier_id?: string
    status?: string
  } | null

  if (!payload) {
    logger.warn('transitionCeeDossierStatus: RPC payload vide', {
      action: 'cee-dossier-transition',
      dossier_id: id,
      to_status: toStatus,
    })
    return { ok: false, error: 'rpc_empty_payload' }
  }

  if (payload.ok !== true) {
    const reason = payload.reason ?? 'unknown'
    if (reason === 'not_found') {
      logger.warn('transitionCeeDossierStatus: dossier introuvable', {
        action: 'cee-dossier-transition',
        dossier_id: id,
        to_status: toStatus,
      })
      return { ok: false, error: 'dossier introuvable' }
    }
    return { ok: false, error: reason }
  }

  return { ok: true }
}
