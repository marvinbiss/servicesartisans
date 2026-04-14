/**
 * CEE PR2 — Security hardening integration tests (Iteration 2)
 *
 * Goals
 * -----
 * Cover the remaining edge-cases from THREAT_MODEL_PR2.md §5 that are not
 * already asserted by the route-specific files. These tests are oriented
 * around input shape (SQL injection vectors rejected by zod, XSS escape,
 * malformed bodies), IBAN/BIC robustness, and quiz scoring invariants.
 *
 * Mapped THREAT_MODEL rows
 * ------------------------
 * - MUST-3  (bind params + zod guards on all inputs)
 * - MUST-6  (TRANSITIONS map miroir — fuzzed)
 * - MUST-7  (quiz scored server-side — fuzzed)
 * - MUST-11 (IBAN never in logs)
 * - OWASP A03 (injection) and A04 (insecure design — quiz tamper)
 */

import { describe, it, expect } from 'vitest'
import { validateIban } from '@/lib/cee/iban-crypto'
import { scoreQuiz, QUIZ_QUESTIONS } from '@/lib/cee/quiz-questions'
import { PARTNER_TRANSITIONS, canTransition } from '@/lib/cee/leads-service'

describe('CEE — input validation hardening (SQL injection surface)', () => {
  it('validateIban rejects SQL-injection style payloads', () => {
    const payloads = [
      "FR14' OR 1=1 --",
      'FR14; DROP TABLE cee_artisan_partners;',
      "FR14' UNION SELECT iban_encrypted FROM cee_artisan_partners --",
      '<script>alert(1)</script>',
      '${process.env.CEE_IBAN_KEY}',
      '\u0000FR14',
      '\x00\x01\x02',
    ]
    for (const p of payloads) {
      expect(validateIban(p).valid).toBe(false)
    }
  })

  it('validateIban rejects non-FR codes (only FR allowed)', () => {
    // Valid shape but different country — must be rejected per CEE rule
    expect(validateIban('DE89370400440532013000').valid).toBe(false)
    expect(validateIban('GB82WEST12345698765432').valid).toBe(false)
    expect(validateIban('IT60X0542811101000000123456').valid).toBe(false)
  })

  it('validateIban rejects long/garbage inputs safely (no crash)', () => {
    const big = 'F' + 'R'.repeat(10_000)
    expect(() => validateIban(big)).not.toThrow()
    expect(validateIban(big).valid).toBe(false)
  })

  it('validateIban rejects empty/whitespace', () => {
    expect(validateIban('').valid).toBe(false)
    expect(validateIban('    ').valid).toBe(false)
  })
})

describe('CEE — status transitions (fuzzed)', () => {
  it('rejects every illegal transition in a Cartesian product', () => {
    const all = Object.keys(PARTNER_TRANSITIONS) as Array<keyof typeof PARTNER_TRANSITIONS>
    for (const from of all) {
      for (const to of all) {
        const allowed = (PARTNER_TRANSITIONS[from] as readonly string[]).includes(to)
        expect(canTransition(from, to)).toBe(allowed)
      }
    }
  })

  it('no direct transition invited → active (must go through onboarding/quiz)', () => {
    expect(canTransition('invited', 'active')).toBe(false)
  })

  it('no direct transition pending-like shortcut to active', () => {
    expect(canTransition('invited', 'active')).toBe(false)
    expect(canTransition('onboarding', 'active')).toBe(false)
  })

  it('revoked is terminal (no outgoing transitions)', () => {
    expect(PARTNER_TRANSITIONS.revoked).toEqual([])
  })
})

describe('CEE — quiz scoring invariants (server-side, MUST-7)', () => {
  it('score is bounded in [0, QUIZ_QUESTIONS.length]', () => {
    const answers: Record<string, number> = {}
    for (const q of QUIZ_QUESTIONS) {
      answers[q.id] = 0
    }
    const { score } = scoreQuiz(answers)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(QUIZ_QUESTIONS.length)
  })

  it('ignores extraneous keys injected by malicious client', () => {
    const answers: Record<string, number> = {
      ...(Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.id, q.correct])) as Record<
        string,
        number
      >),
      __proto__: 999,
      score: 999,
      certified: 1,
      constructor: 42,
    }
    const { score } = scoreQuiz(answers)
    expect(score).toBe(QUIZ_QUESTIONS.length)
  })

  it('coerces out-of-bound indices to wrong (no overflow)', () => {
    const answers: Record<string, number> = {}
    for (const q of QUIZ_QUESTIONS) {
      answers[q.id] = 9999
    }
    const { score } = scoreQuiz(answers)
    expect(score).toBe(0)
  })

  it('missing answers count as wrong (no NaN / no throw)', () => {
    const { score } = scoreQuiz({})
    expect(score).toBe(0)
  })
})

describe('CEE — XSS / logging safety (unit)', () => {
  it('IBAN with tags is rejected before storage (no XSS to DB)', () => {
    const r = validateIban('<img src=x onerror=alert(1)>')
    expect(r.valid).toBe(false)
    expect(r.normalized ?? undefined).toBeUndefined()
  })

  it('valid IBAN returns only last4 (full IBAN never surfaced)', () => {
    const r = validateIban('FR1420041010050500013M02606')
    expect(r.valid).toBe(true)
    expect(r.last4).toBeTruthy()
    expect(r.last4).toHaveLength(4)
    // The normalized IBAN exists for the RPC, but last4 is what leaks out.
    // Caller must log last4 only (asserted by partners-iban.test.ts MUST-11).
  })
})
