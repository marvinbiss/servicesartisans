/**
 * Cron : IndexNow batch auto — push quotidien des pages récemment modifiées.
 *
 * Complément du cron `indexnow-submit` (rotation statique pSEO 2500/jour) :
 * ce cron cible spécifiquement les **nouvelles pages** ajoutées au filesystem
 * et les **providers DB** dont `updated_at` < 2 jours. Cap volontairement bas
 * (1000 URLs/jour) pour rester gentil avec le quota IndexNow et éviter le
 * recouvrement avec l'autre cron.
 *
 * Logique (mirroir conceptuel de `scripts/indexnow-batch-auto.ts`) :
 *   1. Liste les routes statiques reno récentes via une whitelist explicite
 *      (le filesystem scan du script n'est pas dispo en serverless — fs.readdirSync
 *      sur le bundle n'expose pas les routes Next.js).
 *   2. Query providers updated_at >= now - 2j (cron quotidien donc 48h ≈ 2x
 *      grace pour rattraper si run skip).
 *   3. Filtre via `evaluateGonePath` + dedup + cap 1000.
 *   4. Submit via `submitToIndexNow` (handle batching + timeout + log).
 *
 * Schedule : `0 8 * * *` (8h UTC = 9h Paris hiver / 10h été — après le cron
 * `indexnow-submit` de 6h15 pour ne pas se chevaucher sur le quota Bing).
 */
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { SITE_URL } from '@/lib/seo/config'
import { evaluateGonePath } from '@/lib/seo/gone-paths'
import { pingHeartbeat } from '@/lib/monitoring/heartbeat'
import { submitToIndexNow } from '@/lib/seo/indexnow'
import { logger } from '@/lib/logger'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

/** Cap quotidien volontairement bas pour rester sous le radar Bing. */
const MAX_URLS_PER_DAY = 1000
/** Fenêtre updated_at pour les providers — 2 jours = grace si cron skip 1 fois. */
const LOOKBACK_DAYS = 2

export const maxDuration = 60

/**
 * Whitelist explicite des hubs reno récents (Sprint 1 VMC + Sprint 3 ballon
 * thermo + Sprint 5 baromètre + pillars Sprint 20/80). Ces pages ne sont PAS
 * dans la rotation `indexnow-submit/route.ts` (qui couvre /services/devis/tarifs
 * pSEO uniquement).
 *
 * Ne PAS dépasser ~50 URLs ici — le reste du quota va aux providers DB frais.
 */
const RECENT_RENO_ROUTES: readonly string[] = [
  // Sprint 5 — baromètre Indice Rénovation
  '/barometre/renovation-energetique-2026',
  '/api/v1/barometre/renovation/embed.html',
  // Sprint 3 — Ballon thermodynamique
  '/renovation-energetique/travaux/ballon-thermodynamique',
  '/renovation-energetique/travaux/ballon-thermodynamique/prix',
  '/renovation-energetique/travaux/ballon-thermodynamique/installation',
  // Sprint 1 — VMC cluster
  '/renovation-energetique/travaux/vmc',
  '/renovation-energetique/travaux/vmc/installation',
  '/renovation-energetique/travaux/vmc/double-flux-thermodynamique',
  '/renovation-energetique/travaux/vmc/hygroreglable',
  '/renovation-energetique/travaux/vmc/hygroreglable/type-b',
  '/renovation-energetique/travaux/vmc/simple-flux',
  '/renovation-energetique/travaux/vmc/branchement-pose',
  '/renovation-energetique/travaux/vmc/salle-de-bain',
  '/renovation-energetique/travaux/vmc/entretien',
  // PAC sous-cluster (rappel quotidien — pages denses, ROI immédiat)
  '/renovation-energetique/travaux/pompe-a-chaleur',
  '/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix',
  '/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix',
  '/renovation-energetique/travaux/pompe-a-chaleur/installation',
  '/renovation-energetique/travaux/pompe-a-chaleur/entretien',
  // Hubs reno
  '/renovation-energetique',
  '/renovation-energetique/aides',
  '/renovation-energetique/diagnostic',
  '/renovation-energetique/passoires-thermiques',
  '/renovation-energetique/travaux',
  // Conversion / commercial
  '/simulateur-aides-renovation',
  '/devenir-partenaire-cee',
  '/comparatif-primes-cee-2026',
  '/leads-exclusifs-vs-partages',
] as const

