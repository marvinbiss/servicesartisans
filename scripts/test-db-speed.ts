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
  await client.query('SET statement_timeout = 0')
  console.log('Connected\n')

  // Test 1: Simple count
  let t = Date.now()
  const r1 = await client.query('SELECT COUNT(*) FROM providers')
  console.log(`COUNT(*): ${r1.rows[0].count} (${Date.now() - t}ms)`)

  // Test 2: Count with WHERE
  t = Date.now()
  const r2 = await client.query("SELECT COUNT(*) FROM providers WHERE specialty IS NOT NULL")
  console.log(`COUNT specialty NOT NULL: ${r2.rows[0].count} (${Date.now() - t}ms)`)

  // Test 3: Check if index specialty is being created
  t = Date.now()
  const r3 = await client.query(`
    SELECT pid, state, wait_event_type, wait_event,
           now() - query_start as duration,
           left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND state = 'active'
    AND pid != pg_backend_pid()
    AND query ILIKE '%CREATE%'
  `)
  console.log(`\nActive CREATE processes: ${r3.rows.length}`)
  r3.rows.forEach(r => {
    console.log(`  PID ${r.pid} | ${r.state} | wait: ${r.wait_event_type || '-'}/${r.wait_event || '-'} | duration: ${r.duration} | ${r.q}`)
  })

  // Test 4: Check table size
  t = Date.now()
  const r4 = await client.query(`
    SELECT pg_size_pretty(pg_total_relation_size('providers')) as total,
           pg_size_pretty(pg_relation_size('providers')) as table_only,
           pg_size_pretty(pg_indexes_size('providers')) as indexes
  `)
  console.log(`\nTable size: ${r4.rows[0].table_only} (data) + ${r4.rows[0].indexes} (indexes) = ${r4.rows[0].total} (total)`)

  // Test 5: Disk usage / IO stats
  t = Date.now()
  const r5 = await client.query(`
    SELECT heap_blks_read, heap_blks_hit, idx_blks_read, idx_blks_hit
    FROM pg_statio_user_tables WHERE relname = 'providers'
  `)
  if (r5.rows.length > 0) {
    const s = r5.rows[0]
    const hitRate = s.heap_blks_hit / (s.heap_blks_read + s.heap_blks_hit + 1)
    console.log(`Cache hit rate: ${(hitRate * 100).toFixed(1)}% (reads: ${s.heap_blks_read}, hits: ${s.heap_blks_hit})`)
  }

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
