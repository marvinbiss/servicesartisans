/**
 * Pipedrive CRM integration — ServicesArtisans
 *
 * Syncs devis_requests leads to Pipedrive as Person + Deal.
 * Fire-and-forget from API routes: never blocks the user response.
 * A daily cron (/api/cron/pipedrive-retry) replays any failed syncs.
 *
 * Required env vars:
 *   PIPEDRIVE_API_TOKEN         — personal API token (Settings → Personal → API)
 *   PIPEDRIVE_COMPANY_DOMAIN    — your company subdomain (e.g. "servicesartisans")
 *   PIPEDRIVE_PIPELINE_ID       — numeric pipeline ID (optional, defaults to first)
 *   PIPEDRIVE_STAGE_ID          — numeric stage ID for new leads
 *
 * Optional custom field keys (set these if you created custom fields in Pipedrive):
 *   PIPEDRIVE_FIELD_SERVICE, PIPEDRIVE_FIELD_URGENCY, PIPEDRIVE_FIELD_CITY,
 *   PIPEDRIVE_FIELD_POSTAL_CODE, PIPEDRIVE_FIELD_SOURCE
 */

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Types ───────────────────────────────────────────────────────────

export interface DevisLeadForSync {
  id: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_name: string | null
  description: string | null
  budget: string | null
  urgency: string | null
  city: string | null
  postal_code: string | null
  created_at: string
}

interface PipedriveResponse<T> {
  success: boolean
  data: T | null
  error?: string
}

interface PipedrivePerson {
  id: number
}

interface PipedriveDeal {
  id: number
}

interface PipedrivePersonSearchItem {
  item: { id: number }
}

// ── Config ──────────────────────────────────────────────────────────

function getConfig() {
  const token = process.env.PIPEDRIVE_API_TOKEN
  const domain = process.env.PIPEDRIVE_COMPANY_DOMAIN
  if (!token || !domain) {
    return null
  }
  return {
    token,
    baseUrl: `https://${domain}.pipedrive.com/api/v1`,
    pipelineId: process.env.PIPEDRIVE_PIPELINE_ID ? Number(process.env.PIPEDRIVE_PIPELINE_ID) : undefined,
    stageId: process.env.PIPEDRIVE_STAGE_ID ? Number(process.env.PIPEDRIVE_STAGE_ID) : undefined,
    fields: {
      service: process.env.PIPEDRIVE_FIELD_SERVICE,
      urgency: process.env.PIPEDRIVE_FIELD_URGENCY,
      city: process.env.PIPEDRIVE_FIELD_CITY,
      postalCode: process.env.PIPEDRIVE_FIELD_POSTAL_CODE,
      source: process.env.PIPEDRIVE_FIELD_SOURCE,
    },
  }
}

export function isPipedriveConfigured(): boolean {
  return getConfig() !== null
}

// ── HTTP helper ─────────────────────────────────────────────────────

async function pdFetch<T>(
  path: string,
  init: RequestInit & { token: string; baseUrl: string }
): Promise<PipedriveResponse<T>> {
  const { token, baseUrl, ...rest } = init
  const sep = path.includes('?') ? '&' : '?'
  const url = `${baseUrl}${path}${sep}api_token=${encodeURIComponent(token)}`
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(rest.headers || {}),
    },
  })
  const json = (await res.json().catch(() => ({}))) as PipedriveResponse<T>
  if (!res.ok || !json.success) {
    throw new Error(`Pipedrive ${path} failed: ${res.status} ${json.error || res.statusText}`)
  }
  return json
}

// ── Person (contact) ────────────────────────────────────────────────

async function findExistingPerson(
  cfg: NonNullable<ReturnType<typeof getConfig>>,
  email: string | null,
  phone: string | null
): Promise<number | null> {
  const term = email || phone
  if (!term) return null
  const fields = email ? 'email' : 'phone'
  const res = await pdFetch<{ items: PipedrivePersonSearchItem[] }>(
    `/persons/search?term=${encodeURIComponent(term)}&fields=${fields}&exact_match=true&limit=1`,
    { token: cfg.token, baseUrl: cfg.baseUrl, method: 'GET' }
  )
  return res.data?.items?.[0]?.item.id ?? null
}