/**
 * Filter routes through `evaluateGonePath` (skip 410s) + dedup + absolutize.
 */
function filterAndAbsolutize(routes: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const route of routes) {
    if (!route.startsWith('/')) continue
    // Skip routes that would 410 via middleware — never burn IndexNow credit on dead URLs.
    const decision = evaluateGonePath(route)
    if (decision.gone) continue
    const abs = `${SITE_URL}${route}`
    if (seen.has(abs)) continue
    seen.add(abs)
    out.push(abs)
  }
  return out
}

/**
 * Query providers updated in last LOOKBACK_DAYS days, return canonical URLs.
 * Graceful degrade if Supabase unavailable.
 */
async function getRecentProviderUrls(limit: number): Promise<string[]> {
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const { getArtisanUrl } = await import('@/lib/utils')
    const supabase = createAdminClient()
    const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('providers')
      .select('stable_id, slug, specialty, address_city')
      .eq('is_active', true)
      .eq('noindex', false)
      .gte('updated_at', cutoff)
      .not('specialty', 'is', null)
      .not('address_city', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.warn('indexnow-batch: failed to fetch fresh providers', { error: error.message })
      return []
    }
    if (!data) return []

    const urls = new Set<string>()
    for (const p of data) {
      const u = getArtisanUrl({
        slug: p.slug as string | null,
        stable_id: p.stable_id as string | null,
        specialty: p.specialty as string | null,
        city: p.address_city as string | null,
      })
      if (u && !u.endsWith('/')) urls.add(`${SITE_URL}${u}`)
    }
    return Array.from(urls)
  } catch (err) {
    logger.warn('indexnow-batch: Supabase unavailable', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return []
  }
}

export const GET = withCronCheckIn('cron-indexnow-batch', async (request: Request) => {
  return await Sentry.withMonitor(
    'cron-indexnow-batch',
    async () => {
      if (!process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
      }
      const authHeader = request.headers.get('authorization')
      if (!verifyCronSecret(authHeader)) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }

      // ── 1. Static reno whitelist ──────────────────────────────────────
      const renoUrls = filterAndAbsolutize(RECENT_RENO_ROUTES)

      // ── 2. Fresh providers from DB ────────────────────────────────────
      // Reserve LIMIT-renoUrls for provider routes.
      const providerSlots = Math.max(0, MAX_URLS_PER_DAY - renoUrls.length)
      const providerUrls = providerSlots > 0 ? await getRecentProviderUrls(providerSlots) : []

      // ── 3. Merge + dedup + cap ────────────────────────────────────────
      const merged = [...renoUrls, ...providerUrls]
      const uniqueUrls = Array.from(new Set(merged)).slice(0, MAX_URLS_PER_DAY)

      logger.info('indexnow-batch: submitting URLs', {
        action: 'indexnow-batch-cron',
        renoCount: renoUrls.length,
        providerCount: providerUrls.length,
        totalUnique: uniqueUrls.length,
        cap: MAX_URLS_PER_DAY,
        lookbackDays: LOOKBACK_DAYS,
      })

      if (uniqueUrls.length === 0) {
        await pingHeartbeat('indexnow-batch')
        return NextResponse.json({
          submitted: 0,
          success: true,
          note: 'no URLs candidate',
          breakdown: { reno: 0, providers: 0 },
        })
      }

      const result = await submitToIndexNow(uniqueUrls)

      await pingHeartbeat('indexnow-batch')
      return NextResponse.json({
        ...result,
        urlCount: uniqueUrls.length,
        breakdown: { reno: renoUrls.length, providers: providerUrls.length },
        lookbackDays: LOOKBACK_DAYS,
      })
    },
    {
      schedule: { type: 'crontab', value: '0 8 * * *' },
    }
  )
})
