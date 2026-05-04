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
 */
export const GET = withCronCheckIn('cron-canonical-fingerprint', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (!verifyCronSecret(authHeader)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  return await Sentry.withMonitor(
    'cron-canonical-fingerprint',
    async () => {
      const urls = CRITICAL_PATHS.map((p) => `${SITE_URL}${p}`)
      const supabase = createAdminClient()

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
        timestamp: new Date().toISOString(),
      })
    },
    {
      schedule: { type: 'crontab', value: '0 7 * * *' },
    }
  )
})
