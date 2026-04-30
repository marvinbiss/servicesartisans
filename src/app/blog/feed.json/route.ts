import { NextResponse } from 'next/server'
import { allArticles } from '@/lib/data/blog/articles'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { SITE_URL } from '@/lib/seo/config'
import { sitemapHeaders } from '@/lib/seo/sitemap-headers'

const FEED_LIMIT = 50

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(request: Request) {
  const items = allArticlesMeta.slice(0, FEED_LIMIT)

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Blog ServicesArtisans — Travaux, prix et rénovation',
    home_page_url: `${SITE_URL}/blog`,
    feed_url: `${SITE_URL}/blog/feed.json`,
    description: `Guides, prix et conseils pour vos travaux. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`,
    icon: `${SITE_URL}/icon.svg`,
    favicon: `${SITE_URL}/favicon.png`,
    language: 'fr-FR',
    authors: [
      {
        name: 'Équipe éditoriale ServicesArtisans',
        url: `${SITE_URL}/a-propos`,
      },
    ],
    items: items.map((meta) => {
      const article = allArticles[meta.slug]
      const author = article?.author || 'Équipe éditoriale ServicesArtisans'
      const url = `${SITE_URL}/blog/${meta.slug}`
      return {
        id: url,
        url,
        title: meta.title,
        summary: meta.excerpt,
        content_text: meta.excerpt,
        date_published: new Date(article?.date || meta.date).toISOString(),
        ...(article?.updatedDate
          ? { date_modified: new Date(article.updatedDate).toISOString() }
          : {}),
        authors: [{ name: author }],
        tags: meta.tags,
        language: 'fr-FR',
      }
    }),
  }

  const body = JSON.stringify(feed)
  const lastModified = items[0]?.date ? new Date(items[0].date) : undefined
  const { notModified, responseHeaders } = sitemapHeaders(body, request, {
    cacheControl: 'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=604800',
    lastModified,
  })
  responseHeaders['Content-Type'] = 'application/feed+json; charset=utf-8'
  if (notModified) return new NextResponse(null, { status: 304, headers: responseHeaders })
  return new NextResponse(body, { headers: responseHeaders })
}
