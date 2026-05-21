# API v1 — `POST /api/v1/ask/stream`

Server-Sent Events (SSE) streaming companion to [`POST /api/v1/ask`](./API-V1-ASK.md).
Lets clients render the answer incrementally instead of waiting 10-30s for the
full AnswerEngine pipeline (LLM + Critic + ground-truth + citations) to finish.

- **Backend** : same `answer()` orchestrator (Ralph 13).
- **Wire** : SSE (`text/event-stream; charset=utf-8`), 7 event types.
- **Rate limit** : 20 req/min/IP, fail-open. Tighter than `/api/v1/ask`
  because each stream holds a Vercel connection slot for the whole budget.
- **License** : response content is CC-BY-4.0.
- **Disclosure** : `https://servicesartisans.fr/transparence-ia` (AI Act §50).

## Quick start

### curl

```bash
curl -N -X POST https://servicesartisans.fr/api/v1/ask/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "query": "Quel est le barème MaPrimeRénov pour une PAC air-eau ?",
    "aidesContext": { "geste": "pac_air_eau", "menageCategorie": "modeste" }
  }'
```

`-N` (`--no-buffer`) is required — without it curl buffers the whole response.

### Browser EventSource — read-only (no body)

`EventSource` only supports `GET`, so for browser clients you typically POST
via `fetch()` with `ReadableStream` (see Node example below). A future
`/api/v1/ask/stream/sse?token=...` GET endpoint is on the v0.3 roadmap to
support raw `EventSource`.

### Node 18+ / fetch

```ts
const res = await fetch('https://servicesartisans.fr/api/v1/ask/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Quel est le barème PAC ?' }),
})

const reader = res.body!.getReader()
const decoder = new TextDecoder()
let buf = ''

while (true) {
  const { value, done } = await reader.read()
  if (done) break
  buf += decoder.decode(value, { stream: true })
  // SSE frames are delimited by a blank line ("\n\n").
  let idx: number
  while ((idx = buf.indexOf('\n\n')) >= 0) {
    const frame = buf.slice(0, idx)
    buf = buf.slice(idx + 2)
    if (frame.startsWith(':')) continue // SSE comment (heartbeat)
    const evt = parseFrame(frame)
    console.log(evt.event, evt.data)
  }
}

function parseFrame(raw: string) {
  const out: { event: string; data: unknown; id?: string } = { event: 'message', data: null }
  for (const line of raw.split('\n')) {
    if (line.startsWith('event: ')) out.event = line.slice(7)
    else if (line.startsWith('data: ')) out.data = JSON.parse(line.slice(6))
    else if (line.startsWith('id: ')) out.id = line.slice(4)
  }
  return out
}
```

## Event reference

| `event:`      | When                                                        | `data:` shape                                                                                                                  |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `start`       | First frame (status: starting) + refined post-orchestration | `{traceId, status: 'starting'}` then `{traceId, classification, provider, model, status: 'answering'}`                         |
| `groundtruth` | When `trace.groundTruthInjected === true`                   | `{injected: true, detail: '<calculator output>'}` — deterministic figure injected before the LLM (MaPrimeRénov / CEE).         |
| `chunk`       | One per phrase (sentence-granular, v0.1)                    | `{delta: string, cumulative: number}` — `delta` is the next phrase; `cumulative` is total chars emitted so far.                |
| `critic`      | When YMYL second-pass returned a verdict                    | `{decision: 'approve'\|'revise'\|'block', confidence: number, reasons: Array<{dimension, severity, message}>}`                 |
| `done`        | Successful end of stream                                    | `{ok: true, latency_ms: number, citations: Array<{url, title, retrievedAt}>, trace: {traceId, classification, provider, ...}}` |
| `error`       | Fatal error, terminates the stream                          | `{code: string, message: string, retryable: boolean}`                                                                          |
| heartbeat     | Every ~10s while AnswerEngine pends                         | SSE comment line `: hb` (no `event:`) — silently consumed by `EventSource`, resets proxy idle timer.                           |

### Sample SSE wire body

