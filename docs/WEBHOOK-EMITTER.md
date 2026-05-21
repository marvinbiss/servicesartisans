# Webhook Event Emitter

Internal helper that closes the Ralph 24 (`596c05828`, delivery) + Ralph 29
(`8ee0f75b8`, retry pipeline) loop by giving any in-process worker — cron,
admin route, manual trigger — a single fan-out API to broadcast signed
events to all active subscribers.

## Purpose

Pillar 8 v0.1 (Ralph 24) shipped subscribe / list / unsubscribe / test
endpoints + signed HMAC delivery. v0.2 (Ralph 29) added the retry cron +
circuit-breaker. This sprint connects the two by adding the **publisher
side**: a helper that, given an event + payload, looks up the subscribers
DB, fires `deliverWebhook` for each, records the attempt, and schedules
a retry (Ralph 29 picks up) if needed.

Production cron emitters (ADEME / MPR / CEE / transparence-ia) wire into
this helper in Sprint 2. The admin endpoint in this sprint lets us
validate the loop end-to-end before that wiring is committed.

## Public API

```ts
import { emitWebhookEvent, type EmitDeps } from '@/lib/webhooks/emit'

const summary = await emitWebhookEvent('rge.snapshot.refreshed', payload, deps)
// → { event, matched, delivered, failed_initial, scheduled_retry, circuit_broken }
```

### Signature

```ts
function emitWebhookEvent<E extends WebhookEvent>(
  event: E,
  payload: WebhookPayloadByEvent[E],
  deps: EmitDeps
): Promise<EmitSummary>
```

### `EmitDeps`

All I/O is injected so the emitter is fully unit-testable.

| Field                   | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `fetchSubscribers`      | Query active hooks subscribed to `event`                         |
| `recordDelivery`        | Insert one row into `rge_os_webhook_deliveries`                  |
| `updateHookBookkeeping` | Patch `rge_os_webhooks.last_delivery_*` + `consecutive_failures` |
| `disableHook`           | Flip `rge_os_webhooks.active = false` on circuit-break           |
| `deliver`               | `deliverWebhook` from Ralph 24 (HMAC POST + 10s timeout)         |
| `now?`                  | Optional clock override for deterministic tests                  |

The admin route at `src/app/api/v1/webhooks/admin-emit/route.ts` wires
these to a real `createAdminClient()` from Supabase.

## State machine (per subscriber)

```text
deliverWebhook → status code →
  2xx                                  → delivered  + final_status_at = now
  4xx                                  → failed_initial + final_status_at = now (terminal)
  5xx / null  +  failures+1 <  MAX (10) → scheduled_retry + next_retry_at = now + 5min
  5xx / null  +  failures+1 >= MAX (10) → circuit_broken + disable hook + final_status_at = now
```

Why **4xx is terminal**: 400/401/403/404 means the integrator's endpoint
has a structural problem (auth header missing, schema mismatch, URL
deleted). Retrying just amplifies the noise. We stamp the row final and
let the integrator see the failure in `/api/v1/webhooks/list`.

Why **5xx triggers retry, not failure**: those are transient (cold-start
timeout, dependency outage, deploy in progress). Ralph 29's retry cron
re-fires with `BACKOFF_SCHEDULE_SECONDS = [60, 300, 1800, 10800, 43200]`
spanning 24h. After `MAX_ATTEMPTS = 5` we give up.

Why **circuit-break at 10 consecutive failures**: protects the platform
from hammering a broken integrator endpoint indefinitely. The hook flips
inactive, the integrator sees it in their dashboard, re-enables manually
after fixing.

## Concurrency

`MAX_FANOUT_PARALLELISM = 8`. The emitter chunks subscribers into batches
of 8 and `await Promise.all()` each batch. A slow subscriber within a
batch won't block earlier batches from completing — but the worst case
per batch is still `deliveryTimeout = 10s × 1 slow` if the slowest sub
in the batch times out. This is a deliberate trade-off: we want to bound
the cron tick latency without exposing the platform to thundering-herd
DNS lookups when a popular event has thousands of subscribers.

