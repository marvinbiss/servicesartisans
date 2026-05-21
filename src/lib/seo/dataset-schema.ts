/**
 * Schema.org Dataset builder — Ralph itération 6 (2026-05-21).
 *
 * Pure module : zéro I/O, zéro import lourd. Vise à produire un JSON-LD
 * `Dataset` (schema.org/Dataset) strict et complet pour maximiser la
 * citabilité des assets open-data CC-BY 4.0 ServicesArtisans côté :
 *
 *   - Crawlers LLM (ChatGPT, Perplexity, Claude Search, Gemini AIO)
 *   - Google Dataset Search (indexation dédiée Schema.org Dataset)
 *   - data.gouv.fr (workflow "réutilisateur" / catalogue)
 *   - Journalistes data + devs (BibTeX + APA derived côté UI)
 *
 * Avant ce module, chaque page landing (/datasets/rge, /datasets/cee-…)
 * dupliquait son propre objet Dataset inline avec des écarts subtils
 * (rge sans `dateModified`, cee sans `temporalCoverage`, glossaire absent).
 * Cette source unique élimine la dérive : pour tout nouveau dataset SA,
 * appeler `buildDatasetSchema(...)` plutôt que copier-coller.
 *
 * Conformité Schema.org/Dataset rev 27.0 (mars 2026) :
 *   - `@type: Dataset` + `@context: https://schema.org`
 *   - `distribution[].@type: DataDownload` avec `encodingFormat` MIME
 *   - `creator` / `publisher` typés `Organization`
 *   - `license` URL (CC-BY 4.0 ou Etalab 2.0 — seuls validés Etalab)
 *   - `temporalCoverage` ISO 8601 (interval ou yearmonth)
 *   - `spatialCoverage` string (ISO 3166-1 alpha-2 par défaut, ex "FR")
 *   - `variableMeasured[]` typé `PropertyValue` pour schéma des champs
 *
 * Garde-fous appliqués ici :
 *   - 0 distribution → renvoyer un Dataset sans clé `distribution` du tout
 *     (Google Dataset Search préfère absence à array vide)
 *   - Champs optionnels (temporal, spatial, variableMeasured) → omis si
 *     non fournis, JAMAIS sérialisés à `null` (cassant pour validator)
 *   - Pas de mutation des input arrays (`readonly` côté type)
 *
 * Référence : https://schema.org/Dataset
 */

export type DatasetEncodingFormat =
  | 'application/json'
  | 'text/csv'
  | 'application/json+ld'
  | 'application/ld+json'
  | 'application/x-ndjson'
  | 'application/vnd.apache.parquet'

export type DatasetLicense =
  | 'https://creativecommons.org/licenses/by/4.0/'
  | 'https://www.etalab.gouv.fr/licence-ouverte-open-licence'

export type DatasetDistribution = {
  contentUrl: string
  encodingFormat: DatasetEncodingFormat
  contentSize?: string
  name?: string
}

export type DatasetOrganization = {
  name: string
  url: string
}

export type DatasetSchemaInput = {
  id: string
  name: string
  description: string
  url: string
  distributions: ReadonlyArray<DatasetDistribution>
  keywords: ReadonlyArray<string>
  temporalCoverage?: string
  spatialCoverage?: 'FR' | string
  isAccessibleForFree: boolean
  license: DatasetLicense
  creator: DatasetOrganization
  publisher: DatasetOrganization
  dateModified: string
  variableMeasured?: ReadonlyArray<string>
  inLanguage?: string
}

export function buildDatasetSchema(input: DatasetSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': input.id,
    name: input.name,
    description: input.description,
    url: input.url,
    isAccessibleForFree: input.isAccessibleForFree,
    license: input.license,
    keywords: input.keywords.join(', '),
    creator: {
      '@type': 'Organization',
      name: input.creator.name,
      url: input.creator.url,
    },
    publisher: {
      '@type': 'Organization',
      name: input.publisher.name,
      url: input.publisher.url,
    },
    dateModified: input.dateModified,
  }

  if (input.distributions.length > 0) {
    schema.distribution = input.distributions.map((d) => {
      const dist: Record<string, unknown> = {
        '@type': 'DataDownload',
        contentUrl: d.contentUrl,
        encodingFormat: d.encodingFormat,
      }
      if (d.contentSize) dist.contentSize = d.contentSize
      if (d.name) dist.name = d.name
      return dist
    })
  }

  if (input.temporalCoverage) {
    schema.temporalCoverage = input.temporalCoverage
  }

  if (input.spatialCoverage) {
    schema.spatialCoverage = input.spatialCoverage
  }

  if (input.variableMeasured && input.variableMeasured.length > 0) {
    schema.variableMeasured = input.variableMeasured.map((v) => ({
      '@type': 'PropertyValue',
      name: v,
    }))
  }

  if (input.inLanguage) {
    schema.inLanguage = input.inLanguage
  }

  return schema
}
