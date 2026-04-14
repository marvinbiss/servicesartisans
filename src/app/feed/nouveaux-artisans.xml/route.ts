import { SITE_URL, SITE_NAME } from '@/lib/seo/config'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const revalidate = 86400 // 24h

export async function GET() {
  let items = ''

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { data } = await supabase
      .from('providers')
      .select('name,slug,address_city,created_at,stable_id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      items = data
        .map(
          (p) => `    <item>
      <title>${escapeXml(p.name || 'Artisan')}</title>
      <link>${SITE_URL}/artisans/${p.slug || p.stable_id}</link>
      <guid isPermaLink="true">${SITE_URL}/artisans/${p.slug || p.stable_id}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(`${p.name} à ${p.address_city || 'France'} — Artisan référencé sur ${SITE_NAME}`)}</description>
    </item>`
        )
        .join('\n')
    }
  } catch {
    // DB unavailable — return empty feed
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Nouveaux artisans</title>
    <link>${SITE_URL}/artisans</link>
    <description>Les derniers artisans référencés sur ${escapeXml(SITE_NAME)}</description>
    <language>fr</language>
    <atom:link href="${SITE_URL}/feed/nouveaux-artisans.xml" rel="self" type="application/rss+xml" />
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
