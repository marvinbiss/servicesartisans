import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/seo/config'

const PROVIDER_BATCH_SIZE = 40_000

export async function GET() {
  // Static sitemap IDs (must match generateSitemaps() in app/sitemap.ts)
  const ids: string[] = ['static', 'service-cities', 'cities', 'geo', 'quartiers']

  // Determine provider batches dynamically
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('noindex', false)

    if (!error && count && count > 0) {
      const batchCount = Math.ceil(count / PROVIDER_BATCH_SIZE)
      for (let i = 0; i < batchCount; i++) {
        ids.push(`providers-${i}`)
      }
    }
  } catch {
    // DB unavailable — only static sitemaps in the index
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ids.map(
      (id) => `  <sitemap><loc>${SITE_URL}/sitemap/${id}.xml</loc></sitemap>`
    ),
    '</sitemapindex>',
  ].join('\n')

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
