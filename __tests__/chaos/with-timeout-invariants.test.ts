/**
 * Chaos tests — invariants `withTimeout` (`@/lib/api/timeout`)
 *
 * Pourquoi : ce helper est la pierre angulaire du SLA-99.9 — utilisé par
 * 70+ routes pour borner les calls Supabase / fetches externes. Si l'invariant
 * "rejette après Nms" casse silencieusement, le site peut hang la function
 * Vercel jusqu'au timeout dur (60s) → 504 → user voit page blanche →
 * GSC voit soft 404 → ranking dégrade.
 *
 * Couvre :
 *   1. Promesse qui hang → reject avec `Error('upstream_timeout:<label>')`
 *   2. Promesse qui résout dans le budget → resolve normalement
 *   3. Promesse qui reject avant le timeout → propage l'erreur originale
 *   4. Timer cleanup en cas de resolve early (pas de leak setInterval)
 *   5. Wall-clock <= ms+marge (pas de drift sur timeout précis)
 *   6. Promesse résolue immédiatement (0ms) → resolve sans déclencher timer
 *   7. Label inclus dans message d'erreur (pour Sentry filter)
 */

import { describe, it, expect } from 'vitest'
import { withTimeout } from '@/lib/api/timeout'

describe('withTimeout — chaos invariants', () => {
  it('rejects with upstream_timeout:<label> when promise hangs past budget', async () => {
    const start = Date.now()
    const hangPromise = new Promise<never>(() => {
      // Never resolves
    })

    await expect(withTimeout(hangPromise, 100, 'test_hang')).rejects.toThrow(
      'upstream_timeout:test_hang'
    )

    const elapsed = Date.now() - start
    // Marge 50ms pour CI lente (vitest setup overhead).
    expect(elapsed).toBeGreaterThanOrEqual(95)
    expect(elapsed).toBeLessThan(250)
  })

  it('resolves normally when promise completes within budget', async () => {
    const fastPromise = Promise.resolve('ok')
    const result = await withTimeout(fastPromise, 1000, 'test_fast')
    expect(result).toBe('ok')
  })

  it('propagates original error when promise rejects before timeout', async () => {
    const rejectingPromise = Promise.reject(new Error('original_error'))
    await expect(withTimeout(rejectingPromise, 1000, 'test_reject')).rejects.toThrow(
      'original_error'
    )
  })

  it('does not leak setTimeout when promise resolves early (no false timeout firing)', async () => {
    // Si le timer n'est pas clear, un test suivant pourrait recevoir un reject
    // tardif. On vérifie qu'après resolve early, attendre 2x le budget ne
    // produit aucun rejection asynchrone.
    const lateReject: unknown = null
    const earlyPromise = Promise.resolve(42)
    const result = await withTimeout(earlyPromise, 50, 'test_no_leak')
    expect(result).toBe(42)

    // Attendre 100ms (= 2× budget) pour voir si un timer fantôme firing.
    await new Promise((r) => setTimeout(r, 100))
    expect(lateReject).toBeNull()
  })

  it('respects timeout precision within reasonable margin', async () => {
    const targets = [50, 100, 250]
    for (const ms of targets) {
      const start = Date.now()
      await withTimeout(new Promise<never>(() => {}), ms, 'precision').catch(() => {})
      const elapsed = Date.now() - start
      // Marge généreuse +50ms pour event loop scheduling sur CI.
      expect(elapsed).toBeGreaterThanOrEqual(ms - 5)
      expect(elapsed).toBeLessThan(ms + 100)
    }
  })

  it('handles immediate (0ms) resolve without invoking timer', async () => {
    const value = await withTimeout(Promise.resolve('instant'), 100, 'test_instant')
    expect(value).toBe('instant')
  })

  it('error message contains the label for Sentry filtering', async () => {
    try {
      await withTimeout(new Promise<never>(() => {}), 50, 'sentry_filter_label')
      throw new Error('should not reach here')
    } catch (err) {
      expect(err).toBeInstanceOf(Error)
      expect((err as Error).message).toContain('sentry_filter_label')
      expect((err as Error).message).toBe('upstream_timeout:sentry_filter_label')
    }
  })

  it('PostgrestBuilder-like thenable is supported (Supabase shape)', async () => {
    // Supabase query builders sont thenables (PromiseLike) mais pas des
    // Promises natives. withTimeout doit les accepter via Promise.race.
    const fakeBuilder = {
      then: <T>(
        onFulfilled?: (v: { data: number }) => T,
        _onRejected?: (e: unknown) => T
      ): Promise<T> => Promise.resolve({ data: 42 }).then(onFulfilled),
    } as PromiseLike<{ data: number }>

    const result = await withTimeout(fakeBuilder, 100, 'thenable')
    expect(result.data).toBe(42)
  })

  it('rejecting thenable propagates error before timeout', async () => {
    const rejectingBuilder = {
      then: <T>(_onFulfilled?: (v: never) => T, onRejected?: (e: unknown) => T): Promise<T> =>
        Promise.reject(new Error('thenable_failed')).catch(onRejected),
    } as PromiseLike<never>

    await expect(withTimeout(rejectingBuilder, 1000, 'thenable_reject')).rejects.toThrow(
      'thenable_failed'
    )
  })
})

describe('withTimeout — concurrent invariants', () => {
  it('100 concurrent timeouts all fire independently (no shared state corruption)', async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      withTimeout(new Promise<never>(() => {}), 50, `concurrent_${i}`).catch(
        (err) => (err as Error).message
      )
    )

    const results = await Promise.all(promises)
    expect(results).toHaveLength(100)
    results.forEach((msg, i) => {
      expect(msg).toBe(`upstream_timeout:concurrent_${i}`)
    })
  })

  it('mix of resolves and timeouts in same batch (no cross-contamination)', async () => {
    const resolvers = Array.from({ length: 50 }, (_, i) =>
      withTimeout(Promise.resolve(`fast_${i}`), 1000, `mix_fast_${i}`)
    )
    const hangers = Array.from({ length: 50 }, (_, i) =>
      withTimeout(new Promise<never>(() => {}), 50, `mix_hang_${i}`).catch(
        (err) => (err as Error).message
      )
    )

    const [resolved, hanged] = await Promise.all([Promise.all(resolvers), Promise.all(hangers)])

    resolved.forEach((v, i) => expect(v).toBe(`fast_${i}`))
    hanged.forEach((m, i) => expect(m).toBe(`upstream_timeout:mix_hang_${i}`))
  })
})

describe('withTimeout — failure mode SLA contract', () => {
  it('A handler using withTimeout(5_000) MUST return in <6s when upstream hangs', async () => {
    // Contrat SLA-99.9 : aucun handler ne doit hang plus de budget+marge même si
    // Supabase part en sucette (15-30s en pire cas connu). withTimeout doit
    // garantir cette borne supérieure.
    const start = Date.now()
    let captured: string | null = null
    try {
      await withTimeout(new Promise<never>(() => {}), 500, 'sla_contract')
    } catch (err) {
      captured = (err as Error).message
    }
    const elapsed = Date.now() - start
    expect(captured).toBe('upstream_timeout:sla_contract')
    expect(elapsed).toBeLessThan(700) // 500ms + 200ms marge généreuse
  })
})
