/**
 * Create performance indexes on providers table via Supabase Management API
 *
 * Usage: node scripts/create-indexes.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://umjmbdbwcsxrvfqktiui.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtam1iZGJ3Y3N4cnZmcWt0aXVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY2NjQ1OCwiZXhwIjoyMDg1MjQyNDU4fQ.6hXdR5jfhCl1AA5052k3YrBmI-UMhu36mxV2IPvYxjc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('=== Creating Performance Indexes ===\n')

  // Step 1: Create a temporary exec_sql function
  console.log('1. Creating temporary exec_sql function...')

  const createFnSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `

  // We need to use the Supabase Management API (not PostgREST) to run DDL
  // Since we can't run DDL via PostgREST, let's use a migration approach
  // Try the pg_net extension or just create the function via seed

  // Actually, let's try a different approach - use the Supabase SQL Editor API
  const PROJECT_REF = 'umjmbdbwcsxrvfqktiui'

  // The Supabase Management API requires an access token from the dashboard
  // Let's try using the service role key with pg_net or dblink instead

  // Simplest approach: write a migration file and apply it
  console.log('Writing migration file...')

  const indexSQL = `
-- Performance indexes for providers table
-- These indexes dramatically speed up the service+location queries

-- Composite index: specialty + city + active (covers the main listing query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_specialty_city_active
ON providers(specialty, address_city, is_active)
WHERE is_active = true;

-- Index for stable_id lookups (artisan profile pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_providers_stable_id_active
ON providers(stable_id)
WHERE is_active = true AND stable_id IS NOT NULL;

-- Index for provider_services join
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_services_service_id
ON provider_services(service_id);

-- Index for provider_services provider lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provider_services_provider_id
ON provider_services(provider_id);
`

  console.log('\nIndex SQL to run:')
  console.log(indexSQL)

  // Try to test current query performance
  console.log('\n2. Testing current query performance...')

  const start = Date.now()
  const { data, error, count } = await supabase
    .from('providers')
    .select('id, name, stable_id', { count: 'exact' })
    .eq('specialty', 'plombier')
    .eq('address_city', 'Paris')
    .eq('is_active', true)
    .limit(5)

  const elapsed = Date.now() - start

  if (error) {
    console.log(`   Query failed (${elapsed}ms): ${error.message}`)
  } else {
    console.log(`   Query OK (${elapsed}ms): ${count} total, showing ${data?.length}:`)
    for (const p of (data || [])) {
      console.log(`   - ${p.name} (${p.stable_id})`)
    }
  }

  // Try a broader query (like the actual app does)
  console.log('\n3. Testing ilike query (like production)...')
  const start2 = Date.now()
  const { data: d2, error: e2 } = await supabase
    .from('providers')
    .select('id, name')
    .or('address_city.ilike.Paris,address_city.in.(75056,75101,75102,75103,75104,75105,75106,75107,75108,75109,75110,75111,75112,75113,75114,75115,75116,75117,75118,75119,75120)')
    .eq('is_active', true)
    .in('specialty', ['plombier'])
    .limit(25)

  const elapsed2 = Date.now() - start2
  if (e2) {
    console.log(`   Query failed (${elapsed2}ms): ${e2.message}`)
  } else {
    console.log(`   Query OK (${elapsed2}ms): ${d2?.length} results`)
    for (const p of (d2 || []).slice(0, 5)) {
      console.log(`   - ${p.name}`)
    }
  }

  console.log('\n=== NEXT STEP ===')
  console.log('Run the following SQL in Supabase Dashboard > SQL Editor:')
  console.log(indexSQL)
}

main().catch(console.error)
