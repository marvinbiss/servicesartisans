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
export async function listActiveDelegataires(supabase: SupabaseClient): Promise<CeeDelegataire[]> {
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
 * obligés vague 1 : Effy, TotalEnergies…).
 *
 * Pourquoi DEUX queries distinctes au lieu d'un `OR` : PostgREST ne permet
 * pas d'exprimer `cardinality(operations_supportees) = 0` dans un filtre
 * `.eq()` / `.filter()`. La syntaxe `.eq('operations_supportees', '{}')`
 * envoie littéralement la chaîne `'{}'` au driver qui la compare à un array
 * Postgres — le match ne se produit jamais et les délégataires "toutes
 * opérations" étaient silencieusement exclus. On remplace par :
 *
 *   - Query A : `.contains('operations_supportees', [code])` (GIN @>)
 *   - Query B : tous les délégataires actifs/partenaires, filtrés en JS sur
 *     `row.operations_supportees.length === 0` (catch-all)
 *
 * Puis on merge A + B, dédup par `id`, tri `vague_priorite ASC` puis
 * `nom_commercial ASC`.
 *
 * Fail-open sur erreur DB (retourne []).
 */
export async function getDelegatairesByOperation(
  supabase: SupabaseClient,
  operationCode: string
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

  // Étape 2 : tous les délégataires actifs/partenaires (sans filtre array).
  // Le filtre catch-all (`operations_supportees.length === 0`) est fait en
  // JS parce que PostgREST ne supporte pas cardinality = 0 sur un array.
  const { data: allActive, error: allActiveErr } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])

  if (allActiveErr) {
    logger.warn('getDelegatairesByOperation: all-active query failed', {
      action: 'cee-delegataires-by-op',
      operationCode,
      error: allActiveErr.message,
    })
    // On a au moins les tagged — on ne casse pas le routing pour autant.
    return (tagged ?? []) as unknown as CeeDelegataire[]
  }

  const catchAll = ((allActive ?? []) as unknown as CeeDelegataire[]).filter(
    (row) => Array.isArray(row.operations_supportees) && row.operations_supportees.length === 0
  )

  // Union + dédup par id (plus stable que slug), tri vague puis nom.
  const seen = new Set<string>()
  const merged: CeeDelegataire[] = []
  for (const row of [...(tagged ?? []), ...catchAll] as unknown as CeeDelegataire[]) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    merged.push(row)
  }
  merged.sort((a, b) => {
    if (a.vague_priorite !== b.vague_priorite) return a.vague_priorite - b.vague_priorite
    return a.nom_commercial.localeCompare(b.nom_commercial, 'fr')
  })

  return merged
}

/**
 * Variante batch de `getDelegatairesByOperation` : résout en EXACTEMENT 2 queries
 * totales la liste des délégataires par code, peu importe le nombre de codes.
 *
 * Stratégie :
 *   - Query A : `.overlaps('operations_supportees', codes)` (GIN &&) — récupère
 *     d'un coup tous les délégataires taggés sur AU MOINS un des codes passés.
 *   - Query B : tous les délégataires actifs/partenaires, dont on extrait
 *     en JS les catch-all (`operations_supportees = []`).
 *
 * Puis dispatch en JS dans une `Map<code, CeeDelegataire[]>`, chaque liste
 * triée `vague_priorite ASC` puis `nom_commercial ASC` (FR locale). Les
 * codes absents de la Map reçoivent un tableau vide.
 *
 * Fail-open : erreur DB → Map<code, []> pour tous les codes.
 */
export async function getDelegatairesForOperations(
  supabase: SupabaseClient,
  codes: string[]
): Promise<Map<string, CeeDelegataire[]>> {
  const result = new Map<string, CeeDelegataire[]>()
  for (const c of codes) result.set(c, [])
  if (codes.length === 0) return result

  // Query A : tous les tagged sur n'importe lequel des codes (GIN &&)
  const { data: tagged, error: taggedErr } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])
    .overlaps('operations_supportees', codes)

  if (taggedErr) {
    logger.warn('getDelegatairesForOperations: tagged query failed', {
      action: 'cee-delegataires-batch',
      codes,
      error: taggedErr.message,
    })
    return result
  }

  // Query B : tous les actifs/partenaires — on extrait les catch-all en JS.
  const { data: allActive, error: allActiveErr } = await supabase
    .from('cee_delegataires')
    .select(DELEGATAIRE_PUBLIC_SELECT)
    .in('statut', ['actif', 'partenaire'])

  if (allActiveErr) {
    logger.warn('getDelegatairesForOperations: all-active query failed', {
      action: 'cee-delegataires-batch',
      codes,
      error: allActiveErr.message,
    })
    // On fait quand même du mieux possible avec les tagged uniquement.
  }

  const taggedRows = (tagged ?? []) as unknown as CeeDelegataire[]
  const catchAllRows = ((allActive ?? []) as unknown as CeeDelegataire[]).filter(
    (row) => Array.isArray(row.operations_supportees) && row.operations_supportees.length === 0
  )

  // Dispatch : pour chaque code, on merge (tagged sur ce code) + catch-all, dédup par id.
  for (const code of codes) {
    const seen = new Set<string>()
    const list: CeeDelegataire[] = []
    // Tagged : ceux qui déclarent ce code spécifiquement
    for (const row of taggedRows) {
      if (!Array.isArray(row.operations_supportees)) continue
      if (!row.operations_supportees.includes(code)) continue
      if (seen.has(row.id)) continue
      seen.add(row.id)
      list.push(row)
    }
    // Catch-all : supportent toutes les opérations
    for (const row of catchAllRows) {
      if (seen.has(row.id)) continue
      seen.add(row.id)
      list.push(row)
    }
    list.sort((a, b) => {
      if (a.vague_priorite !== b.vague_priorite) return a.vague_priorite - b.vague_priorite
      return a.nom_commercial.localeCompare(b.nom_commercial, 'fr')
    })
    result.set(code, list)
  }

  return result
}
