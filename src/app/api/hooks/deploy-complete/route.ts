import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createHmac } from 'crypto'

/**
 * Vercel deploy webhook → triggers GitHub Actions cache warmup.
 *
 * Setup:
 *   1. Vercel Dashboard → Team Settings → Webhooks
 *   2. Event: deployment.succeeded
 *   3. Endpoint: https://servicesartisans.fr/api/hooks/deploy-complete
 *   4. Copy the signing secret → add as WEBHOOK_SECRET env var in Vercel
 *   5. Add GITHUB_DISPATCH_TOKEN env var in Vercel (GitHub PAT)
 */

export const dynamic = 'force-dynamic'

const GITHUB_TOKEN = process.env.GITHUB_DISPATCH_TOKEN
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
const REPO = 'marvinbiss/servicesartisans'

async function verifySignature(request: Request, body: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    // This should never be reached — POST handler checks first
    return false
  }

  const signature = request.headers.get('x-vercel-signature')
  if (!signature) return false

  const hash = createHmac('sha1', WEBHOOK_SECRET).update(body).digest('hex')
  return hash === signature
}

export async function POST(request: Request) {
  if (!process.env.WEBHOOK_SECRET) {
    logger.error('[deploy-hook] WEBHOOK_SECRET not configured — rejecting request')
    return NextResponse.json({ error: 'Secret webhook non configuré' }, { status: 500 })
  }

  const rawBody = await request.text()

  // Verify Vercel webhook signature
  const isValid = await verifySignature(request, rawBody)
  if (!isValid) {
    logger.warn('[deploy-hook] Invalid webhook signature')
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  // Only trigger on production deploys
  try {
    const payload = JSON.parse(rawBody)
    const target =
      payload?.payload?.deployment?.meta?.target || payload?.payload?.target || 'production'
    if (target !== 'production') {
      return NextResponse.json({ skipped: true, reason: `target=${target}` })
    }
  } catch {
    // If we can't parse, still proceed
  }

  if (!GITHUB_TOKEN) {
    logger.error('[deploy-hook] GITHUB_DISPATCH_TOKEN not configured')
    return NextResponse.json({ error: 'GITHUB_DISPATCH_TOKEN non configuré' }, { status: 500 })
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
      return NextResponse.json({ success: true, message: 'Préchauffage déclenché' })
    }

    const body = await res.text()
    logger.error('[deploy-hook] GitHub API error', { status: res.status, body })
    return NextResponse.json({ error: `GitHub API: ${res.status}` }, { status: 502 })
  } catch (err) {
    logger.error('[deploy-hook] Failed to trigger warmup', err)
    return NextResponse.json({ error: 'Échec du déclenchement' }, { status: 500 })
  }
}
