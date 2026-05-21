import {
  DATASETS,
  ORG_NAME,
  CONTACT_EMAIL,
  ATTRIBUTION,
} from '../config.mjs'

/**
 * Builds the JSON payload accepted by https://www.data.gouv.fr/api/1/datasets/
 * Dry-run only — actual POST/PUT lives behind --no-dry-run + env token in
 * sprint 2.
 */
export function buildDataGouvDataset(datasetId) {
  const ds = DATASETS.find((d) => d.id === datasetId)
  if (!ds) throw new Error(`Unknown dataset: ${datasetId}`)
  return {
    title: ds.title,
    description: ds.description,
    organization: ORG_NAME,
    license: 'cc-by',
    tags: ds.keywords,
    frequency: ds.update_frequency === 'P1W' ? 'weekly' : 'unknown',
    spatial: ds.spatial_coverage,
    temporal_coverage: ds.temporal_coverage ?? null,
    resources: ds.formats.map((mime) => ({
      title: `${ds.title} (${mime})`,
      type: 'main',
      filetype: 'remote',
      url: ds.url,
      mime,
    })),
    extras: {
      attribution: ATTRIBUTION,
      contact_email: CONTACT_EMAIL,
      rge_os_pillar: '11',
    },
  }
}

export function buildDataGouvAllDatasets() {
  return DATASETS.map((d) => buildDataGouvDataset(d.id))
}
