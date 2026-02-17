import { SITE_URL } from '@/lib/seo/config'
import { generateSitemaps } from '../sitemap'

/**
 * Manual sitemap index — Next.js 14.2 with generateSitemaps() does not
 * always produce a /sitemap.xml index automatically. This route handler
 * fills that gap so Google and other crawlers can discover all sub-sitemaps.
 */
export async function GET() {
  const sitemaps = await generateSitemaps()
  const baseUrl = SITE_URL.trim().replace(/\/+$/, '')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map(
      ({ id }) =>
        `  <sitemap><loc>${baseUrl}/sitemap/${id}.xml</loc></sitemap>`
    ),
    `  <sitemap><loc>${baseUrl}/news-sitemap.xml</loc></sitemap>`,
    '</sitemapindex>',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
