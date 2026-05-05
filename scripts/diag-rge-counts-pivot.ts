#!/usr/bin/env npx tsx
/**
 * diag-rge-counts-pivot.ts
 * Vérifie les comptages avant/après pivot full RGE pour validation visuelle.
 */
import { supabase } from './lib/supabase-admin'

async function countSvc(slug: string) {
  const today = new Date().toISOString().slice(0, 10)
  const specMap: Record<string, string[]> = {
    electricien: ['electricien'],
    plombier: ['plombier'],
    chauffagiste: ['chauffagiste'],
    'pompe-a-chaleur': ['pompe-a-chaleur'],
    'isolation-thermique': ['isolation-thermique', 'isolation'],
  }
  const specialties = specMap[slug] ?? [slug]
  const { count: total } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .in('specialty', specialties)
    .eq('is_active', true)
  const { count: rge } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .in('specialty', specialties)
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
  return { total: total ?? 0, rge: rge ?? 0 }
}

async function main() {
  console.log('\n=== Pivot full RGE — counts avant/après ===\n')
  const today = new Date().toISOString().slice(0, 10)

  // Site total
  const { count: totalAll } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  const { count: totalRge } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
  console.log(`getSiteStats.artisanCount :`)
  console.log(`  avant (tous actifs)  : ${totalAll}`)
  console.log(`  après (RGE only)     : ${totalRge}`)
  console.log(`  ratio RGE            : ${(((totalRge ?? 0) / (totalAll ?? 1)) * 100).toFixed(1)}%`)

  console.log('\nPar service hub (/services/[s]) :')
  for (const slug of [
    'electricien',
    'plombier',
    'chauffagiste',
    'pompe-a-chaleur',
    'isolation-thermique',
  ]) {
    const c = await countSvc(slug)
    console.log(
      `  ${slug.padEnd(22)} avant=${String(c.total).padStart(7)}  après(RGE)=${String(c.rge).padStart(5)}`
    )
  }

  // Services × ville Paris (75056 + arrond + 'Paris')
  console.log('\nelectricien × Paris :')
  const cityValues = ['Paris', '75056']
  for (let i = 75101; i <= 75120; i++) cityValues.push(String(i))
  const { count: parisAll } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('specialty', 'electricien')
    .in('address_city', cityValues)
    .eq('is_active', true)
  const { count: parisRge } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('specialty', 'electricien')
    .in('address_city', cityValues)
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
  console.log(`  avant : ${parisAll}`)
  console.log(`  après : ${parisRge}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
