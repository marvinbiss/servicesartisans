/**
 * CEE qualification — maps a devis service slug to applicable CEE operation codes.
 *
 * Brique 1 du pipeline mandataire CEE : à la soumission d'un devis, on détermine
 * si les travaux sont potentiellement éligibles à une prime CEE et on enregistre
 * les codes d'opérations standardisées (FOS) applicables.
 *
 * Logique simple & volontairement conservatrice :
 *  - Match par `services_slugs` (GIN index idx_cee_operations_services_gin)
 *  - Filtre `is_active = TRUE`, secteur `residentiel`
 *  - On ne croise PAS encore avec les qualifs RGE du provider assigné : cela
 *    arrive Brique 1 bis (filtrage artisan avant dispatch). Ici on veut juste
 *    flaguer le devis pour la suite du tunnel.
 *
 * Usage :
 *   const { eligible, codes } = await qualifyDevisForCee(supabase, 'chauffagiste')
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface CeeQualificationResult {
  eligible: boolean
  codes: string[]
}

export interface CeeOperationDetail {
  code: string
  nom: string
  domaine: string
  sous_domaine: string | null
  rge_qualifications_requises: string[]
  non_cumulable_avec: string[]
  public_cible: string
}

/**
 * Retourne les codes FOS CEE applicables à un service SA donné.
 *
 * @param supabase  Client Supabase (admin ou server) — lecture seule
 * @param serviceSlug Slug normalisé du service (ex: 'chauffagiste', 'couvreur')
 */
export async function qualifyDevisForCee(
  supabase: SupabaseClient,
  serviceSlug: string
): Promise<CeeQualificationResult> {
  if (!serviceSlug) return { eligible: false, codes: [] }

  const { data, error } = await supabase
    .from('cee_operations')
    .select('code')
    .eq('is_active', true)
    .eq('secteur', 'residentiel')
    .contains('services_slugs', [serviceSlug])

  if (error || !data) {
    return { eligible: false, codes: [] }
  }

  const codes = data.map((row) => row.code as string)
  return { eligible: codes.length > 0, codes }
}

/**
 * Récupère les détails complets d'une liste d'opérations CEE.
 * Utilisé par la Brique 2 (tunnel dossier) pour afficher les exigences
 * et vérifier les incompatibilités de cumul avant dépose.
 */
export async function getCeeOperationDetails(
  supabase: SupabaseClient,
  codes: string[]
): Promise<CeeOperationDetail[]> {
  if (codes.length === 0) return []

  const { data, error } = await supabase
    .from('cee_operations')
    .select(
      'code, nom, domaine, sous_domaine, rge_qualifications_requises, non_cumulable_avec, public_cible'
    )
    .eq('is_active', true)
    .in('code', codes)

  if (error || !data) return []
  return data as CeeOperationDetail[]
}
