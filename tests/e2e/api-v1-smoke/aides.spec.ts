/**
 * Aides endpoints smoke (Ralph 16).
 *
 * /api/v1/aides/mpr-bareme  — MaPrimeRénov' 2026 deterministic calculator
 * /api/v1/aides/cee-bareme  — Certificats Économies d'Énergie calculator
 * /api/v1/aides/cumul-rules — Cumul matrix between MPR + CEE + Eco-PTZ
 *
 * Each endpoint MUST :
 *  - 200 + Schema.org Dataset envelope + `_meta.api_version=v1` on valid input
 *  - 400 + `INVALID_PARAMS` error code on missing/malformed params
 *  - Carry `X-License: CC-BY-4.0` + `X-Source` + `X-Snapshot-Date` headers
 */

import { expect, test } from '@playwright/test'

import { SHOULD_RUN_SMOKE, expectV1Meta, getJson, isObject, isServerReachable } from './fixtures'
import { newApiContext } from './fixtures'

test.describe('Aides — MaPrimeRénov bareme', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/aides/mpr-bareme with valid params returns 200 + result + _meta', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await getJson(ctx, '/api/v1/aides/mpr-bareme', {
        geste: 'pompe_chaleur_air_eau',
        menage_categorie: 'modeste',
        zone: 'hors_idf',
        rfr: '20000',
        nb_personnes: '3',
      })
      expect(response.status()).toBe(200)

      if (!isObject(body)) throw new Error('expected JSON object')
      expect(isObject(body.result)).toBe(true)
      expect(isObject(body.input)).toBe(true)
      expectV1Meta(body)

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(typeof headers['x-snapshot-date']).toBe('string')
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/aides/mpr-bareme without params returns 400 INVALID_PARAMS', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await getJson(ctx, '/api/v1/aides/mpr-bareme')
      expect(response.status()).toBe(400)

      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
      const err = body.error as Record<string, unknown>
      expect(err.code).toBe('INVALID_PARAMS')
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('Aides — CEE bareme', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/aides/cee-bareme with valid params returns 200 + result envelope', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await getJson(ctx, '/api/v1/aides/cee-bareme', {
        geste: 'pompe_chaleur_air_eau',
        zone_climatique: 'H1',
        type_logement: 'maison_individuelle',
        menage_categorie: 'modeste',
      })
      expect(response.status()).toBe(200)

      if (!isObject(body)) throw new Error('expected JSON object')
      expect(isObject(body.result)).toBe(true)
      expect(isObject(body.input)).toBe(true)
      expectV1Meta(body)
    } finally {
      await ctx.dispose()
    }
  })

  test('GET /api/v1/aides/cee-bareme without params returns 400', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await getJson(ctx, '/api/v1/aides/cee-bareme')
      expect(response.status()).toBe(400)

      if (!isObject(body)) throw new Error('expected JSON error object')
      expect(isObject(body.error)).toBe(true)
    } finally {
      await ctx.dispose()
    }
  })
})

test.describe('Aides — cumul rules', () => {
  test.beforeAll(async () => {
    if (!SHOULD_RUN_SMOKE && !(await isServerReachable())) {
      test.skip(true, 'Set E2E_RUN_SMOKE=1 or run a server on BASE_URL')
    }
  })

  test('GET /api/v1/aides/cumul-rules returns 200 + cumul_rules + _meta', async () => {
    const ctx = await newApiContext()
    try {
      const { response, body } = await getJson(ctx, '/api/v1/aides/cumul-rules')
      expect(response.status()).toBe(200)

      if (!isObject(body)) throw new Error('expected JSON object')
      expect(body.cumul_rules).toBeDefined()
      expectV1Meta(body)

      const headers = response.headers()
      expect(headers['x-license']).toBe('CC-BY-4.0')
      expect(headers['cache-control']).toContain('max-age=86400')
    } finally {
      await ctx.dispose()
    }
  })
})
