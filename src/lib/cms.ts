import { createAdminClient } from '@/lib/supabase/admin'
import { getCachedData, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import type { CmsPage, CmsPageType } from '@/types/cms'

/**
 * Fetch published CMS content for a given slug + type.
 * Returns null if no published record exists (caller uses hardcoded fallback).
 * Does NOT cache null results — only successful fetches are cached.
 */
export async function getPageContent(
  slug: string,
  pageType: CmsPageType,
  options?: { serviceSlug?: string; locationSlug?: string }
): Promise<CmsPage | null> {
  if (!slug) return null

  const cacheKey = `cms:${pageType}:${slug}:${options?.serviceSlug ?? ''}:${options?.locationSlug ?? ''}`

  return getCachedData(cacheKey, async () => {
    try {
      const supabase = createAdminClient()
      const query = supabase
        .from('cms_pages')
        .select('*')
        .eq('slug', slug)
        .eq('page_type', pageType)
        .eq('status', 'published')
        .eq('is_active', true)

      if (options?.serviceSlug) {
        query.eq('service_slug', options.serviceSlug)
      }
      if (options?.locationSlug) {
        query.eq('location_slug', options.locationSlug)
      }

      const { data, error } = await query.single()
      if (error || !data) return null
      return data as CmsPage
    } catch (err) {
      logger.error('[CMS] getPageContent error', err as Error)
      return null
    }
  }, CACHE_TTL.cms, { skipNull: true })
}

/**
 * Fetch all published blog articles from CMS.
 */
export async function getCmsBlogArticles(): Promise<CmsPage[]> {
  return getCachedData('cms:blog:all', async () => {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('page_type', 'blog')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('published_at', { ascending: false })

      if (error) {
        logger.error('[CMS] getCmsBlogArticles error', error)
        return []
      }
      return (data || []) as CmsPage[]
    } catch (err) {
      logger.error('[CMS] getCmsBlogArticles error', err as Error)
      return []
    }
  }, CACHE_TTL.cms, { skipNull: true })
}

/**
 * Fetch structured trade content override from CMS.
 */
export async function getTradeContentOverride(serviceSlug: string): Promise<Record<string, unknown> | null> {
  const page = await getPageContent(serviceSlug, 'service')
  if (!page?.structured_data) return null
  return page.structured_data
}
