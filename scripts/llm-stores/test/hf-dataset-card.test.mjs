import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildHfDatasetCard,
  buildAllHfDatasetCards,
} from '../src/manifests/hf-dataset-card.mjs'

test('HF dataset card starts with YAML front-matter', () => {
  const out = buildHfDatasetCard('rge-providers')
  assert.ok(out.startsWith('---\n'))
  assert.ok(out.includes('\n---\n'))
})

test('HF dataset card declares cc-by-4.0 license', () => {
  const out = buildHfDatasetCard('mpr-bareme-2026')
  assert.ok(out.includes('license: cc-by-4.0'))
  assert.ok(out.includes('language:'))
  assert.ok(out.includes('  - fr'))
})

test('HF dataset card contains a bibtex citation block', () => {
  const out = buildHfDatasetCard('cee-bareme-2026')
  assert.ok(out.includes('```bibtex'))
  assert.ok(out.includes('@dataset{servicesartisans_cee_bareme_2026_2026'))
  assert.ok(out.includes('license = {CC-BY 4.0}'))
})

test('buildAllHfDatasetCards yields { id, content } per dataset', () => {
  const all = buildAllHfDatasetCards()
  assert.ok(all.length >= 5)
  for (const c of all) {
    assert.ok(c.id)
    assert.ok(typeof c.content === 'string' && c.content.startsWith('---'))
  }
})
