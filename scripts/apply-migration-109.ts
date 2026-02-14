/**
 * Applique la migration 109 directement via connexion PostgreSQL
 * Stratégie: tue les processus orphelins, puis crée chaque objet un par un.
 * Usage: npx tsx scripts/apply-migration-109.ts
 */

import pg from 'pg'

const { Client } = pg

async function createClient(): Promise<InstanceType<typeof Client>> {
  const client = new Client({
    host: 'db.umjmbdbwcsxrvfqktiui.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Bulgarie93@',
    ssl: { rejectUnauthorized: false },
  })
  // Prevent unhandled 'error' event crash on connection drop
  client.on('error', () => {})
  await client.connect()
  await client.query('SET statement_timeout = 0')
  await client.query('SET lock_timeout = 0')
  return client
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const statements = [
  // --- INDEX CRITIQUES (les plus importants pour le build) ---
  {
    label: 'Index specialty',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_specialty ON providers (specialty) WHERE specialty IS NOT NULL`,
  },
  {
    label: 'Index specialty + city',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_specialty_city_active ON providers (specialty, address_city) WHERE is_active = TRUE`,
  },
  {
    label: 'Index dept + specialty',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_dept_specialty ON providers (address_department, specialty) WHERE is_active = TRUE`,
  },
  {
    label: 'Index dept + artisan',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_dept_artisan ON providers (address_department) WHERE is_artisan = TRUE AND is_active = TRUE`,
  },
  {
    label: 'Index sitemap',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_sitemap ON providers (updated_at DESC) WHERE is_active = TRUE`,
  },
  {
    label: 'Index city + rating',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_city_rating ON providers (address_city, rating_average DESC NULLS LAST) WHERE is_active = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL`,
  },
  {
    label: 'Index quality zero',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_quality_zero ON providers (id) WHERE data_quality_score = 0 AND is_artisan = TRUE`,
  },
  {
    label: 'Index radiated',
    sql: `CREATE INDEX IF NOT EXISTS idx_providers_radiated ON providers (date_radiation) WHERE date_radiation IS NOT NULL`,
  },
  // --- UNICITE SIREN / SIRET ---
  {
    label: 'Unique SIREN',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_providers_siren_unique') THEN CREATE UNIQUE INDEX idx_providers_siren_unique ON providers (siren) WHERE siren IS NOT NULL AND siren != ''; END IF; END $do$`,
  },
  {
    label: 'Unique SIRET',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_providers_siret_unique') THEN CREATE UNIQUE INDEX idx_providers_siret_unique ON providers (siret) WHERE siret IS NOT NULL AND siret != ''; END IF; END $do$`,
  },
  // --- VUES MATERIALISEES ---
  {
    label: 'Vue mat. artisan_counts_by_dept',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_dept AS
      SELECT address_department AS department, specialty,
        COUNT(*)::INTEGER AS artisan_count,
        COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
        ROUND(AVG(rating_average)::numeric, 1) AS avg_rating,
        SUM(review_count)::INTEGER AS total_reviews
      FROM providers WHERE is_active = TRUE AND address_department IS NOT NULL AND specialty IS NOT NULL
      GROUP BY address_department, specialty WITH DATA`,
  },
  {
    label: 'Index unique mv_dept_spec',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_dept_spec ON mv_artisan_counts_by_dept (department, specialty)`,
  },
  {
    label: 'Vue mat. artisan_counts_by_city',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_city AS
      SELECT address_city AS city, address_department AS department,
        COUNT(*)::INTEGER AS artisan_count,
        COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
        COUNT(DISTINCT specialty)::INTEGER AS specialty_count,
        ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
      FROM providers WHERE is_active = TRUE AND address_city IS NOT NULL
      GROUP BY address_city, address_department WITH DATA`,
  },
  {
    label: 'Index unique mv_city_dept',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_city_dept ON mv_artisan_counts_by_city (city, department)`,
  },
  {
    label: 'Index mv_city_count',
    sql: `CREATE INDEX IF NOT EXISTS idx_mv_artisan_counts_city_count ON mv_artisan_counts_by_city (artisan_count DESC)`,
  },
  {
    label: 'Vue mat. artisan_counts_by_region',
    sql: `CREATE MATERIALIZED VIEW IF NOT EXISTS mv_artisan_counts_by_region AS
      SELECT address_region AS region,
        COUNT(*)::INTEGER AS artisan_count,
        COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS verified_count,
        COUNT(DISTINCT specialty)::INTEGER AS specialty_count,
        COUNT(DISTINCT address_department)::INTEGER AS dept_count,
        COUNT(DISTINCT address_city)::INTEGER AS city_count,
        ROUND(AVG(rating_average)::numeric, 1) AS avg_rating
      FROM providers WHERE is_active = TRUE AND address_region IS NOT NULL
      GROUP BY address_region WITH DATA`,
  },
  {
    label: 'Index unique mv_region',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_artisan_counts_region ON mv_artisan_counts_by_region (region)`,
  },
  // --- FONCTION REFRESH ---
  {
    label: 'Fonction refresh_artisan_stats()',
    sql: `CREATE OR REPLACE FUNCTION refresh_artisan_stats() RETURNS VOID AS $fn$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_dept;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_city;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_artisan_counts_by_region;
      END; $fn$ LANGUAGE plpgsql SECURITY DEFINER`,
  },
  // --- VUE STATS PUBLIQUES ---
  {
    label: 'Vue v_public_stats',
    sql: `CREATE OR REPLACE VIEW v_public_stats AS
      SELECT COUNT(*)::INTEGER AS total_artisans,
        COUNT(*) FILTER (WHERE is_verified = TRUE)::INTEGER AS total_verified,
        COUNT(*) FILTER (WHERE is_artisan = TRUE)::INTEGER AS total_artisans_cma,
        COUNT(DISTINCT address_department)::INTEGER AS total_departments,
        COUNT(DISTINCT address_city)::INTEGER AS total_cities,
        COUNT(DISTINCT specialty)::INTEGER AS total_specialties,
        ROUND(AVG(rating_average)::numeric, 1) AS avg_rating,
        SUM(review_count)::INTEGER AS total_reviews
      FROM providers WHERE is_active = TRUE`,
  },
  // --- GRANT ---
  {
    label: 'GRANT SELECT sur vues mat. dept',
    sql: `GRANT SELECT ON mv_artisan_counts_by_dept TO anon, authenticated`,
  },
  {
    label: 'GRANT SELECT sur vues mat. city',
    sql: `GRANT SELECT ON mv_artisan_counts_by_city TO anon, authenticated`,
  },
  {
    label: 'GRANT SELECT sur vues mat. region',
    sql: `GRANT SELECT ON mv_artisan_counts_by_region TO anon, authenticated`,
  },
  {
    label: 'GRANT SELECT sur vue public stats',
    sql: `GRANT SELECT ON v_public_stats TO anon, authenticated`,
  },
  // --- CONTRAINTES CHECK ---
  {
    label: 'CHECK data_quality_score 0-100',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_data_quality_score_range') THEN ALTER TABLE providers ADD CONSTRAINT providers_data_quality_score_range CHECK (data_quality_score >= 0 AND data_quality_score <= 100); END IF; END $do$`,
  },
  {
    label: 'CHECK rating_average 0-5',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_rating_average_range') THEN ALTER TABLE providers ADD CONSTRAINT providers_rating_average_range CHECK (rating_average IS NULL OR (rating_average >= 0 AND rating_average <= 5)); END IF; END $do$`,
  },
  {
    label: 'CHECK review_count >= 0',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_review_count_positive') THEN ALTER TABLE providers ADD CONSTRAINT providers_review_count_positive CHECK (review_count IS NULL OR review_count >= 0); END IF; END $do$`,
  },
  {
    label: 'CHECK SIREN format 9 chiffres',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_siren_format') THEN ALTER TABLE providers ADD CONSTRAINT providers_siren_format CHECK (siren IS NULL OR siren = '' OR siren ~ '^\\d{9}$'); END IF; END $do$`,
  },
  {
    label: 'CHECK SIRET format 14 chiffres',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_siret_format') THEN ALTER TABLE providers ADD CONSTRAINT providers_siret_format CHECK (siret IS NULL OR siret = '' OR siret ~ '^\\d{14}$'); END IF; END $do$`,
  },
  {
    label: 'CHECK SIRET commence par SIREN',
    sql: `DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'providers_siret_starts_with_siren') THEN ALTER TABLE providers ADD CONSTRAINT providers_siret_starts_with_siren CHECK (siren IS NULL OR siret IS NULL OR siren = '' OR siret = '' OR left(siret, 9) = siren); END IF; END $do$`,
  },
  // --- ANALYZE ---
  {
    label: 'ANALYZE providers',
    sql: `ANALYZE providers`,
  },
]

async function main() {
  console.log('=== Migration 109 — Application directe ===\n')

  // Step 1: Kill orphan CREATE INDEX / MATERIALIZED VIEW processes
  console.log('Phase 1: Nettoyage des processus orphelins...')
  const cleanup = await createClient()
  const orphans = await cleanup.query(`
    SELECT pid, left(query, 80) as q
    FROM pg_stat_activity
    WHERE datname = 'postgres'
    AND pid != pg_backend_pid()
    AND state = 'active'
    AND (query ILIKE 'CREATE INDEX%' OR query ILIKE 'CREATE MATERIALIZED%' OR query ILIKE 'DO $do$%')
  `)
  if (orphans.rows.length > 0) {
    for (const row of orphans.rows) {
      console.log(`  Terminate PID ${row.pid}: ${row.q}`)
      await cleanup.query('SELECT pg_terminate_backend($1)', [row.pid])
    }
    console.log(`  ${orphans.rows.length} processus termines, attente 5s...\n`)
    await new Promise(r => setTimeout(r, 5000))
  } else {
    console.log('  Aucun processus orphelin\n')
  }
  await cleanup.end()

  // Step 2: Create each object one by one with a fresh connection each time
  console.log('Phase 2: Creation des objets (un par un)...\n')

  let success = 0
  let errors = 0
  let skipped = 0

  for (const stmt of statements) {
    const idx = success + errors + skipped + 1
    let done = false
    let retries = 0
    const MAX_RETRIES = 3

    while (!done && retries <= MAX_RETRIES) {
      if (retries > 0) {
        console.log(`    Retry ${retries}/${MAX_RETRIES} apres 10s...`)
        await sleep(10000)
      }
      process.stdout.write(`  [${idx}/${statements.length}] ${stmt.label}... `)
      const start = Date.now()

      let client: InstanceType<typeof Client> | null = null
      try {
        client = await createClient()
        await client.query(stmt.sql)
        const ms = Date.now() - start
        console.log(`OK (${Math.round(ms / 1000)}s)`)
        success++
        done = true
      } catch (err: any) {
        const ms = Date.now() - start
        if (err.message.includes('already exists')) {
          console.log(`DEJA EXISTANT (${Math.round(ms / 1000)}s)`)
          skipped++
          done = true
        } else if (err.code === 'ECONNRESET' || err.message.includes('ECONNRESET') || err.message.includes('connection')) {
          console.log(`DECONNEXION (${Math.round(ms / 1000)}s)`)
          retries++
          if (retries > MAX_RETRIES) {
            console.log(`    Abandon apres ${MAX_RETRIES} tentatives`)
            errors++
            done = true
          }
        } else {
          console.log(`ERREUR (${Math.round(ms / 1000)}s): ${err.message}`)
          errors++
          done = true
        }
      } finally {
        if (client) {
          try { await client.end() } catch { /* ignore */ }
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`  Termine: ${success} crees, ${skipped} existants, ${errors} erreurs`)
  console.log(`${'='.repeat(50)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
