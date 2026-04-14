/**
 * Pipedrive integration — Callback conseiller (post-simulation)
 *
 * Triggered when a user on the simulator result page clicks "Rappel gratuit
 * par un conseiller". Attaches an Activity to the existing person/deal (looked
 * up by email) so the sales team sees the hot signal.
 *
 * Design choices:
 *   - Re-uses PIPEDRIVE_PIPELINE_SIMULATEUR config.
 *   - Finds person by email (idempotent). If no existing person, still creates
 *     an Activity under a freshly-created Deal in the simulateur pipeline.
 *   - Activity type "call" is standard Pipedrive; falls back to a Note on any
 *     failure (never throws to the caller).
 *   - Fire-and-forget from the HTTP route; logs errors.
 */

import { logger } from '@/lib/logger'

interface CallbackInput {
  publicId: string
  prenom: string | null
  nom: string | null
  email: string
  telephone: string
  preferredSlot: string | null
  remarquesClient: string | null
}

interface CallbackCfg {
  token: string
  baseUrl: string
  pipelineId: number
  stageId: number
}

function getConfig(): CallbackCfg | null {
  const token = process.env.PIPEDRIVE_API_TOKEN
  const domain = process.env.PIPEDRIVE_COMPANY_DOMAIN
  const pipelineRaw = process.env.PIPEDRIVE_PIPELINE_SIMULATEUR
  if (!token || !domain || !pipelineRaw) return null
  const pipelineId = Number(pipelineRaw)
  if (!Number.isFinite(pipelineId) || pipelineId <= 0) return null
  const stageRaw = process.env.PIPEDRIVE_STAGE_SIMULATEUR
  const stageId = stageRaw && Number.isFinite(Number(stageRaw)) ? Number(stageRaw) : 1
  return {
    token,
    baseUrl: `https://${domain}.pipedrive.com/api/v1`,
    pipelineId,
    stageId,
  }
}

interface PdResponse<T> {
  success: boolean
  data: T | null
  error?: string
}

async function pdFetch<T>(
  cfg: CallbackCfg,
  path: string,
  init: RequestInit = {}
): Promise<PdResponse<T>> {
  const sep = path.includes('?') ? '&' : '?'
  const url = `${cfg.baseUrl}${path}${sep}api_token=${encodeURIComponent(cfg.token)}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers || {}),
    },
  })
  const json = (await res.json().catch(() => ({}))) as PdResponse<T>
  if (!res.ok || !json.success) {
    throw new Error(
      `Pipedrive ${path} failed: ${res.status} ${json.error || res.statusText || 'unknown'}`
    )
  }
  return json
}

async function findPersonByEmail(cfg: CallbackCfg, email: string): Promise<number | null> {
  if (!email) return null
  const res = await pdFetch<{ items: Array<{ item: { id: number } }> }>(
    cfg,
    `/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`,
    { method: 'GET' }
  )
  return res.data?.items?.[0]?.item.id ?? null
}

async function upsertPerson(cfg: CallbackCfg, input: CallbackInput): Promise<number> {
  const existingId = await findPersonByEmail(cfg, input.email)
  if (existingId) return existingId

  const name = [input.prenom, input.nom].filter(Boolean).join(' ').trim() || input.email
  const body = {
    name,
    email: [{ value: input.email, primary: true, label: 'work' }],
    phone: [{ value: input.telephone, primary: true, label: 'work' }],
  }
  const res = await pdFetch<{ id: number }>(cfg, '/persons', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive person creation returned no id')
  return res.data.id
}

async function findOpenDeal(cfg: CallbackCfg, personId: number): Promise<number | null> {
  // Search open deals for this person in the simulateur pipeline, most recent first.
  const res = await pdFetch<{ items: Array<{ item: { id: number; pipeline_id: number } }> }>(
    cfg,
    `/deals/search?person_id=${personId}&status=open&limit=5`,
    { method: 'GET' }
  )
  const items = res.data?.items ?? []
  const inPipeline = items.find((it) => it.item.pipeline_id === cfg.pipelineId)
  return inPipeline?.item.id ?? items[0]?.item.id ?? null
}

async function createCallbackDeal(
  cfg: CallbackCfg,
  personId: number,
  input: CallbackInput
): Promise<number> {
  const title =
    `[RAPPEL] Simulateur — ${input.prenom ?? ''} ${input.nom ?? ''}`.trim() ||
    `[RAPPEL] ${input.email}`
  const res = await pdFetch<{ id: number }>(cfg, '/deals', {
    method: 'POST',
    body: JSON.stringify({
      title,
      person_id: personId,
      status: 'open',
      pipeline_id: cfg.pipelineId,
      stage_id: cfg.stageId,
      currency: 'EUR',
    }),
  })
  if (!res.data?.id) throw new Error('Pipedrive deal creation returned no id')
  return res.data.id
}

function buildNote(input: CallbackInput): string {
  const lines = [
    `<b>🔔 RAPPEL CONSEILLER DEMANDÉ</b>`,
    `<b>Estimation:</b> ${input.publicId}`,
    `<b>Téléphone:</b> ${input.telephone}`,
  ]
  if (input.preferredSlot) lines.push(`<b>Créneau souhaité:</b> ${input.preferredSlot}`)
  if (input.remarquesClient) lines.push(`<b>Remarques client:</b> ${input.remarquesClient}`)
  lines.push(`<br/><i>Source: page résultat simulateur — signal chaud</i>`)
  return lines.join('<br/>')
}

async function addDealNote(cfg: CallbackCfg, dealId: number, input: CallbackInput): Promise<void> {
  await pdFetch<unknown>(cfg, '/notes', {
    method: 'POST',
    body: JSON.stringify({ deal_id: dealId, content: buildNote(input) }),
  })
}

async function addCallActivity(
  cfg: CallbackCfg,
  dealId: number,
  personId: number,
  input: CallbackInput
): Promise<void> {
  const subject = `Rappel conseiller — ${input.publicId}`
  const note = `Téléphone: ${input.telephone}${
    input.preferredSlot ? ` · Créneau: ${input.preferredSlot}` : ''
  }${input.remarquesClient ? ` · Note: ${input.remarquesClient}` : ''}`
  // Due today, no specific time — sales team picks up ASAP.
  const dueDate = new Date().toISOString().slice(0, 10)
  await pdFetch<unknown>(cfg, '/activities', {
    method: 'POST',
    body: JSON.stringify({
      subject,
      type: 'call',
      deal_id: dealId,
      person_id: personId,
      due_date: dueDate,
      note,
    }),
  })
}

export interface CallbackResult {
  personId: number
  dealId: number
}

/**
 * Create or attach a callback request in Pipedrive. Throws on hard failure so
 * the caller can decide what to do; activity failure falls back to a note.
 */
export async function createCallbackRequest(input: CallbackInput): Promise<CallbackResult> {
  const cfg = getConfig()
  if (!cfg) throw new Error('Pipedrive simulateur not configured')

  const personId = await upsertPerson(cfg, input)
  const dealId =
    (await findOpenDeal(cfg, personId)) ?? (await createCallbackDeal(cfg, personId, input))

  // Note always (persistent record). Activity best-effort.
  await addDealNote(cfg, dealId, input)
  await addCallActivity(cfg, dealId, personId, input).catch((err) => {
    logger.warn('simulateur-callback: activity creation failed, note kept', {
      dealId,
      publicId: input.publicId,
      err: err instanceof Error ? err.message : String(err),
    })
  })

  return { personId, dealId }
}

export function isCallbackPipedriveConfigured(): boolean {
  return getConfig() !== null
}
