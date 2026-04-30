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
  const updatedIso = items[0]?.date
    ? new Date(items[0].date).toISOString()
    : new Date().toISOString()
  const feedId = `${SITE_URL}/blog/atom.xml`

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="fr-FR">',
    `  <id>${feedId}</id>`,
    `  <title>${escapeXml('Blog ServicesArtisans — Travaux, prix et rénovation')}</title>`,
    `  <subtitle>${escapeXml(`Guides, prix et conseils pour vos travaux. ${allArticlesMeta.length}+ articles vérifiés par des experts du bâtiment.`)}</subtitle>`,
    `  <updated>${updatedIso}</updated>`,
    `  <link rel="self" type="application/atom+xml" href="${SITE_URL}/blog/atom.xml" />`,
    `  <link rel="alternate" type="text/html" href="${SITE_URL}/blog" />`,
    `  <icon>${SITE_URL}/icon.svg</icon>`,
    `  <logo>${SITE_URL}/logo.png</logo>`,
    '  <rights>Creative Commons Attribution 4.0 — ServicesArtisans</rights>',
    '  <author><name>Équipe éditoriale ServicesArtisans</name>',
    `    <uri>${SITE_URL}/a-propos</uri></author>`,
    ...items.map((meta) => {
      const article = allArticles[meta.slug]
      const author = article?.author || 'Équipe éditoriale ServicesArtisans'
      const published = new Date(article?.date || meta.date).toISOString()
      const updated = new Date(article?.updatedDate || article?.date || meta.date).toISOString()
      const url = `${SITE_URL}/blog/${meta.slug}`
      return [
        '  <entry>',
        `    <id>${url}</id>`,
        `    <title>${escapeXml(meta.title)}</title>`,
        `    <link rel="alternate" type="text/html" href="${url}" />`,
        `    <published>${published}</published>`,
        `    <updated>${updated}</updated>`,
        `    <author><name>${escapeXml(author)}</name></author>`,
        `    <category term="${escapeXml(meta.category)}" />`,
        ...meta.tags.map((t) => `    <category term="${escapeXml(t)}" />`),
        `    <summary type="html"><![CDATA[${escapeCdata(meta.excerpt)}]]></summary>`,
        '  </entry>',
      ].join('\n')
    }),
    '</feed>',
  ].join('\n')

  const lastModified = items[0]?.date ? new Date(items[0].date) : undefined
  const { notModified, responseHeaders } = sitemapHeaders(xml, request, {
    cacheControl: 'public, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=604800',
    lastModified,
  })
  responseHeaders['Content-Type'] = 'application/atom+xml; charset=utf-8'
  if (notModified) return new NextResponse(null, { status: 304, headers: responseHeaders })
  return new NextResponse(xml, { headers: responseHeaders })
}
