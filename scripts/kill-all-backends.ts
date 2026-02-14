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

  // Kill ALL non-system active backends (except ours)
  const result = await client.query(`
    SELECT pid, state, usename, left(query, 100) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND usename = 'postgres'
    AND state != 'idle'
  `)

  console.log('Active backends to kill:', result.rows.length)
  for (const row of result.rows) {
    console.log('  PID', row.pid, '|', row.state, '|', row.q)
    try {
      await client.query('SELECT pg_terminate_backend($1)', [row.pid])
      console.log('    -> terminated')
    } catch (e: any) {
      console.log('    -> error:', e.message)
    }
  }

  await new Promise(r => setTimeout(r, 3000))

  // Verify
  const check = await client.query(`
    SELECT pid, state, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND state != 'idle'
  `)
  console.log('\nStill active after cleanup:', check.rows.length)
  check.rows.forEach(r => console.log('  PID', r.pid, '|', r.state, '|', r.q))

  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
