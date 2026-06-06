/**
 * CEE barème lookup — snapshot forfait pour création de dossier.
 *
 * Source de vérité : table `cee_forfaits` (mig 424, seed mig 543), versionnée
 * par (operation_code, zone, categorie_revenus, date_validite_debut). Le
 * snapshot (forfait_id, forfait_version, prime_cee_cts) est gelé dans le
 * dossier à la création — pas de recalcul a posteriori (contrat mig 431).
 *
 * Sémantique prime :
 * - Opérations isolation (BAR-EN-*) : `prime_forfait_eur_cts` est un montant
 *   PAR m² — la prime dossier = forfait × surface_m2 (surface obligatoire).
 * - Autres opérations (BAR-TH-*) : forfait par geste, prime = forfait.
 *
 * ⚠️ Montants indicatifs (source_doc en DB) : le montant opposable PNCEE est
 * recalculé au dépôt délégataire. Voir servicesartisans-emmy-operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/** Opérations dont le forfait est exprimé par m² de surface isolée. */
export const PER_M2_OPERATIONS: ReadonlySet<string> = new Set([
  'BAR-EN-101',
  'BAR-EN-102',
  'BAR-EN-103',
])

export interface ForfaitSnapshot {
  forfait_id: number
  forfait_version: string
  prime_cee_cts: number
}

export type ForfaitLookupResult =
  | { ok: true; snapshot: ForfaitSnapshot }
  | { ok: false; error: 'BAREME_NOT_FOUND' | 'SURFACE_REQUIRED' | 'DB_ERROR'; detail?: string }

interface ForfaitRow {
  id: number
  prime_forfait_eur_cts: number
  date_validite_debut: string
}

/**
 * Résout le forfait CEE en vigueur et calcule la prime snapshot.
 * Fail-closed : aucun barème trouvé → erreur typée, jamais de prime à 0
 * silencieuse.
 */
export async function lookupForfaitSnapshot(
  supabase: SupabaseClient,
  params: {
    operationCode: string
    zone: string
    revenusCategorie: string
    surfaceM2?: number | null
    at?: Date
  }
): Promise<ForfaitLookupResult> {
  const { operationCode, zone, revenusCategorie, surfaceM2 } = params
  const dateStr = (params.at ?? new Date()).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('cee_forfaits')
    .select('id, prime_forfait_eur_cts, date_validite_debut')
    .eq('operation_code', operationCode)
    .eq('zone', zone)
    .eq('categorie_revenus', revenusCategorie)
    .lte('date_validite_debut', dateStr)
    .or(`date_validite_fin.is.null,date_validite_fin.gte.${dateStr}`)
    .order('date_validite_debut', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('cee-bareme: forfait lookup DB error', error, {
      action: 'cee-bareme-lookup',
      operation_code: operationCode,
      zone,
    })
    return { ok: false, error: 'DB_ERROR', detail: error.message }
  }

  if (!data) {
    logger.warn('cee-bareme: no forfait for tuple', {
      action: 'cee-bareme-not-found',
      operation_code: operationCode,
      zone,
      categorie: revenusCategorie,
    })
    return {
      ok: false,
      error: 'BAREME_NOT_FOUND',
      detail: `operation=${operationCode} zone=${zone} categorie=${revenusCategorie}`,
    }
  }

  const row = data as unknown as ForfaitRow
  let primeCts = Number(row.prime_forfait_eur_cts)

  if (PER_M2_OPERATIONS.has(operationCode)) {
    if (!surfaceM2 || surfaceM2 <= 0) {
      return {
        ok: false,
        error: 'SURFACE_REQUIRED',
        detail: `operation=${operationCode} exige surface_m2 > 0`,
      }
    }
    primeCts = Math.round(primeCts * surfaceM2)
  }

  return {
    ok: true,
    snapshot: {
      forfait_id: Number(row.id),
      forfait_version: `${row.date_validite_debut}:${row.prime_forfait_eur_cts}`,
      prime_cee_cts: primeCts,
    },
  }
}
