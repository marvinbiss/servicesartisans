import { createAdminClient } from '@/lib/supabase/admin'
import { getCachedData } from '@/lib/cache'
import type { CmsPage } from '@/types/cms'

/**
 * Fetch published CMS content for a given slug + type.
 * Returns null if no published record exists (caller uses hardcoded fallback).
 */
export async function getPageContent(
  slug: string,
  pageType: string,
  options?: { serviceSlug?: string; locationSlug?: string }
): Promise<CmsPage | null> {
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
    } catch {
      return null
    }
  }, 300)
}

/**
 * Fetch all published blog articles from CMS.
 */
export async function getCmsBlogArticles(): Promise<CmsPage[]> {
  return getCachedData('cms:blog:all', async () => {
    try {
      const supabase = createAdminClient()
      const { data } = await supabase
        .from('cms_pages')
        .select('*')
        .eq('page_type', 'blog')
        .eq('status', 'published')
        .eq('is_active', true)
        .order('published_at', { ascending: false })

      return (data || []) as CmsPage[]
    } catch {
      return []
    }
  }, 300)
}

/**
 * Fetch structured trade content override from CMS.
 */
export async function getTradeContentOverride(serviceSlug: string): Promise<Record<string, unknown> | null> {
  const page = await getPageContent(serviceSlug, 'service')
  if (!page?.structured_data) return null
  return page.structured_data
}
