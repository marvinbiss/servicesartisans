# ServicesArtisans RGE-OS — Bruno API collection

A pre-built [Bruno](https://www.usebruno.com/) collection for the
ServicesArtisans RGE-OS public API. Open the folder in Bruno and you have
working requests against every `v1` endpoint in one click — no curl, no
manual import of the OpenAPI JSON, no closed-source tooling.

License : [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) — cite
as "Source: ServicesArtisans".

## Why Bruno (and not Postman / Insomnia)

- **Plain-text `.bru` files** — diffable, reviewable, lives next to the
  code in git instead of in a vendor cloud.
- **Open source** — no account required, no cloud lock-in, no telemetry by
  default.
- **Native git workflow** — collection updates ship as pull requests, not
  as out-of-band "share link" exports.
- **CLI runnable** — `bru run` for CI smoke tests of the public API.

## Quick start

1. Download Bruno : <https://www.usebruno.com/downloads>
2. In Bruno : `File > Open Collection` and point at this folder
   (`packages/sa-rge-bruno`).
3. Select the **Production** environment (top-right dropdown). It sets
   `base_url=https://servicesartisans.fr`.
4. Open `collection/Meta > Endpoint discovery metadata` and click **Send**.
   You should get a 200 with a JSON discovery payload.

For local dev against `npm run dev`, pick the **Local** environment
(`http://localhost:3099`) instead.

## Folder layout

```
packages/sa-rge-bruno/
  bruno.json                       # Bruno collection metadata
  environments/
    Production.bru                 # base_url = https://servicesartisans.fr
    Local.bru                      # base_url = http://localhost:3099
  collection/                      # AUTO-GENERATED — do not edit by hand
    AI/                            # POST /api/v1/ask, etc.
    Aides/                         # MPR + CEE + cumul rules
    GraphQL/                       # /api/v1/graphql
    KG/                            # SPARQL + ontology
    MCP/                           # JSON-RPC 2.0
    Meta/                          # OpenAPI + endpoint discovery
    RGE/                           # SIRET lookup + metier/ville search
    Webhooks/                      # Subscribe / list / unsubscribe / test
```

Each `.bru` file is one HTTP request, named after the OpenAPI `summary`
and grouped by `tags[0]`. Sequence (`seq:`) preserves the order Bruno
displays them.

## Authentication

Most public endpoints are unauthenticated (rate-limited fail-open). The
exceptions are :

- `GET /api/v1/webhooks/list` — requires `Authorization: Bearer
<integrator_token>` (token is the `secret` returned by
  `/api/v1/webhooks/subscribe`).
- Webhook unsubscribe / test — pass the subscription `id` + `secret` in
  the JSON body.

To add an `Authorization` header in Bruno, open the request, scroll to
the `headers {}` block and add `Authorization: Bearer
{{integrator_token}}`. Define `integrator_token` once in the environment
(`environments/Production.bru`) so every request reuses it.

## Regeneration

The `.bru` files in `collection/` are generated from
`src/app/api/v1/openapi/_spec.ts`. **Do not edit them by hand** — your
changes will be wiped on the next regeneration. Instead :

1. Edit `src/app/api/v1/openapi/_spec.ts`.
2. Refresh the snapshot :
   `npx tsx scripts/snapshot-openapi.mjs`
3. Regenerate the collection :
   `node scripts/generate-bruno-collection.mjs`
4. Commit the updated snapshot + .bru files together.

The generator is idempotent : it wipes `collection/` before writing, so
renamed or removed operations stop showing up.

## Reporting issues

If a request fails or a parameter looks wrong, the fix lives in
`_spec.ts`, not in the `.bru` file. Open an issue with the request name
and the curl reproduction.

## Roadmap

- v0.2 : `npm run bruno:regenerate` one-shot npm script.
- v0.2 : Auth header preset injected per-endpoint when the spec declares
  a security requirement.
- v0.2 : Per-tag README in each `collection/<Tag>/` subdir.
- v0.3 : Sibling packages exposing the same surface as Insomnia and
  Hoppscotch collections.

## License

[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cite as
"Source: ServicesArtisans".
