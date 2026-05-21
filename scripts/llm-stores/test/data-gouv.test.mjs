import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDataGouvDataset,
  buildDataGouvAllDatasets,
} from '../src/manifests/data-gouv.mjs'
import { DATASETS } from '../src/config.mjs'

test('buildDataGouvDataset throws on unknown id', () => {
  assert.throws(
    () => buildDataGouvDataset('nope'),
    /Unknown dataset/,
  )
})

test('buildDataGouvDataset returns cc-by license and mapped resources', () => {
  const ds = buildDataGouvDataset('rge-providers')
  assert.equal(ds.license, 'cc-by')
  assert.ok(Array.isArray(ds.resources))
  assert.equal(ds.resources.length, 4)
  for (const r of ds.resources) {
    assert.equal(r.type, 'main')
    assert.equal(r.filetype, 'remote')
    assert.ok(r.mime)
    assert.ok(r.url.startsWith('https://'))
  }
  assert.equal(ds.extras.rge_os_pillar, '11')
})

test('buildDataGouvAllDatasets returns one entry per catalog dataset', () => {
  const all = buildDataGouvAllDatasets()
  assert.equal(all.length, DATASETS.length)
  for (const d of all) {
    assert.equal(d.organization, 'ServicesArtisans')
    assert.ok(d.title)
  }
})
