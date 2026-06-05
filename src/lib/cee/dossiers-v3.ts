/**
 * CEE dossiers — data access layer V3 (schéma cee_dossiers migration 431).
 *
 * Source de vérité : `supabase/migrations/431_cee_dossiers.sql` (table recréée,
 * remplace le schéma 402 droppé) + ajouts `487_restore_drifted_columns.sql`.
 *
 * Remplace les fonctions legacy `getCeeDossierById` / `listCeeDossiersForProvider`
 * de `dossiers.ts`, qui sélectionnaient des colonnes du schéma 402 mortes
 * (`client_id`, `date_engagement`, `zone_climatique`, `postal_code`,
 * `prime_estimee_eur` côté affichage, etc.) → 0 row côté dashboard artisan.
 *
 * Colonnes V3 sélectionnées (vérifiées mig 431) :
 *   id, reference, provider_id, operation_code, status (enum cee_dossier_status),
 *   client_code_postal, date_devis, date_chantier_prevue, date_chantier_realisee,
 *   montant_ht_cts, montant_ttc_cts, prime_cee_cts, prime_total_cts (GENERATED),
 *   reste_a_charge_cts (GENERATED), commission_amount_cts (GENERATED),
 *   commission_status, qa_score, created_at.
 *
 * NOTE schéma — `metadata` :
 *   La colonne `metadata` JSONB N'EXISTE PAS sur cee_dossiers V3 (elle était sur
 *   le schéma 402 droppé ; le `ADD COLUMN metadata` de mig 487 cible `audit_logs`,
 *   pas cee_dossiers). On ne la sélectionne donc PAS — la référencer relancerait
 *   exactement le bug de drift que cette migration corrige. Le champ est exposé
 *   en `Record<string,unknown>` constant `{}` pour conserver la compatibilité
 *   avec `extractScoreFromMetadata` (fail-open → score 0, tri stable par
 *   created_at desc).
 *
 * Règles (alignées sur `dossiers.ts`) :
 *   - Fail-open sur get/list (null / [] sur erreur DB) + logger.warn
 *   - Zéro PII dans les logs ni dans le SELECT (les pages n'affichent pas le client)
 *   - TypeScript strict, aucun `any`
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { CeeDossierV3Status } from './dossier-transitions'

/**
 * Représentation applicative d'une ligne `cee_dossiers` (schéma V3, mig 431).
 * `metadata` est un placeholder constant `{}` (colonne absente de la table V3,
 * cf. note d'en-tête) conservé pour la compat `extractScoreFromMetadata`.
 */
export interface CeeDossierV3Row {
  id: string
  reference: string
  provider_id: string
  operation_code: string
  status: CeeDossierV3Status
  client_code_postal: string | null
  date_devis: string | null
  date_chantier_prevue: string | null
  date_chantier_realisee: string | null
  montant_ht_cts: number | null
  montant_ttc_cts: number | null
  prime_cee_cts: number | null
  prime_total_cts: number | null
  reste_a_charge_cts: number | null
  commission_amount_cts: number | null
  commission_status: string | null
  qa_score: number | null
  metadata: Record<string, unknown>
  created_at: string
}

/**
 * Colonnes V3 sélectionnables — miroir exact des colonnes réelles de la table
 * (mig 431). Listées explicitement pour empêcher tout drift silencieux.
 * `metadata` est volontairement ABSENT (colonne inexistante en V3).
 */
const DOSSIER_V3_SELECT = [
  'id',
  'reference',
  'provider_id',
  'operation_code',
  'status',
  'client_code_postal',
  'date_devis',
  'date_chantier_prevue',
  'date_chantier_realisee',
  'montant_ht_cts',
  'montant_ttc_cts',
  'prime_cee_cts',
  'prime_total_cts',
  'reste_a_charge_cts',
  'commission_amount_cts',
  'commission_status',
  'qa_score',
  'created_at',
].join(',')

/** Normalise une ligne DB en `CeeDossierV3Row` (injecte le placeholder metadata). */
function toRow(raw: Record<string, unknown>): CeeDossierV3Row {
  return { ...(raw as unknown as Omit<CeeDossierV3Row, 'metadata'>), metadata: {} }
}

/**
 * Récupère un dossier CEE V3 par son id. Fail-open : retourne `null` si non
 * trouvé ou en cas d'erreur DB.
 */
export async function getCeeDossierByIdV3(
  supabase: SupabaseClient,
  id: string
): Promise<CeeDossierV3Row | null> {
  if (!id) return null

  const { data, error } = await supabase
    .from('cee_dossiers')
    .select(DOSSIER_V3_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    logger.warn('getCeeDossierByIdV3: DB error — returning null', {
      action: 'cee-dossier-get-v3',
      dossier_id: id,
      error: error.message,
    })
    return null
  }

  if (!data) return null
  return toRow(data as unknown as Record<string, unknown>)
}

/**
 * Liste les dossiers CEE V3 d'un artisan, triés par date de création descendante.
 * Fail-open : retourne `[]` sur erreur DB.
 */
export async function listCeeDossiersForProviderV3(
  supabase: SupabaseClient,
  providerId: string
): Promise<CeeDossierV3Row[]> {
  if (!providerId) return []

  const { data, error } = await supabase
    .from('cee_dossiers')
    .select(DOSSIER_V3_SELECT)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.warn('listCeeDossiersForProviderV3: DB error — returning empty', {
      action: 'cee-dossier-list-provider-v3',
      provider_id: providerId,
      error: error.message,
    })
    return []
  }

  return ((data ?? []) as unknown as Record<string, unknown>[]).map(toRow)
}
