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

  // Kill all CREATE INDEX and DO $do$ statements from previous runs
  const result = await client.query(`
    SELECT pid, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND state = 'active'
    AND pid != pg_backend_pid()
    AND (query ILIKE 'CREATE INDEX%' OR query ILIKE 'DO $do$%')
  `)

  console.log('Found', result.rows.length, 'orphaned index processes:')
  for (const row of result.rows) {
    console.log('  Killing PID', row.pid, ':', row.q)
    await client.query('SELECT pg_terminate_backend($1)', [row.pid])
  }

  console.log('\nDone. Waiting 2s for cleanup...')
  await new Promise(r => setTimeout(r, 2000))

  // Verify
  const check = await client.query(`
    SELECT pid, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND state = 'active'
    AND pid != pg_backend_pid()
    AND (query ILIKE 'CREATE INDEX%' OR query ILIKE 'DO $do$%')
  `)
  console.log('Remaining:', check.rows.length)

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
