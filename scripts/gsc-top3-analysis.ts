/**
 * GSC TOP 3 Analysis Script
 *
 * Extracts, scores, and classifies pages for TOP 3 ranking optimization.
 * Combines GSC data with internal enrichment data (trade-content, commune-data).
 *
 * Usage:
 *   1. Export GSC Search Performance CSV (28 days, Pages + Queries dimensions)
 *      → Google Search Console → Performance → Export → CSV
 *   2. Run: npx tsx scripts/gsc-top3-analysis.ts <path-to-csv>
 *   3. Optional: --json flag to output JSON instead of formatted text
 *   4. Optional: --upload flag to push priority pages to Supabase seo_priority_pages table
 *
 * Output: structured analysis with scored pages, pattern insights, and actionable flags.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// ── Types ──────────────────────────────────────────────────────────────────

interface GscRow {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface QueryDetail {
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

interface PageAggregate {
  url: string
  path: string
  mainQuery: string
  mainQueryImpressions: number
  top3Queries: QueryDetail[]
  queries: QueryDetail[]
  avgPosition: number
  totalImpressions: number
  totalClicks: number
  avgCtr: number
  pageType: string
  serviceSlug: string
  citySlug: string
}

type CtrFlag = 'CTR_EXCELLENT' | 'CTR_NORMAL' | 'CTR_LOW' | 'CTR_VERY_LOW'
type OpportunityFlag = 'STRIKING_DISTANCE' | 'QUICK_WIN' | 'HIGH_VOLUME_LOW_CTR' | 'CANNIBALIZATION_RISK'

interface EnrichedPage extends PageAggregate {
  providerCount: number
  avgRating: number
  reviewCount: number
  hasPricingData: boolean
  hasLocalInsights: boolean
  top3Score: number
  label: 'READY_TO_WIN' | 'NEEDS_ENRICHMENT' | 'LOW_PRIORITY'
  flags: string[]
  ctrFlag: CtrFlag
  opportunityFlags: OpportunityFlag[]
}

// ── CSV Parser ─────────────────────────────────────────────────────────────

function parseCsv(filePath: string): GscRow[] {
  const raw = readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n').filter(l => l.trim())
  if (lines.length < 2) {
    console.error('CSV vide ou invalide')
    process.exit(1)
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
  const qIdx = headers.findIndex(h => h.includes('query') || h.includes('requête') || h.includes('requete'))
  const pIdx = headers.findIndex(h => h.includes('page') || h.includes('url'))
  const cIdx = headers.findIndex(h => h.includes('click'))
  const iIdx = headers.findIndex(h => h.includes('impression'))
  const ctrIdx = headers.findIndex(h => h.includes('ctr'))
  const posIdx = headers.findIndex(h => h.includes('position'))

  if (qIdx === -1 || pIdx === -1) {
    console.error('Headers CSV non reconnus. Attendus : query/requête, page/url, clicks, impressions, ctr, position')
    console.error('Trouvés :', headers)
    process.exit(1)
  }

  return lines.slice(1).map(line => {
    const cols: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue }
      current += char
    }
    cols.push(current.trim())

    return {
      query: cols[qIdx] || '',
      page: cols[pIdx] || '',
      clicks: parseFloat(cols[cIdx] || '0'),
      impressions: parseFloat(cols[iIdx] || '0'),
      ctr: parseFloat((cols[ctrIdx] || '0').replace('%', '')) / (cols[ctrIdx]?.includes('%') ? 100 : 1),
      position: parseFloat(cols[posIdx] || '0'),
    }
  }).filter(r => r.query && r.page)
}

// ── Page Type Detection ────────────────────────────────────────────────────

function detectPageType(path: string): string {
  if (path.startsWith('/services/') && path.split('/').length >= 4) return 'services_city'
  if (path.startsWith('/services/') && path.split('/').length === 3) return 'services_hub'
  if (path.startsWith('/tarifs/') && path.split('/').length >= 4) return 'tarifs_city'
  if (path.startsWith('/tarifs/') && path.split('/').length === 3) return 'tarifs_hub'
  if (path.startsWith('/devis/')) return 'devis'
  if (path.startsWith('/urgence/')) return 'urgence'
  if (path.startsWith('/avis/')) return 'avis'
  if (path.startsWith('/barometre/')) return 'barometre'
  if (path.startsWith('/villes/')) return 'villes'
  if (path.startsWith('/departements/')) return 'departements'
  if (path.startsWith('/regions/')) return 'regions'
  if (path.startsWith('/blog/')) return 'blog'
  if (path.startsWith('/guides/')) return 'guides'
  if (path.startsWith('/questions/')) return 'questions'
  if (path.startsWith('/problemes/')) return 'problemes'
  if (path.startsWith('/comparaison/')) return 'comparaison'
  if (path === '/') return 'homepage'
  return 'other'
}

function extractServiceAndCity(path: string): { service: string; city: string } {
  // /services/plombier/lyon → { service: 'plombier', city: 'lyon' }
  // /tarifs/plombier/lyon → { service: 'plombier', city: 'lyon' }
  const parts = path.split('/').filter(Boolean)
  return {
    service: parts[1] || '',
    city: parts[2] || '',
  }
}

// ── TASK 1: Filter & Aggregate ─────────────────────────────────────────────

function aggregatePages(rows: GscRow[]): PageAggregate[] {
  // Group by page URL
  const byPage = new Map<string, GscRow[]>()
  for (const row of rows) {
    const existing = byPage.get(row.page) || []
    existing.push(row)
    byPage.set(row.page, existing)
  }

  const pages: PageAggregate[] = []

  for (const [url, pageRows] of byPage) {
    // Compute weighted average position
    const totalImpressions = pageRows.reduce((s, r) => s + r.impressions, 0)
    const totalClicks = pageRows.reduce((s, r) => s + r.clicks, 0)
    const weightedPosition = totalImpressions > 0
      ? pageRows.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpressions
      : 0
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0

    // Filter: position 5-20, impressions > 20
    if (weightedPosition < 5 || weightedPosition > 20 || totalImpressions <= 20) continue

    // Find main query (highest impressions)
    const sorted = [...pageRows].sort((a, b) => b.impressions - a.impressions)
    const mainQuery = sorted[0]

    // Top 3 queries with their own CTR
    const top3Queries: QueryDetail[] = sorted.slice(0, 3).map(r => ({
      query: r.query,
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.impressions > 0 ? r.clicks / r.impressions : 0,
      position: r.position,
    }))

    // Extract path from full URL
    let path = url
    try {
      const u = new URL(url)
      path = u.pathname
    } catch {
      // Already a path
    }

    const { service, city } = extractServiceAndCity(path)

    pages.push({
      url,
      path,
      mainQuery: mainQuery.query,
      mainQueryImpressions: mainQuery.impressions,
      top3Queries,
      queries: sorted.slice(0, 10).map(r => ({
        query: r.query,
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.impressions > 0 ? r.clicks / r.impressions : 0,
        position: r.position,
      })),
      avgPosition: Math.round(weightedPosition * 10) / 10,
      totalImpressions,
      totalClicks,
      avgCtr: Math.round(avgCtr * 10000) / 10000,
      pageType: detectPageType(path),
      serviceSlug: service,
      citySlug: city,
    })
  }

  return pages.sort((a, b) => b.totalImpressions - a.totalImpressions)
}

// ── TASK 2 & 3: Enrich & Score ─────────────────────────────────────────────

// Load trade content for pricing data check
let tradeContentCache: Record<string, { min: number; max: number; unit: string }> | null = null

async function loadTradeContent(): Promise<Record<string, { min: number; max: number; unit: string }>> {
  if (tradeContentCache) return tradeContentCache
  try {
    const mod = await import('../src/lib/data/trade-content')
    const result: Record<string, { min: number; max: number; unit: string }> = {}
    for (const [slug, content] of Object.entries(mod.tradeContent)) {
      const tc = content as { priceRange?: { min: number; max: number; unit: string } }
      if (tc.priceRange?.min && tc.priceRange?.max) {
        result[slug] = tc.priceRange
      }
    }
    tradeContentCache = result
    return result
  } catch {
    console.warn('⚠ Impossible de charger trade-content.ts — has_pricing_data sera false pour toutes les pages')
    tradeContentCache = {}
    return {}
  }
}

// Load commune data for local insights check
let communeCache: Set<string> | null = null

async function loadCommuneSlugs(): Promise<Set<string>> {
  if (communeCache) return communeCache
  try {
    // commune-data.ts uses DB (getCommuneBySlug is async).
    // For offline local analysis, load the villes list from france-light instead.
    const mod = await import('../src/lib/data/france-light')
    const slugs = new Set<string>()
    for (const v of mod.villesLight) {
      slugs.add(v.slug)
    }
    communeCache = slugs
    return slugs
  } catch {
    console.warn('⚠ Impossible de charger france-light.ts — has_local_insights sera approximatif')
    communeCache = new Set()
    return communeCache
  }
}

function computeScore(page: PageAggregate, enrichment: {
  providerCount: number
  avgRating: number
  reviewCount: number
  hasPricingData: boolean
  hasLocalInsights: boolean
}): number {
  let score = 0

  // Position score
  if (page.avgPosition >= 5 && page.avgPosition <= 10) score += 30
  else if (page.avgPosition > 10 && page.avgPosition <= 15) score += 20
  else if (page.avgPosition > 15 && page.avgPosition <= 20) score += 10

  // Impressions score
  if (page.totalImpressions > 100) score += 20
  else if (page.totalImpressions > 20) score += 10

  // Provider score
  if (enrichment.providerCount >= 3) score += 10
  if (enrichment.avgRating >= 4) score += 5

  // Content score
  if (enrichment.hasPricingData) score += 10
  if (enrichment.hasLocalInsights) score += 10

  // Penalties
  if (enrichment.reviewCount === 0) score -= 15
  if (enrichment.providerCount === 0) score -= 10

  return Math.max(0, Math.min(100, score))
}

function getFlags(enrichment: {
  providerCount: number
  reviewCount: number
  hasPricingData: boolean
  hasLocalInsights: boolean
}): string[] {
  const flags: string[] = []
  if (enrichment.providerCount < 3) flags.push('ADD_PROVIDERS')
  if (enrichment.reviewCount < 5) flags.push('ADD_REVIEWS')
  if (!enrichment.hasPricingData) flags.push('ADD_PRICING')
  if (!enrichment.hasLocalInsights) flags.push('ADD_INSIGHTS')
  return flags
}

// ── CTR Benchmarks by position bucket ──────────────────────────────────────
// Expected CTR for organic results by position range (industry averages for local/service queries)
const CTR_BENCHMARKS: Record<string, number> = {
  '1-3': 0.15,    // 15% CTR expected for top 3
  '4-7': 0.05,    // 5% for positions 4-7
  '8-10': 0.025,  // 2.5% for bottom of page 1
  '11-15': 0.012, // 1.2% for top of page 2
  '16-20': 0.006, // 0.6% for mid page 2
}

function getExpectedCtr(position: number): number {
  if (position <= 3) return CTR_BENCHMARKS['1-3']
  if (position <= 7) return CTR_BENCHMARKS['4-7']
  if (position <= 10) return CTR_BENCHMARKS['8-10']
  if (position <= 15) return CTR_BENCHMARKS['11-15']
  return CTR_BENCHMARKS['16-20']
}

function computeCtrFlag(page: PageAggregate): CtrFlag {
  const expected = getExpectedCtr(page.avgPosition)
  const ratio = page.avgCtr / expected
  if (ratio >= 1.5) return 'CTR_EXCELLENT'
  if (ratio >= 0.8) return 'CTR_NORMAL'
  if (ratio >= 0.4) return 'CTR_LOW'
  return 'CTR_VERY_LOW'
}

function computeOpportunityFlags(page: PageAggregate): OpportunityFlag[] {
  const flags: OpportunityFlag[] = []

  // STRIKING_DISTANCE: position 4-10, one push could get top 3
  if (page.avgPosition >= 4 && page.avgPosition <= 10) {
    flags.push('STRIKING_DISTANCE')
  }

  // QUICK_WIN: high impressions + low position = lots of demand, just need to move up
  if (page.totalImpressions > 50 && page.avgPosition >= 8 && page.avgPosition <= 15) {
    flags.push('QUICK_WIN')
  }

  // HIGH_VOLUME_LOW_CTR: many impressions but CTR is way below expected
  const expected = getExpectedCtr(page.avgPosition)
  if (page.totalImpressions > 30 && page.avgCtr < expected * 0.5) {
    flags.push('HIGH_VOLUME_LOW_CTR')
  }

  // CANNIBALIZATION_RISK: top 3 queries have very different intents or the same query ranks for multiple pages
  // Detected here by: if top 2 queries have positions that differ by >5, the page may be splitting authority
  if (page.top3Queries.length >= 2) {
    const posDiff = Math.abs(page.top3Queries[0].position - page.top3Queries[1].position)
    if (posDiff > 8) {
      flags.push('CANNIBALIZATION_RISK')
    }
  }

  return flags
}

async function enrichPages(pages: PageAggregate[]): Promise<EnrichedPage[]> {
  const pricing = await loadTradeContent()
  const communes = await loadCommuneSlugs()

  // Note: providerCount, avgRating, reviewCount require DB access.
  // Without Supabase connection, we use heuristics:
  // - Pages in GSC_BOOST_PAGES likely have providers
  // - We mark these for DB enrichment
  const boostPages = new Set([
    '/services/deratisation/rosny-sous-bois',
    '/services/deratisation/plaisir',
    '/services/deratisation/montigny-le-bretonneux',
    '/services/deratisation/gosier',
    '/services/deratisation/montluel',
    '/services/deratisation/cabasse',
    '/services/deratisation/voiron',
    '/services/deratisation/villejuif',
    '/services/demenageur/croissy-sur-seine',
    '/services/demenageur/domont',
    '/services/demenageur/carqueiranne',
    '/services/electricien/courbevoie',
    '/services/antenniste/juvignac',
    '/services/alarme-securite/saran',
    '/services/vitrier/stains',
    '/services/peintre-en-batiment/le-plessis-trevise',
    '/services/deratisation/trappes',
    '/services/deratisation/villemoisson-sur-orge',
    '/services/deratisation/ermont',
    '/services/deratisation/montgeron',
    '/services/deratisation/vaucresson',
    '/services/deratisation/thiais',
    '/services/deratisation/la-londe-les-maures',
    '/services/deratisation/fresnes',
  ])

  return pages.map(page => {
    const hasPricingData = !!pricing[page.serviceSlug]
    const hasLocalInsights = communes.size > 0 ? communes.has(page.citySlug) : page.citySlug.length > 0

    // Without DB, estimate provider data
    // These are placeholder values — run with --upload to get real data from Supabase
    const isBoost = boostPages.has(page.path)
    const providerCount = isBoost ? 5 : (page.pageType.includes('city') ? 2 : 0)
    const avgRating = isBoost ? 4.2 : 0
    const reviewCount = isBoost ? 8 : 0

    const enrichment = { providerCount, avgRating, reviewCount, hasPricingData, hasLocalInsights }
    const score = computeScore(page, enrichment)
    const label = score >= 70 ? 'READY_TO_WIN' as const
      : score >= 50 ? 'NEEDS_ENRICHMENT' as const
      : 'LOW_PRIORITY' as const

    return {
      ...page,
      ...enrichment,
      top3Score: score,
      label,
      flags: getFlags(enrichment),
      ctrFlag: computeCtrFlag(page),
      opportunityFlags: computeOpportunityFlags(page),
    }
  })
}

// ── TASK 5: Output ─────────────────────────────────────────────────────────

// ── CTR flag labels ────────────────────────────────────────────────────────
const CTR_FLAG_LABELS: Record<CtrFlag, string> = {
  CTR_EXCELLENT: '++ CTR excellent (>1.5x attendu)',
  CTR_NORMAL: '= CTR normal',
  CTR_LOW: '- CTR bas (<0.8x attendu)',
  CTR_VERY_LOW: '!! CTR critique (<0.4x attendu)',
}

const OPP_FLAG_LABELS: Record<OpportunityFlag, string> = {
  STRIKING_DISTANCE: 'A portée du TOP 3 (pos 4-10)',
  QUICK_WIN: 'Quick win (fort volume, pos 8-15)',
  HIGH_VOLUME_LOW_CTR: 'Volume élevé, CTR à optimiser',
  CANNIBALIZATION_RISK: 'Risque cannibalization (queries hétérogènes)',
}

function formatPageBlock(p: EnrichedPage, index: number): string[] {
  const lines: string[] = []
  lines.push(`  ${index}. ${p.path}`)
  lines.push(`     Type: ${p.pageType} | Score: ${p.top3Score} | Label: ${p.label}`)
  lines.push(`     Position: ${p.avgPosition} | Impressions: ${p.totalImpressions.toLocaleString('fr-FR')} | Clicks: ${p.totalClicks} | CTR: ${(p.avgCtr * 100).toFixed(2)}%`)
  lines.push(`     CTR:  ${CTR_FLAG_LABELS[p.ctrFlag]}`)
  if (p.opportunityFlags.length > 0) {
    lines.push(`     Opps: ${p.opportunityFlags.map(f => OPP_FLAG_LABELS[f]).join(' | ')}`)
  }
  lines.push(`     Data: ${p.providerCount} providers | ${p.reviewCount} avis | rating ${p.avgRating} | prix: ${p.hasPricingData ? 'oui' : 'NON'} | insights: ${p.hasLocalInsights ? 'oui' : 'NON'}`)
  if (p.flags.length > 0) {
    lines.push(`     TODO: ${p.flags.join(', ')}`)
  }
  lines.push(`     Top 3 requêtes :`)
  for (const q of p.top3Queries) {
    const qCtr = (q.ctr * 100).toFixed(1)
    const expected = getExpectedCtr(q.position)
    const ratio = expected > 0 ? q.ctr / expected : 0
    const ctrSignal = ratio >= 1.5 ? '++' : ratio >= 0.8 ? '=' : ratio >= 0.4 ? '-' : '!!'
    lines.push(`       [${ctrSignal}] "${q.query}" — pos ${q.position.toFixed(1)} | ${q.impressions} imp | ${q.clicks} clics | CTR ${qCtr}%`)
  }
  lines.push('')
  return lines
}

function formatOutput(pages: EnrichedPage[], outputJson: boolean): string {
  if (outputJson) {
    // Group by template for JSON output
    const byTemplate = new Map<string, EnrichedPage[]>()
    for (const p of pages) {
      const arr = byTemplate.get(p.pageType) || []
      arr.push(p)
      byTemplate.set(p.pageType, arr)
    }
    const templateSegments: Record<string, { pages: EnrichedPage[]; stats: Record<string, unknown> }> = {}
    for (const [type, typePages] of byTemplate) {
      templateSegments[type] = {
        stats: computeTemplateStats(typePages),
        pages: typePages.sort((a, b) => b.top3Score - a.top3Score).slice(0, 30),
      }
    }

    return JSON.stringify({
      summary: {
        totalPagesAnalyzed: pages.length,
        readyToWin: pages.filter(p => p.label === 'READY_TO_WIN').length,
        needsEnrichment: pages.filter(p => p.label === 'NEEDS_ENRICHMENT').length,
        lowPriority: pages.filter(p => p.label === 'LOW_PRIORITY').length,
        avgPosition: Math.round(pages.reduce((s, p) => s + p.avgPosition, 0) / pages.length * 10) / 10,
        totalImpressions: pages.reduce((s, p) => s + p.totalImpressions, 0),
        totalClicks: pages.reduce((s, p) => s + p.totalClicks, 0),
        ctrDistribution: {
          excellent: pages.filter(p => p.ctrFlag === 'CTR_EXCELLENT').length,
          normal: pages.filter(p => p.ctrFlag === 'CTR_NORMAL').length,
          low: pages.filter(p => p.ctrFlag === 'CTR_LOW').length,
          veryLow: pages.filter(p => p.ctrFlag === 'CTR_VERY_LOW').length,
        },
        opportunityDistribution: {
          strikingDistance: pages.filter(p => p.opportunityFlags.includes('STRIKING_DISTANCE')).length,
          quickWin: pages.filter(p => p.opportunityFlags.includes('QUICK_WIN')).length,
          highVolumeLowCtr: pages.filter(p => p.opportunityFlags.includes('HIGH_VOLUME_LOW_CTR')).length,
          cannibalizationRisk: pages.filter(p => p.opportunityFlags.includes('CANNIBALIZATION_RISK')).length,
        },
      },
      templateSegments,
      insights: computeInsights(pages),
      generatedAt: new Date().toISOString(),
    }, null, 2)
  }

  const lines: string[] = []

  // ── HEADER ──
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('  GSC TOP 3 ANALYSIS — ServicesArtisans')
  lines.push(`  ${new Date().toISOString().split('T')[0]} | ${pages.length} pages analysées`)
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('')

  // ── GLOBAL SUMMARY ──
  const readyToWin = pages.filter(p => p.label === 'READY_TO_WIN')
  const needsEnrichment = pages.filter(p => p.label === 'NEEDS_ENRICHMENT')
  const lowPriority = pages.filter(p => p.label === 'LOW_PRIORITY')

  lines.push(`READY_TO_WIN:      ${readyToWin.length} pages (score >= 70)`)
  lines.push(`NEEDS_ENRICHMENT:  ${needsEnrichment.length} pages (score 50-69)`)
  lines.push(`LOW_PRIORITY:      ${lowPriority.length} pages (score < 50)`)
  lines.push(`Total impressions: ${pages.reduce((s, p) => s + p.totalImpressions, 0).toLocaleString('fr-FR')}`)
  lines.push(`Total clicks:      ${pages.reduce((s, p) => s + p.totalClicks, 0).toLocaleString('fr-FR')}`)
  lines.push('')

  // CTR distribution
  lines.push('CTR Distribution :')
  lines.push(`  ++ Excellent : ${pages.filter(p => p.ctrFlag === 'CTR_EXCELLENT').length} pages`)
  lines.push(`  =  Normal    : ${pages.filter(p => p.ctrFlag === 'CTR_NORMAL').length} pages`)
  lines.push(`  -  Bas       : ${pages.filter(p => p.ctrFlag === 'CTR_LOW').length} pages`)
  lines.push(`  !! Critique  : ${pages.filter(p => p.ctrFlag === 'CTR_VERY_LOW').length} pages`)
  lines.push('')

  // Opportunity distribution
  lines.push('Opportunities :')
  lines.push(`  STRIKING_DISTANCE     : ${pages.filter(p => p.opportunityFlags.includes('STRIKING_DISTANCE')).length} pages (pos 4-10, poussables en TOP 3)`)
  lines.push(`  QUICK_WIN             : ${pages.filter(p => p.opportunityFlags.includes('QUICK_WIN')).length} pages (volume + position 8-15)`)
  lines.push(`  HIGH_VOLUME_LOW_CTR   : ${pages.filter(p => p.opportunityFlags.includes('HIGH_VOLUME_LOW_CTR')).length} pages (titre/meta à optimiser)`)
  lines.push(`  CANNIBALIZATION_RISK  : ${pages.filter(p => p.opportunityFlags.includes('CANNIBALIZATION_RISK')).length} pages (queries hétérogènes)`)
  lines.push('')

  // ── SECTION PAR TEMPLATE (segmentation stricte) ──
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('  SEGMENTATION PAR TEMPLATE')
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('')

  // Group pages by template
  const byTemplate = new Map<string, EnrichedPage[]>()
  for (const p of pages) {
    const arr = byTemplate.get(p.pageType) || []
    arr.push(p)
    byTemplate.set(p.pageType, arr)
  }

  // Sort templates by total impressions
  const sortedTemplates = [...byTemplate.entries()].sort((a, b) => {
    const impA = a[1].reduce((s, p) => s + p.totalImpressions, 0)
    const impB = b[1].reduce((s, p) => s + p.totalImpressions, 0)
    return impB - impA
  })

  for (const [template, templatePages] of sortedTemplates) {
    const stats = computeTemplateStats(templatePages)
    const ready = templatePages.filter(p => p.label === 'READY_TO_WIN')
    const needs = templatePages.filter(p => p.label === 'NEEDS_ENRICHMENT')
    const striking = templatePages.filter(p => p.opportunityFlags.includes('STRIKING_DISTANCE'))
    const quickWins = templatePages.filter(p => p.opportunityFlags.includes('QUICK_WIN'))
    const lowCtr = templatePages.filter(p => p.ctrFlag === 'CTR_LOW' || p.ctrFlag === 'CTR_VERY_LOW')

    lines.push(`───── ${template.toUpperCase()} (${templatePages.length} pages) ─────`)
    lines.push(`  Pos moy: ${stats.avgPosition} | CTR moy: ${stats.avgCtr}% | Imp totales: ${stats.totalImpressions.toLocaleString('fr-FR')}`)
    lines.push(`  Ready: ${ready.length} | Enrichment: ${needs.length} | Striking: ${striking.length} | Quick wins: ${quickWins.length} | CTR bas: ${lowCtr.length}`)
    lines.push('')

    // Show top 10 pages for this template, sorted by score then impressions
    const topPages = [...templatePages]
      .sort((a, b) => b.top3Score - a.top3Score || b.totalImpressions - a.totalImpressions)
      .slice(0, 10)

    for (let i = 0; i < topPages.length; i++) {
      lines.push(...formatPageBlock(topPages[i], i + 1))
    }
    lines.push('')
  }

  // ── PATTERN INSIGHTS ──
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('  PATTERN INSIGHTS')
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('')

  const insights = computeInsights(pages)
  for (const insight of insights) {
    lines.push(`  * ${insight}`)
  }
  lines.push('')

  // ── ACTIONABLE FLAGS AGGREGATE ──
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('  ACTIONABLE FLAGS (READY_TO_WIN + NEEDS_ENRICHMENT)')
  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push('')

  const flagCounts: Record<string, number> = {}
  for (const p of [...readyToWin, ...needsEnrichment]) {
    for (const f of p.flags) {
      flagCounts[f] = (flagCounts[f] || 0) + 1
    }
  }
  for (const [flag, count] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${flag.padEnd(20)} ${count} pages`)
  }
  lines.push('')

  // ── CTR OPPORTUNITIES (pages where title/meta improvement could increase clicks) ──
  const ctrOpps = pages
    .filter(p => p.opportunityFlags.includes('HIGH_VOLUME_LOW_CTR'))
    .sort((a, b) => b.totalImpressions - a.totalImpressions)
    .slice(0, 10)

  if (ctrOpps.length > 0) {
    lines.push('═══════════════════════════════════════════════════════════════════════════')
    lines.push('  TOP 10 CTR OPPORTUNITIES (volume élevé, CTR critique → optimiser titre/meta)')
    lines.push('═══════════════════════════════════════════════════════════════════════════')
    lines.push('')

    for (let i = 0; i < ctrOpps.length; i++) {
      const p = ctrOpps[i]
      const expected = getExpectedCtr(p.avgPosition)
      const potentialClicks = Math.round(p.totalImpressions * expected) - p.totalClicks
      lines.push(`  ${i + 1}. ${p.path}`)
      lines.push(`     "${p.mainQuery}" — pos ${p.avgPosition} | ${p.totalImpressions} imp | CTR ${(p.avgCtr * 100).toFixed(2)}% (attendu: ${(expected * 100).toFixed(1)}%)`)
      lines.push(`     Potentiel : +${potentialClicks > 0 ? potentialClicks : 0} clics/mois si CTR normalisé`)
      lines.push('')
    }
  }

  lines.push('═══════════════════════════════════════════════════════════════════════════')
  lines.push(`  Note : provider/review data = estimations sans connexion DB.`)
  lines.push(`  Lancer avec --upload pour enrichir avec données réelles Supabase.`)
  lines.push('═══════════════════════════════════════════════════════════════════════════')

  return lines.join('\n')
}

function computeTemplateStats(pages: EnrichedPage[]): {
  avgPosition: string
  avgCtr: string
  totalImpressions: number
  totalClicks: number
  avgScore: string
} {
  const n = pages.length || 1
  return {
    avgPosition: (pages.reduce((s, p) => s + p.avgPosition, 0) / n).toFixed(1),
    avgCtr: (pages.reduce((s, p) => s + p.avgCtr, 0) / n * 100).toFixed(2),
    totalImpressions: pages.reduce((s, p) => s + p.totalImpressions, 0),
    totalClicks: pages.reduce((s, p) => s + p.totalClicks, 0),
    avgScore: (pages.reduce((s, p) => s + p.top3Score, 0) / n).toFixed(0),
  }
}

// ── TASK 3 bis: Pattern Insights ───────────────────────────────────────────

function computeInsights(pages: EnrichedPage[]): string[] {
  const insights: string[] = []

  // Avg position by page type
  const positionsByType = new Map<string, number[]>()
  for (const p of pages) {
    const arr = positionsByType.get(p.pageType) || []
    arr.push(p.avgPosition)
    positionsByType.set(p.pageType, arr)
  }
  const typeAvgs = [...positionsByType.entries()]
    .map(([type, positions]) => ({
      type,
      avg: positions.reduce((s, p) => s + p, 0) / positions.length,
      count: positions.length,
    }))
    .sort((a, b) => a.avg - b.avg)

  if (typeAvgs.length > 0) {
    const best = typeAvgs[0]
    insights.push(`Meilleur type de page : "${best.type}" avec position moyenne ${best.avg.toFixed(1)} (${best.count} pages)`)
  }

  // CTR by position bucket
  const buckets: Record<string, { clicks: number; impressions: number }> = {
    '5-10': { clicks: 0, impressions: 0 },
    '10-15': { clicks: 0, impressions: 0 },
    '15-20': { clicks: 0, impressions: 0 },
  }
  for (const p of pages) {
    const bucket = p.avgPosition <= 10 ? '5-10' : p.avgPosition <= 15 ? '10-15' : '15-20'
    buckets[bucket].clicks += p.totalClicks
    buckets[bucket].impressions += p.totalImpressions
  }
  for (const [bucket, data] of Object.entries(buckets)) {
    if (data.impressions > 0) {
      const ctr = (data.clicks / data.impressions * 100).toFixed(1)
      insights.push(`CTR moyen positions ${bucket} : ${ctr}%`)
    }
  }

  // Provider count vs position
  const withProviders = pages.filter(p => p.providerCount >= 3)
  const withoutProviders = pages.filter(p => p.providerCount < 3)
  if (withProviders.length > 3 && withoutProviders.length > 3) {
    const avgWith = withProviders.reduce((s, p) => s + p.avgPosition, 0) / withProviders.length
    const avgWithout = withoutProviders.reduce((s, p) => s + p.avgPosition, 0) / withoutProviders.length
    const diff = avgWithout - avgWith
    if (diff > 0.5) {
      insights.push(`Pages avec ≥3 providers se positionnent en moyenne ${diff.toFixed(1)} positions plus haut`)
    }
  }

  // Pricing data vs CTR
  const withPricing = pages.filter(p => p.hasPricingData)
  const withoutPricing = pages.filter(p => !p.hasPricingData)
  if (withPricing.length > 3 && withoutPricing.length > 3) {
    const ctrWith = withPricing.reduce((s, p) => s + p.avgCtr, 0) / withPricing.length
    const ctrWithout = withoutPricing.reduce((s, p) => s + p.avgCtr, 0) / withoutPricing.length
    if (ctrWith > ctrWithout) {
      const pctDiff = ((ctrWith - ctrWithout) / ctrWithout * 100).toFixed(0)
      insights.push(`Pages avec données de prix : +${pctDiff}% CTR vs pages sans prix`)
    }
  }

  // Review count vs CTR
  const withReviews = pages.filter(p => p.reviewCount > 0)
  const withoutReviews = pages.filter(p => p.reviewCount === 0)
  if (withReviews.length > 3 && withoutReviews.length > 3) {
    const ctrWith = withReviews.reduce((s, p) => s + p.avgCtr, 0) / withReviews.length
    const ctrWithout = withoutReviews.reduce((s, p) => s + p.avgCtr, 0) / withoutReviews.length
    if (ctrWith > ctrWithout) {
      const pctDiff = ((ctrWith - ctrWithout) / ctrWithout * 100).toFixed(0)
      insights.push(`Pages avec avis : +${pctDiff}% CTR vs pages sans avis`)
    }
  }

  // Local insights vs position
  const withInsights = pages.filter(p => p.hasLocalInsights)
  const withoutInsights = pages.filter(p => !p.hasLocalInsights)
  if (withInsights.length > 3 && withoutInsights.length > 3) {
    const avgWith = withInsights.reduce((s, p) => s + p.avgPosition, 0) / withInsights.length
    const avgWithout = withoutInsights.reduce((s, p) => s + p.avgPosition, 0) / withoutInsights.length
    const diff = avgWithout - avgWith
    if (diff > 0.5) {
      insights.push(`Pages avec insights locaux INSEE : ${diff.toFixed(1)} positions plus haut en moyenne`)
    }
  }

  // Top services by impression volume
  const serviceImpressions = new Map<string, number>()
  for (const p of pages) {
    if (p.serviceSlug) {
      serviceImpressions.set(p.serviceSlug, (serviceImpressions.get(p.serviceSlug) || 0) + p.totalImpressions)
    }
  }
  const topServices = [...serviceImpressions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  if (topServices.length > 0) {
    insights.push(`Top 5 services par impressions : ${topServices.map(([s, i]) => `${s} (${i.toLocaleString('fr-FR')})`).join(', ')}`)
  }

  // CTR flag distribution insight
  const ctrExcellent = pages.filter(p => p.ctrFlag === 'CTR_EXCELLENT')
  const ctrCritical = pages.filter(p => p.ctrFlag === 'CTR_VERY_LOW')
  if (ctrCritical.length > 0) {
    const potentialClicks = ctrCritical.reduce((s, p) => {
      const expected = getExpectedCtr(p.avgPosition)
      return s + Math.max(0, Math.round(p.totalImpressions * expected) - p.totalClicks)
    }, 0)
    insights.push(`${ctrCritical.length} pages avec CTR critique — potentiel de +${potentialClicks.toLocaleString('fr-FR')} clics/mois si titres/meta optimisés`)
  }
  if (ctrExcellent.length > 0) {
    insights.push(`${ctrExcellent.length} pages avec CTR excellent — titres/meta efficaces, à répliquer sur les autres pages`)
  }

  // Striking distance insight
  const striking = pages.filter(p => p.opportunityFlags.includes('STRIKING_DISTANCE'))
  if (striking.length > 0) {
    const totalImpStriking = striking.reduce((s, p) => s + p.totalImpressions, 0)
    insights.push(`${striking.length} pages en striking distance (pos 4-10) — ${totalImpStriking.toLocaleString('fr-FR')} impressions, prêtes à passer en TOP 3`)
  }

  // Template performance comparison
  const byTemplate = new Map<string, EnrichedPage[]>()
  for (const p of pages) {
    const arr = byTemplate.get(p.pageType) || []
    arr.push(p)
    byTemplate.set(p.pageType, arr)
  }
  const templatePerf = [...byTemplate.entries()]
    .filter(([, tp]) => tp.length >= 3)
    .map(([type, tp]) => ({
      type,
      avgCtr: tp.reduce((s, p) => s + p.avgCtr, 0) / tp.length,
      count: tp.length,
    }))
    .sort((a, b) => b.avgCtr - a.avgCtr)
  if (templatePerf.length >= 2) {
    const best = templatePerf[0]
    const worst = templatePerf[templatePerf.length - 1]
    if (best.avgCtr > worst.avgCtr * 1.5) {
      insights.push(`Template "${best.type}" a ${((best.avgCtr / worst.avgCtr - 1) * 100).toFixed(0)}% de CTR en plus que "${worst.type}" — analyser les différences de titre/meta`)
    }
  }

  // Cannibalization warning
  const cannibal = pages.filter(p => p.opportunityFlags.includes('CANNIBALIZATION_RISK'))
  if (cannibal.length > 0) {
    insights.push(`${cannibal.length} pages avec risque de cannibalization — vérifier si plusieurs pages ciblent la même requête`)
  }

  return insights
}

// ── Supabase Upload ────────────────────────────────────────────────────────

async function uploadToSupabase(pages: EnrichedPage[]): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('⚠ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises pour --upload')
    console.error('  Ajoutez-les dans .env.local ou exportez-les dans le shell')
    return
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(url, key)

  // Upload priority pages (READY_TO_WIN + NEEDS_ENRICHMENT)
  const toUpload = pages
    .filter(p => p.label !== 'LOW_PRIORITY')
    .map(p => ({
      path: p.path,
      position: p.avgPosition,
      impressions: p.totalImpressions,
      clicks: p.totalClicks,
      query: p.mainQuery,
      enhanced: false,
    }))

  if (toUpload.length === 0) {
    console.log('Aucune page à uploader.')
    return
  }

  const { error } = await supabase
    .from('seo_priority_pages')
    .upsert(toUpload, { onConflict: 'path,query' })

  if (error) {
    console.error('Erreur upload Supabase:', error.message)
  } else {
    console.log(`✓ ${toUpload.length} pages uploadées dans seo_priority_pages`)
  }

  // Now enrich with real provider data
  console.log('Enrichissement avec données réelles...')
  for (const page of pages.filter(p => p.serviceSlug && p.citySlug)) {
    const { data } = await supabase
      .from('mv_provider_counts')
      .select('provider_count, verified_count, avg_rating')
      .eq('specialty', page.serviceSlug)
      .eq('city', page.citySlug)
      .maybeSingle()

    if (data) {
      page.providerCount = data.provider_count || 0
      page.avgRating = parseFloat(data.avg_rating) || 0
      // Recalculate score with real data
      page.top3Score = computeScore(page, {
        providerCount: page.providerCount,
        avgRating: page.avgRating,
        reviewCount: page.reviewCount,
        hasPricingData: page.hasPricingData,
        hasLocalInsights: page.hasLocalInsights,
      })
      page.label = page.top3Score >= 70 ? 'READY_TO_WIN'
        : page.top3Score >= 50 ? 'NEEDS_ENRICHMENT'
        : 'LOW_PRIORITY'
      page.flags = getFlags({
        providerCount: page.providerCount,
        reviewCount: page.reviewCount,
        hasPricingData: page.hasPricingData,
        hasLocalInsights: page.hasLocalInsights,
      })
      page.ctrFlag = computeCtrFlag(page)
      page.opportunityFlags = computeOpportunityFlags(page)
    }
  }
  console.log('✓ Enrichissement terminé')
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const csvPath = args.find(a => !a.startsWith('--'))
  const outputJson = args.includes('--json')
  const shouldUpload = args.includes('--upload')

  if (!csvPath) {
    console.log(`
Usage: npx tsx scripts/gsc-top3-analysis.ts <gsc-export.csv> [options]

Options:
  --json     Output JSON instead of formatted text
  --upload   Push priority pages to Supabase seo_priority_pages table
             (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)

Steps:
  1. Go to Google Search Console → Performance
  2. Set date range: Last 28 days
  3. Click "Export" → CSV
  4. Make sure dimensions include "Pages" AND "Queries"
  5. Run this script with the exported CSV file
`)
    process.exit(0)
  }

  const resolvedPath = resolve(csvPath)
  console.log(`Parsing ${resolvedPath}...`)

  const rows = parseCsv(resolvedPath)
  console.log(`${rows.length} lignes GSC chargées`)

  const aggregated = aggregatePages(rows)
  console.log(`${aggregated.length} pages filtrées (position 5-20, impressions > 20)`)

  const enriched = await enrichPages(aggregated)

  if (shouldUpload) {
    await uploadToSupabase(enriched)
  }

  const output = formatOutput(enriched, outputJson)

  if (outputJson) {
    const outPath = resolvedPath.replace(/\.csv$/i, '-top3-analysis.json')
    writeFileSync(outPath, output, 'utf-8')
    console.log(`✓ JSON sauvegardé : ${outPath}`)
  } else {
    console.log('')
    console.log(output)

    // Also save to file
    const outPath = resolvedPath.replace(/\.csv$/i, '-top3-analysis.txt')
    writeFileSync(outPath, output, 'utf-8')
    console.log(`\n✓ Rapport sauvegardé : ${outPath}`)
  }
}

main().catch(err => {
  console.error('Erreur fatale:', err)
  process.exit(1)
})
