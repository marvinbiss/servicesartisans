# Changelog

All notable changes to `@servicesartisans/rge-sdk` are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-21

Initial publish-ready release. Pillar 3 of the ServicesArtisans RGE-OS.

### Added

- `SARgeClient` class with constructor config (`baseUrl`, `timeoutMs`, `userAgent`).
- `rgeLookup(siret)` — wraps `GET /api/v1/rge/lookup`.
- `rgeSearch(metier, ville, limit?)` — wraps `GET /api/v1/rge/search`.
- `mprBareme(input)` — wraps `GET /api/v1/aides/mpr-bareme` (MaPrimeRenov 2026 calculator).
- `ceeBareme(input)` — wraps `GET /api/v1/aides/cee-bareme` (CEE forfaits calculator).
- `cumulRules()` — wraps `GET /api/v1/aides/cumul-rules`.
- `ask(input)` — wraps `POST /api/v1/ask` (YMYL-gated AI Q&A).
- `fetchSpec(version)` — fetches the RGE JSON Schema spec (default `v1.0`).
- Typed error hierarchy: `SARgeError`, `SARgeValidationError`,
  `SARgeRateLimitError`, `SARgeServiceUnavailableError`, `SARgeNetworkError`.
- Closed-set union types: `Geste` (10), `MenageCategorie` (4), `ZoneRGE` (2),
  `ZoneClimatique` (3), `TypeLogement` (2).
- Zero runtime dependencies — relies on Node 18+ native `fetch` and
  `AbortController`.
- MIT license.

### Notes

- ESM-only build (no dual-package CommonJS hazard). Consumers must use
  `"type": "module"` or dynamic `import()`.
- `AskInput.citedSources` is the contract the server uses to YMYL-gate numeric
  amounts; supplying them is the recommended pattern when you control the
  surrounding context (e.g., journalistic embeds).
