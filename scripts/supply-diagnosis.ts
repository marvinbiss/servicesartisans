#!/usr/bin/env npx tsx
/**
 * Why cohort A = 0 rows? Diagnose the RGE + is_active + contact intersection.
 */
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)

async function count(filters: (q: any) => any, label: string): Promise<number> {
  let q = supa.from('providers').select('*', { count: 'exact', head: true })
  q = filters(q)
  const { count: n, error } = await q
  if (error) throw new Error(`${label}: ${error.message}`)
  console.log(`   ${label.padEnd(60)} ${n ?? 0}`)
  return n ?? 0
}

async function main() {
  console.log('🔬 Supply layer diagnosis\n')

  await count((q) => q, 'TOTAL providers')
  await count((q) => q.eq('is_active', true), 'is_active=true')
  await count((q) => q.not('rge_verified_at', 'is', null), 'has rge_verified_at')
  await count(
    (q) => q.eq('is_active', true).not('rge_verified_at', 'is', null),
    'is_active AND RGE'
  )
  await count(
    (q) => q.not('rge_verified_at', 'is', null).not('email', 'is', null),
    'RGE with email'
  )
  await count(
    (q) => q.not('rge_verified_at', 'is', null).not('phone', 'is', null),
    'RGE with phone'
  )
  await count((q) => q.not('user_id', 'is', null), 'user_id NOT NULL (claimed)')
  await count((q) => q.not('rge_qualifications', 'is', null), 'has rge_qualifications array')
  await count((q) => q.not('email', 'is', null), 'has email (all providers)')
  await count((q) => q.not('phone', 'is', null), 'has phone (all providers)')
  await count((q) => q.eq('is_active', true).not('email', 'is', null), 'is_active AND email')
  await count((q) => q.eq('is_active', true).not('phone', 'is', null), 'is_active AND phone')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
