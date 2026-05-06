import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { SITE_URL } from '@/lib/seo/config'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'
import {
  captureFingerprints,
  classifyDrift,
  computeChanges,
  fetchHtmlForFingerprint,
  loadPreviousFingerprints,
  persistFingerprints,
} from '@/lib/seo/canonical-fingerprint'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// SLA-99.9 : wall-clock guard 50s + lease 15min anti-double-run.
const MAX_RUNTIME_MS = 50_000
const LEASE_NAME = 'cron_canonical_fingerprint'
const LEASE_TTL_SECONDS = 15 * 60

/**
 * Top 12 URLs templates. 1 par template SEO-critique. Inclut homepage,
 * top-trafic services, RGE flagship, blog top, devis, simulateur.
 */
const CRITICAL_PATHS = [
  '/',
  '/services',
  '/services/plombier/paris',
  '/services/electricien/lyon',
  '/services/pompe-a-chaleur/marseille',
  '/rge/pompe-a-chaleur/paris',
  '/tarifs/plombier/paris',
  '/avis/plombier/paris',
  '/villes/paris',
  '/blog',
  '/devis',
  '/simulateur-aides-renovation',
]

/**
 * Daily cron — Bouclier 2 plan v2.
 * Snapshote canonical/title/meta/h1/noindex de N URLs critiques, compare au
 * dernier snapshot connu, alerte Sentry sur drift critical (canonical
 * changed OR noindex flipped).
 *
 * Hardening SLA-99.9 (2026-05-06) :
 *   - Lease anti-double-run via RPC (mig 411) avec abort 5s
 *   - Wall-clock 50s : on stoppe la capture HTTP avant kill Vercel
 *   - Per-URL try/catch déjà géré par captureFingerprints (best-effort)
 *   - Release du lease en finally
 */
export const GET = withCronCheckIn('cron-canonical-fingerprint', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()

  // SLA-99.9 : lease avec abort 5s.
  const leaseController = new AbortController()
  const leaseTimer = setTimeout(() => leaseController.abort(), 5_000)
  let acquired: boolean | null = null
  let leaseErr: { message: string } | null = null
  try {
    const result = await supabase
      .rpc('acquire_cron_lease', {
        p_name: LEASE_NAME,
        p_ttl_seconds: LEASE_TTL_SECONDS,
      })
      .abortSignal(leaseController.signal)
    acquired = result.data as boolean | null
    leaseErr = result.error
  } catch (err) {
    leaseErr = { message: err instanceof Error ? err.message : String(err) }
  } finally {
    clearTimeout(leaseTimer)
  }

  if (leaseErr) {
    logger.error('[canonical-fingerprint] lease error', undefined, {
      lease: LEASE_NAME,
      error: leaseErr.message,
    })
    return NextResponse.json({ error: 'lease_error' }, { status: 500 })
  }
  if (acquired !== true) {
    logger.info('[canonical-fingerprint] skipped (lease already held)', { lease: LEASE_NAME })
    return NextResponse.json({ ok: true, skipped: true, reason: 'already_running' })
  }

  try {
    return await Sentry.withMonitor(
      'cron-canonical-fingerprint',
      async () => {
        const urls = CRITICAL_PATHS.map((p) => `${SITE_URL}${p}`)

        // SLA-99.9 : si on a déjà mangé le budget en lease + setup, skip capture.
        if (Date.now() - startedAt > MAX_RUNTIME_MS) {
          return NextResponse.json({ ok: true, skipped: true, reason: 'wall_clock_pre_capture' })
        }

        const previous = await loadPreviousFingerprints(supabase, urls)
        const current = await captureFingerprints(urls, fetchHtmlForFingerprint)

        let critical = 0
        let warn = 0
        const enriched = current.map((cur) => {
          const prev = previous.get(cur.url) ?? null
          const driftSeverity = classifyDrift(prev, {
            canonical: cur.canonical,
            title: cur.title,
            metaDescription: cur.metaDescription,
            h1: cur.h1,
            noindex: cur.noindex,
          })
          const changes = computeChanges(prev, {
            canonical: cur.canonical,
            title: cur.title,
            metaDescription: cur.metaDescription,
            h1: cur.h1,
            noindex: cur.noindex,
          })
          const logBody = {
            kind: 'canonical_fingerprint',
            url: cur.url,
            severity: driftSeverity,
            fingerprint: cur.fingerprint,
            status_code: cur.statusCode,
            changes,
          }
          if (driftSeverity === 'critical') {
            critical += 1
            logger.error(`[canonical-fingerprint] CRITICAL drift on ${cur.url}`, undefined, logBody)
            Sentry.captureMessage(`Canonical drift critical: ${cur.url}`, {
              level: 'error',
              extra: logBody,
            })
          } else if (driftSeverity === 'warn') {
            warn += 1
            logger.warn(`[canonical-fingerprint] WARN drift on ${cur.url}`, logBody)
          } else if (driftSeverity === 'new') {
            logger.info(`[canonical-fingerprint] new fingerprint for ${cur.url}`, logBody)
          }
          return { ...cur, driftSeverity }
        })

        const persistResult = await persistFingerprints(supabase, enriched)
        if (!persistResult.ok) {
          logger.warn('[canonical-fingerprint] persist failed (non-blocking)', {
            kind: 'canonical_fp_persist_error',
          })
        }

        await pingHeartbeat('canonical-fingerprint')
        return NextResponse.json({
          ok: true,
          upserted: persistResult.upserted,
          captured: current.length,
          critical,
          warn,
          duration_ms: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        })
      },
      {
        schedule: { type: 'crontab', value: '0 7 * * *' },
      }
    )
  } finally {
    // SLA-99.9 : release best-effort. Lease expire au TTL si crash.
    try {
      await supabase.rpc('release_cron_lease', { p_name: LEASE_NAME })
    } catch {
      // swallowed : TTL acts as safety net
    }
  }
})
