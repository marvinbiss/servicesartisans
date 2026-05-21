import { DATASETS, SITE_URL, LICENSE } from '../config.mjs'

/**
 * Generates the README.md (dataset card) for a HuggingFace Datasets Hub entry.
 * Ralph 9 already published the initial cards — this builder is used to refresh
 * them on a recurring basis.
 */
export function buildHfDatasetCard(datasetId) {
  const ds = DATASETS.find((d) => d.id === datasetId)
  if (!ds) throw new Error(`Unknown dataset: ${datasetId}`)
  const tagsYaml = ds.keywords.map((k) => `  - ${k}`).join('\n')
  const bibtexId = datasetId.replace(/-/g, '_')
  return `---
license: cc-by-4.0
tags:
${tagsYaml}
language:
  - fr
size_categories:
  - 10K<n<100K
task_categories:
  - tabular-classification
  - text-retrieval
pretty_name: ${ds.title}
homepage: ${SITE_URL}
source_datasets:
  - ademe-rge-official
---

# ${ds.title}

${ds.description}

## Source

- Homepage: ${SITE_URL}
- API: ${ds.url}
- License: [CC-BY 4.0](${LICENSE})

## Citation

\`\`\`bibtex
@dataset{servicesartisans_${bibtexId}_2026,
  title  = {${ds.title}},
  author = {ServicesArtisans},
  year   = {2026},
  url    = {${ds.url}},
  license = {CC-BY 4.0},
  note   = {Source : ServicesArtisans + ADEME Registre RGE},
}
\`\`\`
`
}

export function buildAllHfDatasetCards() {
  return DATASETS.map((d) => ({ id: d.id, content: buildHfDatasetCard(d.id) }))
}
