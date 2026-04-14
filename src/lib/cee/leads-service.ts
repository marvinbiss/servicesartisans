/**
 * CEE leads & partners service — CRUD + state machine.
 *
 * Design
 * ------
 * - `createCeeLead` : insert cee_leads. La colonne `email_hash` est GENERATED
 *   côté SQL (SHA-256(lower(email))) — on la recalcule en Node pour pouvoir
 *   dédoublonner PRÉ-insert avant de payer le roundtrip DB.
 * - `createCeePartner` : insert cee_artisan_partners status='invited'.
 * - `updateCeePartnerStatus` : valide transition via `PARTNER_TRANSITIONS`,
 *   applique timestamp correspondant.
 * - State machine alignée sur migration 425 (enum `cee_partner_status`).
 *
 * Zéro PII dans les logs (email/téléphone jamais loggés).
 */

import crypto from 'crypto'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types & state machine
// ---------------------------------------------------------------------------

export type CeePartnerStatus =
  | 'invited'
  | 'onboarding'
  | 'convention_sent'
  | 'convention_signed'
  | 'training'
  | 'certified'
  | 'active'
  | 'suspended'
  | 'revoked'

/**
 * Transitions autorisées pour `cee_artisan_partners.status`.
 * Source unique — alignée sur migration 425 + plan V3 §PR2.
 */
export const PARTNER_TRANSITIONS: Record<CeePartnerStatus, CeePartnerStatus[]> = {
  invited: ['onboarding', 'revoked'],
  onboarding: ['convention_sent', 'revoked'],
  convention_sent: ['convention_signed', 'revoked'],
  convention_signed: ['training', 'certified', 'suspended', 'revoked'],
  training: ['certified', 'suspended', 'revoked'],
  certified: ['active', 'suspended', 'revoked'],
  active: ['suspended', 'revoked'],
  suspended: ['active', 'revoked'],
  revoked: [], // terminal
}

/** Timestamp mis à jour quand on entre dans un status. */
const STATUS_TIMESTAMP_COLUMN: Partial<Record<CeePartnerStatus, string>> = {
  invited: 'invited_at',
  onboarding: 'onboarding_started_at',
  convention_sent: 'convention_sent_at',
  convention_signed: 'convention_signed_at',
  training: 'training_completed_at',
  certified: 'certified_at',
  active: 'activated_at',
  suspended: 'suspended_at',
  revoked: 'revoked_at',
}

export interface CeeLeadInput {
  nom?: string | null
  prenom?: string | null
  email: string
  telephone_e164?: string | null
  code_postal?: string | null
  ville?: string | null
  zone_climatique?: 'H1' | 'H2' | 'H3' | null
  operation_code?: string | null
  prime_estimee_cts?: number | null
  source?: string
  status?:
    | 'simulation'
    | 'qualifie'
    | 'transmis_artisan'
    | 'devis_envoye'
    | 'devis_signe'
    | 'mandat_signe'
    | 'dossier_cee_depose'
    | 'paye'
    | 'perdu'
    | 'doublon'
  devis_request_id?: string | null
  artisan_id?: string | null
}

const CeeLeadInputSchema = z.object({
  nom: z.string().max(100).nullish(),
  prenom: z.string().max(100).nullish(),
  email: z.string().email(),
  telephone_e164: z
    .string()
    .regex(/^\+[1-9][0-9]{6,14}$/)
    .nullish(),
  code_postal: z.string().regex(/^[0-9]{5}$/).nullish(),
  ville: z.string().max(100).nullish(),
  zone_climatique: z.enum(['H1', 'H2', 'H3']).nullish(),
  operation_code: z.string().max(20).nullish(),
  prime_estimee_cts: z.number().int().nonnegative().nullish(),
  source: z.string().max(50).default('simulator'),
  status: z
    .enum([
      'simulation',
      'qualifie',
      'transmis_artisan',
      'devis_envoye',
      'devis_signe',
      'mandat_signe',
      'dossier_cee_depose',
      'paye',
      'perdu',
      'doublon',
    ])
    .default('simulation'),
  devis_request_id: z.string().uuid().nullish(),
  artisan_id: z.string().uuid().nullish(),
})

export interface CreatedLead {
  id: string
  email_hash: string
}

export interface CeePartner {
  id: string
  provider_id: string
  user_id: string
  status: CeePartnerStatus
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calcule `email_hash` côté app (identique à la colonne GENERATED SQL).
 * SHA-256(lower(email)) en hex.
 */
export function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex')
}

// ---------------------------------------------------------------------------
// API — CEE Leads
// ---------------------------------------------------------------------------

/**
 * Crée un lead CEE. Si un lead existe déjà avec même `email_hash` +
 * `operation_code` dans les dernières 24h, retourne le lead existant
 * (dédoublonnage côté DB via UNIQUE index partiel — migration 428).
 */
