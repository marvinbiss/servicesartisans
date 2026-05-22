# PR template — `public-apis/public-apis`

**Date** : 2026-05-22
**Status** : DRY-RUN — Marvin must fork and PR.

## Target repo

https://github.com/public-apis/public-apis

Mega-list of free public APIs (~80K stars). PRs are strict on format:
single line, alphabetical, working HTTPS, CORS hint, auth hint, no
"placeholder" entries.

## Where to insert

Two candidate sections:

1. **`### Government`** — best fit (Etalab 2.0 source, ADEME registry).
2. **`### Open Data`** — secondary fit.

Insert alphabetically in section `Government` between any `S*` entries.

## Markdown row to add

```markdown
| [ServicesArtisans RGE](https://servicesartisans.fr/api/v1) | French RGE-certified artisan registry + MaPrimeRenov / CEE deterministic calculators (ADEME source, Etalab 2.0) | No | Yes | Yes |
```

Columns explanation (matches repo schema):

| Column      | Value                | Why                                                |
| ----------- | -------------------- | -------------------------------------------------- |
| API         | ServicesArtisans RGE | link to root                                       |
| Description | one-liner            |                                                    |
| Auth        | No                   | endpoints public read-only                         |
| HTTPS       | Yes                  | enforced (301 from http)                           |
| CORS        | Yes                  | `Access-Control-Allow-Origin: *` on JSON endpoints |

## PR title

```
Add: ServicesArtisans RGE — French renovation registry (Government)
```

## PR body

````markdown
## Add ServicesArtisans RGE

- **API root** : https://servicesartisans.fr/api/v1
- **OpenAPI** : https://servicesartisans.fr/api/v1/openapi/json
- **Documentation** : https://servicesartisans.fr/developpeurs/api-catalog
- **License** : CC-BY 4.0 — `Source : ServicesArtisans` required.
- **Source data** : ADEME official RGE registry, weekly sync, Etalab 2.0.

### Endpoints (subset)

- `GET /api/v1/rge/lookup?siret={14-digit}`
- `GET /api/v1/rge/search?city=&q=`
- `GET /api/v1/rge/geojson` (FeatureCollection)
- `GET /api/v1/aides/mpr-bareme?geste=&menage=&zone=`
- `GET /api/v1/aides/cee-bareme?fiche=&zone=&menage=`
- `POST /api/v1/ask` (AnswerEngine with Critic YMYL gate)
- `POST /api/v1/mcp` (Model Context Protocol JSON-RPC 2.0)
- `POST /api/v1/graphql`
- `POST /api/v1/kg/sparql`

### Validation

```bash
curl -i https://servicesartisans.fr/api/v1/openapi/json | head -5
# HTTP/2 200
# access-control-allow-origin: *
# content-type: application/json; charset=utf-8
```
````

### Checklist

- [x] Auth: none (public read-only)
- [x] HTTPS: enforced
- [x] CORS: open
- [x] Alphabetical insertion
- [x] Single-line entry, no trailing whitespace

```

## Pre-PR checklist

- [ ] Run `npm run lint` or `markdownlint README.md` locally on the fork
- [ ] Verify all linked endpoints return 200 (or documented 4xx/5xx mocked)
- [ ] Confirm CORS header live (`curl -I` shows `access-control-allow-origin: *`)
- [ ] Re-run the JSON validator script bundled in `public-apis` repo (`scripts/`)
```
