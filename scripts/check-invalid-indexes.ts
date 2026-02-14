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
  console.log('Connected\n')

  // Check for invalid indexes
  const r1 = await client.query(`
    SELECT c.relname, i.indisvalid, i.indisready
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    WHERE NOT i.indisvalid
    OR NOT i.indisready
  `)
  console.log('Invalid/not-ready indexes:', r1.rows.length)
  r1.rows.forEach(r => console.log('  ', r.relname, '| valid:', r.indisvalid, '| ready:', r.indisready))

  // Check for any lock waits
  const r2 = await client.query(`
    SELECT blocked_locks.pid AS blocked_pid,
           blocked_activity.query AS blocked_query,
           blocking_locks.pid AS blocking_pid,
           blocking_activity.query AS blocking_query
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks
        ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
    WHERE NOT blocked_locks.granted
  `)
  console.log('\nBlocking lock chains:', r2.rows.length)
  r2.rows.forEach(r => {
    console.log(`  Blocked PID ${r.blocked_pid}: ${r.blocked_query?.slice(0, 60)}`)
    console.log(`    <- by PID ${r.blocking_pid}: ${r.blocking_query?.slice(0, 60)}`)
  })

  // Active processes with duration
  const r3 = await client.query(`
    SELECT pid, state, now() - query_start as duration,
           wait_event_type, wait_event,
           left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND state = 'active'
    AND pid != pg_backend_pid()
    ORDER BY query_start
  `)
  console.log('\nActive queries:')
  r3.rows.forEach(r => {
    console.log(`  PID ${r.pid} | ${r.duration} | wait: ${r.wait_event_type || '-'}/${r.wait_event || '-'} | ${r.q}`)
  })

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
