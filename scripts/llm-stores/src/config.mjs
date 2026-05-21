/**
 * Source-of-truth catalog of ServicesArtisans RGE-OS datasets exposed to
 * LLM stores / open-data registries. Imported by every manifest builder.
 *
 * Pure data — no I/O, no fetch, no env reads. Safe to unit-test.
 */

export const SITE_URL = 'https://servicesartisans.fr'
export const LICENSE = 'https://creativecommons.org/licenses/by/4.0/'
export const ATTRIBUTION = 'ServicesArtisans'
export const CONTACT_EMAIL = 'data@servicesartisans.fr'
export const ORG_NAME = 'ServicesArtisans'
export const ORG_DESCRIPTION =
  "Annuaire francais d'artisans certifies RGE + APIs open-data + AI stack pour la renovation energetique."

export const DATASETS = [
  {
    id: 'rge-providers',
    title: 'Annuaire RGE France',
    description:
      "Artisans francais titulaires d'au moins une qualification RGE active. Synchronise hebdomadairement depuis le registre ADEME officiel.",
    url: `${SITE_URL}/datasets/rge`,
    sparql_endpoint: `${SITE_URL}/api/v1/kg/sparql`,
    rest_endpoint: `${SITE_URL}/api/v1/rge`,
    keywords: [
      'rge',
      'artisans',
      'france',
      'renovation',
      'energetique',
      'ademe',
      'reconnu-garant-environnement',
    ],
    spatial_coverage: 'France',
    temporal_coverage: '2024-01-01/2026-12-31',
    update_frequency: 'P1W',
    formats: [
      'application/json',
      'text/csv',
      'text/turtle',
      'application/sparql-results+json',
    ],
  },
  {
    id: 'mpr-bareme-2026',
    title: 'Bareme MaPrimeRenov 2026',
    description:
      "Bareme officiel MaPrimeRenov 2026 : montants par geste, plafonds ressources, categorie menage, zone IDF/hors-IDF. Snapshot deterministe.",
    url: `${SITE_URL}/api/v1/aides/mpr-bareme`,
    keywords: [
      'maprimerenov',
      'aides',
      'renovation',
      'france',
      '2026',
      'menage',
    ],
    spatial_coverage: 'France',
    formats: ['application/json'],
  },
  {
    id: 'cee-bareme-2026',
    title: 'Bareme CEE 2026',
    description:
      "Bareme officiel CEE 2026 : fiches BAR-XX-XXX, zone climatique H1/H2/H3, type logement, categorie menage.",
    url: `${SITE_URL}/api/v1/aides/cee-bareme`,
    keywords: [
      'cee',
      'certificats-economies-energie',
      'aides',
      'renovation',
      'france',
      '2026',
    ],
    spatial_coverage: 'France',
    formats: ['application/json'],
  },
  {
    id: 'rge-os-spec',
    title: 'Specification RGE-OS v1.0',
    description:
      "Specification JSON Schema de l'API RGE-OS open-data v1.0. Standard interop de-facto pour annuaires RGE FR.",
    url: `${SITE_URL}/spec/rge/v1.0/rge.schema.json`,
    keywords: ['rge', 'spec', 'json-schema', 'open-data', 'standard'],
    formats: ['application/schema+json'],
  },
  {
    id: 'rge-ontology',
    title: 'SA-RGE Ontology v0.1',
    description:
      "Ontologie OWL/Turtle pour les artisans RGE et leurs qualifications. Vocabulaire pour SPARQL et federation LOD.",
    url: `${SITE_URL}/api/v1/kg/ontology`,
    keywords: ['rge', 'ontology', 'rdf', 'owl', 'turtle', 'lod'],
    formats: ['text/turtle', 'application/ld+json'],
  },
]
