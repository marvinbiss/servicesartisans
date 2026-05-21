import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildGoogleDatasetJsonLd,
  buildAllGoogleDatasetJsonLd,
} from '../src/manifests/google-dataset.mjs'
import { DATASETS } from '../src/config.mjs'

test('JSON-LD uses schema.org context', () => {
  const out = buildGoogleDatasetJsonLd('rge-providers')
  assert.equal(out['@context'], 'https://schema.org')
})

test('JSON-LD @type is Dataset', () => {
  const out = buildGoogleDatasetJsonLd('mpr-bareme-2026')
  assert.equal(out['@type'], 'Dataset')
  assert.ok(out.name)
  assert.ok(out.description)
  assert.equal(out.isAccessibleForFree, true)
})

test('distribution maps every format to a DataDownload', () => {
  const out = buildGoogleDatasetJsonLd('rge-providers')
  const source = DATASETS.find((d) => d.id === 'rge-providers')
  assert.equal(out.distribution.length, source.formats.length)
  for (const dist of out.distribution) {
    assert.equal(dist['@type'], 'DataDownload')
    assert.ok(source.formats.includes(dist.encodingFormat))
  }
})

test('buildAllGoogleDatasetJsonLd emits one entry per catalog dataset', () => {
  const all = buildAllGoogleDatasetJsonLd()
  assert.equal(all.length, DATASETS.length)
})
