/**
 * CEE dossier creation — business gate validation + idempotence + barème snapshot.
 *
 * Business gates (all must pass before INSERT):
 *   1. Partner status = 'active' (convention signée + certified + activé)
 *   2. convention_signed_at non-null (sécurité défensive, cohérent avec status)
 *   3. certified_at non-null (quiz >= 8/10 passé)
 *   4. RGE valide à la date de dépôt (at least one non-expired qualification)
 *   5. operation_code dans operations_allowed du partner
 *
 * Idempotence:
 *   Clé composite (partner_id, client_email_hash, operation_code, date(created_at))
 *   → Si un dossier draft existe déjà pour ce tuple aujourd'hui, on le retourne.
 *
 * Snapshot barème:
 *   Les colonnes forfait_id, forfait_version, prime_cee_cts, commission_rate
 *   sont gelées à la date de création — pas de recalcul a posteriori.
 *
 * Zéro PII dans les logs (email hashé, pas de nom/prénom).
 */

import crypto from 'crypto'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CeeDossierV3Status = z.infer<typeof CeeDossierV3StatusEnum>

export const CeeDossierV3StatusEnum = z.enum([
  'draft',
  'submitted_by_artisan',
  'qa_pending',
  'qa_approved',
  'qa_rejected',
  'deposited',
  'validated_pncee',
  'rejected_pncee',
  'paid_client',
  'commission_due',
  'commission_paid',
  'archived',
])

export interface CeeDossierV3 {
  id: string
  reference: string
  partner_id: string
  provider_id: string
  client_email_hash: string | null
  client_code_postal: string
  client_commune_insee: string
  foyer_personnes: number
  revenus_categorie: string
  rfr_declared_cts: number | null
  operation_code: string
  type_travaux: string
  surface_m2: number | null
  annee_construction: number | null
  energie_remplacee: string | null
  montant_ht_cts: number
  montant_ttc_cts: number
  date_devis: string
  date_chantier_prevue: string | null
  date_chantier_realisee: string | null
  forfait_id: number
  forfait_version: string
  prime_cee_cts: number
  prime_mpr_cts: number | null
  commission_rate: number
  status: CeeDossierV3Status
  delegataire: string | null
  pncee_reference: string | null
  qa_score: number | null
  created_at: string
  updated_at: string
}

export const CreateDossierInputSchema = z.object({
  partner_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  // Client PII (chiffrées côté appelant avant passage ici — on reçoit les bytea encodés base64)
  client_nom_b64: z.string().min(1),
  client_prenom_b64: z.string().min(1),
  client_email_b64: z.string().min(1),
  client_email_hash: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]{64}$/),
  client_telephone_b64: z.string().nullish(),
  client_adresse_b64: z.string().min(1),
  client_code_postal: z.string().regex(/^[0-9]{5}$/),
  client_commune_insee: z.string().min(1).max(10),
  // Revenus
  foyer_personnes: z.number().int().min(1).max(12),
  revenus_categorie: z.enum(['tres_modeste', 'modeste', 'intermediaire', 'superieur']),
  rfr_declared_cts: z.number().int().nonnegative().nullish(),
  // Chantier
  operation_code: z.string().regex(/^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$/),
  type_travaux: z.string().min(1).max(200),
  surface_m2: z.number().positive().nullish(),
  annee_construction: z.number().int().min(1800).max(2100).nullish(),
  energie_remplacee: z.string().max(50).nullish(),
  montant_ht_cts: z.number().int().nonnegative(),
  montant_ttc_cts: z.number().int().nonnegative(),
  date_devis: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  date_chantier_prevue: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .nullish(),
  // Barème snapshot (fourni par l'appelant après lookup cee_forfaits)
  forfait_id: z.number().int().positive(),
  forfait_version: z.string().min(1).max(50),
  prime_cee_cts: z.number().int().nonnegative(),
  prime_mpr_cts: z.number().int().nonnegative().nullish(),
  commission_rate: z.number().min(0).max(100),
})

export type CreateDossierInput = z.infer<typeof CreateDossierInputSchema>

export type BusinessGateError =
  | 'PARTNER_NOT_FOUND'
  | 'PARTNER_NOT_ACTIVE'
  | 'CONVENTION_NOT_SIGNED'
  | 'NOT_CERTIFIED'
  | 'RGE_EXPIRED'
  | 'OPERATION_NOT_ALLOWED'
  | 'VALIDATION_ERROR'
  | 'DB_ERROR'

export type CreateDossierResult =
  | { ok: true; dossier: CeeDossierV3; status: 'draft' | 'existing' }
  | { ok: false; error: BusinessGateError; detail?: string }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Génère un hash email côté app (identique à la colonne SQL).
 */
export function hashEmailForDossier(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
}

/**
 * Génère une référence SAE-YYYYMM-NNNNNN à partir d'un ID UUID.
 * Le suffixe 6 chiffres est extrait des 3 premiers bytes du UUID (hex → int).
 */
