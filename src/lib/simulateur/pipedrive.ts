/**
 * Pipedrive integration — Simulateur aides rénovation
 *
 * Creates a Person + Deal + Note in a dedicated pipeline when an estimation
 * is submitted. Fire-and-forget from /api/simulateur/submit.
 *
 * On failure, the caller inserts a row in simulateur_pipedrive_failures (DLQ)
 * and the cron /api/cron/simulateur-pipedrive-retry replays every 6h with
 * exponential backoff capped at 24h, max 5 attempts.
 *
 * Required env vars (shared with existing Pipedrive integration):
 *   PIPEDRIVE_API_TOKEN
 *   PIPEDRIVE_COMPANY_DOMAIN
 *
 * Simulateur-specific:
 *   PIPEDRIVE_PIPELINE_SIMULATEUR   — numeric pipeline id for "Simulateur Aides"
 *   PIPEDRIVE_STAGE_SIMULATEUR      — numeric stage id (defaults to 1)
 *
 * Doc archi: docs/simulateur-architecture.md §6
 */

import { logger } from '@/lib/logger'
import type { Estimation } from './types'

// ── DLQ / retry config ─────────────────────────────────────────────

export const MAX_SIM_SYNC_ATTEMPTS = 5
const BACKOFF_BASE_HOURS = 1
const BACKOFF_CAP_HOURS = 24

/**
 * Exponential backoff: 2^attempt hours, capped at 24h.
 * attempts = total failures recorded so far (>= 1).
 *   1 → 2h, 2 → 4h, 3 → 8h, 4 → 16h, 5+ → 24h
 */
