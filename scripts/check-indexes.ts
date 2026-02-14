import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'db.umjmbdbwcsxrvfqktiui.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Bulgarie93@',
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()

  // Check indexes
  const r1 = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'providers'
    ORDER BY indexname
  `)
  console.log('=== INDEXES ON providers ===')
  r1.rows.forEach(r => console.log('  ', r.indexname))

  // Check materialized views
  const r2 = await client.query(`
    SELECT matviewname FROM pg_matviews WHERE schemaname = 'public' ORDER BY matviewname
  `)
  console.log('\n=== MATERIALIZED VIEWS ===')
  if (r2.rows.length === 0) console.log('  (none)')
  r2.rows.forEach(r => console.log('  ', r.matviewname))

  // Check constraints
  const r3 = await client.query(`
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'providers'::regclass
    AND conname LIKE 'providers_%'
    ORDER BY conname
  `)
  console.log('\n=== CONSTRAINTS ON providers ===')
  r3.rows.forEach(r => console.log('  ', r.conname))

  // Check views
  const r4 = await client.query(`
    SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'v_%'
  `)
  console.log('\n=== VIEWS ===')
  if (r4.rows.length === 0) console.log('  (none)')
  r4.rows.forEach(r => console.log('  ', r.viewname))

  // Check functions
  const r5 = await client.query(`
    SELECT proname FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
    AND proname = 'refresh_artisan_stats'
  `)
  console.log('\n=== FUNCTION refresh_artisan_stats ===')
  console.log('  ', r5.rows.length > 0 ? 'EXISTS' : 'MISSING')

  // Other table indexes
  const r6 = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename IN ('import_jobs', 'provider_financials')
    AND indexname LIKE 'idx_%'
    ORDER BY indexname
  `)
  console.log('\n=== OTHER TABLE INDEXES ===')
  if (r6.rows.length === 0) console.log('  (none)')
  r6.rows.forEach(r => console.log('  ', r.indexname))

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
