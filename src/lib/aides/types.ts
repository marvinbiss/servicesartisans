/**
 * Types deterministic calculator MaPrimeRénov' 2026.
 *
 * Symétrie volontaire avec les `metadata.geste` / `metadata.menage_categorie`
 * du fichier `evals/gold/mpr-bareme-2026.jsonl` (Ralph 7). Le golden test
 * `__tests__/lib/aides/__golden.test.ts` repose sur cette correspondance.
 */

import type { SourceRef } from './__sources'

export type Geste =
  | 'pac_air_eau'
  | 'pac_geothermique'
  | 'pac_air_air'
  | 'chauffe_eau_thermo'
  | 'isolation_combles'
  | 'isolation_ite'
  | 'isolation_planchers_bas'
  | 'vmc_double_flux'
  | 'chaudiere_biomasse'
  | 'audit_energetique'

export type MenageCategorie = 'tres_modeste' | 'modeste' | 'intermediaire' | 'superieur'

export type Zone = 'idf' | 'hors_idf'

export type BaremeEntry = {
  geste: Geste
  menageCategorie: MenageCategorie
  amountEUR: number | null
  sourceRef: SourceRef
  notes?: string
}

export type BaremeResult =
  | { eligible: true; amountEUR: number; sourceRef: SourceRef; notes?: string }
  | { eligible: false; reason: string; sourceRef: SourceRef }

export type EligibilityInput = {
  rfr: number
  nbPersonnes: number
  zone: Zone
  geste: Geste
}

export type EligibilityResult = {
  eligible: boolean
  menageCategorie: MenageCategorie | null
  plafondAtteint: number
  reason?: string
  sourceRef: SourceRef
}

export type PlafondRevenusEntry = {
  zone: Zone
  nbPersonnes: number
  tresModesteMax: number
  modesteMax: number
  intermediaireMax: number
  stepIncrement?: number
}
