/**
 * CEE délégataires — public data access layer (brique 1 bis roadmap mandataire CEE).
 *
 * Source de vérité : table `cee_delegataires` (migration 386, seed 387).
 * Utilisé pour :
 *   - Lister les partenaires actifs dans les pages éditoriales /cee/mandataire-*
 *   - Router un dossier CEE (brique 3+) vers le délégataire approprié
 *   - Alimenter le backoffice mandataire (brique 5)
 *
 * Règles :
 *  - Fail-open strict : IS_BUILD → [] / null, erreur DB → [] / null
 *  - Ne JAMAIS sélectionner les colonnes PII (contact_*_email) côté public
 *  - TypeScript strict, zéro `any`
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/** Nature juridique dans le dispositif CEE. */
export type CeeDelegataireType = 'obligated' | 'delegated' | 'mandataire'

/** Statut commercial (aligné sur le CHECK constraint de la migration 386). */
export type CeeDelegataireStatut = 'partenaire' | 'prospect' | 'actif' | 'inactif'

/**
 * Shape publique d'un délégataire CEE — miroir partiel de la table.
 * Les colonnes PII (contact_commercial_email, contact_technique_email) sont
 * volontairement omises et ne doivent JAMAIS être sélectionnées côté anon.
 */
export interface CeeDelegataire {
  id: string
  slug: string
  nom_commercial: string
  raison_sociale: string
  type: CeeDelegataireType
  vague_priorite: 1 | 2 | 3
  statut: CeeDelegataireStatut
  url_site: string | null
  url_api_docs: string | null
  operations_supportees: string[]
  secteurs_couverts: string[]
  coup_de_pouce_signataire: boolean
  is_p6: boolean
}

/**
 * Colonnes publiques sélectionnables — liste explicite pour empêcher tout leak
 * accidentel de PII (emails de contact) lorsque cette fonction est appelée
 * depuis une route publique.
 */
const DELEGATAIRE_PUBLIC_SELECT = [
  'id',
  'slug',
  'nom_commercial',
  'raison_sociale',
  'type',
  'vague_priorite',
  'statut',
  'url_site',
  'url_api_docs',
  'operations_supportees',
  'secteurs_couverts',
  'coup_de_pouce_signataire',
  'is_p6',
].join(',')

/**
 * Liste les délégataires actifs ou partenaires, triés par vague de priorité
 * puis nom commercial. Fail-open sur erreur DB (retourne []).
 */
export async function listActiveDelegataires(
  supabase: SupabaseClient,
): Promise<CeeDelegataire[]> {
  const { data, error } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])
    .order('vague_priorite', { ascending: true })
    .order('nom_commercial', { ascending: true })

  if (error) {
    logger.warn('listActiveDelegataires: DB error — returning empty', {
      action: 'cee-delegataires-list',
      error: error.message,
    })
    return []
  }

  return (data ?? []) as unknown as CeeDelegataire[]
}

/**
 * Liste les délégataires qui supportent une opération CEE donnée (ex: 'BAR-EN-101').
 *
 * Règle métier : un délégataire avec `operations_supportees = []` est considéré
 * comme supportant TOUTES les opérations par défaut (cas fréquent pour les gros
 * obligés). La query fait donc `operations_supportees @> {code} OR cardinality(operations_supportees) = 0`.
 *
 * Fail-open sur erreur DB (retourne []).
 */
export async function getDelegatairesByOperation(
  supabase: SupabaseClient,
  operationCode: string,
): Promise<CeeDelegataire[]> {
  // Étape 1 : délégataires explicitement tagués sur l'opération (GIN @>)
  const { data: tagged, error: taggedErr } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])
    .contains('operations_supportees', [operationCode])

  if (taggedErr) {
    logger.warn('getDelegatairesByOperation: tagged query failed', {
      action: 'cee-delegataires-by-op',
      operationCode,
      error: taggedErr.message,
    })
    return []
  }

  // Étape 2 : délégataires "toutes opérations" (operations_supportees = {})
  const { data: catchAll, error: catchAllErr } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])
    .eq('operations_supportees', '{}')

  if (catchAllErr) {
    logger.warn('getDelegatairesByOperation: catchAll query failed', {
      action: 'cee-delegataires-by-op',
      operationCode,
      error: catchAllErr.message,
    })
    return (tagged ?? []) as unknown as CeeDelegataire[]
  }

  // Union + dédup par slug, tri vague puis nom.
  const seen = new Set<string>()
  const merged: CeeDelegataire[] = []
  for (const row of [...(tagged ?? []), ...(catchAll ?? [])] as unknown as CeeDelegataire[]) {
    if (seen.has(row.slug)) continue
    seen.add(row.slug)
    merged.push(row)
  }
  merged.sort((a, b) => {
    if (a.vague_priorite !== b.vague_priorite) return a.vague_priorite - b.vague_priorite
    return a.nom_commercial.localeCompare(b.nom_commercial, 'fr')
  })

  return merged
}