export async function createCeeLead(
  supabase: SupabaseClient,
  input: CeeLeadInput
): Promise<CreatedLead> {
  const parsed = CeeLeadInputSchema.parse(input)
  const email_hash = hashEmail(parsed.email)

  // Pré-check dédoublonnage pour éviter le 23505 si possible
  const { data: existing } = await supabase
    .from('cee_leads')
    .select('id')
    .eq('email_hash', email_hash)
    .eq('operation_code', parsed.operation_code ?? '')
    .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .is('duplicate_of', null)
    .maybeSingle()

  if (existing?.id) {
    logger.info('cee-leads: duplicate detected, returning existing', {
      action: 'cee-lead-dedup',
      leadId: existing.id,
    })
    return { id: existing.id, email_hash }
  }

  const { data, error } = await supabase
    .from('cee_leads')
    .insert({
      nom: parsed.nom ?? null,
      prenom: parsed.prenom ?? null,
      email: parsed.email,
      telephone_e164: parsed.telephone_e164 ?? null,
      code_postal: parsed.code_postal ?? null,
      ville: parsed.ville ?? null,
      zone_climatique: parsed.zone_climatique ?? null,
      operation_code: parsed.operation_code ?? null,
      prime_estimee_cts: parsed.prime_estimee_cts ?? null,
      source: parsed.source,
      status: parsed.status,
      devis_request_id: parsed.devis_request_id ?? null,
      artisan_id: parsed.artisan_id ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    // 23505 = unique violation → race avec pré-check, on retry le SELECT
    if ((error as { code?: string } | null)?.code === '23505') {
      const { data: raced } = await supabase
        .from('cee_leads')
        .select('id')
        .eq('email_hash', email_hash)
        .eq('operation_code', parsed.operation_code ?? '')
        .is('duplicate_of', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (raced?.id) return { id: raced.id, email_hash }
    }
    logger.error('cee-leads: insert failed', error, {
      action: 'cee-lead-insert',
    })
    throw new Error('Création lead CEE impossible')
  }

  logger.info('cee-leads: created', {
    action: 'cee-lead-created',
    leadId: data.id,
  })
  return { id: data.id, email_hash }
}

// ---------------------------------------------------------------------------
// API — CEE Partners
// ---------------------------------------------------------------------------

export interface CreateCeePartnerInput {
  userId: string
  providerId: string
}

/**
 * Crée un partner CEE status='invited'. Idempotent via UNIQUE(provider_id).
 */
export async function createCeePartner(
  supabase: SupabaseClient,
  input: CreateCeePartnerInput
): Promise<CeePartner> {
  const { userId, providerId } = input

  // Idempotence : si déjà existant, on retourne
  const { data: existing } = await supabase
    .from('cee_artisan_partners')
    .select('id, provider_id, user_id, status')
    .eq('provider_id', providerId)
    .maybeSingle()

  if (existing) {
    return existing as CeePartner
  }

  const { data, error } = await supabase
    .from('cee_artisan_partners')
    .insert({
      provider_id: providerId,
      user_id: userId,
      status: 'invited',
      invited_at: new Date().toISOString(),
    })
    .select('id, provider_id, user_id, status')
    .single()

  if (error || !data) {
    logger.error('cee-partners: insert failed', error, {
      action: 'cee-partner-insert',
    })
    throw new Error('Création partner CEE impossible')
  }

  logger.info('cee-partners: created', {
    action: 'cee-partner-created',
    partnerId: data.id,
  })
  return data as CeePartner
}

/**
 * Vérifie si une transition de status est autorisée.
 */
export function canTransition(
  from: CeePartnerStatus,
  to: CeePartnerStatus
): boolean {
  return PARTNER_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Met à jour le status d'un partner en validant la transition.
 * Applique automatiquement le timestamp correspondant au nouveau status.
 *
 * @throws Error si la transition n'est pas autorisée.
 */
export async function updateCeePartnerStatus(
  supabase: SupabaseClient,
  partnerId: string,
  newStatus: CeePartnerStatus,
  reason?: string
): Promise<CeePartner> {
  // Lit le status actuel
  const { data: current, error: readError } = await supabase
    .from('cee_artisan_partners')
    .select('id, provider_id, user_id, status')
    .eq('id', partnerId)
    .maybeSingle()

  if (readError || !current) {
    throw new Error('Partner CEE introuvable')
  }

  const currentStatus = current.status as CeePartnerStatus

  if (currentStatus === newStatus) {
    // Idempotent
    return current as CeePartner
  }

  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(
      `Transition interdite: ${currentStatus} → ${newStatus}`
    )
  }

  const now = new Date().toISOString()
  const tsColumn = STATUS_TIMESTAMP_COLUMN[newStatus]
  const update: Record<string, unknown> = { status: newStatus }
  if (tsColumn) update[tsColumn] = now
  if (newStatus === 'suspended' && reason) update.suspended_reason = reason
  if (newStatus === 'revoked' && reason) update.revoked_reason = reason

  const { data, error } = await supabase
    .from('cee_artisan_partners')
    .update(update)
    .eq('id', partnerId)
    .select('id, provider_id, user_id, status')
    .single()

  if (error || !data) {
    logger.error('cee-partners: status update failed', error, {
      action: 'cee-partner-status-update',
      partnerId,
      from: currentStatus,
      to: newStatus,
    })
    throw new Error('Mise à jour status partner impossible')
  }

  logger.info('cee-partners: status updated', {
    action: 'cee-partner-status-ok',
    partnerId,
    from: currentStatus,
    to: newStatus,
  })
  return data as CeePartner
}
