/**
 * Tests — ASYNCAPI_SPEC structure + event coverage
 * (`src/app/api/v1/asyncapi/_spec.ts`).
 *
 * Couvre :
 *  - version 3.0.0
 *  - license CC-BY 4.0
 *  - 4 channels (rge.snapshot.refreshed, rge.qualification.added,
 *    aides.bareme.updated, ai.transparency.updated)
 *  - 4 receive operations
 *  - 4 messages
 *  - WebhookHeaders required X-SA-Signature
 *  - RgeSnapshotRefreshedPayload requires snapshot_date + counts
 *  - HmacSignature security scheme defined
 */
import { describe, it, expect } from 'vitest'

import { ASYNCAPI_SPEC } from '@/app/api/v1/asyncapi/_spec'

describe('ASYNCAPI_SPEC — meta', () => {
  it('declares AsyncAPI 3.0.0', () => {
    expect(ASYNCAPI_SPEC.asyncapi).toBe('3.0.0')
  })

  it('declares CC-BY 4.0 license', () => {
    expect(ASYNCAPI_SPEC.info.license.name).toBe('CC-BY 4.0')
  })
})

describe('ASYNCAPI_SPEC — channel coverage', () => {
  it('exposes the 4 RGE-OS event channels', () => {
    const expected = [
      'rge.snapshot.refreshed',
      'rge.qualification.added',
      'aides.bareme.updated',
      'ai.transparency.updated',
    ]
    const channelKeys = Object.keys(ASYNCAPI_SPEC.channels)
    for (const channel of expected) {
      expect(channelKeys).toContain(channel)
    }
    expect(channelKeys.length).toBe(4)
  })

  it('declares 4 receive operations (one per channel)', () => {
    const ops = ASYNCAPI_SPEC.operations
    const opKeys = Object.keys(ops)
    expect(opKeys.length).toBe(4)
    for (const key of opKeys) {
      const op = ops[key as keyof typeof ops] as { action: string }
      expect(op.action).toBe('receive')
    }
  })
})

describe('ASYNCAPI_SPEC — components.messages', () => {
  it('exposes 4 message definitions', () => {
    const messages = ASYNCAPI_SPEC.components.messages
    const messageKeys = Object.keys(messages)
    expect(messageKeys).toContain('RgeSnapshotRefreshed')
    expect(messageKeys).toContain('RgeQualificationAdded')
    expect(messageKeys).toContain('AidesBaremeUpdated')
    expect(messageKeys).toContain('AiTransparencyUpdated')
    expect(messageKeys.length).toBe(4)
  })
})

describe('ASYNCAPI_SPEC — components.schemas', () => {
  it('WebhookHeaders requires X-SA-Signature + X-SA-Event', () => {
    const headers = ASYNCAPI_SPEC.components.schemas.WebhookHeaders
    expect(headers.required).toContain('X-SA-Signature')
    expect(headers.required).toContain('X-SA-Event')
  })

  it('RgeSnapshotRefreshedPayload payload requires snapshot_date, providers_count, qualifications_count', () => {
    const payload = ASYNCAPI_SPEC.components.schemas.RgeSnapshotRefreshedPayload.properties.payload
    expect(payload.required).toContain('snapshot_date')
    expect(payload.required).toContain('providers_count')
    expect(payload.required).toContain('qualifications_count')
  })
})

describe('ASYNCAPI_SPEC — security', () => {
  it('declares the HmacSignature security scheme', () => {
    const schemes = ASYNCAPI_SPEC.components.securitySchemes
    expect(schemes).toHaveProperty('HmacSignature')
    expect(schemes.HmacSignature.type).toBe('apiKey')
    expect(schemes.HmacSignature.name).toBe('X-SA-Signature')
  })
})
