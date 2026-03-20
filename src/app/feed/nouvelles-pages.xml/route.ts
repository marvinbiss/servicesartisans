import { SITE_URL, SITE_NAME } from '@/lib/seo/config'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { services, villes } from '@/lib/data/france'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export const revalidate = 86400 // 24h

export async function GET() {
  const now = new Date()
  const entries: { title: string; url: string; date: Date }[] = []

  // Blog articles (real dates)
  for (const a of allArticlesMeta) {
    entries.push({
      title: a.title,
      url: `${SITE_URL}/blog/${a.slug}`,
      date: new Date(a.date),
    })
  }

  // Recent service×ville pages (use build date as proxy)
  const recentCities = villes.slice(0, 50)
  for (const svc of services.slice(0, 8)) {
    for (const v of recentCities.slice(0, 5)) {
      entries.push({
        title: `${svc.name} à ${v.name}`,
        url: `${SITE_URL}/services/${svc.slug}/${v.slug}`,
        date: now,
      })
    }
  }

  // New providers from DB
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('providers')
      .select('name,slug,stable_id,created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      for (const p of data) {
        entries.push({
          title: p.name || 'Artisan',
          url: `${SITE_URL}/artisans/${p.slug || p.stable_id}`,
          date: new Date(p.created_at),
        })
      }
    }
  } catch {
    // DB unavailable
  }

  // Sort by date desc, take 200
  entries.sort((a, b) => b.date.getTime() - a.date.getTime())
  const top = entries.slice(0, 200)

  const items = top.map(e => `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${e.url}</link>
      <guid isPermaLink="true">${e.url}</guid>
      <pubDate>${e.date.toUTCString()}</pubDate>
    </item>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Nouvelles pages</title>
    <link>${SITE_URL}</link>
    <description>Les dernières pages publiées sur ${escapeXml(SITE_NAME)}</description>
    <language>fr</language>
    <atom:link href="${SITE_URL}/feed/nouvelles-pages.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
