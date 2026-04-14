import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrawlsPerDay {
  day: string
  count: number
}

export interface TopCrawledPage {
  url: string
  count: number
}

export interface PageTypeDistribution {
  page_type: string
  count: number
}

export interface UserAgentDistribution {
  user_agent_type: string
  count: number
}

export interface StatusCodeDistribution {
  status: number | null
  count: number
}

export interface HourlyCrawlDistribution {
  hour: number
  count: number
}

export interface NeverCrawledPage {
  url: string
  source: string
}

export interface GooglebotAnalysisReport {
  period_start: string
  period_end: string
  total_crawls: number
  crawls_per_day: CrawlsPerDay[]
  top_pages: TopCrawledPage[]
  never_crawled_sample: NeverCrawledPage[]
  page_type_distribution: PageTypeDistribution[]
  user_agent_distribution: UserAgentDistribution[]
  status_code_distribution: StatusCodeDistribution[]
  hourly_distribution: HourlyCrawlDistribution[]
  logs_purged: number
}

// ── Page type classifier (mirrors the SQL CASE from migration 356) ───────────

function classifyPageType(url: string): string {
  if (url.match(/^\/services\/[^/]+\/[^/]+\/[^/]+$/)) return 'provider'
  if (url.match(/^\/services\/[^/]+\/[^/]+$/)) return 'service×ville'
  if (url.match(/^\/services\/[^/]+$/)) return 'service'
  if (url.match(/^\/devis\/[^/]+\/[^/]+$/)) return 'devis×ville'
  if (url.match(/^\/devis\/[^/]+$/)) return 'devis'
  if (url.match(/^\/tarifs\/[^/]+\/[^/]+\/[^/]+$/)) return 'tarifs×task'
  if (url.match(/^\/tarifs\/[^/]+\/[^/]+$/)) return 'tarifs×ville'
  if (url.match(/^\/tarifs\/[^/]+$/)) return 'tarifs'
  if (url.match(/^\/avis\/[^/]+\/[^/]+$/)) return 'avis×ville'
  if (url.match(/^\/avis\/[^/]+$/)) return 'avis'
  if (url.match(/^\/urgence\/[^/]+\/[^/]+$/)) return 'urgence×ville'
  if (url.match(/^\/problemes\/[^/]+\/[^/]+$/)) return 'problemes×ville'
  if (url.match(/^\/problemes\/[^/]+$/)) return 'problemes'
  if (url.match(/^\/departements\/[^/]+\/[^/]+$/)) return 'dept×service'
  if (url.match(/^\/departements\/[^/]+$/)) return 'departement'
  if (url.match(/^\/regions\/[^/]+\/[^/]+$/)) return 'region×service'
  if (url.match(/^\/regions\/[^/]+$/)) return 'region'
  if (url.match(/^\/villes\/[^/]+$/)) return 'ville'
  if (url.startsWith('/blog/')) return 'blog'
  if (url.startsWith('/guides/')) return 'guide'
  if (url.startsWith('/barometre/')) return 'barometre'
  if (url.startsWith('/questions/')) return 'questions'
  if (url.startsWith('/comparaison/')) return 'comparaison'
  if (url.startsWith('/glossaire/')) return 'glossaire'
  return 'other'
}

// ── User-agent classifier ────────────────────────────────────────────────────

function classifyUserAgent(ua: string): string {
  if (/AdsBot-Google-Mobile/i.test(ua)) return 'AdsBot-Mobile'
  if (/AdsBot-Google/i.test(ua)) return 'AdsBot'
  if (/APIs-Google/i.test(ua)) return 'APIs-Google'
  if (/Mediapartners-Google/i.test(ua)) return 'Mediapartners'
  if (/Google-InspectionTool/i.test(ua)) return 'InspectionTool'
  if (/Googlebot-Image/i.test(ua)) return 'Googlebot-Image'
  if (/Googlebot-Video/i.test(ua)) return 'Googlebot-Video'
  if (/Googlebot-News/i.test(ua)) return 'Googlebot-News'
  if (/Mobile.*Googlebot|Googlebot.*Mobile/i.test(ua)) return 'Googlebot-Mobile'
  if (/Googlebot/i.test(ua)) return 'Googlebot-Desktop'
  return 'other'
}

// ── Core analysis functions ──────────────────────────────────────────────────

/**
 * Fetch total crawls per day for the given period.
 * Uses the existing RPC but filters to 7 days for the weekly report.
 */