export function generateDossierReference(date: Date, uuidSuffix: string): string {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  // Prend les 6 premiers chars hex du UUID (après les tirets)
  const hex = uuidSuffix.replace(/-/g, '').slice(0, 6)
  const num = parseInt(hex, 16) % 1_000_000
  return `SAE-${yyyymm}-${String(num).padStart(6, '0')}`
}

// ---------------------------------------------------------------------------
// Business gate check
// ---------------------------------------------------------------------------

interface PartnerRow {
  id: string
  status: string
  convention_signed_at: string | null
  certified_at: string | null
  operations_allowed: string[]
  provider: {
    rge_qualifications: Array<{
      code: string
      date_fin?: string | null
    }> | null
  } | null
}

/**
 * Vérifie toutes les business gates avant création du dossier.
 * Fail-closed : retourne une erreur typée sur le premier gate qui échoue.
 */
export async function checkDossierCreationGates(
  supabase: SupabaseClient,
  partnerId: string,
  operationCode: string,
  depositDate: Date = new Date()
): Promise<
  { ok: true; partner: PartnerRow } | { ok: false; error: BusinessGateError; detail?: string }
> {
  const { data: partner, error: partnerError } = await supabase
    .from('cee_artisan_partners')
    .select(
      'id, status, convention_signed_at, certified_at, operations_allowed, provider:provider_id(rge_qualifications)'
    )
    .eq('id', partnerId)
    .maybeSingle()

  if (partnerError) {
    logger.error('dossier-creation: partner lookup DB error', partnerError, {
      action: 'dossier-gate-partner-lookup',
      partner_id: partnerId,
    })
    return { ok: false, error: 'DB_ERROR', detail: partnerError.message }
  }

  if (!partner) {
    return { ok: false, error: 'PARTNER_NOT_FOUND' }
  }

  const typedPartner = partner as unknown as PartnerRow

  // Gate 1: Partner must be active
  if (typedPartner.status !== 'active') {
    logger.warn('dossier-creation: partner not active', {
      action: 'dossier-gate-status',
      partner_id: partnerId,
      status: typedPartner.status,
    })
    return { ok: false, error: 'PARTNER_NOT_ACTIVE', detail: `status=${typedPartner.status}` }
  }

  // Gate 2: Convention must be signed
  if (!typedPartner.convention_signed_at) {
    return { ok: false, error: 'CONVENTION_NOT_SIGNED' }
  }

  // Gate 3: Must be certified (quiz passed)
  if (!typedPartner.certified_at) {
    return { ok: false, error: 'NOT_CERTIFIED' }
  }

  // Gate 4: RGE must be valid at deposit date
  const qualifications = typedPartner.provider?.rge_qualifications ?? []
  const depositDateStr = depositDate.toISOString().slice(0, 10)
  const hasValidRge = qualifications.some((q) => {
    if (!q.date_fin) return true // no expiry = still valid
    return q.date_fin >= depositDateStr
  })

  if (!hasValidRge) {
    logger.warn('dossier-creation: RGE expired at deposit date', {
      action: 'dossier-gate-rge',
      partner_id: partnerId,
      deposit_date: depositDateStr,
    })
    return { ok: false, error: 'RGE_EXPIRED', detail: `deposit_date=${depositDateStr}` }
  }

  // Gate 5: Operation must be in partner's allowed operations
  const ops = typedPartner.operations_allowed ?? []
  if (ops.length > 0 && !ops.includes(operationCode)) {
    logger.warn('dossier-creation: operation not allowed for partner', {
      action: 'dossier-gate-operation',
      partner_id: partnerId,
      operation_code: operationCode,
    })
    return { ok: false, error: 'OPERATION_NOT_ALLOWED', detail: `operation_code=${operationCode}` }
  }

  return { ok: true, partner: typedPartner }
}

// ---------------------------------------------------------------------------
// createDossier
// ---------------------------------------------------------------------------

const DOSSIER_SELECT = [
  'id',
  'reference',
  'partner_id',
  'provider_id',
  'client_email_hash',
  'client_code_postal',
  'client_commune_insee',
  'foyer_personnes',
  'revenus_categorie',
  'rfr_declared_cts',
  'operation_code',
  'type_travaux',
  'surface_m2',
  'annee_construction',
  'energie_remplacee',
  'montant_ht_cts',
  'montant_ttc_cts',
  'date_devis',
  'date_chantier_prevue',
  'date_chantier_realisee',
  'forfait_id',
  'forfait_version',
  'prime_cee_cts',
  'prime_mpr_cts',
  'commission_rate',
  'status',
  'delegataire',
  'pncee_reference',
  'qa_score',
  'created_at',
  'updated_at',
].join(',')

/**
 * Crée un dossier CEE après validation des business gates.
 *
 * Idempotence : si un dossier draft existe déjà pour
 * (partner_id, client_email_hash, operation_code) dans la même journée,
 * on retourne le dossier existant avec status='existing'.
 *
 * @param supabase Client avec RLS respecté (createClient). L'admin client
 *   est passé séparément uniquement pour l'INSERT (RLS insert autorisé
 *   pour artisan active via policy).
 */