export function computeNextSimRetryAt(attempts: number, now: Date = new Date()): Date {
  const n = Math.max(1, attempts)
  const hours = Math.min(BACKOFF_CAP_HOURS, BACKOFF_BASE_HOURS * Math.pow(2, n))
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

// ── Input payload ──────────────────────────────────────────────────

export interface SimulateurLeadInput {
  publicId: string
  prenom: string
  nom: string
  email: string
  telephone: string
  // Estimation snapshot pour la note
  estimation: Pick<
    Estimation,
    | 'publicId'
    | 'categorieAnah'
    | 'zoneClimatique'
    | 'parcours'
    | 'gestes'
    | 'baremeIds'
    | 'mprTotal'
    | 'ceeFourchetteBas'
    | 'ceeFourchetteHaut'
    | 'coupPouceEstimation'
    | 'resteAChargeBas'
    | 'resteAChargeHaut'
    | 'barometreVersion'
    | 'codePostal'
    | 'surface'
    | 'rfr'
  >
}

export interface SimulateurSyncResult {
  personId: number
  dealId: number
}

// ── Config ─────────────────────────────────────────────────────────

interface SimConfig {
  token: string
  baseUrl: string
  pipelineId: number
  stageId: number
}

function getSimConfig(): SimConfig | null {
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

export function isSimulateurPipedriveConfigured(): boolean {
  return getSimConfig() !== null
}

// ── HTTP helper ────────────────────────────────────────────────────

interface PdResponse<T> {
  success: boolean
  data: T | null
  error?: string
}

async function pdFetch<T>(
  cfg: SimConfig,
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

// ── Person (idempotent by email) ───────────────────────────────────

async function findExistingPersonByEmail(cfg: SimConfig, email: string): Promise<number | null> {
  if (!email) return null
  const res = await pdFetch<{ items: Array<{ item: { id: number } }> }>(
    cfg,
    `/persons/search?term=${encodeURIComponent(email)}&fields=email&exact_match=true&limit=1`,
    { method: 'GET' }
  )
  return res.data?.items?.[0]?.item.id ?? null
}

async function upsertPerson(cfg: SimConfig, input: SimulateurLeadInput): Promise<number> {
  const existingId = await findExistingPersonByEmail(cfg, input.email)
  if (existingId) return existingId

  const name = `${input.prenom} ${input.nom}`.trim() || input.email
  const body = {
    name,
    email: [{ value: input.email, primary: true, label: 'work' }],
    ...(input.telephone
      ? { phone: [{ value: input.telephone, primary: true, label: 'work' }] }
      : {}),
  }
  const res = await pdFetch<{ id: number }>(cfg, '/persons', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive person creation returned no id')
  return res.data.id
}

// ── Deal ───────────────────────────────────────────────────────────

function computeDealValue(est: SimulateurLeadInput['estimation']): number {
  // Upper bound of aides for the Deal monetary "value"
  const v =
    (est.mprTotal || 0) + (est.ceeFourchetteHaut || 0) + (est.coupPouceEstimation || 0)
  return Math.round(v)
}

async function createDeal(
  cfg: SimConfig,
  personId: number,
  input: SimulateurLeadInput
): Promise<number> {
  const title = `Simulateur aides — ${input.prenom} ${input.nom} (${input.estimation.codePostal})`.trim()
  const body: Record<string, unknown> = {
    title,
    person_id: personId,
    status: 'open',
    pipeline_id: cfg.pipelineId,
    stage_id: cfg.stageId,
    value: computeDealValue(input.estimation),
    currency: 'EUR',
  }
  const res = await pdFetch<{ id: number }>(cfg, '/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive deal creation returned no id')
  return res.data.id
}

// ── Note ───────────────────────────────────────────────────────────

function buildNoteHtml(input: SimulateurLeadInput): string {
  const est = input.estimation
  const gestesList = (est.gestes || []).map((g) => `${g.label} (${g.id})`).join(', ') || '—'
  const baremesList = (est.baremeIds || []).slice(0, 40).join(', ') || '—'
  const fmt = (v: number | null | undefined) =>
    typeof v === 'number' && Number.isFinite(v)
      ? `${v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
      : '—'

  return [
    `<b>Estimation:</b> ${est.publicId}`,
    `<b>Version barèmes:</b> ${est.barometreVersion}`,
    `<b>Catégorie ANAH:</b> ${est.categorieAnah}`,
    `<b>Zone climatique:</b> ${est.zoneClimatique}`,
    `<b>Parcours:</b> ${est.parcours}`,
    `<b>Code postal:</b> ${est.codePostal}`,
    `<b>Surface:</b> ${est.surface} m²`,
    `<b>RFR:</b> ${fmt(est.rfr)}`,
    `<b>Gestes:</b> ${gestesList}`,
    `<br/>`,
    `<b>MaPrimeRénov':</b> ${fmt(est.mprTotal)}`,
    `<b>CEE:</b> ${fmt(est.ceeFourchetteBas)} — ${fmt(est.ceeFourchetteHaut)}`,
    `<b>Coup de Pouce:</b> ${fmt(est.coupPouceEstimation)}`,
    `<b>Reste à charge:</b> ${fmt(est.resteAChargeBas)} — ${fmt(est.resteAChargeHaut)}`,
    `<br/>`,
    `<b>Barèmes consultés:</b> ${baremesList}`,
  ].join('<br/>')
}

async function addDealNote(cfg: SimConfig, dealId: number, input: SimulateurLeadInput): Promise<void> {
  await pdFetch<unknown>(cfg, '/notes', {
    method: 'POST',
    body: JSON.stringify({ deal_id: dealId, content: buildNoteHtml(input) }),
  })
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Create a Person + Deal + Note in the dedicated Simulateur pipeline.
 * Throws on failure — callers are expected to catch and insert into DLQ.
 * Idempotent: Person is searched by email before creation.
 * Note creation failure does not fail the whole sync (deal is what matters).
 */
export async function createSimulateurDeal(
  input: SimulateurLeadInput
): Promise<SimulateurSyncResult> {
  const cfg = getSimConfig()
  if (!cfg) throw new Error('Pipedrive simulateur not configured')

  const personId = await upsertPerson(cfg, input)
  const dealId = await createDeal(cfg, personId, input)
  await addDealNote(cfg, dealId, input).catch((err) => {
    logger.warn('simulateur-pipedrive: note creation failed', {
      dealId,
      publicId: input.publicId,
      err: err instanceof Error ? err.message : String(err),
    })
  })

  return { personId, dealId }
}
