import 'server-only'

/**
 * Lit le body HTTP en imposant 3 caps STRICTS, peu importe les headers
 * envoyés par l'attaquant (`Content-Length`, `Transfer-Encoding: chunked`) :
 *   1. Byte-cap absolu — coupe au premier octet en trop.
 *   2. Timeout total — ferme le slow-loris (1 byte / 30s pendant heures).
 *   3. Allocation pré-bornée — un seul Uint8Array de taille `maxBytes`,
 *      jamais de tableau de chunks à concaténer (mémoire bornée).
 *
 * Pourquoi : `request.json()` ne respecte pas de cap par défaut sur Node
 * runtime Vercel. Sans timeout ni cap, un attaquant non authentifié peut :
 *   - chunked + body massif → OOM lambda
 *   - chunked + 1 byte / 30s → bloque la lambda jusqu'au timeout Vercel
 *     (~30-90s × 100 connexions = saturation pool)
 *
 * Retourne soit le body parsé en JSON, soit un sentinel pour 4xx.
 */
export type ReadBodyResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; reason: 'too-large' | 'invalid-json' | 'timeout' }

const DEFAULT_TIMEOUT_MS = 10_000

const TIMEOUT_SENTINEL: unique symbol = Symbol('readBodyTimeout')
type TimeoutSentinel = typeof TIMEOUT_SENTINEL

export async function readJsonBodyWithCap<T = unknown>(
  request: Request,
  maxBytes: number,
  options: { timeoutMs?: number } = {}
): Promise<ReadBodyResult<T>> {
  const reader = request.body?.getReader()
  if (!reader) {
    return { ok: false, reason: 'invalid-json' }
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const buffer = new Uint8Array(maxBytes)
  let received = 0

  const deadline = Date.now() + timeoutMs

  const cancelReader = async () => {
    try {
      await reader.cancel()
    } catch {
      // ignore
    }
  }

  try {
    while (true) {
      const remainingMs = deadline - Date.now()
      if (remainingMs <= 0) {
        await cancelReader()
        return { ok: false, reason: 'timeout' }
      }

      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeoutPromise = new Promise<TimeoutSentinel>((resolve) => {
        timeoutId = setTimeout(() => resolve(TIMEOUT_SENTINEL), remainingMs)
        // Don't keep the lambda alive just for this timer (Node-only).
        // Edge runtime ignores `unref`, but these routes run in Node.
        timeoutId?.unref?.()
      })

      let raceResult: { done: boolean; value?: Uint8Array } | TimeoutSentinel
      try {
        raceResult = await Promise.race([reader.read(), timeoutPromise])
      } finally {
        // Critical: clear the timer the moment we leave the race so we don't
        // leak hundreds of pending setTimeouts when the body has many chunks.
        // Vercel lambdas wait for the event loop to drain before finalising
        // the response — pending timers add direct latency to every request.
        if (timeoutId !== undefined) clearTimeout(timeoutId)
      }

      if (raceResult === TIMEOUT_SENTINEL) {
        await cancelReader()
        return { ok: false, reason: 'timeout' }
      }

      if (raceResult.done) break
      const value = raceResult.value
      if (!value) continue

      const next = received + value.byteLength
      if (next > maxBytes) {
        await cancelReader()
        return { ok: false, reason: 'too-large' }
      }
      buffer.set(value, received)
      received = next
    }
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }

  if (received === 0) {
    return { ok: false, reason: 'invalid-json' }
  }

  try {
    const text = new TextDecoder('utf-8').decode(buffer.subarray(0, received))
    return { ok: true, data: JSON.parse(text) as T }
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
}
