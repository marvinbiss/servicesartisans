import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DATASETS,
  SITE_URL,
  LICENSE,
  ATTRIBUTION,
  ORG_NAME,
  CONTACT_EMAIL,
} from '../src/config.mjs'

test('DATASETS contains at least 5 entries', () => {
  assert.ok(Array.isArray(DATASETS))
  assert.ok(DATASETS.length >= 5, `expected >=5 datasets, got ${DATASETS.length}`)
})

test('every dataset declares mandatory fields', () => {
  for (const d of DATASETS) {
    assert.ok(d.id, `missing id`)
    assert.ok(d.title, `${d.id}: missing title`)
    assert.ok(d.description, `${d.id}: missing description`)
    assert.ok(d.url, `${d.id}: missing url`)
    assert.ok(Array.isArray(d.keywords) && d.keywords.length > 0, `${d.id}: keywords empty`)
    assert.ok(Array.isArray(d.formats) && d.formats.length > 0, `${d.id}: formats empty`)
  }
})

test('SITE_URL + global constants are well-formed', () => {
  assert.ok(SITE_URL.startsWith('https://'), 'SITE_URL must be https')
  assert.ok(SITE_URL.includes('servicesartisans.fr'), 'SITE_URL must point to SA')
  assert.ok(LICENSE.includes('creativecommons.org'), 'LICENSE must be CC')
  assert.equal(ATTRIBUTION, 'ServicesArtisans')
  assert.equal(ORG_NAME, 'ServicesArtisans')
  assert.ok(CONTACT_EMAIL.includes('@'), 'CONTACT_EMAIL must be email-shaped')
})

test('dataset IDs are unique', () => {
  const ids = DATASETS.map((d) => d.id)
  const unique = new Set(ids)
  assert.equal(unique.size, ids.length, 'duplicate dataset id detected')
})
