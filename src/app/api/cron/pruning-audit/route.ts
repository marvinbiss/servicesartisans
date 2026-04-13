import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { services as staticServices, villes } from '@/lib/data/france'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getCommuneBySlug } from '@/lib/data/commune-data'
import { getTradeContent } from '@/lib/data/trade-content'
import {
  THIN_PAGE_PROVIDER_THRESHOLD,
  MIN_DIFFERENTIATION_PERCENT,
  calculateDifferentiation,
  classifyPageType,
  type PruningCandidate,
  type PruningReason,
} from '@/lib/seo/pruning'
import { logger } from '@/lib/logger'

/**
 * Monthly cron: SEO Pruning Audit
 *
 * Identifies pages that are candidates for noindex based on:
 * - Zero providers in the service×city combination
 * - Low provider count (< threshold)
 * - Low content differentiation score
 *
 * This is READ-ONLY — no database writes, no page modifications.
 * Output: a structured JSON report for human review.
 *
 * Recommended schedule: monthly (1st of each month)
 * Vercel cron: "0 3 1 * *" (3 AM UTC on the 1st)
 */

export const maxDuration = 60 // seconds — may need to scan many combinations

export async function GET(request: Request) {
  // Auth: same pattern as all other crons
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    const supabase = createAdminClient()

    // -----------------------------------------------------------------------
    // Step 1: Get provider counts per city (aggregated)
    // Single query: count active providers grouped by address_city
    // -----------------------------------------------------------------------
    const { data: cityCounts, error: cityError } = await supabase
      .from('providers')
      .select('address_city')
      .eq('is_active', true)
      .not('address_city', 'is', null)

    if (cityError) {
      logger.error('[pruning-audit] Failed to fetch provider city counts:', cityError.message)
      return NextResponse.json(
        { error: 'Erreur base de données', details: cityError.message },
        { status: 500 }
      )
    }

    // Build a map: normalized city name -> provider count
    const cityProviderMap = new Map<string, number>()
    for (const row of cityCounts || []) {
      const city = (row.address_city as string)?.toLowerCase().trim()
      if (city) {
        cityProviderMap.set(city, (cityProviderMap.get(city) || 0) + 1)
      }
    }

    // -----------------------------------------------------------------------
    // Step 2: Get provider counts per specialty (for service matching)
    // -----------------------------------------------------------------------
    const { data: specialtyCounts, error: specError } = await supabase
      .from('providers')
      .select('specialty, address_city')
      .eq('is_active', true)
      .not('address_city', 'is', null)
      .not('specialty', 'is', null)

    if (specError) {
      logger.error('[pruning-audit] Failed to fetch specialty counts:', specError.message)
      return NextResponse.json(
        { error: 'Erreur base de données', details: specError.message },
        { status: 500 }
      )
    }

    // Build a map: "specialty:city" -> count
    const specCityMap = new Map<string, number>()
    for (const row of specialtyCounts || []) {
      const spec = (row.specialty as string)?.toLowerCase().trim()
      const city = (row.address_city as string)?.toLowerCase().trim()
      if (spec && city) {
        const key = `${spec}:${city}`
        specCityMap.set(key, (specCityMap.get(key) || 0) + 1)
      }
    }

    // -----------------------------------------------------------------------
    // Step 3: Scan service×city combinations
    // -----------------------------------------------------------------------
    const candidates: PruningCandidate[] = []
    let totalServiceCityPages = 0
    let indexedPages = 0
    let noindexCandidates = 0
    let zeroPagesCount = 0
    let thinPagesCount = 0
    let lowDiffCount = 0

    // Sample: top 500 cities (covers >95% of traffic)
    const citiesToAudit = villes.slice(0, 500)

    for (const service of staticServices) {
      const specialties = SERVICE_TO_SPECIALTIES[service.slug]
      if (!specialties || specialties.length === 0) continue

      for (const ville of citiesToAudit) {
        totalServiceCityPages++

        // Count providers for this service×city combination
        let providerCount = 0
        const cityLower = ville.name.toLowerCase().trim()
        for (const spec of specialties) {
          const key = `${spec}:${cityLower}`
          providerCount += specCityMap.get(key) || 0
        }

        // Check data richness
        const communeData = getCommuneBySlug(ville.slug)
        const tradeContent = getTradeContent(service.slug)
        const hasCommuneData = communeData !== null && communeData !== undefined
        const hasTradeContent = tradeContent !== null && tradeContent !== undefined

        const diffScore = calculateDifferentiation(providerCount, hasCommuneData, hasTradeContent)
        const url = `/services/${service.slug}/${ville.slug}`
        const pageType = classifyPageType(url)

        // Assess pruning candidacy
        let reason: PruningReason | null = null
        let priority: 'high' | 'medium' | 'low' = 'low'

        if (providerCount === 0 && !hasCommuneData && !hasTradeContent) {
          reason = 'zero_providers'
          priority = 'high'
          zeroPagesCount++
        } else if (providerCount === 0) {
          // Zero providers but has some content — lower priority
          reason = 'zero_providers'
          priority = 'medium'
          zeroPagesCount++
        } else if (
          providerCount <= THIN_PAGE_PROVIDER_THRESHOLD &&
          diffScore < MIN_DIFFERENTIATION_PERCENT
        ) {
          reason = 'low_providers'
          priority = 'low'
          thinPagesCount++
        } else if (diffScore < MIN_DIFFERENTIATION_PERCENT) {
          reason = 'low_differentiation'
          priority = 'low'
          lowDiffCount++
        }

        if (reason) {
          noindexCandidates++
          candidates.push({ url, reason, providerCount, pageType, priority })
        } else {
          indexedPages++
        }
      }
    }

    // -----------------------------------------------------------------------
    // Step 4: Count existing noindex providers
    // -----------------------------------------------------------------------
    const { count: noindexProviderCount, error: noindexError } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('noindex', true)

    if (noindexError) {
      logger.warn('[pruning-audit] Failed to count noindex providers:', {
        action: noindexError.message,
      })
    }

    // -----------------------------------------------------------------------
    // Step 5: Summary stats
    // -----------------------------------------------------------------------
    const totalProviders = cityCounts?.length || 0
    const indexationRatio =
      totalServiceCityPages > 0 ? ((indexedPages / totalServiceCityPages) * 100).toFixed(1) : '0'

    const highPriority = candidates.filter((c) => c.priority === 'high')
    const mediumPriority = candidates.filter((c) => c.priority === 'medium')
    const lowPriority = candidates.filter((c) => c.priority === 'low')

    const durationMs = Date.now() - startTime

    // -----------------------------------------------------------------------
    // Step 6: Build report
    // -----------------------------------------------------------------------
    const report = {
      audit: 'seo-pruning',
      timestamp: new Date().toISOString(),
      durationMs,
      summary: {
        totalServiceCityPages,
        indexedPages,
        noindexCandidates,
        indexationRatio: `${indexationRatio}%`,
        totalActiveProviders: totalProviders,
        noindexProviders: noindexProviderCount || 0,
        citiesAudited: citiesToAudit.length,
        servicesAudited: staticServices.length,
      },
      breakdown: {
        zeroPagesCount,
        thinPagesCount,
        lowDiffCount,
      },
      priorities: {
        high: highPriority.length,
        medium: mediumPriority.length,
        low: lowPriority.length,
      },
      recommendations: generateRecommendations({
        totalServiceCityPages,
        noindexCandidates,
        zeroPagesCount,
        thinPagesCount,
        highPriority: highPriority.length,
      }),
      // Top 50 highest-priority candidates (for quick review)
      topCandidates: candidates
        .sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
        .slice(0, 50),
    }

    logger.info(
      `[pruning-audit] Complete: ${totalServiceCityPages} pages scanned, ${noindexCandidates} candidates (${indexationRatio}% indexation ratio) in ${durationMs}ms`
    )

    return NextResponse.json(report)
  } catch (error) {
    logger.error('[pruning-audit] Fatal error:', error)
    return NextResponse.json(
      { error: 'Erreur interne', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// Recommendation generator
// ---------------------------------------------------------------------------

function generateRecommendations(stats: {
  totalServiceCityPages: number
  noindexCandidates: number
  zeroPagesCount: number
  thinPagesCount: number
  highPriority: number
}): string[] {
  const recommendations: string[] = []
  const prunePercent =
    stats.totalServiceCityPages > 0
      ? ((stats.noindexCandidates / stats.totalServiceCityPages) * 100).toFixed(1)
      : '0'

  recommendations.push(
    `${stats.noindexCandidates} pages candidates au pruning sur ${stats.totalServiceCityPages} (${prunePercent}%).`
  )

  if (stats.highPriority > 0) {
    recommendations.push(
      `${stats.highPriority} pages HAUTE PRIORITE : 0 providers, 0 commune data, 0 trade content. Ces pages n'apportent aucune valeur et diluent le crawl budget.`
    )
  }

  if (stats.zeroPagesCount > 100) {
    recommendations.push(
      `${stats.zeroPagesCount} pages sans aucun provider. Envisager un noindex progressif en commencant par les villes les moins populaires.`
    )
  }

  if (stats.thinPagesCount > 50) {
    recommendations.push(
      `${stats.thinPagesCount} pages avec contenu "thin" (<= ${THIN_PAGE_PROVIDER_THRESHOLD} provider). Enrichir le contenu OU noindex si pas d'amelioration apres 6 mois.`
    )
  }

  const targetPercent = parseFloat(prunePercent)
  if (targetPercent > 20) {
    recommendations.push(
      `ALERTE : ${prunePercent}% de pages candidates depasse le seuil recommande de 20% (Kevin Indig). Prioriser les high/medium avant les low.`
    )
  } else if (targetPercent > 10) {
    recommendations.push(
      `Le ratio de pruning (${prunePercent}%) est dans la fourchette optimale de 10-20% (Kevin Indig).`
    )
  } else {
    recommendations.push(
      `Seulement ${prunePercent}% de pages candidates — le site est en bonne sante. Continuer a monitorer mensuellement.`
    )
  }

  recommendations.push(
    'RAPPEL : Ne JAMAIS supprimer automatiquement. Chaque decision de noindex doit etre validee manuellement.'
  )

  return recommendations
}
