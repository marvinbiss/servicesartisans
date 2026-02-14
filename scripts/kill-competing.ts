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

  // Kill ALL active/idle-in-transaction queries EXCEPT our CREATE INDEX and this connection
  const result = await client.query(`
    SELECT pid, state, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND state IN ('active', 'idle in transaction', 'idle in transaction (aborted)')
    AND query NOT LIKE 'CREATE INDEX IF NOT EXISTS idx_providers_specialty%'
  `)

  console.log('Processes to terminate:', result.rows.length)
  for (const row of result.rows) {
    console.log(`  PID ${row.pid} [${row.state}]: ${row.q}`)
    await client.query('SELECT pg_terminate_backend($1)', [row.pid])
  }

  console.log('\nWaiting 3s...')
  await new Promise(r => setTimeout(r, 3000))

  // Verify what's left
  const check = await client.query(`
    SELECT pid, state, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND state != 'idle'
  `)
  console.log('\nRemaining active processes:')
  if (check.rows.length === 0) console.log('  Only our CREATE INDEX (if still running)')
  check.rows.forEach(r => console.log(`  PID ${r.pid} [${r.state}]: ${r.q}`))

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
