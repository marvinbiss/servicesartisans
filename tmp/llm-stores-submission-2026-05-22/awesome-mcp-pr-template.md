# PR template — `punkpeye/awesome-mcp-servers`

**Date** : 2026-05-22
**Status** : DRY-RUN — Marvin must fork and open the PR.

## Target repo

https://github.com/punkpeye/awesome-mcp-servers

Community list of MCP servers, MIT-licensed, alphabetical by category.
Each entry is a single bullet, kept short. Comply or get a "format nit"
in review.

## Where to insert

Section : **`### 🏠 Real Estate & Government Data`** (or, if absent,
**`### 🌐 Open Data`**, or **`### 🇫🇷 France-specific`** — pick the
section with closest neighbours; if creating a new section, propose
it in the PR body).

Insert alphabetically (`s` cluster, after `salesforce-mcp`).

## Markdown row to add

```markdown
- [ServicesArtisans RGE](https://github.com/servicesartisans/servicesartisans) [🌐](https://servicesartisans.fr/api/v1/mcp) - French RGE-certified artisan lookup + deterministic MaPrimeRenov / CEE 2026 calculators. Source: ADEME official registry (Etalab 2.0).
```

Legend keys used (from repo's README key):

- `[🌐]` = remote MCP server (HTTP transport)
- (no `[🐍]`/`[🦀]` etc. — server is hosted, not language-specific)
- (no `[🏠]` because it is a remote server, not for local Claude Desktop only)

Verify the repo's current legend before submitting — keys evolve.

## PR title

```
Add ServicesArtisans RGE MCP server
```

## PR body

````markdown
## Adds

- **ServicesArtisans RGE** — MCP server exposing the French RGE
  (Reconnu Garant Environnement) registry. Tools:
  - `lookup_rge` (by SIRET)
  - `search_rge` (by city + metier)
  - `get_bareme_mpr` (MaPrimeRenov' 2026, deterministic)
  - `get_aides_for_geste` (cumulable aids matrix)

## Endpoint

- HTTP : https://servicesartisans.fr/api/v1/mcp
- Discovery (GET) returns `{ server, version, protocol, tools }`
- Protocol : 2025-03-26
- License : CC-BY 4.0

## Validation

```bash
curl -sX POST https://servicesartisans.fr/api/v1/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq '.result.tools | length'
# 4
```
````

## Why this fits awesome-mcp-servers

- Real-world public data (~49 228 active RGE artisans, weekly ADEME sync)
- Deterministic, auditable calculators (no LLM-in-the-loop for amounts)
- CC-BY 4.0, no auth, no payment, fully public
- Covers a use-case (French renovation aids) not represented in the list

```

## Checklist before opening PR

- [ ] Alphabetical insertion verified
- [ ] Existing legend keys checked (🌐 still means remote in current README?)
- [ ] No trailing whitespace, one trailing newline
- [ ] `npm run lint` (or `markdownlint README.md`) passes locally
- [ ] curl validation above returns 200 + 4 tools
```
