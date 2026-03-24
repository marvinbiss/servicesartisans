import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * Vercel deploy webhook → triggers GitHub Actions cache warmup.
 *
 * Setup in Vercel Dashboard:
 *   Settings → Git → Deploy Hooks is for triggering deploys (not what we want).
 *   Instead, use Project Settings → Webhooks → add:
 *     URL: https://servicesartisans.fr/api/hooks/deploy-complete
 *     Events: deployment.succeeded
 *
 * Or simpler: add to package.json scripts:
 *   "postbuild": "node scripts/vercel-deploy-hook.mjs"
 *   (won't work — runs at build time, not after deploy)
 *
 * Simplest: Vercel Integration → use the webhook approach below.
 */

export const dynamic = 'force-dynamic'

const GITHUB_TOKEN = process.env.GITHUB_DISPATCH_TOKEN
const REPO = 'marvinbiss/servicesartisans'

export async function POST(request: Request) {
  // Verify this is from Vercel (check shared secret)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GITHUB_TOKEN) {
    logger.error('[deploy-hook] GITHUB_DISPATCH_TOKEN not configured')
    return NextResponse.json(
      { error: 'GITHUB_DISPATCH_TOKEN not configured' },
      { status: 500 }
    )
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'vercel-deploy',
        client_payload: {
          timestamp: new Date().toISOString(),
        },
      }),
    })

    if (res.status === 204) {
      logger.info('[deploy-hook] Cache warmup triggered on GitHub Actions')
      return NextResponse.json({ success: true, message: 'Warmup triggered' })
    }

    const body = await res.text()
    logger.error('[deploy-hook] GitHub API error', { status: res.status, body })
    return NextResponse.json(
      { error: `GitHub API: ${res.status}` },
      { status: 502 }
    )
  } catch (err) {
    logger.error('[deploy-hook] Failed to trigger warmup', err)
    return NextResponse.json({ error: 'Failed to trigger' }, { status: 500 })
  }
}