export async function createDossier(
  supabase: SupabaseClient,
  input: CreateDossierInput,
  depositDate: Date = new Date()
): Promise<CreateDossierResult> {
  // Validate input schema
  const parsed = CreateDossierInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'VALIDATION_ERROR',
      detail: parsed.error.issues.map((i) => i.message).join('; '),
    }
  }

  const data = parsed.data

  // Business gates
  const gateResult = await checkDossierCreationGates(
    supabase,
    data.partner_id,
    data.operation_code,
    depositDate
  )
  if (!gateResult.ok) {
    return { ok: false, error: gateResult.error, detail: gateResult.detail }
  }

  // Idempotence check: same (partner_id, email_hash, operation_code) today
  const todayStart = new Date(depositDate)
  todayStart.setHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from('cee_dossiers')
    .select(DOSSIER_SELECT)
    .eq('partner_id', data.partner_id)
    .eq('client_email_hash', data.client_email_hash)
    .eq('operation_code', data.operation_code)
    .eq('status', 'draft')
    .gte('created_at', todayStart.toISOString())
    .maybeSingle()

  if (existing) {
    const existingRow = existing as unknown as CeeDossierV3
    logger.info('dossier-creation: idempotent hit, returning existing draft', {
      action: 'dossier-create-idempotent',
      dossier_id: existingRow.id,
      partner_id: data.partner_id,
    })
    return { ok: true, dossier: existingRow, status: 'existing' }
  }

  // Generate reference (temporary ID used; will be replaced by actual UUID after insert)
  const tempId = crypto.randomUUID()
  const reference = generateDossierReference(depositDate, tempId)

  // Build PII encoded fields (base64 → Buffer for bytea storage)
  const nomBuf = Buffer.from(data.client_nom_b64, 'base64')
  const prenomBuf = Buffer.from(data.client_prenom_b64, 'base64')
  const emailBuf = Buffer.from(data.client_email_b64, 'base64')
  const adresseBuf = Buffer.from(data.client_adresse_b64, 'base64')
  const telBuf = data.client_telephone_b64 ? Buffer.from(data.client_telephone_b64, 'base64') : null

  const { data: inserted, error: insertError } = await supabase
    .from('cee_dossiers')
    .insert({
      reference,
      partner_id: data.partner_id,
      provider_id: data.provider_id,
      client_nom_encrypted: `\\x${nomBuf.toString('hex')}`,
      client_prenom_encrypted: `\\x${prenomBuf.toString('hex')}`,
      client_email_encrypted: `\\x${emailBuf.toString('hex')}`,
      client_email_hash: data.client_email_hash,
      client_telephone_encrypted: telBuf ? `\\x${telBuf.toString('hex')}` : null,
      client_adresse_encrypted: `\\x${adresseBuf.toString('hex')}`,
      client_code_postal: data.client_code_postal,
      client_commune_insee: data.client_commune_insee,
      foyer_personnes: data.foyer_personnes,
      revenus_categorie: data.revenus_categorie,
      rfr_declared_cts: data.rfr_declared_cts ?? null,
      operation_code: data.operation_code,
      type_travaux: data.type_travaux,
      surface_m2: data.surface_m2 ?? null,
      annee_construction: data.annee_construction ?? null,
      energie_remplacee: data.energie_remplacee ?? null,
      montant_ht_cts: data.montant_ht_cts,
      montant_ttc_cts: data.montant_ttc_cts,
      date_devis: data.date_devis,
      date_chantier_prevue: data.date_chantier_prevue ?? null,
      forfait_id: data.forfait_id,
      forfait_version: data.forfait_version,
      prime_cee_cts: data.prime_cee_cts,
      prime_mpr_cts: data.prime_mpr_cts ?? null,
      commission_rate: data.commission_rate,
      status: 'draft',
    })
    .select(DOSSIER_SELECT)
    .single()

  if (insertError || !inserted) {
    // Handle unique reference collision (race condition)
    if ((insertError as { code?: string } | null)?.code === '23505') {
      logger.warn('dossier-creation: reference collision, retrying idempotence check', {
        action: 'dossier-create-collision',
        partner_id: data.partner_id,
      })
      // Retry idempotence lookup
      const { data: raced } = await supabase
        .from('cee_dossiers')
        .select(DOSSIER_SELECT)
        .eq('partner_id', data.partner_id)
        .eq('client_email_hash', data.client_email_hash)
        .eq('operation_code', data.operation_code)
        .eq('status', 'draft')
        .gte('created_at', todayStart.toISOString())
        .maybeSingle()
      if (raced) {
        return { ok: true, dossier: raced as unknown as CeeDossierV3, status: 'existing' }
      }
    }
    logger.error('dossier-creation: insert failed', insertError, {
      action: 'dossier-create-insert',
      partner_id: data.partner_id,
      operation_code: data.operation_code,
    })
    return { ok: false, error: 'DB_ERROR', detail: insertError?.message }
  }

  const insertedRow = inserted as unknown as CeeDossierV3
  logger.info('dossier-creation: created', {
    action: 'dossier-created',
    dossier_id: insertedRow.id,
    partner_id: data.partner_id,
    operation_code: data.operation_code,
  })

  return { ok: true, dossier: insertedRow, status: 'draft' }
}
