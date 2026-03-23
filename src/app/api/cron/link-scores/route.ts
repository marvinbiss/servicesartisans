import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { precomputeScores } from '@/lib/seo/page-scoring'

/**
 * Daily cron: Precompute page scores for the internal linking system.
 * Computes scores for all service×city combos and stores results in /tmp
 * as a JSON file for fast reads by the linking engine.
 *
 * Auth: Bearer CRON_SECRET (same pattern as other crons).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    const scores = await precomputeScores()

    // Persist to /tmp for fast reads (serverless-friendly, survives within same instance)
    const { writeFile } = await import('node:fs/promises')
    const payload: Record<string, number> = {}
    scores.forEach((score, key) => {
      payload[key] = score
    })
    await writeFile('/tmp/page-scores.json', JSON.stringify(payload), 'utf-8')

    const durationMs = Date.now() - start

    logger.info('[link-scores] Cron completed', {
      action: 'link-scores-cron',
      artisanId: `${scores.size} scores computed in ${durationMs}ms`,
    })

    return NextResponse.json({
      ok: true,
      scoresComputed: scores.size,
      durationMs,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('[link-scores] Cron failed', err, { action: 'link-scores-cron' })

    return NextResponse.json(
      { error: 'Score computation failed', message },
      { status: 500 },
    )
  }
}
