import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

async function main() {
  const s = createAdminClient()
  const { data, error } = await s.from('lead_assignments').select('*').limit(3)
  if (error) {
    console.log('ERR:', JSON.stringify(error))
    return
  }
  console.log('rows:', data?.length)
  console.log('cols:', Object.keys(data?.[0] ?? {}).join(', '))
  console.log('sample:', JSON.stringify(data?.[0], null, 2))

  const { count: total } = await s
    .from('lead_assignments')
    .select('*', { count: 'exact', head: true })
  console.log('total rows:', total)

  const { data: bySource } = await s.from('lead_assignments').select('source_table')
  const grouped: Record<string, number> = {}
  for (const r of bySource ?? []) {
    const k = r.source_table ?? 'NULL'
    grouped[k] = (grouped[k] ?? 0) + 1
  }
  console.log('by source_table:', grouped)

  // Distribution par âge
  const { data: all } = await s
    .from('lead_assignments')
    .select('assigned_at, lead_id')
    .eq('source_table', 'devis_requests')
    .order('assigned_at', { ascending: false })
  const now = Date.now()
  const buckets = { '<=7d': 0, '8-20d': 0, '21-60d': 0, '>60d': 0 }
  for (const a of all ?? []) {
    const age = (now - new Date(a.assigned_at).getTime()) / (24 * 60 * 60 * 1000)
    if (age <= 7) buckets['<=7d']++
    else if (age <= 20) buckets['8-20d']++
    else if (age <= 60) buckets['21-60d']++
    else buckets['>60d']++
  }
  console.log('assignments by age:', buckets)
  console.log('latest assigned_at:', all?.[0]?.assigned_at)
  console.log('oldest assigned_at:', all?.[all.length - 1]?.assigned_at)
}

main().catch((e) => console.error(e))
