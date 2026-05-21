# Changelog — RGE Spec

All notable changes to this spec follow [Keep a Changelog](https://keepachangelog.com/) + [SemVer](https://semver.org/).

## [1.0.0] — 2026-05-21

### Added

- Initial public release.
- `RgeArtisan` core entity with strict `additionalProperties: false`.
- `RgeQualification`, `Address`, `GeoLocation`, `Source` sub-entities.
- Enumerated values for `organismes-certificateurs` (13 entries), `gestes-rge` (15 entries), `categories-meta-domaines` (5 entries).
- Three valid examples covering chauffage (PAC Paris), isolation (ITE/ITI Bordeaux), études (audit Lyon).
- One invalid example (`invalid-missing-siret`) used by the validator and tests for negative cases.
- Dependency-free validator `scripts/validate-rge-spec.mjs`.
- License: CC-BY 4.0.

### Deprecation policy

- A field marked deprecated in a MINOR release `X.Y` will be removed in the next MAJOR release `(X+1).0`.
- Enum values may be **added** in MINOR releases without breaking backward compatibility.
- Enum value **renames or removals** are MAJOR-only.
- Field renames are MAJOR-only.
- New optional fields may be introduced in MINOR releases.
- New required fields are MAJOR-only.
