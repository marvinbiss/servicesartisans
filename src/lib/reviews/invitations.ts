import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  createInvitationToken,
  hashInvitationToken,
  INVITATION_DELAY_MS,
  INVITATION_EXPIRY_MS,
} from './invitation-token'

export type CreateInvitationInput = {
  devisRequestId: string
  clientEmail: string
  clientName: string | null
  serviceName: string | null
  providerId: string | null
}

export type CreateInvitationResult =
  | { success: true; invitationId: string; plaintextToken: string }
  | { success: false; reason: 'missing_email' | 'db_error' | 'duplicate' }

/**
 * Scheduled 7 days out so the artisan has time to complete the work
 * before the client is asked to review. Expires after +30 days total.
 */
export async function createInvitationForDevis(
  input: CreateInvitationInput
): Promise<CreateInvitationResult> {
  if (!input.clientEmail) {
    return { success: false, reason: 'missing_email' }
  }

  const supabase = createAdminClient()
  const { plaintext, hash } = createInvitationToken()
  const now = Date.now()
  const scheduledAt = new Date(now + INVITATION_DELAY_MS).toISOString()
  const expiresAt = new Date(now + INVITATION_DELAY_MS + INVITATION_EXPIRY_MS).toISOString()

  const { data, error } = await supabase
    .from('review_invitations')
    .insert({
      devis_request_id: input.devisRequestId,
      provider_id: input.providerId,
      client_email: input.clientEmail,
      client_name: input.clientName,
      service_name: input.serviceName,
      token_hash: hash,
      scheduled_at: scheduledAt,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, reason: 'duplicate' }
    }
    logger.error('[review_invitations] insert failed', error)
    return { success: false, reason: 'db_error' }
  }

  return { success: true, invitationId: data.id, plaintextToken: plaintext }
}

export async function findInvitationByPlaintextToken(plaintext: string) {
  const supabase = createAdminClient()
  const hash = hashInvitationToken(plaintext)

  const { data, error } = await supabase
    .from('review_invitations')
    .select(
      `
      id,
      devis_request_id,
      provider_id,
      client_email,
      client_name,
      service_name,
      scheduled_at,
      sent_at,
      completed_at,
      expires_at,
      review_id
    `
    )
    .eq('token_hash', hash)
    .maybeSingle()

  if (error) {
    logger.error('[review_invitations] lookup failed', error)
    return null
  }

  return data
}
