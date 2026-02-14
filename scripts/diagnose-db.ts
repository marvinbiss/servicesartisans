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
  console.log('Connected OK\n')

  // 1. Active queries
  const r1 = await client.query(`
    SELECT pid, state, wait_event_type, wait_event, query_start,
           left(query, 120) as query_preview
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND state != 'idle'
    AND pid != pg_backend_pid()
    ORDER BY query_start
  `)
  console.log('Active queries:', r1.rows.length)
  r1.rows.forEach(r => console.log('  -', r.state, '|', r.wait_event_type || '-', '|', r.query_preview))

  // 2. Locks on providers table
  const r2 = await client.query(`
    SELECT l.mode, l.granted, a.state, left(a.query, 100) as q
    FROM pg_locks l
    JOIN pg_stat_activity a ON l.pid = a.pid
    WHERE l.relation = 'providers'::regclass
    AND l.pid != pg_backend_pid()
  `)
  console.log('\nLocks on providers:', r2.rows.length)
  r2.rows.forEach(r => console.log('  -', r.mode, '| granted:', r.granted, '|', r.state, '|', r.q))

  // 3. Quick count test
  const t1 = Date.now()
  const r3 = await client.query('SELECT COUNT(*) FROM providers')
  console.log('\nCOUNT(*):', r3.rows[0].count, `(${Date.now() - t1}ms)`)

  // 4. Existing custom indexes on providers
  const r4 = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'providers'
    AND indexname LIKE 'idx_%'
    ORDER BY indexname
  `)
  console.log('\nExisting custom indexes on providers:')
  if (r4.rows.length === 0) console.log('  (none)')
  r4.rows.forEach(r => console.log('  -', r.indexname))

  // 5. Check statement_timeout setting
  const r5 = await client.query('SHOW statement_timeout')
  console.log('\nDefault statement_timeout:', r5.rows[0].statement_timeout)

  // 6. Try SET statement_timeout = 0
  await client.query('SET statement_timeout = 0')
  const r6 = await client.query('SHOW statement_timeout')
  console.log('After SET 0:', r6.rows[0].statement_timeout)

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
