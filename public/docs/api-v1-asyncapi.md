# AsyncAPI 3.0.0 spec — `/api/v1/asyncapi/{json,yaml}`

Statut : live 2026-05-21 (Ralph itération 30).
Source de vérité : `src/app/api/v1/asyncapi/_spec.ts`.
License : CC-BY 4.0.

Ce document décrit l'endpoint qui publie le **contrat AsyncAPI 3.0.0** des
événements webhooks RGE-OS de ServicesArtisans. AsyncAPI est à OpenAPI ce
que Kafka est à HTTP : il décrit le **flux d'événements** (event-driven)
plutôt que le request/response synchrone. Ensemble, OpenAPI (Ralph 27) et
AsyncAPI (Ralph 30) couvrent la totalité de la surface contractuelle de
SA RGE-OS.

Les consommateurs visés : EventCatalog, AsyncAPI Studio, Postman events,
AsyncAPI Generator (codegen TS/Python/Go/Java/Rust), agents IA capables
de souscrire à des flux d'événements.

## Endpoints

| Endpoint                | Format   | Cache        | Méthode |
| ----------------------- | -------- | ------------ | ------- |
| `/api/v1/asyncapi/json` | JSON     | 1h + swr 24h | GET     |
| `/api/v1/asyncapi/yaml` | YAML 1.2 | 1h + swr 24h | GET     |

> Next.js App Router contraint la structure : les chemins canoniques sont
> `/api/v1/asyncapi/json` et `/api/v1/asyncapi/yaml` (et non
> `asyncapi.json` / `asyncapi.yaml` comme on le verrait sur un serveur
> statique). Conventions identiques à `/api/v1/openapi/{json,yaml}`.

Headers communs :

- `Content-Type: application/json` ou `application/yaml`
- `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- `X-License: CC-BY-4.0`
- `Access-Control-Allow-Origin: *`

Aucun rate-limit appliqué (lecture statique).

## Event catalog (v0.1 → spec v1.0.0)

| Event                     | Channel address           | Payload requis                                                    |
| ------------------------- | ------------------------- | ----------------------------------------------------------------- |
| `rge.snapshot.refreshed`  | `rge.snapshot.refreshed`  | `snapshot_date` + `providers_count` + `qualifications_count`      |
| `rge.qualification.added` | `rge.qualification.added` | `siret` (14 chiffres) + `qualif_code` + `date_debut`              |
| `aides.bareme.updated`    | `aides.bareme.updated`    | `aide` (`maprimerenov` \| `cee`) + `version_id` + `snapshot_date` |
| `ai.transparency.updated` | `ai.transparency.updated` | `version` + `change_summary`                                      |

Chaque message hérite de l'enveloppe commune `{event, payload, ts}` et
des headers HTTP signés HMAC-SHA256 (cf. `docs/API-V1-WEBHOOKS.md` §3).

Les 4 opérations sont déclarées en `action: receive` du point de vue du
**subscriber** — c'est SA qui pousse vers son URL via POST signé.

## Sécurité — signature HMAC

La spec déclare un `securityScheme` `HmacSignature` (type `apiKey`,
header `X-SA-Signature`) qui correspond exactement à la convention
livrée en Ralph 24 :

```
X-SA-Signature: v1,t=<unix>,sig=<hex-64>
```

Vérification : HMAC-SHA256 de `v1.<unix-ts>.<raw-body>` avec le secret
retourné une seule fois par `/api/v1/webhooks/subscribe`, comparé via
`crypto.timingSafeEqual` dans une fenêtre anti-rejeu de 5 min
(inspirée RFC 9421).

## Cas d'usage

### EventCatalog — import direct

EventCatalog est devenu le standard de facto pour cataloguer les
événements d'une organisation. Import :

```bash
npx @eventcatalog/generator-asyncapi \
  --url https://servicesartisans.fr/api/v1/asyncapi/json \
  --out ./eventcatalog
```

### AsyncAPI Studio — édition + preview

1. Ouvrir [https://studio.asyncapi.com](https://studio.asyncapi.com).
2. `Import from URL` → `https://servicesartisans.fr/api/v1/asyncapi/yaml`.
3. Le rendu Studio expose channel diagrams + message previews + JSON
   Schema validators.

### Postman events — collection events

Postman v11+ supporte l'import AsyncAPI :

1. `Import → Link` → coller l'URL JSON.
2. Postman génère un workspace events séparé de la collection REST.

### AsyncAPI Generator — codegen subscriber

```bash
ag https://servicesartisans.fr/api/v1/asyncapi/yaml \
  @asyncapi/nodejs-template \
  -o ./sa-subscriber \
  -p server=production
```

Templates disponibles : `nodejs-template`, `python-paho-template`,
`go-watermill-template`, `java-spring-template`, etc.

### Agent IA — discovery automatique

Un agent capable de souscrire aux événements peut découvrir la liste
des channels + leurs schemas via :

```bash
curl -sS https://servicesartisans.fr/api/v1/asyncapi/json \
  | jq '.channels | keys'
```

et négocier une souscription via `/api/v1/webhooks/subscribe`.

## Politique de versioning

- **Aucun breaking change** sur la sémantique des événements ne sera
  publié sans bump explicite vers `/api/v2/*` (cohérent avec la
  politique OpenAPI).
- Tout nouveau champ optionnel dans un payload existant : bump patch.
- Tout nouveau channel : bump minor.
- Toute déprécation d'un channel : `deprecated: true` dans le bloc
  channel pendant **6 mois minimum** avant retrait.

## Roadmap v0.2

- **Send operations** : ajouter les 4 endpoints REST companion
  (`/api/v1/webhooks/{subscribe, unsubscribe, list, test}`) comme
  `action: send` côté producteur — utile pour les codegen
  publisher-side.
- **Bindings SSE** : Ralph 28 si on expose un flux Server-Sent Events
  parallèle aux webhooks classiques (push à la volée vs. POST async).
- **AsyncAPI Studio embed** : `/developpeurs/asyncapi` qui rend la
  spec en plein écran via le composant Studio embarqué.
- **i18n** : descriptions EN + FR via `x-translations`, aligné avec la
  roadmap OpenAPI v2.0.

## Références

- AsyncAPI 3.0 spec : https://www.asyncapi.com/docs/reference/specification/v3.0.0
- ServicesArtisans Developer Hub : https://servicesartisans.fr/developpeurs
- Webhooks (delivery + signature) : `docs/API-V1-WEBHOOKS.md`
- OpenAPI 3.1 spec (sister contract) : `docs/API-V1-OPENAPI.md`
- Transparence IA : https://servicesartisans.fr/transparence-ia
- License CC-BY 4.0 : https://creativecommons.org/licenses/by/4.0/
