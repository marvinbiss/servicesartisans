# API v1 — Webhooks (RGE-OS pillar 8)

> Status : **v0.1** (subscribe + delivery infra). Events are wired manually
> for now; cron-driven emitters (ADEME weekly import, MPR bareme bumps) land
> in v0.2. License : **CC-BY-4.0** on event payloads.

Webhooks let a third-party consumer (data journalist, Sonergia / Effy / Hellio
integrator, BI dashboard, internal ops tool) subscribe to RGE-OS events and
receive HMAC-signed POST notifications instead of polling
`/api/v1/rge/...` every hour.

---

## 1. Quick start

```bash
# 1. Subscribe — returns secret + api_key ONCE.
curl -sS https://servicesartisans.fr/api/v1/webhooks/subscribe \
  -H 'Content-Type: application/json' \
  -d '{
        "url": "https://your-app.example.com/hooks/sa",
        "events": ["rge.snapshot.refreshed", "aides.bareme.updated"]
      }'

# 2. Fire a test event so your endpoint can validate signature parsing.
curl -sS https://servicesartisans.fr/api/v1/webhooks/test \
  -H 'Content-Type: application/json' \
  -d '{"id": "<id-from-step-1>",
       "secret": "<secret-from-step-1>",
       "event": "rge.snapshot.refreshed"}'

# 3. List your active webhooks.
curl -sS https://servicesartisans.fr/api/v1/webhooks/list \
  -H 'Authorization: Bearer <api_key-from-step-1>'

# 4. Unsubscribe.
curl -sS -X DELETE https://servicesartisans.fr/api/v1/webhooks/unsubscribe \
  -H 'Content-Type: application/json' \
  -d '{"id": "<id>", "secret": "<secret>"}'
```

---

## 2. Event catalog (v0.1)

| Event                     | Trigger                                      | Payload shape                                                                    |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- |
| `rge.snapshot.refreshed`  | Weekly ADEME RGE import finished             | `{snapshot_date: string, providers_count: number, qualifications_count: number}` |
| `rge.qualification.added` | New qualification added to existing provider | `{siret: string, qualif_code: string, date_debut: string}`                       |
| `aides.bareme.updated`    | MaPrimeRénov' or CEE bareme changed          | `{aide: 'maprimerenov' \| 'cee', version_id: string, snapshot_date: string}`     |
| `ai.transparency.updated` | `/transparence-ia` content version bumped    | `{version: string, change_summary: string}`                                      |

Events not in this table are **rejected** at subscription time (400).
A typo like `rge.snapshot.refresh` (missing `ed`) will fail closed.

The outer envelope is always :

```json
{
  "event": "rge.snapshot.refreshed",
  "payload": {
    /* one of the shapes above */
  },
  "ts": 1716301200
}
```

---

## 3. HMAC signature

Every delivery carries :

```
X-SA-Signature: v1,t=<unix>,sig=<hex>
X-SA-Event:     rge.snapshot.refreshed
User-Agent:     sa-rge-os-webhooks/0.1.0
Content-Type:   application/json
```

The `sig` is `HMAC-SHA256(secret, "v1.<t>.<raw_body>")` hex-encoded.
**Compute over the RAW body, not the parsed JSON** (re-serialization
reorders keys and breaks the signature).

### Verify — Node 20+ (no deps)

```js
import crypto from 'node:crypto'

export function verify(secret, header, rawBody, toleranceSeconds = 300) {
  const parts = Object.fromEntries(
    header
      .split(',')
      .slice(1)
      .map((p) => p.split('=').map((s) => s.trim()))
  )
  const t = Number(parts.t)
  if (!Number.isFinite(t)) return false
  if (Math.abs(Math.floor(Date.now() / 1000) - t) > toleranceSeconds) return false

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`v1.${parts.t}.${rawBody}`)
    .digest('hex')

  const a = Buffer.from(parts.sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
```

### Verify — Python 3.10+

```python
import hmac, hashlib, time

def verify(secret: str, header: str, raw_body: bytes, tolerance: int = 300) -> bool:
    parts = dict(p.strip().split('=', 1) for p in header.split(',')[1:])
    try:
        t = int(parts['t'])
    except (KeyError, ValueError):
        return False
    if abs(int(time.time()) - t) > tolerance:
        return False
    expected = hmac.new(
        secret.encode(),
        f"v1.{parts['t']}.".encode() + raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(parts.get('sig', ''), expected)
```