export async function getCrawlsPerDay(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string
): Promise<CrawlsPerDay[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('created_at')
    .gte('created_at', since)
    .lt('created_at', until)
    .order('created_at', { ascending: true })
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getCrawlsPerDay failed', { error: error.message })
    return []
  }

  const dayCounts = new Map<string, number>()
  for (const row of data || []) {
    const day = row.created_at.slice(0, 10) // YYYY-MM-DD
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
  }

  return Array.from(dayCounts.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

/**
 * Top N most crawled pages in the period.
 */
export async function getTopCrawledPages(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string,
  limit = 50
): Promise<TopCrawledPage[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('url')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getTopCrawledPages failed', { error: error.message })
    return []
  }

  const counts = new Map<string, number>()
  for (const row of data || []) {
    counts.set(row.url, (counts.get(row.url) || 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([url, count]) => ({ url, count }))
}

/**
 * Distribution of crawls by page type (aggregated in JS using classifier).
 */
export async function getPageTypeDistribution(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string
): Promise<PageTypeDistribution[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('url')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getPageTypeDistribution failed', { error: error.message })
    return []
  }

  const counts = new Map<string, number>()
  for (const row of data || []) {
    const pt = classifyPageType(row.url)
    counts.set(pt, (counts.get(pt) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([page_type, count]) => ({ page_type, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Distribution by user-agent type (Googlebot-Mobile vs Desktop, AdsBot, etc.).
 */
export async function getUserAgentDistribution(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string
): Promise<UserAgentDistribution[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('user_agent')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getUserAgentDistribution failed', { error: error.message })
    return []
  }

  const counts = new Map<string, number>()
  for (const row of data || []) {
    const uaType = classifyUserAgent(row.user_agent)
    counts.set(uaType, (counts.get(uaType) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([user_agent_type, count]) => ({ user_agent_type, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Distribution of HTTP status codes in crawl logs.
 * Note: the middleware currently doesn't log status (column exists but is null).
 * This function handles that gracefully.
 */
export async function getStatusCodeDistribution(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string
): Promise<StatusCodeDistribution[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('status')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getStatusCodeDistribution failed', { error: error.message })
    return []
  }

  const counts = new Map<number | null, number>()
  for (const row of data || []) {
    const s = row.status ?? null
    counts.set(s, (counts.get(s) || 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Hourly distribution — at which hour (UTC) does Google crawl the most?
 */
export async function getHourlyCrawlDistribution(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string
): Promise<HourlyCrawlDistribution[]> {
  const { data, error } = await supabase
    .from('googlebot_logs')
    .select('created_at')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getHourlyCrawlDistribution failed', { error: error.message })
    return []
  }

  const hours = new Array(24).fill(0) as number[]
  for (const row of data || []) {
    const h = new Date(row.created_at).getUTCHours()
    hours[h]++
  }

  return hours.map((count, hour) => ({ hour, count }))
}

/**
 * Find pages in the sitemap that were never crawled in the period.
 * We compare against a sample of known high-priority URLs from the sitemap.
 */
export async function getNeverCrawledPages(
  supabase: ReturnType<typeof createAdminClient>,
  since: string,
  until: string,
  limit = 100
): Promise<NeverCrawledPage[]> {
  // Get distinct URLs crawled in the period
  const { data: crawledData, error } = await supabase
    .from('googlebot_logs')
    .select('url')
    .gte('created_at', since)
    .lt('created_at', until)
    .limit(100_000)

  if (error) {
    logger.warn('crawl-analysis: getNeverCrawledPages failed', { error: error.message })
    return []
  }

  const crawledUrls = new Set((crawledData || []).map((r) => r.url))

  // Get active providers to build expected service×ville URLs
  const { data: providers } = await supabase
    .from('providers')
    .select('slug, specialty, address_city')
    .eq('is_active', true)
    .eq('noindex', false)
    .limit(5000)

  const neverCrawled: NeverCrawledPage[] = []

  // Check provider profile pages
  if (providers) {
    for (const p of providers) {
      if (!p.slug || neverCrawled.length >= limit) break
      // Provider pages are /services/{service}/{ville}/{publicId} but we check slug-based
      // Check service hub pages that should be crawled
      if (p.specialty && p.address_city) {
        const serviceSlug = p.specialty
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        const citySlug = p.address_city
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        const hubUrl = `/services/${serviceSlug}/${citySlug}`
        if (!crawledUrls.has(hubUrl) && !neverCrawled.some((n) => n.url === hubUrl)) {
          neverCrawled.push({ url: hubUrl, source: 'provider-hub' })
          if (neverCrawled.length >= limit) break
        }
      }
    }
  }

  return neverCrawled
}

/**
 * Purge logs older than the specified number of days.
 * Returns the count of deleted rows.
 */
export async function purgeOldLogs(
  supabase: ReturnType<typeof createAdminClient>,
  retentionDays = 30
): Promise<number> {
  const cutoff = new Date(Date.now() - retentionDays * 86400_000).toISOString()

  const { data, error } = await supabase
    .from('googlebot_logs')
    .delete()
    .lt('created_at', cutoff)
    .select('id')

  if (error) {
    logger.warn('crawl-analysis: purgeOldLogs failed', { error: error.message })
    return 0
  }

  return data?.length ?? 0
}

/**
 * Run the full weekly analysis and return a structured report.
 */
export async function runWeeklyAnalysis(): Promise<GooglebotAnalysisReport> {
  const supabase = createAdminClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000)
  const since = sevenDaysAgo.toISOString()
  const until = now.toISOString()

  // Run all analyses in parallel for efficiency
  const [
    crawlsPerDay,
    topPages,
    pageTypeDistribution,
    userAgentDistribution,
    statusCodeDistribution,
    hourlyDistribution,
    neverCrawledSample,
    logsPurged,
  ] = await Promise.all([
    getCrawlsPerDay(supabase, since, until),
    getTopCrawledPages(supabase, since, until, 50),
    getPageTypeDistribution(supabase, since, until),
    getUserAgentDistribution(supabase, since, until),
    getStatusCodeDistribution(supabase, since, until),
    getHourlyCrawlDistribution(supabase, since, until),
    getNeverCrawledPages(supabase, since, until, 100),
    purgeOldLogs(supabase, 30),
  ])

  const totalCrawls = crawlsPerDay.reduce((sum, d) => sum + d.count, 0)

  return {
    period_start: since,
    period_end: until,
    total_crawls: totalCrawls,
    crawls_per_day: crawlsPerDay,
    top_pages: topPages,
    never_crawled_sample: neverCrawledSample,
    page_type_distribution: pageTypeDistribution,
    user_agent_distribution: userAgentDistribution,
    status_code_distribution: statusCodeDistribution,
    hourly_distribution: hourlyDistribution,
    logs_purged: logsPurged,
  }
}
