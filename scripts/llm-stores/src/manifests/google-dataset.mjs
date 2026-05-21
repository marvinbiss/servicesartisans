import { DATASETS, SITE_URL, LICENSE, ATTRIBUTION } from '../config.mjs'

/**
 * Emits a Schema.org Dataset JSON-LD object compatible with Google Dataset
 * Search guidelines (https://developers.google.com/search/docs/appearance/structured-data/dataset).
 */
export function buildGoogleDatasetJsonLd(datasetId) {
  const ds = DATASETS.find((d) => d.id === datasetId)
  if (!ds) throw new Error(`Unknown dataset: ${datasetId}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: ds.title,
    description: ds.description,
    url: ds.url,
    keywords: ds.keywords,
    license: LICENSE,
    isAccessibleForFree: true,
    creator: { '@type': 'Organization', name: ATTRIBUTION, url: SITE_URL },
    distribution: ds.formats.map((mime) => ({
      '@type': 'DataDownload',
      encodingFormat: mime,
      contentUrl: ds.url,
    })),
    spatialCoverage: ds.spatial_coverage,
    temporalCoverage: ds.temporal_coverage ?? undefined,
    sameAs: ds.sparql_endpoint ?? undefined,
  }
}

export function buildAllGoogleDatasetJsonLd() {
  return DATASETS.map((d) => buildGoogleDatasetJsonLd(d.id))
}