---

## 4. Retry policy

**v0.1 — single-shot.** A network failure or a non-2xx status is recorded
in `rge_os_webhook_deliveries` with `status:null` (network) or the HTTP
status (server reply), and that's it. Re-fire manually via
`/api/v1/webhooks/test` after fixing your endpoint.

**v0.2 — promised.** A cron worker will scan
`status IS NULL OR status >= 500 AND status NOT IN (501,505)` and re-fire
with exponential backoff (1, 5, 30, 120, 600 minutes; max 5 attempts);
then `active = false` on persistent failure with an ops alert.

If your endpoint is temporarily down today, just re-subscribe after the
fix — your old subscription stays in `deliveries` for audit.

---

## 5. Security

### URL whitelist (SSRF guard)

The subscribe endpoint rejects in production :

- non-`https://` URLs (except `http://localhost` and `http://127.0.0.1` for
  CI/dev),
- RFC1918 private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`),
- link-local (`169.254.0.0/16` — covers AWS / GCP metadata),
- loopback (`127.0.0.1`, `::1`),
- URLs over 500 chars.

### Secret + api_key rotation

The per-hook **secret** signs every delivery; if it leaks, anyone with the
secret can forge events at your endpoint. To rotate :

1. Subscribe a new hook (new URL or same URL) → fresh secret.
2. Unsubscribe the old hook via DELETE.

The **api_key** is the integrator-level credential used by
`/api/v1/webhooks/list`. Only its sha256 hash is persisted; if you lose it
you must re-subscribe to recover access.

### What we store

`rge_os_webhooks` columns : `id, url, secret, email?, events[], active,
api_key_hash, created_at, updated_at, last_delivery_at,
last_delivery_status, consecutive_failures, notes`. Plaintext `api_key` is
never persisted. RLS is service-role only — no anonymous read path.

---

## 6. Endpoints

### POST `/api/v1/webhooks/subscribe`

```
Body :     { url: string, email?: string, events: WebhookEvent[] }
Response : 201 { id, secret, api_key, events, created_at, _meta }
Errors :   400 invalid_body / invalid_params (with .field) | 429 rate_limit
Rate :     30 req/min/IP, fail-open
```

### DELETE `/api/v1/webhooks/unsubscribe`

```
Body :     { id: uuid, secret: string }
Response : 200 { id, active:false } | 403 invalid_secret | 404 not_found
Rate :     30 req/min/IP, fail-open
```

### GET `/api/v1/webhooks/list`

```
Header :   Authorization: Bearer <api_key>
Response : 200 { webhooks: [...], count, _meta } — secret NEVER returned
Errors :   401 unauthorized (also returned for short / malformed bearer)
Note   :   200 + empty array for an unknown api_key (no leak via status code)
Rate :     30 req/min/IP, fail-open
```

### POST `/api/v1/webhooks/test`

```
Body :     { id: uuid, secret: string, event: WebhookEvent }
Response : 200 { delivered: bool, status: number|null, duration_ms, error? }
Errors :   400 invalid_params | 403 invalid_secret | 404 not_found | 429
Rate :     30 req/min/IP, fail-open
Side fx :  records delivery row + updates last_delivery_* on the hook
```

---

## 7. Roadmap

- **v0.2** Webhook UI dashboard at `/espace-developpeur/webhooks` :
  list + test fire + delivery log + rotate secret + revoke api_key.
- **v0.2** Cron worker for retry + DLQ (`status NULL` / 5xx).
- **v0.3** Subscription filters (`events_geste=pac_air_eau`,
  `siret=12345678901234`) for high-volume integrators who don't want the
  full firehose.
- **v0.3** Wire production emitters : ADEME-import + MPR-version +
  CEE-version + transparence-ia.
- **v0.4** Webhook signature key rotation without re-subscribe (key id
  in the signature header so we can ship a new secret without breaking
  in-flight requests).

---

## 8. Refs

- `docs/RGE-OS-MANIFESTO.md` — pillar 8 motivation.
- `supabase/migrations/521_rge_os_webhooks.sql` — DDL.
- `src/lib/webhooks/` — signing / delivery / validation library.
- `src/app/api/v1/webhooks/` — route handlers.
- Memory : `feedback_legal_data_quality` (HMAC sig prevents spoof on YMYL
  bareme events), `servicesartisans-upstash-rate-limit-fix-2026-04-22`
  (fail-open mandatory).
