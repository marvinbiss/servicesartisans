import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export type ExclusivityProof = {
  assignmentId: string
  leadId: string
  providerId: string
  assignedAt: string
  status: string
  isExclusiveActive: boolean
  exclusivityProofHash: string
}

/**
 * Returns the DB-backed exclusivity proof for a given assignment.
 *
 * Why this matters: the partial UNIQUE index + trigger (migration 455)
 * guarantee at the schema level that only ONE active assignment exists
 * per lead. The hash is a deterministic fingerprint of (lead_id, provider_id,
 * assigned_at) — an artisan can cite it to prove their lead was not shared.
 */
export async function getExclusivityProofForAssignment(
  assignmentId: string
): Promise<ExclusivityProof | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('lead_exclusivity_audit')
    .select(
      'assignment_id, lead_id, provider_id, assigned_at, status, is_exclusive_active, exclusivity_proof_hash'
    )
    .eq('assignment_id', assignmentId)
    .maybeSingle()

  if (error) {
    logger.error('[exclusivity-proof] fetch error', error)
    return null
  }
  if (!data) return null

  return {
    assignmentId: data.assignment_id,
    leadId: data.lead_id,
    providerId: data.provider_id,
    assignedAt: data.assigned_at,
    status: data.status,
    isExclusiveActive: data.is_exclusive_active,
    exclusivityProofHash: data.exclusivity_proof_hash,
  }
}

export async function listExclusivityProofsForProvider(
  providerId: string,
  opts: { limit?: number } = {}
): Promise<ExclusivityProof[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('lead_exclusivity_audit')
    .select(
      'assignment_id, lead_id, provider_id, assigned_at, status, is_exclusive_active, exclusivity_proof_hash'
    )
    .eq('provider_id', providerId)
    .order('assigned_at', { ascending: false })
    .limit(opts.limit ?? 50)

  if (error) {
    logger.error('[exclusivity-proof] list error', error)
    return []
  }

  return (data ?? []).map((row) => ({
    assignmentId: row.assignment_id,
    leadId: row.lead_id,
    providerId: row.provider_id,
    assignedAt: row.assigned_at,
    status: row.status,
    isExclusiveActive: row.is_exclusive_active,
    exclusivityProofHash: row.exclusivity_proof_hash,
  }))
}