```
: stream open

event: start
data: {"traceId":"a1b2c3d4","status":"starting"}
id: 0

: hb

event: start
data: {"traceId":"a1b2c3d4","classification":"ymyl_aides","provider":"mistral","model":"mistral-large-latest","status":"answering"}
id: 1

event: groundtruth
data: {"injected":true,"detail":"MPR pac_air_eau: 5000EUR (source anah-2026)"}
id: 2

event: chunk
data: {"delta":"Pour une pompe à chaleur air/eau, MaPrimeRénov' s'élève à 5 000 € pour un ménage modeste.","cumulative":97}
id: 3

event: chunk
data: {"delta":"Le plafond global aides + CEE est de 90 % du coût TTC.","cumulative":151}
id: 4

event: critic
data: {"decision":"approve","confidence":0.94,"reasons":[]}
id: 5

event: done
data: {"ok":true,"latency_ms":12734,"citations":[{"url":"https://france-renov.gouv.fr","title":"France Rénov'","retrievedAt":"2026-05-21"}],"trace":{"traceId":"a1b2c3d4","classification":"ymyl_aides","provider":"mistral","model":"mistral-large-latest","criticInvoked":true,"groundTruthInjected":true,"latencyMs":12734}}
id: 6
```

## Error codes

| `code`               | `retryable` | Meaning                                                             |
| -------------------- | ----------- | ------------------------------------------------------------------- |
| `critic_block`       | `false`     | YMYL second-pass refused to publish. Surface `userSafeMessage`.     |
| `llm_unavailable`    | `true`      | Upstream LLM provider down. Back off + retry.                       |
| `timeout`            | `true`      | Provider exceeded `llmTimeoutMs` (30s). Back off + retry.           |
| `rate_limit`         | `true`      | Upstream LLM provider rate-limited us. Back off + retry.            |
| `invalid_request`    | `false`     | AnswerEngine rejected the request shape.                            |
| `client_disconnect`  | `false`     | Client aborted mid-stream — informational, no need to retry.        |
| `internal`           | `false`     | Unhandled AnswerEngine exception. Captured to Sentry on the server. |
| `orchestrator_error` | `false`     | Stream generator itself threw. Should never happen — Sentry-paged.  |
| `no_result`          | `false`     | AnswerEngine returned null. Should never happen — Sentry-paged.     |

Always inspect `retryable` before retrying. A `false` flag means the same
request will fail the same way; surface the error to the user instead.

## Client patterns

### Display incremental text

```ts
let accumulated = ''
on('chunk', (data) => {
  accumulated += data.delta
  ui.setText(accumulated)
})
on('done', (data) => {
  ui.setCitations(data.citations)
  ui.setStatus('ready')
})
on('error', (data) => {
  ui.setStatus(data.retryable ? 'retrying' : 'failed')
})
```

### Cancel the stream

The orchestrator listens to the request's `AbortSignal`. If your client
calls `reader.cancel()` (`fetch` ReadableStream), the server emits a final
`error` frame with `code: 'client_disconnect'` and tears down.

Note (v0.1) : cancelling the client does **not** abort the upstream LLM
call — the cost of the in-flight completion is still paid. v0.2 will plumb
the `AbortSignal` all the way to the provider SDK to align with the
billing window.

## Reconnect / resume

Currently fire-and-forget. If the connection drops, retry the whole
request. A future v0.2 will honour SSE's `Last-Event-ID` header (each
event carries a numeric `id:` already, so the protocol is forward-compatible).

## Roadmap

| Version | Feature                                                                                  |
| ------- | ---------------------------------------------------------------------------------------- |
| v0.1    | (current) Phrase-granular emulation. Heartbeat. Bulk `done` with citations.              |
| v0.2    | True token-level streaming from Mistral / Claude provider SSE. `Last-Event-ID` resume.   |
| v0.3    | Partial `citation` events (citations drip as URLs are discovered).                       |
| v0.4    | Stream cancellation cost-tracking (charge tokens consumed up to abort).                  |
| v0.5    | GET-friendly `/api/v1/ask/stream/sse?token=...` for raw browser `EventSource` consumers. |

## Related

- [`POST /api/v1/ask`](./API-V1-ASK.md) — unary REST endpoint (same backend).
- [`/transparence-ia`](https://servicesartisans.fr/transparence-ia) — AI Act §50 disclosure.
- Ralph 13 (`8b98d57b0`) — AnswerEngine orchestrator.
- Ralph 19 (`56f4050a3`) — `/api/v1/ask` unary route.
