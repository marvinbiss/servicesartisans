/**
 * Moteur de calcul du simulateur d'aides rénovation.
 * Source de vérité : docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md
 */

export * from './classifier'
export * from './eligibilite'
export * from './calc-mpr'
export * from './calc-cee'
export * from './calc-cdp'
export * from './calc-prets'
export * from './calc-complementaires'
export * from './non-cumul'
export * from './ecretement'
export * from './reste-a-charge'
export * from './lead-scoring'
export * from './pipeline'

// Re-export convenience types for CEE ampleur + MAR + prêts
export type { CeeAmpleurResult, MarResult } from './calc-cee'
export type { EcoPtzResult, ParResult } from './calc-prets'
export type { MprCoproResult, DenormandieResult, TaxeFonciereResult } from './calc-complementaires'
