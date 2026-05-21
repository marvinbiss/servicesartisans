# ServicesArtisans RGE-OS — Bruno API Collection

Bruno workspace pour appeler l'API publique CC-BY 4.0 SA depuis Bruno
(<https://www.usebruno.com>). Format git-friendly (un fichier `.bru` par
requête, environnements en plain text).

## Installation

```bash
# Bruno CLI (optional, headless runs)
npm i -g @usebruno/cli
```

## Usage

1. Bruno desktop : `File → Open Collection → docs/api/bruno`
2. Select environment : `production` ou `local`
3. Run any request

CLI :

```bash
cd docs/api/bruno
bru run --env production
```

## Structure

```
bruno.json                # collection metadata
environments/
  production.bru          # https://servicesartisans.fr
  local.bru               # http://localhost:3000
AI/
  ask.bru                 # POST /api/v1/ask
RGE/
  geojson.bru             # GET /api/v1/rge/geojson
  lookup.bru              # GET /api/v1/rge/lookup?siret=...
  search.bru              # GET /api/v1/rge/search?city=...
Stats/
  department-paris.bru    # GET /api/v1/stats/department/75
  department-rhone.bru    # GET /api/v1/stats/department/69
Aides/
  mpr-bareme.bru          # GET /api/v1/aides/mpr-bareme?geste=...
```

## License

CC-BY 4.0 — cite as "Source: ServicesArtisans".

## Single source of truth

OpenAPI 3.1 spec : `src/app/api/v1/openapi/_spec.ts`
Served at : `https://servicesartisans.fr/api/v1/openapi/json`
