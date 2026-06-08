# OpenAPI 3.1 spec — `/api/v1/openapi/{json,yaml}`

Statut : live 2026-05-21 (Ralph itération 27).
Source de vérité : `src/app/api/v1/openapi/_spec.ts`.
License : CC-BY 4.0.

Ce document décrit l'endpoint qui publie le **contrat OpenAPI 3.1** de toute
la surface `/api/v1/*` de ServicesArtisans. Le but : permettre à n'importe
quel consommateur (Postman, Insomnia, Bruno, openapi-typescript, openapi-
generator, Stoplight, Redocly, ChatGPT plugin manifests, agents IA, etc.) de
récupérer la spec en un GET et générer son client ou sa collection sans
intervention humaine.

## Endpoints

| Endpoint               | Format   | Cache        | Méthode |
| ---------------------- | -------- | ------------ | ------- |
| `/api/v1/openapi/json` | JSON     | 1h + swr 24h | GET     |
| `/api/v1/openapi/yaml` | YAML 1.2 | 1h + swr 24h | GET     |

Headers communs :

- `Content-Type: application/json` ou `application/yaml`
- `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- `X-License: CC-BY-4.0`
- `Access-Control-Allow-Origin: *`

Aucun rate-limit appliqué (lecture statique).

## Couverture

13 endpoints `/api/v1/*` documentés :

| Tag      | Endpoint(s)                                                                  |
| -------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| AI       | `POST /api/v1/ask` (+ GET meta)                                              |
| Aides    | `GET /api/v1/aides/{mpr-bareme, cee-bareme, cumul-rules}`                    |
| RGE      | `GET /api/v1/rge/{lookup, search}`                                           |
| KG       | `GET                                                                         | POST /api/v1/kg/sparql`, `GET /api/v1/kg/ontology` |
| GraphQL  | `POST /api/v1/graphql` (+ GET meta)                                          |
| MCP      | `POST /api/v1/mcp` (JSON-RPC 2.0)                                            |
| Webhooks | `POST /webhooks/subscribe`, `DELETE /unsubscribe`, `GET /list`, `POST /test` |
| Meta     | `GET /api/v1/openapi/{json, yaml}` (self-reference)                          |

Schemas réutilisables (`components.schemas`) :

- `Geste` — enum des 10 gestes éligibles MPR/CEE
- `MenageCategorie` — enum 4 catégories (très_modeste → supérieur)
- `AskRequest` / `AskResponse` — payload AnswerEngine
- `MprBaremeResponse` / `CeeBaremeResponse` — sorties calculs déterministes
- `WebhookSubscribeRequest` — payload souscription événements
- `ErrorResponse` — enveloppe d'erreur uniforme

## Cas d'usage

### Postman / Insomnia / Bruno — import direct

1. Dans Postman : `File → Import → Link` → coller `https://servicesartisans.fr/api/v1/openapi/json`.
2. Insomnia : `Application → Preferences → Data → Import Data → From URL`.
3. Bruno : `Collection → Import → OpenAPI` → coller l'URL.

Toutes les collections sont régénérées à chaque refresh.

### SDK codegen (TypeScript)

```bash
npx openapi-typescript https://servicesartisans.fr/api/v1/openapi.json \
  -o src/types/sa-api.d.ts
```

(Notre SDK officiel Ralph 22 est hand-rolled ; ce flux ouvre la voie à des
SDKs TS/Python/Go/Java/Rust régénérés sans intervention de notre équipe.)

### SDK codegen (autre langage)

```bash
openapi-generator-cli generate \
  -i https://servicesartisans.fr/api/v1/openapi.yaml \
  -g python \
  -o ./sa-client-python
```

### ChatGPT plugin manifest (Ralph 26)

Le manifest `ai-plugin.json` référence cette URL :

```json
{
  "api": {
    "type": "openapi",
    "url": "https://servicesartisans.fr/api/v1/openapi.json"
  }
}
```

### Visualisation lisible — Redocly, Swagger UI, Stoplight Elements

```html
<redoc spec-url="https://servicesartisans.fr/api/v1/openapi.json"></redoc>
<script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
```

## Disclaimer subset

La spec couvre la **surface contractuelle stable** :

- les schemas IN/OUT sont garantis backward-compatibles (cf. politique versioning ci-dessous) ;
- les structures internes (`trace`, `_meta.disclosure`, etc.) sont décrites
  en `additionalProperties: true` quand leur forme exacte évolue vite ;
- les exemples (`examples` dans la spec) reflètent l'usage typique mais ne
  sont pas exhaustifs ;
- les responses non-2xx sont documentés en best-effort (code + description),
  pas toujours en `schema:` complet — sauf pour les endpoints critiques
  (`/api/v1/ask` notamment).

## Politique de versioning

- **Aucun breaking change** sur `/api/v1/*` ne sera publié sans bump explicite vers `/api/v2/*`.
- Toute évolution non-breaking (nouveau champ optionnel, nouvel endpoint, nouvelle valeur dans enum non strictement consommée) augmente `info.version` en patch ou minor.
- Le déprécation d'un endpoint est marquée via `deprecated: true` dans la spec **6 mois minimum** avant retrait.

## Roadmap

- **v1.1** : structured `AskResponse.trace` schema (passage de `additionalProperties: true` à un schema typé).
- **v1.2** : enum d'événements `WebhookEvent` exposé côté `WebhookSubscribeRequest.events` (actuellement enuméré inline).
- **v1.3** : examples SPARQL + GraphQL queries par endpoint.
- **v2.0** : i18n (titres + descriptions en EN + FR via `x-translations`), AsyncAPI 3 companion pour les webhooks (event-driven spec).
- **Bonus** : `/api/v1/openapi/html` server-rendered Redocly pour une page docs auto-hébergée.

## Références

- OpenAPI 3.1 spec : https://spec.openapis.org/oas/v3.1.0
- ServicesArtisans Developer Hub : https://servicesartisans.fr/developpeurs
- Transparence IA : https://servicesartisans.fr/transparence-ia
- License CC-BY 4.0 : https://creativecommons.org/licenses/by/4.0/
