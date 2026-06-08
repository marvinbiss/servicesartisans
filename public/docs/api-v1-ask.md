# `POST /api/v1/ask` — Public AnswerEngine endpoint

> Closes the ServicesArtisans AI system loop. First user-facing productized
> endpoint that orchestrates LLM routing, deterministic ground-truth
> injection (MaPrimeRénov' / CEE calculators), Critic Opus 4.7 second-pass
> on YMYL queries, and citation extraction in a single round-trip.

| Field          | Value                                                                |
| -------------- | -------------------------------------------------------------------- |
| Endpoint       | `https://servicesartisans.fr/api/v1/ask`                             |
| Method         | `POST` (also `GET` for discovery metadata)                           |
| Authentication | Public — no auth required                                            |
| Rate limit     | 60 req/min/IP, **fail-open** (Redis outage ≠ self-DoS)               |
| License        | Response data : **CC-BY 4.0** with attribution `ServicesArtisans.fr` |
| Disclosure     | [`/transparence-ia`](https://servicesartisans.fr/transparence-ia)    |
| Runtime        | Node (live LLM HTTP, not Edge)                                       |

## Overview

`/api/v1/ask` exposes the `AnswerEngine` orchestrator (Ralph 13). For each
incoming query it :

1. Routes through `chooseModel()` (Mistral-first for EU sovereignty on
   `ymyl_aides` / `pii_user` / `contract_legal`).
2. On `aidesContext` presence, runs the **deterministic calculator**
   (Ralph 12 MPR / Ralph 14 CEE) and injects the result as `<ground_truth>`
   in the system prompt — the LLM is forced to cite a known figure rather
   than guess.
3. Calls the LLM provider over live HTTP (Ralph 10).
4. On YMYL classification, dispatches the LLM output to **Critic Opus 4.7**
   (Ralph 8) for a second-pass verification. Critic can `block`, `revise`
   or `pass`.
5. Extracts URL citations from the output and reconciles them with the
   caller-provided `citedSources`.

## Request

### Headers

```
Content-Type: application/json
```

### Body schema

```jsonc
{
  "query": "string, 1..4000 chars, required",
  "classification": "rag_public|ymyl_aides|pii_user|contract_legal|bulk_seo|multimodal|long_context|critic_ymyl|generic (optional, default 'generic')",
  "aidesContext": {
    "geste": "pac_air_eau|pac_geothermique|pac_air_air|chauffe_eau_thermo|isolation_combles|isolation_ite|isolation_planchers_bas|vmc_double_flux|chaudiere_biomasse|audit_energetique",
    "menageCategorie": "tres_modeste|modeste|intermediaire|superieur (optional)",
    "rfr": "number >= 0 (optional, Revenu Fiscal de Référence in €)",
    "nbPersonnes": "integer >= 1 (optional, household size)",
    "zone": "idf|hors_idf (optional)",
  },
  "citedSources": [{ "url": "string", "title": "string", "retrievedAt": "YYYY-MM-DD" }],
  "traceId": "string (optional, caller-supplied trace id)",
  "agentName": "string (optional, calling agent label for telemetry)",
}
```

`aidesContext` is optional. When present **and** `rfr` + `nbPersonnes` +
`zone` + `geste` are all filled, the deterministic calculator runs and its
result is forced into the system prompt before the LLM call. This is the
strongest hallucination guard the API offers.

## Response

### Success (HTTP 200)

```jsonc
{
  "result": {
    "ok": true,
    "content": "La pompe à chaleur air/eau ouvre droit à MaPrimeRénov' à hauteur de 5 000 € pour un ménage très modeste hors Île-de-France ...",
    "citations": [
      {
        "url": "https://france-renov.gouv.fr/",
        "title": "France Rénov'",
        "retrievedAt": "2026-05-21",
      },
    ],
    "criticVerdict": {
      "decision": "pass",
      "score": 0.92,
    },
    "trace": {
      "traceId": "trace-abc-123",
      "classification": "ymyl_aides",
      "providerUsed": "mistral",
      "modelUsed": "mistral-large-latest",
      "groundTruthInjected": true,
      "groundTruthDetail": "PAC air/eau, tres_modeste, hors_idf : 5 000 €",
      "criticInvoked": true,
      "latencyMs": 2134,
      "llmUsage": { "inputTokens": 412, "outputTokens": 318, "cost": 0.0019 },
    },
  },
  "_meta": {
    "api_version": "v1",
    "license": "CC-BY-4.0",
    "docs": "https://servicesartisans.fr/developpeurs",
    "disclosure": "See https://servicesartisans.fr/transparence-ia for AI agent details.",
  },
}
```

### Structured failure (HTTP 422 / 429 / 503)

```jsonc
{
  "result": {
    "ok": false,
    "reason": "critic_block|llm_unavailable|invalid_request|rate_limit|timeout",
    "userSafeMessage": "Réponse non publiable en l'état. Contactez un conseiller France Rénov' pour une réponse vérifiée.",
    "criticVerdict": { "decision": "block", "reasons": ["amount drift > 10%"] },
    "trace": { "traceId": "trace-xyz" }
  },
  "_meta": { ... }
}
```

### Error envelope (HTTP 400 / 500 / 503)

```jsonc
{
  "error": {
    "code": "invalid_body|invalid_params|service_unavailable|internal_error|rate_limit",
    "message": "Human-readable explanation",
    "errors": [{ "field": "query", "message": "required non-empty string" }]
  },
  "_meta": { ... }
}
```

### HTTP status mapping

| Status | When                                                                |
| ------ | ------------------------------------------------------------------- |
| 200    | `result.ok === true`                                                |
| 400    | Body not JSON, validation fails (`invalid_body` / `invalid_params`) |
| 422    | `result.reason === 'critic_block'` (YMYL content refused)           |
| 429    | Rate limit exceeded, or upstream provider rate limit                |
| 500    | Unexpected internal error (`captureError` Sentry-routed)            |
| 503    | LLM unavailable, timeout, or registry not configured                |

### Response headers (always)

- `X-License: CC-BY-4.0`
- `X-Disclosure: /transparence-ia`
- `Cache-Control: no-store` (POST) / `public, max-age=3600` (GET)

## Examples

### Simple query

```bash
curl -X POST https://servicesartisans.fr/api/v1/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "Quel est le barème MaPrimeRénov pour une PAC air/eau ?"
  }'
```

### Query with full ground-truth context (YMYL anti-hallucination)

```bash
curl -X POST https://servicesartisans.fr/api/v1/ask \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "Combien je touche pour une PAC air/eau ?",
    "classification": "ymyl_aides",
    "aidesContext": {
      "geste": "pac_air_eau",
      "rfr": 18000,
      "nbPersonnes": 3,
      "zone": "hors_idf",
      "menageCategorie": "tres_modeste"
    },
    "citedSources": [
      { "url": "https://france-renov.gouv.fr/", "title": "France Rénov'", "retrievedAt": "2026-05-21" }
    ]
  }'
```

### GET discovery

```bash
curl https://servicesartisans.fr/api/v1/ask
```

## Disclosure (AI Act §50)

Every response carries `_meta.disclosure` and an `X-Disclosure` header
pointing to [`/transparence-ia`](https://servicesartisans.fr/transparence-ia),
which lists :

- the LLM providers in use (Mistral, Anthropic, Google),
- the models per classification,
- the Critic Opus 4.7 second-pass policy on YMYL,
- the disclaimer that AI-generated guidance is **not** a substitute for an
  ANAH / France Rénov' adviser.

## Roadmap (v0.2)

- Server-Sent Events streaming (`Accept: text/event-stream`).
- Multi-turn `history` exposure (currently the engine accepts it internally
  but the public endpoint does not yet take it).
- Embedding-based retrieval over the SA RGE corpus (instead of caller-side
  `citedSources`).
- Provider override via `_meta` header for benchmarking studies.

## References

- Ralph 4 — `LLMProvider` abstraction
- Ralph 8 — Critic Opus 4.7 YMYL guard
- Ralph 10 — Live LLM HTTP impls (Mistral / Claude / Gemini)
- Ralph 12 — MaPrimeRénov' 2026 calculator
- Ralph 13 — AnswerEngine orchestrator (`8b98d57b0`)
- Ralph 14 — CEE calculator
- Memory `feedback_legal_data_quality` (zero tolerance YMYL)
- Memory `servicesartisans-upstash-rate-limit-fix-2026-04-22` (fail-open)
