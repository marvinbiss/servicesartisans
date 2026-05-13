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
 * Optional custom field keys (shared with devis integration — same Pipedrive
 * account). If set, the Deal will carry structured metadata usable in filters:
 *   PIPEDRIVE_FIELD_SOURCE          — set to "simulateur-aides" here (vs
 *                                     "servicesartisans.fr" for /api/devis and
 *                                     "callback-simulateur" for the callback)
 *   PIPEDRIVE_FIELD_POSTAL_CODE     — mirrors estimation.codePostal
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
  requestId?: string
  prenom?: string | null
  nom?: string | null
  email?: string | null
  telephone?: string | null
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
  > & {
    leadPriority?: 'high' | 'normal'
    necessiteMAR?: boolean
    leadScore?: number
    leadSegment?: 'hot' | 'warm' | 'cold'
    confidenceLevel?: 'high' | 'medium' | 'low'
    urgenceProjet?: string | null
    ageChaudiere?: string | null
  }
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
  fields: {
    source?: string
    postalCode?: string
    baremeVersion?: string
    requestId?: string
    montantTotal?: string
    leadScore?: string
    leadSegment?: string
    confidenceLevel?: string
  }
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
    fields: {
      source: process.env.PIPEDRIVE_FIELD_SOURCE,
      postalCode: process.env.PIPEDRIVE_FIELD_POSTAL_CODE,
      baremeVersion: process.env.PIPEDRIVE_FIELD_BAREME_VERSION,
      requestId: process.env.PIPEDRIVE_FIELD_REQUEST_ID,
      montantTotal: process.env.PIPEDRIVE_FIELD_MONTANT_TOTAL,
      leadScore: process.env.PIPEDRIVE_FIELD_LEAD_SCORE,
      leadSegment: process.env.PIPEDRIVE_FIELD_LEAD_SEGMENT,
      confidenceLevel: process.env.PIPEDRIVE_FIELD_CONFIDENCE_LEVEL,
    },
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
  const url = `${cfg.baseUrl}${path}`
  // 5s timeout : protège le cron (maxDuration 60s, budget 25s/row) d'un appel
  // Pipedrive bloqué indéfiniment qui écraserait notre deadline.
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(5_000),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-api-token': cfg.token,
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

// ── Person (idempotent by email, phone fallback) ───────────────────

async function findExistingPerson(
  cfg: SimConfig,
  email: string | null | undefined,
  phone: string | null | undefined
): Promise<number | null> {
  // Search email first (primary identity), phone second (cross-canal dedupe
  // when the same user submits a devis then the simulator with another email).
  for (const [term, field] of [[email, 'email'] as const, [phone, 'phone'] as const]) {
    if (!term) continue
    const res = await pdFetch<{ items: Array<{ item: { id: number } }> }>(
      cfg,
      `/persons/search?term=${encodeURIComponent(term)}&fields=${field}&exact_match=true&limit=1`,
      { method: 'GET' }
    )
    const id = res.data?.items?.[0]?.item.id
    if (id) return id
  }
  return null
}

