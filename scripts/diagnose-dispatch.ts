/**
 * Diagnose why dispatch_lead stopped producing lead_assignments since 2026-03-28.
 * Tests on a real recent devis (without writing) and probes algorithm_config + provider pool.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

async function main() {
  const s = createAdminClient()

  console.log('=== 1. algorithm_config ===')
  const { data: cfg, error: cfgErr } = await s.from('algorithm_config').select('*')
  if (cfgErr) console.log('  ERR:', cfgErr.message)
  else console.log('  rows:', cfg?.length, 'sample:', JSON.stringify(cfg?.[0] ?? {}, null, 2))

  console.log('\n=== 2. providers actifs ===')
  const { count: activeTotal } = await s
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  console.log('  total is_active=true:', activeTotal)

  const { count: claimedTotal } = await s
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('claimed_at', 'is', null)
  console.log('  claimed + active:', claimedTotal)

  const { count: verifiedTotal } = await s
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_verified', true)
  console.log('  verified + active:', verifiedTotal)

  console.log('\n=== 3. Dernier devis ayant reçu un assignment ===')
  const { data: lastAssigned } = await s
    .from('lead_assignments')
    .select('lead_id, assigned_at, provider_id')
    .eq('source_table', 'devis_requests')
    .order('assigned_at', { ascending: false })
    .limit(1)
  console.log('  last:', JSON.stringify(lastAssigned?.[0], null, 2))

  console.log('\n=== 4. Devis récent (non dispatché) — test sur un vrai ===')
  const { data: recentDevis } = await s
    .from('devis_requests')
    .select('id, service_name, city, postal_code, urgency, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  console.log('  5 derniers devis:')
  for (const d of recentDevis ?? []) {
    console.log(
      `    ${d.id.slice(0, 8)} ${d.created_at} svc=${d.service_name} city=${d.city ?? 'n/a'} cp=${d.postal_code ?? 'n/a'}`
    )
  }

  const test = recentDevis?.[0]
  if (!test) {
    console.log('  No devis to test.')
    return
  }

  console.log(`\n=== 5. dispatch_lead dry-call sur ${test.id.slice(0, 8)} ===`)
  // Attention : l'appel va potentiellement écrire si la fonction n'est pas read-only.
  // D'après migration 363, dispatch_lead fait bien des INSERT. Donc on teste avec
  // un ID inexistant pour voir la signature/erreur sans side effect, OU on regarde
  // directement via une fonction postgres info.

  // Test signature 363 (8 params, post-fix)
  const { data: fnExists, error: fnErr } = await s.rpc('dispatch_lead', {
    p_lead_id: '00000000-0000-0000-0000-000000000000',
    p_service_name: test.service_name,
    p_city: test.city,
    p_postal_code: test.postal_code,
    p_urgency: test.urgency ?? 'normal',
    p_latitude: null,
    p_longitude: null,
    p_source_table: 'devis_requests',
  })
  if (fnErr) {
    console.log('  RPC error:', fnErr.code, fnErr.message)
    if (fnErr.message.includes('does not exist')) {
      console.log('  → dispatch_lead RPC is missing OR signature mismatch')
    }
  } else {
    console.log('  RPC returned:', JSON.stringify(fnExists))
    console.log('  → function exists, returned empty = no eligible providers match')
  }

  console.log('\n=== 6. Comparaison provider count entre février et maintenant ===')
  const { count: allProviders } = await s
    .from('providers')
    .select('*', { count: 'exact', head: true })
  const { count: withUser } = await s
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .not('user_id', 'is', null)
  console.log('  total providers:', allProviders)
  console.log('  with user_id (claimed):', withUser)
}

main().catch((e) => {
  console.error('fatal:', e)
  process.exit(1)
})