async function upsertPerson(
  cfg: NonNullable<ReturnType<typeof getConfig>>,
  lead: DevisLeadForSync
): Promise<number> {
  const existingId = await findExistingPerson(cfg, lead.client_email, lead.client_phone)
  if (existingId) return existingId

  const body = {
    name: lead.client_name || lead.client_email || lead.client_phone || 'Lead anonyme',
    ...(lead.client_email ? { email: [{ value: lead.client_email, primary: true, label: 'work' }] } : {}),
    ...(lead.client_phone ? { phone: [{ value: lead.client_phone, primary: true, label: 'work' }] } : {}),
  }
  const res = await pdFetch<PipedrivePerson>('/persons', {
    token: cfg.token,
    baseUrl: cfg.baseUrl,
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive person creation returned no id')
  return res.data.id
}

// ── Deal ────────────────────────────────────────────────────────────

async function createDeal(
  cfg: NonNullable<ReturnType<typeof getConfig>>,
  personId: number,
  lead: DevisLeadForSync
): Promise<number> {
  const title = `${lead.service_name || 'Devis'}${lead.city ? ` — ${lead.city}` : ''}`
  const body: Record<string, unknown> = {
    title,
    person_id: personId,
    status: 'open',
    ...(cfg.pipelineId ? { pipeline_id: cfg.pipelineId } : {}),
    ...(cfg.stageId ? { stage_id: cfg.stageId } : {}),
  }

  // Custom fields (only set if configured in env)
  if (cfg.fields.service && lead.service_name) body[cfg.fields.service] = lead.service_name
  if (cfg.fields.urgency && lead.urgency) body[cfg.fields.urgency] = lead.urgency
  if (cfg.fields.city && lead.city) body[cfg.fields.city] = lead.city
  if (cfg.fields.postalCode && lead.postal_code) body[cfg.fields.postalCode] = lead.postal_code
  if (cfg.fields.source) body[cfg.fields.source] = 'servicesartisans.fr'

  const res = await pdFetch<PipedriveDeal>('/deals', {
    token: cfg.token,
    baseUrl: cfg.baseUrl,
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive deal creation returned no id')
  return res.data.id
}

async function addDealNote(
  cfg: NonNullable<ReturnType<typeof getConfig>>,
  dealId: number,
  lead: DevisLeadForSync
): Promise<void> {
  const lines = [
    `<b>Service:</b> ${lead.service_name || '—'}`,
    `<b>Urgence:</b> ${lead.urgency || '—'}`,
    `<b>Ville:</b> ${lead.city || '—'} ${lead.postal_code || ''}`,
    `<b>Budget:</b> ${lead.budget || '—'}`,
    `<b>Description:</b> ${lead.description || '—'}`,
    `<br/><i>Lead ID: ${lead.id}</i>`,
  ]
  await pdFetch<unknown>('/notes', {
    token: cfg.token,
    baseUrl: cfg.baseUrl,
    method: 'POST',
    body: JSON.stringify({ deal_id: dealId, content: lines.join('<br/>') }),
  })
}

// ── Public API ──────────────────────────────────────────────────────

export interface PipedriveSyncResult {
  personId: number
  dealId: number
}

/**
 * Sync a single lead to Pipedrive (person + deal + note).
 * Throws on failure — callers should catch and log.
 */
export async function syncLeadToPipedrive(
  lead: DevisLeadForSync
): Promise<PipedriveSyncResult> {
  const cfg = getConfig()
  if (!cfg) throw new Error('Pipedrive not configured')

  const personId = await upsertPerson(cfg, lead)
  const dealId = await createDeal(cfg, personId, lead)
  await addDealNote(cfg, dealId, lead).catch((err) => {
    // Note failure shouldn't fail the whole sync — deal is what matters
    logger.warn('Pipedrive note creation failed', err)
  })

  return { personId, dealId }
}

/**
 * Sync a devis_requests lead by ID and persist the Pipedrive IDs
 * back into the database. Idempotent: if already synced, returns early.
 * Fire-and-forget safe: catches and logs its own errors.
 */
export async function syncDevisRequestToPipedrive(devisId: string): Promise<void> {
  if (!isPipedriveConfigured()) return

  const supabase = createAdminClient()

  const { data: lead, error } = await supabase
    .from('devis_requests')
    .select('id, client_name, client_email, client_phone, service_name, description, budget, urgency, city, postal_code, created_at, pipedrive_deal_id, pipedrive_sync_attempts')
    .eq('id', devisId)
    .single()

  if (error || !lead) {
    logger.error('pipedrive: lead not found', { devisId, error })
    return
  }

  // Idempotency guard — already synced
  if (lead.pipedrive_deal_id) return

  try {
    const result = await syncLeadToPipedrive(lead as DevisLeadForSync)
    await supabase
      .from('devis_requests')
      .update({
        pipedrive_person_id: result.personId,
        pipedrive_deal_id: result.dealId,
        pipedrive_synced_at: new Date().toISOString(),
        pipedrive_sync_error: null,
        pipedrive_sync_attempts: (lead.pipedrive_sync_attempts || 0) + 1,
      })
      .eq('id', devisId)
    logger.info('pipedrive: lead synced', { devisId, dealId: result.dealId })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('pipedrive: sync failed', { devisId, message })
    await supabase
      .from('devis_requests')
      .update({
        pipedrive_sync_error: message.slice(0, 500),
        pipedrive_sync_attempts: (lead.pipedrive_sync_attempts || 0) + 1,
      })
      .eq('id', devisId)
  }
}
