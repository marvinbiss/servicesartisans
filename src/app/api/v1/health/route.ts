/**
 * GET /api/v1/health — Public shallow health endpoint
 *
 * Sub-1ms latency, no external dependency checks. Designed so that this
 * endpoint stays green as long as the Vercel function itself is reachable,
 * keeping the "function reachable" signal distinct from "dependencies
 * green" (which lives at `/api/v1/health/deep`).
 *
 * Use cases :
 *  - Uptime monitors (UptimeRobot, StatusCake, Pingdom) at 30s polling
 *  - Load balancer probes (k8s-style liveness)
 *  - Status page consumers that show a green/red dot
 *
 * Distinct from `/api/cron/healthcheck` (admin-only, auths via CRON_SECRET,
 * fans out to internal Sentry/BetterStack heartbeats).
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUILD_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'
const BUILD_REF = process.env.VERCEL_GIT_COMMIT_REF ?? 'local'
const APP_VERSION = '1.0.0'

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(
      {
        status: 'ok',
        version: APP_VERSION,
        build: { sha: BUILD_SHA.slice(0, 7), ref: BUILD_REF },
        timestamp: new Date().toISOString(),
        docs: 'https://servicesartisans.fr/developpeurs',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-License': 'CC-BY-4.0',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    logger.error('[api/v1/health] GET failed', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function HEAD(): Promise<NextResponse> {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    logger.error('[api/v1/health] HEAD failed', error)
    return new NextResponse(null, { status: 500 })
  }
}
