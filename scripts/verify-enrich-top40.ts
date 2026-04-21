import { createClient } from '@supabase/supabase-js'
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
)
const TOP = [
  'marseille',
  'lyon',
  'athis-mons',
  'nantes',
  'maubeuge',
  'montauban',
  'macon',
  'cholet',
  'caussade',
  'cannes',
  'poitiers',
  'orleans',
  'besancon',
  'la-ciotat',
  'lorient',
  'dijon',
  'darnetal',
  'nimes',
  'albi',
  'ajaccio',
  'le-havre',
  'perpignan',
  'verdun',
  'castelsarrasin',
  'arras',
  'vannes',
  'toulouse',
  'valenciennes',
  'fonsorbes',
  'toulon',
  'cancale',
  'le-muy',
  'annecy',
  'savigny-le-temple',
  'douarnenez',
]
;(async () => {
  const { data } = await s
    .from('communes')
    .select(
      'slug,prix_m2_moyen,pct_passoires_dpe,risque_argile,zone_sismique,risque_inondation,risque_radon,gentile,description,nb_artisans_btp,revenu_median,climat_zone'
    )
    .in('slug', TOP)
  const totalFilled: Record<string, number> = {}
  const cols = [
    'prix_m2_moyen',
    'pct_passoires_dpe',
    'risque_argile',
    'zone_sismique',
    'risque_inondation',
    'risque_radon',
    'gentile',
    'description',
    'nb_artisans_btp',
    'revenu_median',
    'climat_zone',
  ]
  for (const r of data || []) {
    let filled = 0
    const miss: string[] = []
    for (const c of cols) {
      const v = (r as Record<string, unknown>)[c]
      if (v === null || v === undefined || v === '' || v === 0) miss.push(c)
      else filled++
    }
    const status = filled >= 9 ? '✅' : filled >= 6 ? '🟡' : '🔴'
    console.log(
      `${status} ${(r as { slug: string }).slug.padEnd(22)} ${filled}/${cols.length} ${miss.length ? '(miss: ' + miss.join(',') + ')' : ''}`
    )
    for (const c of cols) {
      if ((r as Record<string, unknown>)[c] != null) totalFilled[c] = (totalFilled[c] || 0) + 1
    }
  }
  console.log('\nGlobal per-column fill (out of', data?.length, 'villes):')
  for (const [c, n] of Object.entries(totalFilled).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c.padEnd(25)} ${n}/${data?.length}`)
  }
})()
