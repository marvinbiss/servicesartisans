# `/api/v1/health` — Public health endpoints

> Public-facing health checks for uptime monitoring, status pages, load
> balancer probes, and integrator dashboards. Replaces the need to point
> external monitors at the admin-only `/api/cron/healthcheck` (which auths
> via `CRON_SECRET` and cannot be reached by third-party tooling).

| Field      | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Endpoints  | `/api/v1/health` (shallow), `/api/v1/health/deep` (deep)  |
| Methods    | `GET` (both), `HEAD` (shallow only)                       |
| Auth       | Public — no auth required                                 |
| Rate limit | Shallow: none. Deep: 30 req/min/IP, **fail-open**         |
| License    | CC-BY 4.0 (response headers carry `X-License: CC-BY-4.0`) |
| Cache      | `Cache-Control: no-store` on both                         |
| Runtime    | Node                                                      |

## Endpoints

### `GET /api/v1/health` — Shallow

Always returns HTTP 200. No external dependency check. Sub-millisecond
latency. Designed so this endpoint stays green as long as the Vercel
function itself is reachable — keeping the "function reachable" signal
distinct from "all dependencies green".

#### Response body

```json
{
  "status": "ok",
  "version": "1.0.0",
  "build": { "sha": "abc1234", "ref": "main" },
  "timestamp": "2026-05-21T10:30:00.000Z",
  "docs": "https://servicesartisans.fr/developpeurs"
}
```

- `build.sha` — first 7 chars of `VERCEL_GIT_COMMIT_SHA` (or `local`)
- `build.ref` — `VERCEL_GIT_COMMIT_REF` (branch name, or `local`)

#### `HEAD /api/v1/health`

Returns HTTP 200 with no body. Useful for cheap probes that only need
"function reachable" signal.

### `GET /api/v1/health/deep` — Deep

Pings each critical dependency and aggregates results. Per-check
latency reported in milliseconds.

#### Checks

| Check      | What it pings                           | Hard fail behavior                     |
| ---------- | --------------------------------------- | -------------------------------------- |
| `supabase` | `providers` head count query            | Overall status → `fail` (HTTP 503)     |
| `upstash`  | `GET {UPSTASH_REDIS_REST_URL}/ping`     | `degraded` (rate-limiter has failOpen) |
| `llm_keys` | Env var presence on 3 LLM provider keys | 0 keys → `fail`, 1 key → `degraded`    |

Per-check timeout: 5 seconds. Slow threshold (`> 1.5s` for ok responses)
downgrades the check to `degraded`.

#### Response body

```json
{
  "status": "ok",
  "checks": [
    { "name": "supabase", "status": "ok", "latency_ms": 42 },
    { "name": "upstash", "status": "ok", "latency_ms": 18 },
    { "name": "llm_keys", "status": "ok", "latency_ms": 0, "details": "3/3 providers configured" }
  ],
  "timestamp": "2026-05-21T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Status semantics

| Status     | Meaning                                                               |
| ---------- | --------------------------------------------------------------------- |
| `ok`       | All checks green, latency within budget                               |
| `degraded` | At least one non-critical dep partially degraded; site still operates |
| `fail`     | At least one critical dep failed; site likely impaired                |

### HTTP status mapping

| Overall status | HTTP status |
| -------------- | ----------- |
| `ok`           | 200         |
| `degraded`     | 200         |
| `fail`         | 503         |

Monitoring tools that flag non-2xx only fire on hard failures. To page
on degradations as well, parse the body `status` field.

## Use cases

| Tool / Use case         | Endpoint                                  | Recommended interval |
| ----------------------- | ----------------------------------------- | -------------------- |
| UptimeRobot free        | `/api/v1/health`                          | 5 min                |
| StatusCake / Pingdom    | `/api/v1/health`                          | 30 s                 |
| Custom status page      | `/api/v1/health/deep`                     | 1 min                |
| Load balancer liveness  | `/api/v1/health` HEAD                     | 10 s                 |
| Internal Sentry checkin | `/api/cron/healthcheck` (admin, separate) | 5 min                |

## Cache-Control

Both endpoints set `Cache-Control: no-store` so probes always hit the
function and never get served a stale "ok" from an edge cache.

## Build metadata source of truth

`build.sha` and `build.ref` come from Vercel deployment env vars
(`VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`). On local dev runs
both default to `"local"`. This is the single source of truth for
"which commit is currently serving traffic" — useful for canary
verification.

## Distinct from `/api/cron/healthcheck*`

The cron endpoints (`/api/cron/healthcheck`, `/api/cron/healthcheck-deep`)
require a `CRON_SECRET` bearer token and are wired to Vercel cron
schedules. They escalate failures to Sentry + BetterStack. The `/api/v1/health*`
endpoints are unauthenticated and intentionally do NOT escalate — they
simply expose what an external monitor would observe.

## Roadmap

- v0.2 — per-dep P50/P95 latency rolling buffer (1h window) returned
  alongside instantaneous latency
- v0.3 — status page integration: cron pings deep + records to
  `rge_os_health_snapshot` table, public history page rendered from
  snapshots
- v0.4 — LLM provider live probe (not just env var presence): single-token
  completion to each provider, $0.001 / probe, surfaces "provider key
  configured but broken" failure mode
