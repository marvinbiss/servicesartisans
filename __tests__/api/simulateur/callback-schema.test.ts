/**
 * Tests — callbackSchema (POST /api/simulateur/callback)
 *
 * Strategy: replicate the Zod schema locally (same pattern as artisan-claim.test.ts)
 * so we never import Next.js server code (runtime = 'nodejs' edge guard).
 *
 * Coverage: publicId · callbackToken · telephone · preferredSlot ·
 *           remarquesClient · consentRgpd · consentDemarchage · combined payloads
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema replica — keep in sync with src/app/api/simulateur/callback/route.ts
// ---------------------------------------------------------------------------

const TEL_FR_RE = /^(?:\+33|0)[1-9](?:\d{8})$/

const callbackSchema = z.object({
  publicId: z.string().min(8).max(64),
  callbackToken: z.string().min(10).max(256),
  telephone: z
    .string()
    .trim()
    .min(10)
    .max(32)
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => TEL_FR_RE.test(v), { message: 'Téléphone FR invalide' }),
  preferredSlot: z.string().max(80).nullish(),
  remarquesClient: z.string().max(500).nullish(),
  consentRgpd: z.literal(true),
  consentDemarchage: z.boolean().optional().default(false),
})

type CallbackInput = z.input<typeof callbackSchema>

const BASE_VALID: CallbackInput = {
  publicId: 'EST-2026-04-14-abc123',
  callbackToken: 'a'.repeat(64) + '.' + 'b'.repeat(64),
  telephone: '0612345678',
  preferredSlot: null,
  remarquesClient: null,
  consentRgpd: true,
  consentDemarchage: false,
}

function make(overrides: Partial<CallbackInput>) {
  return callbackSchema.safeParse({ ...BASE_VALID, ...overrides })
}

// ---------------------------------------------------------------------------
// publicId
// ---------------------------------------------------------------------------

describe('callbackSchema — publicId', () => {
  it('accepts a valid publicId (8 chars)', () => {
    expect(make({ publicId: 'a'.repeat(8) }).success).toBe(true)
  })

  it('accepts a valid publicId (64 chars)', () => {
    expect(make({ publicId: 'a'.repeat(64) }).success).toBe(true)
  })

  it('rejects publicId shorter than 8 chars', () => {
    expect(make({ publicId: 'abc1234' }).success).toBe(false)
  })

  it('rejects empty publicId', () => {
    expect(make({ publicId: '' }).success).toBe(false)
  })

  it('rejects publicId longer than 64 chars', () => {
    expect(make({ publicId: 'a'.repeat(65) }).success).toBe(false)
  })

  it('accepts whitespace-only publicId (8 spaces) — Zod does not trim by default', () => {
    // Schema has no .trim() on publicId — whitespace-only 8-char string is valid length
    expect(make({ publicId: '        ' }).success).toBe(true)
  })

  it('accepts unicode publicId within length bounds', () => {
    // 8 unicode chars — string length in JS is UTF-16 code units
    expect(make({ publicId: 'αβγδεζηθ' }).success).toBe(true)
  })

  it('accepts SQL injection payload as string (no structural validation)', () => {
    const sqlPayload = "' OR 1=1; --"
    // Length is 13 chars, within 8–64 bounds
    expect(make({ publicId: sqlPayload }).success).toBe(true)
  })

  it('rejects missing publicId', () => {
    const result = callbackSchema.safeParse({
      ...BASE_VALID,
      publicId: undefined,
    } as unknown as CallbackInput)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// callbackToken
// ---------------------------------------------------------------------------

describe('callbackSchema — callbackToken', () => {
  it('accepts a 10-char token (minimum)', () => {
    expect(make({ callbackToken: 'a'.repeat(10) }).success).toBe(true)
  })

  it('accepts a 256-char token (maximum)', () => {
    expect(make({ callbackToken: 'a'.repeat(256) }).success).toBe(true)
  })

  it('accepts typical base64-ish token format', () => {
    // epoch.hexsig pattern
    expect(make({ callbackToken: '1744665600.abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789' }).success).toBe(true)
  })

  it('rejects empty callbackToken', () => {
    expect(make({ callbackToken: '' }).success).toBe(false)
  })

  it('rejects callbackToken shorter than 10 chars', () => {
    expect(make({ callbackToken: 'abc123' }).success).toBe(false)
  })

  it('rejects callbackToken longer than 256 chars', () => {
    expect(make({ callbackToken: 'a'.repeat(257) }).success).toBe(false)
  })

  it('accepts token with special chars (schema only checks length)', () => {
    expect(make({ callbackToken: '1234567890!@#$%^&*' }).success).toBe(true)
  })

  it('rejects missing callbackToken', () => {
    const result = callbackSchema.safeParse({
      ...BASE_VALID,
      callbackToken: undefined,
    } as unknown as CallbackInput)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// telephone
// ---------------------------------------------------------------------------

describe('callbackSchema — telephone', () => {
  it('accepts canonical 06 mobile (0612345678)', () => {
    const r = make({ telephone: '0612345678' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.telephone).toBe('0612345678')
  })

  it('accepts +33 international format', () => {
    const r = make({ telephone: '+33612345678' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.telephone).toBe('+33612345678')
  })

  it('accepts 06 12 34 56 78 with spaces (stripped by transform)', () => {
    const r = make({ telephone: '06 12 34 56 78' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.telephone).toBe('0612345678')
  })

  it('accepts +33 6 12 34 56 78 with spaces stripped', () => {
    const r = make({ telephone: '+33 6 12 34 56 78' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.telephone).toBe('+33612345678')
  })

  it('accepts landline starting with 01 (Paris)', () => {
    expect(make({ telephone: '0112345678' }).success).toBe(true)
  })

  it('rejects number starting with 00 (international dialing prefix)', () => {
    // 0033612345678 → after trim: 0033612345678 (13 chars, max 32 OK) → fails regex (00 is not 0[1-9])
    expect(make({ telephone: '0033612345678' }).success).toBe(false)
  })

  it('rejects UK number +44', () => {
    expect(make({ telephone: '+447911123456' }).success).toBe(false)
  })

  it('rejects US number +1', () => {
    expect(make({ telephone: '+12125551234' }).success).toBe(false)
  })

  it('rejects too short (9 digits after strip)', () => {
    // "061234567" → 9 chars → fails min(10)
    expect(make({ telephone: '061234567' }).success).toBe(false)
  })

  it('rejects empty telephone', () => {
    expect(make({ telephone: '' }).success).toBe(false)
  })

  it('rejects telephone with only spaces', () => {
    // after trim: '' → length 0 → fails min(10)
    expect(make({ telephone: '          ' }).success).toBe(false)
  })

  it('rejects letters in telephone', () => {
    expect(make({ telephone: '0612ABCDEF' }).success).toBe(false)
  })

  it('rejects 0 + 0 + 8 digits (second digit is 0 — invalid in FR mobile/landline)', () => {
    // 0012345678 — second digit is 0, fails regex [1-9]
    expect(make({ telephone: '0012345678' }).success).toBe(false)
  })

  it('rejects telephone longer than 32 chars', () => {
    expect(make({ telephone: '0'.repeat(33) }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// preferredSlot
// ---------------------------------------------------------------------------

describe('callbackSchema — preferredSlot', () => {
  it('accepts null', () => {
    expect(make({ preferredSlot: null }).success).toBe(true)
  })

  it('accepts undefined (treated as nullish)', () => {
    expect(make({ preferredSlot: undefined }).success).toBe(true)
  })

  it('accepts empty string', () => {
    // max(80), empty string has length 0 → passes
    expect(make({ preferredSlot: '' }).success).toBe(true)
  })

  it('accepts slot exactly 80 chars', () => {
    expect(make({ preferredSlot: 'a'.repeat(80) }).success).toBe(true)
  })

  it('rejects slot of 81 chars', () => {
    expect(make({ preferredSlot: 'a'.repeat(81) }).success).toBe(false)
  })

  it('accepts unicode in preferredSlot within 80-char limit', () => {
    expect(make({ preferredSlot: 'Lundi 14h–16h 🗓️' }).success).toBe(true)
  })

  it('absent preferredSlot is fine (optional)', () => {
    const r = callbackSchema.safeParse({
      ...BASE_VALID,
      preferredSlot: undefined,
    } as CallbackInput)
    expect(r.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// remarquesClient
// ---------------------------------------------------------------------------

describe('callbackSchema — remarquesClient', () => {
  it('accepts null', () => {
    expect(make({ remarquesClient: null }).success).toBe(true)
  })

  it('accepts undefined', () => {
    expect(make({ remarquesClient: undefined }).success).toBe(true)
  })

  it('accepts exactly 500 chars', () => {
    expect(make({ remarquesClient: 'x'.repeat(500) }).success).toBe(true)
  })

  it('rejects 501 chars', () => {
    expect(make({ remarquesClient: 'x'.repeat(501) }).success).toBe(false)
  })

  it('accepts script tags (escaping handled at render, not schema level)', () => {
    expect(make({ remarquesClient: '<script>alert(1)</script>' }).success).toBe(true)
  })

  it('accepts newlines in remarquesClient', () => {
    expect(make({ remarquesClient: 'ligne 1\nligne 2\nligne 3' }).success).toBe(true)
  })

  it('accepts HTML entities as plain text', () => {
    expect(make({ remarquesClient: '&lt;b&gt;bold&lt;/b&gt;' }).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// consentRgpd
// ---------------------------------------------------------------------------

describe('callbackSchema — consentRgpd', () => {
  it('accepts true', () => {
    expect(make({ consentRgpd: true }).success).toBe(true)
  })

  it('rejects false', () => {
    expect(make({ consentRgpd: false as unknown as true }).success).toBe(false)
  })

  it('rejects string "true"', () => {
    expect(make({ consentRgpd: 'true' as unknown as true }).success).toBe(false)
  })

  it('rejects number 1', () => {
    expect(make({ consentRgpd: 1 as unknown as true }).success).toBe(false)
  })

  it('rejects missing consentRgpd', () => {
    const result = callbackSchema.safeParse({
      ...BASE_VALID,
      consentRgpd: undefined,
    } as unknown as CallbackInput)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// consentDemarchage
// ---------------------------------------------------------------------------

describe('callbackSchema — consentDemarchage', () => {
  it('defaults to false when absent', () => {
    const r = callbackSchema.safeParse({
      ...BASE_VALID,
      consentDemarchage: undefined,
    } as CallbackInput)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.consentDemarchage).toBe(false)
  })

  it('accepts true', () => {
    const r = make({ consentDemarchage: true })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.consentDemarchage).toBe(true)
  })

  it('accepts false explicitly', () => {
    const r = make({ consentDemarchage: false })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.consentDemarchage).toBe(false)
  })

  it('rejects string "false"', () => {
    expect(make({ consentDemarchage: 'false' as unknown as boolean }).success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Combined / structural
// ---------------------------------------------------------------------------

describe('callbackSchema — combined payloads', () => {
  it('accepts complete minimal valid payload', () => {
    const r = callbackSchema.safeParse(BASE_VALID)
    expect(r.success).toBe(true)
  })

  it('accepts full valid payload with all optional fields populated', () => {
    const r = callbackSchema.safeParse({
      publicId: 'EST-2026-04-14-abc123',
      callbackToken: '1744665600.' + 'a'.repeat(64),
      telephone: '06 12 34 56 78',
      preferredSlot: 'Mardi 10h–12h',
      remarquesClient: 'Disponible le matin uniquement.',
      consentRgpd: true,
      consentDemarchage: true,
    })
    expect(r.success).toBe(true)
  })

  it('strips spaces from telephone in combined payload', () => {
    const r = callbackSchema.safeParse({
      ...BASE_VALID,
      telephone: '06 12 34 56 78',
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.telephone).toBe('0612345678')
  })

  it('extra unknown fields are passed through (Zod default strips)', () => {
    const r = callbackSchema.safeParse({
      ...BASE_VALID,
      unknownField: 'ignored',
      anotherExtra: 123,
    })
    // Zod strips extra fields by default (not strict mode)
    expect(r.success).toBe(true)
    if (r.success) {
      expect((r.data as Record<string, unknown>).unknownField).toBeUndefined()
    }
  })

  it('rejects payload missing multiple required fields', () => {
    const r = callbackSchema.safeParse({
      telephone: '0612345678',
    })
    expect(r.success).toBe(false)
  })

  it('rejects entirely empty payload', () => {
    expect(callbackSchema.safeParse({}).success).toBe(false)
  })

  it('rejects null payload', () => {
    expect(callbackSchema.safeParse(null).success).toBe(false)
  })

  it('rejects array payload', () => {
    expect(callbackSchema.safeParse([]).success).toBe(false)
  })
})
