# RGE Spec v1.0

> Canonical JSON Schema for French RGE (Reconnu Garant de l'Environnement)
> certified contractor entities. Published by ServicesArtisans under
> CC-BY 4.0.

## What is RGE Spec

`rge.json` is a machine-readable contract describing the canonical shape
of a French RGE-certified contractor record. It is to the RGE ecosystem
what OpenAPI is to HTTP APIs: a stable, versioned, vendor-neutral
description anyone can validate against.

The schema covers:

- Identity (SIRET, SIREN, legal form, NAF code).
- Address with INSEE-compliant department code pattern.
- Geolocation (WGS84).
- RGE qualifications (code, organisme, domaine, period, isActive).
- Provenance (`sources` array with `license` enum and `retrievedAt`).
- Canonical URL and content license.

## Why we publish it

The French renovation ecosystem has no canonical contractor entity
schema. Every operator (mandataires CEE, agrégateurs, médias data,
fintechs) rolls their own ad-hoc structure. The cost of integration
compounds linearly with each new partner.

If a single specification is adopted by enough actors, the cost of
integration falls to near zero — and the publisher of that specification
becomes a piece of editorial infrastructure rather than just another
operator. That is the play behind RGE Spec.

Pillar 5 of the [RGE-OS Manifesto](../../../RGE-OS-MANIFESTO.md).

## Quick start

### Node.js (Ajv)

```js
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import schema from './rge.schema.json' assert { type: 'json' }
import orgs from './enums/organismes-certificateurs.json' assert { type: 'json' }
import gestes from './enums/gestes-rge.json' assert { type: 'json' }
import meta from './enums/categories-meta-domaines.json' assert { type: 'json' }

const ajv = new Ajv({ strict: false, allErrors: true })
addFormats(ajv)
ajv.addSchema(orgs)
ajv.addSchema(gestes)
ajv.addSchema(meta)

const validate = ajv.compile(schema)
const ok = validate(myRecord)
if (!ok) console.error(validate.errors)
```

### Python (jsonschema)

```python
import json
from jsonschema import Draft202012Validator, RefResolver

with open("rge.schema.json") as f:
    schema = json.load(f)

resolver = RefResolver(
    base_uri="https://servicesartisans.fr/spec/rge/v1.0/",
    referrer=schema,
)
validator = Draft202012Validator(schema, resolver=resolver)
errors = list(validator.iter_errors(my_record))
```

## Cross-walk to Schema.org

A `RgeArtisan` record maps cleanly to
[`LocalBusiness`](https://schema.org/LocalBusiness) /
[`HomeAndConstructionBusiness`](https://schema.org/HomeAndConstructionBusiness):

| RGE Spec field                          | Schema.org property                          |
| --------------------------------------- | -------------------------------------------- |
| `name`                                  | `name`                                       |
| `siret`                                 | `identifier` (with `propertyID: "SIRET"`)    |
| `siren`                                 | `identifier` (with `propertyID: "SIREN"`)    |
| `nafCode`                               | `naics` analog / `Brand.identifier`          |
| `address.streetAddress`                 | `address.streetAddress`                      |
| `address.postalCode`                    | `address.postalCode`                         |
| `address.addressLocality`               | `address.addressLocality`                    |
| `address.addressRegion`                 | `address.addressRegion`                      |
| `address.addressCountry`                | `address.addressCountry`                     |
| `geo.latitude` / `geo.longitude`        | `geo.GeoCoordinates.latitude` / `.longitude` |
| `phoneE164`                             | `telephone`                                  |
| `rgeQualifications[].code`              | `hasCredential.identifier`                   |
| `rgeQualifications[].organisme`         | `hasCredential.recognizedBy.name`            |
| `rgeQualifications[].dateDebut/dateFin` | `hasCredential.validFrom` / `validThrough`   |
| `canonicalUrl`                          | `url`                                        |

Example JSON-LD wrapper:

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "PAC Pro Île-de-France SARL",
  "identifier": [
    { "@type": "PropertyValue", "propertyID": "SIRET", "value": "11111111100015" },
    { "@type": "PropertyValue", "propertyID": "SIREN", "value": "111111111" }
  ],
  "address": {
    "@type": "PostalAddress",
    "postalCode": "75001",
    "addressLocality": "Paris",
    "addressCountry": "FR"
  },
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certification",
      "identifier": "QualiPAC",
      "recognizedBy": { "@type": "Organization", "name": "Qualit'EnR" },
      "validFrom": "2024-01-15",
      "validThrough": "2027-01-14"
    }
  ]
}
```

## Versioning

The spec follows [Semantic Versioning](https://semver.org/) at the URL
level — every breaking change ships under a new path:

- `v1.0/` — current stable.
- `v1.1/` — planned MINOR (additive only).
- `v2.0/` — planned MAJOR.

See [`CHANGELOG.md`](./CHANGELOG.md) for the full deprecation policy.

## Roadmap

- **v1.1** — Optional `chantier` / `booking` entity for documenting a
  lead-to-installation lifecycle.
- **v1.2** — Optional `reviews` aggregate (mean rating + count + most
  recent date) with provenance.
- **v2.0** — Multi-country support (Belgium, Luxembourg) with locale
  switch on `addressCountry` and per-country qualification enums.

## Contributing / Issue reporting

This spec is developed in the open. To propose changes:

1. Open an issue on the ServicesArtisans repository describing the use
   case, the proposed change, and the backward-compatibility implications.
2. For enum additions (MINOR-compatible), include the certifying body's
   official identifier and effective date.
3. For new fields, include the rationale, the data source, and a sample
   record.

Decisions are summarised in `CHANGELOG.md` at release time.

## License

CC-BY 4.0 — see [LICENSE.md](./LICENSE.md).
