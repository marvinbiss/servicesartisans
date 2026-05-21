# @servicesartisans/rge-sdk

Official TypeScript SDK for the [ServicesArtisans](https://servicesartisans.fr)
RGE-OS open-data and AI APIs. One import, two lines, fully typed.

```ts
import { SARgeClient } from '@servicesartisans/rge-sdk'

const sa = new SARgeClient()
const fiche = await sa.rgeLookup('12345678901234')
console.log(fiche.qualifications.filter((q) => q.valide))
```

The SDK wraps the public `v1` endpoints under `https://servicesartisans.fr/api/v1`
(open-data, license [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/))
plus the JSON Schema served at `/spec/rge/v1.0/rge.schema.json`.

---

## Why this exists

If you build a journalistic embed, a CRM integration (Sonergia, Effy, Hellio,
Pipedrive...), an agency dashboard or a Renovation marketplace and you want to
let your users:

- Look up an artisan's RGE qualification from a SIRET
- Search the RGE registry by trade and city
- Compute eligibility for MaPrimeRenov 2026 or CEE
- Ask plain-language questions about renovation aids with cited sources

...then writing the HTTP client yourself is friction. This SDK is the
production-ready replacement.

## Install

```bash
npm install @servicesartisans/rge-sdk
```

Requirements: Node 18+ (native `fetch` and `AbortController`). No runtime
dependencies.

ESM-only: your project must use `"type": "module"` in `package.json`, or
import via dynamic `import()` from CommonJS callers.

## Quick start

```ts
import { SARgeClient } from '@servicesartisans/rge-sdk'

const sa = new SARgeClient()

// 1. RGE lookup
const fiche = await sa.rgeLookup('12345678901234')

// 2. RGE search by trade + city
const hits = await sa.rgeSearch('plombier', 'paris', 25)

// 3. MaPrimeRenov 2026 eligibility
const mpr = await sa.mprBareme({
  geste: 'pac_air_eau',
  menageCategorie: 'modeste',
  zone: 'idf',
  rfr: 22_000,
  nbPersonnes: 3,
})

// 4. CEE 2026 forfait
const cee = await sa.ceeBareme({
  geste: 'isolation_combles',
  zoneClimatique: 'H2',
  typeLogement: 'maison_individuelle',
  menageCategorie: 'tres_modeste',
})

// 5. Cumul rules across MaPrimeRenov / CEE / Eco-PTZ
const cumul = await sa.cumulRules()

// 6. YMYL-gated AI Q&A (POST)
const ask = await sa.ask({
  query: 'Quelle aide pour une pompe a chaleur air-eau en Ile-de-France ?',
  classification: 'NUMERIC',
  aidesContext: {
    geste: 'pac_air_eau',
    menageCategorie: 'modeste',
    rfr: 22_000,
    nbPersonnes: 3,
    zone: 'idf',
  },
})

// 7. JSON Schema spec for the RGE qualification contract
const schema = await sa.fetchSpec()
```

## Configuration

```ts
const sa = new SARgeClient({
  baseUrl: 'https://servicesartisans.fr', // default
  timeoutMs: 30_000, // default
  userAgent: 'my-app/1.0', // default 'sa-rge-sdk-ts/<version>'
})
```

| Field       | Default                       | Notes                                      |
| ----------- | ----------------------------- | ------------------------------------------ |
| `baseUrl`   | `https://servicesartisans.fr` | Override for staging / local dev           |
| `timeoutMs` | `30000`                       | AbortController-based per-request timeout  |
| `userAgent` | `sa-rge-sdk-ts/0.1.0`         | Helps us trace usage and rate-limit fairly |

## Methods reference

| Method                             | HTTP                                | Returns                 |
| ---------------------------------- | ----------------------------------- | ----------------------- |
| `rgeLookup(siret: string)`         | `GET /api/v1/rge/lookup`            | `RgeLookupResult`       |
| `rgeSearch(metier, ville, limit?)` | `GET /api/v1/rge/search`            | `RgeSearchResult`       |
| `mprBareme(input: MprBaremeInput)` | `GET /api/v1/aides/mpr-bareme`      | `MprBaremeResult`       |
| `ceeBareme(input: CeeBaremeInput)` | `GET /api/v1/aides/cee-bareme`      | `CeeBaremeResult`       |
| `cumulRules()`                     | `GET /api/v1/aides/cumul-rules`     | `CumulRulesResult`      |
| `ask(input: AskInput)`             | `POST /api/v1/ask`                  | `AskResult`             |
| `fetchSpec(version?: string)`      | `GET /spec/rge/<v>/rge.schema.json` | `unknown` (JSON Schema) |

CamelCase TS inputs (`menageCategorie`, `nbPersonnes`, `zoneClimatique`,
`typeLogement`) are mapped to snake_case HTTP params (`menage_categorie`,
`nb_personnes`, `zone_climatique`, `type_logement`) at the boundary.

## Error handling

All errors extend `SARgeError`. Branch on `instanceof`:

```ts
import {
  SARgeClient,
  SARgeRateLimitError,
  SARgeServiceUnavailableError,
  SARgeValidationError,
  SARgeNetworkError,
  SARgeError,
} from '@servicesartisans/rge-sdk'

const sa = new SARgeClient()

try {
  const out = await sa.mprBareme({
    geste: 'pac_air_eau',
    menageCategorie: 'modeste',
    zone: 'idf',
    rfr: 22_000,
    nbPersonnes: 3,
  })
  console.log(out.result)
} catch (err) {
  if (err instanceof SARgeValidationError) {
    console.warn('Bad params:', err.details)
  } else if (err instanceof SARgeRateLimitError) {
    console.warn('Throttle and retry later.')
  } else if (err instanceof SARgeServiceUnavailableError) {
    console.warn('Upstream down, fail soft.')
  } else if (err instanceof SARgeNetworkError) {
    console.warn('Timeout or DNS error.')
  } else if (err instanceof SARgeError) {
    console.warn('Unexpected SA error:', err.code, err.statusCode)
  } else {
    throw err
  }
}
```

| Error class                      | HTTP    | When                                   |
| -------------------------------- | ------- | -------------------------------------- |
| `SARgeValidationError`           | 400     | Invalid query params (server-side Zod) |
| `SARgeRateLimitError`            | 429     | 600 req/min/IP exceeded                |
| `SARgeServiceUnavailableError`   | 503     | Upstream AI / DB / ADEME provider down |
| `SARgeError` (code `HTTP_ERROR`) | 4xx/5xx | Anything else (5xx, 404, ...)          |
| `SARgeNetworkError`              | n/a     | Timeout, DNS error, broken socket      |

## Source citation requirement

The data exposed by these APIs is licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). When you display
results in your own product, you must cite ServicesArtisans (and the upstream
source where relevant, e.g., "Registre RGE ADEME" or "ANAH MaPrimeRenov 2026").

A short footer like `Source : ServicesArtisans (CC-BY 4.0)` is enough.

## ES Modules

This package is ESM-only. Your `package.json` must declare:

```json
{
  "type": "module"
}
```

CommonJS consumers can use a dynamic import:

```js
const { SARgeClient } = await import('@servicesartisans/rge-sdk')
```

## Roadmap

- `0.2.0`: streaming `/api/v1/ask` over Server-Sent Events.
- `0.3.0`: retry-with-backoff middleware (currently caller's responsibility).
- `0.4.0`: OpenAPI codegen for newly added endpoints.
- `1.0.0`: stability commitment + LTS once the upstream `v1` contract is frozen.

## Links

- Manifesto: <https://servicesartisans.fr/developpeurs>
- Spec: <https://servicesartisans.fr/spec/rge/v1.0/rge.schema.json>
- API docs: <https://servicesartisans.fr/api/v1/docs>
- Issues: <https://github.com/servicesartisans/rge-sdk/issues>

## License

[MIT](./LICENSE) (code). Data accessed through the API is
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
