/**
 * Types partagés pour l'API CEE estimate et ses consommateurs client.
 *
 * Utilisés par :
 *   - POST /api/cee/estimate (route.ts) — projection publique
 *   - CeeSimulator.tsx — formulaire d'estimation
 *   - CeeSavingsComparator.tsx — comparateur post-devis
 */

export interface PrimeEstimate {
  euros_classique_min: number
  euros_classique_max: number
  euros_precarite_min: number
  euros_precarite_max: number
}

export interface EstimateItem {
  code: string
  nom: string
  prime_estimate: PrimeEstimate | null
}

export interface EstimateResponse {
  eligible: boolean
  codes: string[]
  zone_climatique: 'H1' | 'H2' | 'H3' | null
  items: EstimateItem[]
}