## Idempotency — caller responsibility

`emitWebhookEvent` does **not** dedup based on payload content. Calling
it twice for the same logical event will deliver twice. The production
cron emitters must use a ledger key pattern:

```ts
// Pseudocode for Sprint 2
const ledgerKey = `rge.snapshot:${snapshot_date}`
if (await ledger.has(ledgerKey)) return
await emitWebhookEvent('rge.snapshot.refreshed', payload, deps)
await ledger.set(ledgerKey, { firedAt: new Date().toISOString() })
```

A dedicated `rge_os_event_ledger` table is on the v0.3 roadmap.

## Admin trigger

```bash
# Manual fan-out for debug / dev
curl -X POST https://servicesartisans.fr/api/v1/webhooks/admin-emit \
  -H "Authorization: Bearer $WEBHOOKS_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "rge.snapshot.refreshed",
    "payload": {
      "snapshot_date": "2026-05-21",
      "providers_count": 49228,
      "qualifications_count": 165432
    }
  }'
```

Response:

```json
{
  "ok": true,
  "summary": {
    "event": "rge.snapshot.refreshed",
    "matched": 12,
    "delivered": 10,
    "failed_initial": 1,
    "scheduled_retry": 1,
    "circuit_broken": 0
  },
  "_meta": { "api_version": "v1", "license": "CC-BY-4.0", "docs": "/docs/WEBHOOK-EMITTER.md" }
}
```

## Security

- `WEBHOOKS_ADMIN_API_KEY` env var **must** be set in production. If
  the env is missing every request 401s — no bypass.
- The key is intentionally separate from `CRON_SECRET` so we can rotate
  it independently (an attacker holding the admin key cannot trigger
  arbitrary crons, and vice versa).
- Rate-limit 30 req/min/IP, `failOpen: true` per the Ralph 22 rule
  (`servicesartisans-upstash-rate-limit-fix-2026-04-22`): an Upstash
  outage must not block ops from triggering recovery events.
- The endpoint accepts any object as `payload`. We don't enforce the
  `WebhookPayloadByEvent[E]` shape at runtime because ops may
  legitimately want to send a hand-crafted payload during incident
  response. Strict shape validation lives at the production cron
  emitter sites (Sprint 2), not at this debug surface.

## Integration pattern (Sprint 2 wiring, planned)

```ts
// src/app/api/cron/ademe-import/route.ts (illustrative)
import { emitWebhookEvent } from '@/lib/webhooks/emit'
import { buildEmitDepsFromSupabase } from '@/lib/webhooks/admin-deps' // future helper

const summary = await runAdemeImport()
if (summary.providers_count > 0) {
  await emitWebhookEvent(
    'rge.snapshot.refreshed',
    {
      snapshot_date: summary.snapshot_date,
      providers_count: summary.providers_count,
      qualifications_count: summary.qualifications_count,
    },
    buildEmitDepsFromSupabase()
  )
}
```

Same shape for MPR / CEE version bumps (`aides.bareme.updated`) and
transparence-ia commits (`ai.transparency.updated`).

## Files

- `src/lib/webhooks/emit.ts` — pure emitter (DI'd)
- `src/app/api/v1/webhooks/admin-emit/route.ts` — admin POST wiring
- `__tests__/lib/webhooks/emit.test.ts` — emitter unit tests
- `__tests__/api/v1/webhooks/admin-emit/route.test.ts` — route tests

## Roadmap

- Sprint 2: wire ADEME / MPR / CEE / transparence-ia crons
- v0.3: inline `rge_os_event_ledger` table for idempotency
- v0.3: subscription filters (`geste=` / `siret=` / `version=`)
- v0.3: pg_try_advisory_xact_lock on retry to tighten overlap window
