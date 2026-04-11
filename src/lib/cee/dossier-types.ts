/**
 * Types applicatifs pour les dossiers CEE — brique 2 mandataire CEE.
 *
 * Source de vérité : migration 402 (`supabase/migrations/402_cee_dossiers_schema.sql`).
 * Ces types sont volontairement applicatifs (non générés) pour éviter de
 * toucher à `src/types/database.ts` en parallèle avec d'autres agents.
 * Maintenir l'alignement manuel avec le CHECK constraint SQL.
 */

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

/** Statut d'un dossier CEE — aligné sur le CHECK constraint de la migration 402. */
export type CeeDossierStatus =
  | 'brouillon'
  | 'pre_visite_planifiee'
  | 'pre_visite_effectuee'
  | 'engagement_signe'
  | 'travaux_en_cours'
  | 'travaux_acheves'
  | 'ah_signee'
  | 'depose_delegataire'
  | 'depose_pncee'
  | 'valide'
  | 'rejete'
  | 'annule'

/** Zone climatique RT 2012 — aligné sur `src/lib/cee/climate-zones.ts`. */
export type ClimateZone = 'H1' | 'H2' | 'H3'

/** Type d'événement consigné dans le journal d'audit. */
export type CeeDossierEventType =
  | 'status_change'
  | 'justificatif_uploaded'
  | 'justificatif_verified'
  | 'delegataire_assigned'
  | 'note_added'
  | 'prime_adjusted'
  | 'rejection'

/** Type d'acteur à l'origine d'un événement. */
export type CeeDossierActorType = 'system' | 'admin' | 'artisan' | 'client' | 'delegataire_api'

// -----------------------------------------------------------------------------
// Justificatif
// -----------------------------------------------------------------------------

/**
 * Pièce justificative collectée pour un dossier.
 *
 * Le `code` doit correspondre à l'un des codes déclarés dans
 * `cee_operations.justificatifs_requis` (cf. migration 400).
 */
export interface CeeDossierJustificatif {
  code: string
  label: string
  storage_path: string
  uploaded_at: string // ISO-8601
  verified_at: string | null
  exif_geotag_verified: boolean
}

// -----------------------------------------------------------------------------
// Dossier
// -----------------------------------------------------------------------------

/** Représentation applicative d'une ligne `cee_dossiers`. */
export interface CeeDossier {
  id: string
  devis_id: string | null
  client_id: string | null
  provider_id: string
  delegataire_id: string | null
  operation_code: string
  status: CeeDossierStatus
  date_engagement: string | null
  date_pre_visite: string | null
  date_debut_travaux: string | null
  date_fin_travaux: string | null
  date_ah_signature: string | null
  date_depot_delegataire: string | null
  date_depot_pncee: string | null
  date_validation: string | null
  zone_climatique: ClimateZone | null
  postal_code: string | null
  kwhc_estime: number | null
  kwhc_depose: number | null
  prime_estimee_eur: number | null
  prime_versee_eur: number | null
  precarite: boolean
  justificatifs: CeeDossierJustificatif[]
  rejection_reason: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// -----------------------------------------------------------------------------
// Event (journal d'audit)
// -----------------------------------------------------------------------------

/** Représentation applicative d'une ligne `cee_dossier_events`. */
export interface CeeDossierEvent {
  id: number
  dossier_id: string
  event_type: CeeDossierEventType
  from_status: CeeDossierStatus | null
  to_status: CeeDossierStatus | null
  actor_type: CeeDossierActorType
  actor_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

// -----------------------------------------------------------------------------
// Input types (CRUD)
// -----------------------------------------------------------------------------

/**
 * Payload de création d'un dossier CEE.
 * Tous les champs optionnels reçoivent un DEFAULT côté SQL (`status=brouillon`,
 * `precarite=false`, `justificatifs=[]`, etc.).
 */
export interface CreateCeeDossierInput {
  provider_id: string
  operation_code: string
  devis_id?: string | null
  client_id?: string | null
  delegataire_id?: string | null
  date_engagement?: string | null
  zone_climatique?: ClimateZone | null
  postal_code?: string | null
  kwhc_estime?: number | null
  prime_estimee_eur?: number | null
  precarite?: boolean
  metadata?: Record<string, unknown>
}

/** Résultat d'une transition de statut. */
export interface TransitionResult {
  ok: boolean
  error?: string
}
