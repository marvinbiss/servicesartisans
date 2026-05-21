/**
 * RGE-OS Webhook event catalog (pillar 8).
 *
 * Closed-set TypeScript union — adding a new event requires updating
 * `ALL_EVENTS`, `WebhookPayloadByEvent`, AND the docs in
 * `docs/API-V1-WEBHOOKS.md`. The strict typing prevents drift where the
 * emitter side and the subscriber DB column would disagree on the event
 * name (e.g. typos like `rge.snapshot.refresh` vs `rge.snapshot.refreshed`).
 *
 * Events v0.1 are emitted MANUALLY (the cron emitters are wired in a
 * separate sprint). The `/api/v1/webhooks/test` endpoint already fires
 * a mock payload so integrators can validate their endpoint logic today.
 */

export type WebhookEvent =
  | 'rge.snapshot.refreshed'
  | 'rge.qualification.added'
  | 'aides.bareme.updated'
  | 'ai.transparency.updated'

export const ALL_EVENTS: readonly WebhookEvent[] = [
  'rge.snapshot.refreshed',
  'rge.qualification.added',
  'aides.bareme.updated',
  'ai.transparency.updated',
] as const

export type WebhookPayloadByEvent = {
  'rge.snapshot.refreshed': {
    snapshot_date: string
    providers_count: number
    qualifications_count: number
  }
  'rge.qualification.added': {
    siret: string
    qualif_code: string
    date_debut: string
  }
  'aides.bareme.updated': {
    aide: 'maprimerenov' | 'cee'
    version_id: string
    snapshot_date: string
  }
  'ai.transparency.updated': {
    version: string
    change_summary: string
  }
}

export function isValidEvent(s: string): s is WebhookEvent {
  return (ALL_EVENTS as readonly string[]).includes(s)
}

/**
 * Mock payload helpers used by `/api/v1/webhooks/test`. Returning a static
 * but realistic shape lets integrators validate their JSON.parse + schema
 * checks before subscribing to live events.
 */
export function mockPayloadFor<E extends WebhookEvent>(event: E): WebhookPayloadByEvent[E] {
  switch (event) {
    case 'rge.snapshot.refreshed':
      return {
        snapshot_date: new Date().toISOString().slice(0, 10),
        providers_count: 49228,
        qualifications_count: 165432,
      } as WebhookPayloadByEvent[E]
    case 'rge.qualification.added':
      return {
        siret: '12345678901234',
        qualif_code: 'QB-5911',
        date_debut: new Date().toISOString().slice(0, 10),
      } as WebhookPayloadByEvent[E]
    case 'aides.bareme.updated':
      return {
        aide: 'maprimerenov',
        version_id: '2026-q2',
        snapshot_date: new Date().toISOString().slice(0, 10),
      } as WebhookPayloadByEvent[E]
    case 'ai.transparency.updated':
      return {
        version: '1.4.0',
        change_summary: 'Added Critic Opus 4.7 second-pass on YMYL queries.',
      } as WebhookPayloadByEvent[E]
    default: {
      const _exhaustive: never = event
      throw new Error(`Unknown event: ${String(_exhaustive)}`)
    }
  }
}