async function upsertPerson(cfg: SimConfig, input: SimulateurLeadInput): Promise<number> {
  const existingId = await findExistingPerson(cfg, input.email, input.telephone)
  if (existingId) return existingId

  const name =
    `${input.prenom ?? ''} ${input.nom ?? ''}`.trim() ||
    input.email ||
    input.telephone ||
    input.publicId
  const body: Record<string, unknown> = { name }
  if (input.email) {
    body.email = [{ value: input.email, primary: true, label: 'work' }]
  }
  if (input.telephone) {
    body.phone = [{ value: input.telephone, primary: true, label: 'work' }]
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
  const v = (est.mprTotal || 0) + (est.ceeFourchetteHaut || 0) + (est.coupPouceEstimation || 0)
  return Math.round(v)
}

async function createDeal(
  cfg: SimConfig,
  personId: number,
  input: SimulateurLeadInput
): Promise<number> {
  const displayName =
    `${input.prenom ?? ''} ${input.nom ?? ''}`.trim() || input.email || input.telephone || 'Lead'
  const title = `Simulateur aides — ${displayName} (${input.estimation.codePostal})`.trim()
  const body: Record<string, unknown> = {
    title,
    person_id: personId,
    status: 'open',
    pipeline_id: cfg.pipelineId,
    stage_id: cfg.stageId,
    value: computeDealValue(input.estimation),
    currency: 'EUR',
  }
  // Custom fields (only set if configured in env — shared keys with devis).
  if (cfg.fields.source) body[cfg.fields.source] = 'simulateur-aides'
  if (cfg.fields.postalCode && input.estimation.codePostal) {
    body[cfg.fields.postalCode] = input.estimation.codePostal
  }
  if (cfg.fields.baremeVersion && input.estimation.barometreVersion) {
    body[cfg.fields.baremeVersion] = input.estimation.barometreVersion
  }
  if (cfg.fields.requestId && input.requestId) {
    body[cfg.fields.requestId] = input.requestId
  }
  if (cfg.fields.montantTotal) {
    body[cfg.fields.montantTotal] = computeDealValue(input.estimation)
  }
  if (cfg.fields.leadScore && input.estimation.leadScore != null) {
    body[cfg.fields.leadScore] = input.estimation.leadScore
  }
  if (cfg.fields.leadSegment && input.estimation.leadSegment) {
    body[cfg.fields.leadSegment] = input.estimation.leadSegment.toUpperCase()
  }
  if (cfg.fields.confidenceLevel && input.estimation.confidenceLevel) {
    body[cfg.fields.confidenceLevel] = input.estimation.confidenceLevel
  }
  // Tags pour scoring et routing
  const tags: string[] = []
  if (input.estimation.leadPriority === 'high') {
    tags.push('FIOUL-PRIORITAIRE')
  }
  if (input.estimation.necessiteMAR === true) {
    tags.push('NECESSITE-MAR')
  }
  const segment = input.estimation.leadSegment
  if (segment) {
    tags.push(segment.toUpperCase())
  }
  if (tags.length > 0) {
    body.label = tags.join(', ')
  }

  const res = await pdFetch<{ id: number }>(cfg, '/deals', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.data?.id) throw new Error('Pipedrive deal creation returned no id')
  return res.data.id
}

// ── Note ───────────────────────────────────────────────────────────

function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return '—'
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildNoteHtml(input: SimulateurLeadInput): string {
  const est = input.estimation
  const gestesList =
    (est.gestes || []).map((g) => `${escapeHtml(g.label)} (${escapeHtml(g.id)})`).join(', ') || '—'
  const baremesList =
    (est.baremeIds || [])
      .slice(0, 40)
      .map((b) => escapeHtml(b))
      .join(', ') || '—'
  const fmt = (v: number | null | undefined) =>
    typeof v === 'number' && Number.isFinite(v)
      ? `${v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
      : '—'

  return [
    `<b>Estimation:</b> ${escapeHtml(est.publicId)}`,
    ...(input.requestId ? [`<b>Request ID:</b> ${escapeHtml(input.requestId)}`] : []),
    `<b>Version barèmes:</b> ${escapeHtml(est.barometreVersion)}`,
    `<b>Catégorie ANAH:</b> ${escapeHtml(est.categorieAnah)}`,
    `<b>Zone climatique:</b> ${escapeHtml(est.zoneClimatique)}`,
    `<b>Parcours:</b> ${escapeHtml(est.parcours)}`,
    `<b>Code postal:</b> ${escapeHtml(est.codePostal)}`,
    `<b>Surface:</b> ${escapeHtml(est.surface)} m²`,
    `<b>RFR:</b> ${fmt(est.rfr)}`,
    `<b>Gestes:</b> ${gestesList}`,
    `<br/>`,
    `<b>MaPrimeRénov':</b> ${fmt(est.mprTotal)}`,
    `<b>CEE:</b> ${fmt(est.ceeFourchetteBas)} — ${fmt(est.ceeFourchetteHaut)}`,
    `<b>Coup de Pouce:</b> ${fmt(est.coupPouceEstimation)}`,
    `<b>Reste à charge:</b> ${fmt(est.resteAChargeBas)} — ${fmt(est.resteAChargeHaut)}`,
    `<br/>`,
    `<b>Score commercial:</b> ${est.leadScore ?? '—'}/100 — Segment <b>${(est.leadSegment ?? '—').toUpperCase()}</b>`,
    `<b>Confiance estimation:</b> ${escapeHtml(est.confidenceLevel ?? '—')}`,
    ...(est.urgenceProjet ? [`<b>Urgence projet:</b> ${escapeHtml(est.urgenceProjet)}`] : []),
    ...(est.ageChaudiere ? [`<b>Âge chaudière:</b> ${escapeHtml(est.ageChaudiere)}`] : []),
    ...(est.leadPriority === 'high'
      ? [`<b>🔴 LEAD PRIORITAIRE — Fioul</b> (valeur 5x, à traiter en priorité)`]
      : []),
    ...(est.necessiteMAR === true
      ? [`<b>🏠 Nécessite MAR</b> — Router vers Mon Accompagnateur Rénov' partenaire`]
      : []),
    `<br/>`,
    `<b>Barèmes consultés:</b> ${baremesList}`,
  ].join('<br/>')
}

async function addDealNote(
  cfg: SimConfig,
  dealId: number,
  input: SimulateurLeadInput
): Promise<void> {
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
