import { NextResponse } from 'next/server'
import { allArticles } from '@/lib/data/blog/articles'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { SITE_URL } from '@/lib/seo/config'
import { sitemapHeaders } from '@/lib/seo/sitemap-headers'

const FEED_LIMIT = 50

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function escapeCdata(s: string): string {
  return s.replace(/]]>/g, ']]]]><![CDATA[>')
}

export const dynamic = 'force-static'
export const revalidate = 3600

export async function GET(request: Request) {
  const items = allArticlesMeta.slice(0, FEED_LIMIT)
  const lastBuildIso = items[0]?.date
    ? new Date(items[0].date).toUTCString()
    : new Date().toUTCString()

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${escapeXml('Blog ServicesArtisans — Travaux, prix et rénovation')}</title>`,
    `    <link>${SITE_URL}/blog</link>`,
    `    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />`,
    `    <description>${escapeXml(`Guides, prix et conseils pour vos travaux. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`)}</description>`,
    '    <language>fr-FR</language>',
    `    <lastBuildDate>${lastBuildIso}</lastBuildDate>`,
    '    <copyright>Creative Commons Attribution 4.0 — ServicesArtisans</copyright>',
    `    <generator>ServicesArtisans Feed v1</generator>`,
    `    <image><url>${SITE_URL}/logo.png</url><title>ServicesArtisans</title><link>${SITE_URL}/blog</link></image>`,
    ...items.map((meta) => {
      const article = allArticles[meta.slug]
      const author = article?.author || 'Équipe éditoriale ServicesArtisans'
      const pubDate = new Date(article?.date || meta.date).toUTCString()
      const url = `${SITE_URL}/blog/${meta.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(meta.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <dc:creator><![CDATA[${escapeCdata(author)}]]></dc:creator>`,
        `      <category>${escapeXml(meta.category)}</category>`,
        `      <description><![CDATA[${escapeCdata(meta.excerpt)}]]></description>`,
        '    </item>',
      ].join('\n')
    }),
    '  </channel>',
    '</rss>',
  ].join('\n')

  const lastModified = items[0]?.date ? new Date(items[0].date) : undefined
  const { notModified, responseHeaders } = sitemapHeaders(xml, request, {
    cacheControl: 'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=604800',
    lastModified,
  })
  responseHeaders['Content-Type'] = 'application/rss+xml; charset=utf-8'
  if (notModified) return new NextResponse(null, { status: 304, headers: responseHeaders })
  return new NextResponse(xml, { headers: responseHeaders })
}
