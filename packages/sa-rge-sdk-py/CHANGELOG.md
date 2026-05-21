# Changelog

All notable changes to `sa-rge-sdk` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-21

### Added

- Initial release. Python 3.10+ client for the ServicesArtisans RGE-OS public API.
- `Client` class with retry-with-backoff on `429` + `5xx` (max 3 attempts, jittered
  `(0.2, 1.0, 4.0)` seconds). Honors `Retry-After` when present.
- Typed exception hierarchy: `SaRgeError`, `ValidationError`, `AuthError`,
  `NotFoundError`, `RateLimitError` (with `retry_after_seconds`), `ServerError`.
- Methods covering the API surface:
  - `rge_lookup(siret)`, `rge_search(...)`
  - `aides_mpr_bareme(...)`, `aides_cee_bareme(...)`, `aides_cumul_rules(...)`
  - `ask(query, aides_context)`
  - `sessions_create()`, `sessions_send_message(...)`, `sessions_history(...)`, `sessions_delete(...)`
  - `webhooks_subscribe(...)`, `webhooks_unsubscribe(...)`, `webhooks_list()`, `webhooks_test(...)`
- `verify_signature(...)` and `compute_signature(...)` helpers for webhook
  receivers. Timing-safe (`hmac.compare_digest`), 5-min replay window.
- Zero runtime dependencies (stdlib only).
- Companion to the TypeScript SDK shipped in Ralph 22 (`packages/sa-rge-sdk-ts`).

### Notes

- Surface parity with the TS SDK is intentional - same retry semantics, same
  webhook signing scheme (Ralph 24), same error mapping (Ralph 29).
- Forward-compatible dataclasses: unknown keys are ignored, missing optional
  fields default to `None` / `[]`.
