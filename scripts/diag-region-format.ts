#!/usr/bin/env npx tsx
/**
 * diag-region-format.ts — vérifie le format `providers.address_region`.
 * Hypothèse à falsifier : DB stocke un nom ('Île-de-France') ou un code ('11').
 */
import { supabase } from './lib/supabase-admin'

async function main() {
  const { data } = await supabase
    .from('providers')
    .select('address_region')
    .eq('is_active', true)
    .not('address_region', 'is', null)
    .limit(2000)
  const dist: Record<string, number> = {}
  for (const r of data ?? []) {
    dist[r.address_region as string] = (dist[r.address_region as string] ?? 0) + 1
  }
  const top = Object.entries(dist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
  console.log('Top 30 distinct address_region values:')
  for (const [k, v] of top) {
    console.log(`  ${v.toString().padStart(4)} ${JSON.stringify(k)}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
