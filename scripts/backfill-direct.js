const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.umjmbdbwcsxrvfqktiui',
  password: 'Bulgarie93@',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('Connected!');

  let total = 0;
  let round = 0;
  let errors = 0;

  while (true) {
    round++;
    try {
      const r = await client.query(
        "UPDATE providers SET stable_id = substr(md5(id::text || 'sa-2025'), 1, 16) WHERE id IN (SELECT id FROM providers WHERE stable_id IS NULL ORDER BY id LIMIT 500)"
      );
      total += r.rowCount;
      if (round % 20 === 0 || r.rowCount === 0) {
        console.log('Round ' + round + ': Total ' + total + ' (' + errors + ' errors)');
      }
      if (r.rowCount === 0) break;
    } catch (e) {
      errors++;
      console.log('Round ' + round + ' error: ' + e.message);
      // Reconnect on fatal errors
      try { await client.end(); } catch {}
      await new Promise(r => setTimeout(r, 3000));
      try {
        await client.connect();
        console.log('Reconnected');
      } catch (e2) {
        console.log('Reconnect failed: ' + e2.message);
        break;
      }
    }
  }

  console.log('Done! ' + total + ' stable_ids generated, ' + errors + ' errors');
  await client.end();
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
