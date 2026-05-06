import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getProvidersByServiceAndLocation,
  getProviderCountByServiceAndLocation,
  getProviderCountByService,
} from '@/lib/supabase'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { withTimeout } from '@/lib/api/timeout'

const schema = z.object({
  service: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  rge: z.enum(['0', '1']).optional(),
})

export const dynamic = 'force-dynamic' // hot path lit request.headers (rate-limit IP)

export async function GET(request: NextRequest) {
  try {
    // SLA-99.9 : RL hot path 120/min/IP fail-open. Beaucoup de bots crawlers
    // légitimes (Google/Ahrefs) déjà whitelist via UA dans middleware ; ici
    // on protège contre les scrapers résiduels sans casser PageClient load-more.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`providers-listing:${ip}`, {
      window: 60_000,
      max: 120,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const parsed = schema.safeParse({
      service: searchParams.get('service'),
      location: searchParams.get('location') || undefined,
      offset: searchParams.get('offset') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      rge: searchParams.get('rge') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides' } },
        { status: 400 }
      )
    }

    const { service, location, offset, limit, rge } = parsed.data
    // 2026-05-05 pivot full RGE — endpoint public consommé par PageClient (load
    // more). Default RGE-only ; admin/debug peut bypass via `?rge=0`. Avant le
    // pivot, l'absence de `?rge` signifiait "tous providers" — désormais aligné
    // sur le default des helpers Supabase (RGE first).
    const rgeOnly = rge === '0' ? false : true

    // SLA-99.9 : timeout 5s sur Promise.all amont ; au-delà, on renvoie un
    // payload vide cacheable plutôt qu'un 5xx visible côté SEO (soft-404 risk).
    const [providers, totalCount] = await withTimeout(
      Promise.all([
        location
          ? getProvidersByServiceAndLocation(service, location, { limit, offset, rgeOnly })
          : getProvidersByServiceAndLocation(service, 'france', { limit, offset, rgeOnly }).catch(
              () => []
            ),
        location
          ? getProviderCountByServiceAndLocation(service, location, { rgeOnly }).catch(() => 0)
          : getProviderCountByService(service, { rgeOnly }).catch(() => 0),
      ]),
      5_000,
      'providers_listing'
    )

    return NextResponse.json(
      { providers: providers || [], totalCount },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    // SLA-99.9 : fallback 200 vide cacheable au lieu de 5xx — PageClient
    // affichera un état vide plutôt que de casser la page complète.
    logger.error('providers/listing: error', err)
    captureError(err, { tags: { route: 'api/providers/listing', critical: 'true' } })
    return NextResponse.json(
      { providers: [], totalCount: 0 },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      }
    )
  }
}
