import { NextResponse } from 'next/server'
import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { allArticles, articleSlugs } from '@/lib/data/blog/articles'
import { sitemapHeaders } from '@/lib/seo/sitemap-headers'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: Request) {
  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  const recentArticles = articleSlugs
    .map((slug) => ({ slug, ...allArticles[slug] }))
    .filter((article) => new Date(article.date) >= twoDaysAgo)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const urls = recentArticles.map((article) => {
    const pubDate = new Date(article.date).toISOString().split('T')[0]
    return `  <url>
    <loc>${SITE_URL}/blog/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join('\n')}
</urlset>`

  const lastModified = recentArticles[0] ? new Date(recentArticles[0].date) : undefined

  const { notModified, responseHeaders } = sitemapHeaders(xml, request, {
    cacheControl: 'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400',
    lastModified,
  })
  if (notModified) {
    return new NextResponse(null, { status: 304, headers: responseHeaders })
  }
  return new NextResponse(xml, { headers: responseHeaders })
}
