# Glama.ai MCP directory submission

**Date** : 2026-05-22
**Status** : DRY-RUN — Marvin publishes via Glama dashboard or PR.

## Target

Glama.ai maintains a curated MCP servers directory at
https://glama.ai/mcp/servers
plus an open community catalogue powered by a public GitHub repo.

## Submission options

### Option 1 — Web form (preferred, fastest)

1. Login at https://glama.ai/ (GitHub OAuth).
2. Open https://glama.ai/mcp/servers and click **"Submit a server"**
   (top-right CTA, otherwise footer link).
3. Fill the form with the values below.

### Option 2 — PR on community catalogue

If Glama exposes a public repo (check https://github.com/punkpeye/glama),
open a PR adding a YAML/JSON entry mirroring the values below.

## Submission values

| Field             | Value                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name              | `servicesartisans-rge`                                                                                                                                                                                                                                         |
| Display name      | ServicesArtisans RGE-OS                                                                                                                                                                                                                                        |
| Tagline           | French RGE artisan lookup + MaPrimeRenov / CEE deterministic calculators                                                                                                                                                                                       |
| Description       | MCP server for the French RGE (Reconnu Garant Environnement) registry. Lookup by SIRET, search by city + metier, deterministic MaPrimeRenov 2026 + CEE 2026 calculators, and cumulable aids matrix. Source: ADEME official registry (Etalab 2.0), weekly sync. |
| Transport         | HTTP (POST JSON-RPC 2.0)                                                                                                                                                                                                                                       |
| Endpoint URL      | https://servicesartisans.fr/api/v1/mcp                                                                                                                                                                                                                         |
| Protocol version  | 2025-03-26                                                                                                                                                                                                                                                     |
| Auth              | none (optional Bearer via env)                                                                                                                                                                                                                                 |
| Rate limit        | 60 req/min/IP                                                                                                                                                                                                                                                  |
| License           | CC-BY-4.0                                                                                                                                                                                                                                                      |
| Categories        | Open data, Government, Real estate, Finance                                                                                                                                                                                                                    |
| Tags              | rge, ademe, france, renovation-energetique, maprimerenov, cee, etalab                                                                                                                                                                                          |
| Homepage          | https://servicesartisans.fr                                                                                                                                                                                                                                    |
| Repository        | https://github.com/servicesartisans/servicesartisans                                                                                                                                                                                                           |
| Documentation     | https://servicesartisans.fr/developpeurs/api-catalog                                                                                                                                                                                                           |
| Issues            | https://github.com/servicesartisans/servicesartisans/issues                                                                                                                                                                                                    |
| Maintainer name   | ServicesArtisans                                                                                                                                                                                                                                               |
| Maintainer email  | data@servicesartisans.fr                                                                                                                                                                                                                                       |
| Logo URL          | https://servicesartisans.fr/icons/icon-512x512.png                                                                                                                                                                                                             |
| Safety disclosure | https://servicesartisans.fr/transparence-ia                                                                                                                                                                                                                    |

## Tools (paste into "Tools" rich text field)

1. **lookup_rge** — Lookup an RGE-certified artisan by SIRET (14 digits). Returns name, address, active qualifications, certifying organizations, validity dates.
2. **search_rge** — Search RGE-certified artisans by city + metier. Up to 50 ranked matches.
3. **get_bareme_mpr** — MaPrimeRenov' 2026 subsidy amount for (geste, menage_categorie).
4. **get_aides_for_geste** — Cumulable aids list (MaPrimeRenov, CEE, eco-PTZ, TVA 5,5%, regional bonuses) for a geste.

## Validation gate (run before submit)

```bash
curl -s https://servicesartisans.fr/api/v1/mcp | jq '.tools'
curl -sX POST https://servicesartisans.fr/api/v1/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
# expect 4
```

## Post-submission

- Add entry to memory `servicesartisans-mcp-listings-YYYY-MM-DD.md`.
- Track public listing URL for SEO backlinks (DR Glama ~= 30+).
- Refresh manifest via `scripts/llm-stores-submit.ts --store=glama --no-dry-run` once Sprint 2 ships.
