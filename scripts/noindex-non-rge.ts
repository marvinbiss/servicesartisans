/**
 * Stratégie SEO RGE-only : passe en noindex toutes les fiches providers
 * non-RGE et non-revendiquées. Garde indexables uniquement les fiches
 * avec RGE actif OU revendiquées (claimed_at IS NOT NULL).
 *
 * Cible attendue : ~919 544 fiches passées en noindex, ~50 347 conservées.
 * Batch 5000 lignes, statement_timeout = 0 (illimité, bypass Supabase pooler),
 * lock_timeout = 30s pour éviter blocage infini sur DDL concurrent.
 *
 * Idempotence : les WHERE clauses filtrent sur `noindex = false` (phase 2) et
 * `noindex = true` (phase 3), donc relancer le script n'entraîne aucun
 * double-pass — les batchs remontent 0 rows et la boucle se termine proprement.
 *
 * Graceful shutdown : SIGINT/SIGTERM posent un flag `shouldStop` qui casse la
 * boucle entre deux batchs et ferme la connexion Postgres via try/finally.
 *
 * Flags CLI :
 *   --dry-run : n'exécute aucun UPDATE, remonte uniquement les counts via SELECT
 */
import { Client } from 'pg'

function buildPgUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const password = process.env.SUPABASE_DB_PASSWORD
  if (!supabaseUrl || !password) {
    console.error('Missing DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL+SUPABASE_DB_PASSWORD')
    process.exit(1)
  }
  // Extract project ref: https://<ref>.supabase.co → <ref>
  const match = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    console.error('Cannot extract project ref from NEXT_PUBLIC_SUPABASE_URL')
    process.exit(1)
  }
  const ref = match[1]
  // Direct connection (not pooler) for long-running batch UPDATEs
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

const PG_URL = buildPgUrl()
const BATCH_SIZE = 5000
const DRY_RUN = process.argv.includes('--dry-run')

let shouldStop = false

function formatEta(secondsRemaining: number): string {
  if (!Number.isFinite(secondsRemaining) || secondsRemaining <= 0) return 'n/a'
  const m = Math.floor(secondsRemaining / 60)
  const s = Math.floor(secondsRemaining % 60)
  return `${m}m${s.toString().padStart(2, '0')}s`
}

async function run() {
  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await client.query('SET statement_timeout = 0')
    await client.query("SET lock_timeout = '30s'")

    if (DRY_RUN) {
      console.log('*** DRY-RUN MODE : aucun UPDATE ne sera exécuté ***\n')
    }

    // Phase 1 — diagnostic avant
    const before = await client.query(`
      SELECT
        count(*) FILTER (WHERE noindex = false) AS indexables_before,
        count(*) FILTER (WHERE noindex = true)  AS noindex_before,
        count(*) AS total
      FROM providers
      WHERE is_active = true
    `)
    console.log('AVANT :', before.rows[0])

    const scriptStart = Date.now()

    // Phase 2 — non-RGE non-claim → noindex = true
    console.log('\n--- Phase 2 : noindex non-RGE non-claim ---')
    let totalNoindexed = 0

    if (DRY_RUN) {
      const preview = await client.query(`
        SELECT count(*) AS cible
        FROM providers
        WHERE is_active = true
          AND noindex = false
          AND (rge_valid_until IS NULL OR rge_valid_until < CURRENT_DATE)
          AND claimed_at IS NULL
      `)
      totalNoindexed = Number(preview.rows[0].cible)
      console.log(`  [dry-run] cible phase 2 : ${totalNoindexed} rows`)
    } else {
      let batch = 0
      while (!shouldStop) {
        batch++
        const t0 = Date.now()
        const result = await client.query(`
          WITH cible AS (
            SELECT id FROM providers
            WHERE is_active = true
              AND noindex = false
              AND (rge_valid_until IS NULL OR rge_valid_until < CURRENT_DATE)
              AND claimed_at IS NULL
            LIMIT ${BATCH_SIZE}
            FOR UPDATE SKIP LOCKED
          )
          UPDATE providers p
          SET noindex = true
          FROM cible
          WHERE p.id = cible.id
        `)
        const elapsed = Date.now() - t0
        const rows = result.rowCount ?? 0
        totalNoindexed += rows
        const elapsedSec = Math.max(0.001, (Date.now() - scriptStart) / 1000)
        const rowsPerSec = totalNoindexed / elapsedSec
        console.log(
          `  batch ${batch}: ${rows} rows en ${elapsed}ms (cumul ${totalNoindexed}, ${rowsPerSec.toFixed(0)} rows/s)`
        )
        if (rows === 0) break
      }
      if (shouldStop) {
        console.log('  → interruption demandée (SIGINT/SIGTERM), phase 2 arrêtée proprement')
      }
    }

    // Phase 3 — RGE actifs OU claim → noindex = false (restauration)
    console.log('\n--- Phase 3 : index RGE actifs OU revendiqués ---')
    let totalIndexed = 0

    if (DRY_RUN) {
      const preview = await client.query(`
        SELECT count(*) AS cible
        FROM providers
        WHERE is_active = true
          AND noindex = true
          AND (rge_valid_until >= CURRENT_DATE OR claimed_at IS NOT NULL)
      `)
      totalIndexed = Number(preview.rows[0].cible)
      console.log(`  [dry-run] cible phase 3 : ${totalIndexed} rows`)
    } else if (!shouldStop) {
      let batch = 0
      const phase3Start = Date.now()
      while (!shouldStop) {
        batch++
        const t0 = Date.now()
        const result = await client.query(`
          WITH cible AS (
            SELECT id FROM providers
            WHERE is_active = true
              AND noindex = true
              AND (rge_valid_until >= CURRENT_DATE OR claimed_at IS NOT NULL)
            LIMIT ${BATCH_SIZE}
            FOR UPDATE SKIP LOCKED
          )
          UPDATE providers p
          SET noindex = false
          FROM cible
          WHERE p.id = cible.id
        `)
        const elapsed = Date.now() - t0
        const rows = result.rowCount ?? 0
        totalIndexed += rows
        const elapsedSec = Math.max(0.001, (Date.now() - phase3Start) / 1000)
        const rowsPerSec = totalIndexed / elapsedSec
        console.log(
          `  batch ${batch}: ${rows} rows en ${elapsed}ms (cumul ${totalIndexed}, ${rowsPerSec.toFixed(0)} rows/s)`
        )
        if (rows === 0) break
      }
      if (shouldStop) {
        console.log('  → interruption demandée (SIGINT/SIGTERM), phase 3 arrêtée proprement')
      }
    }

    // Phase 4 — diagnostic après
    const after = await client.query(`
      SELECT
        count(*) FILTER (WHERE noindex = false) AS indexables_after,
        count(*) FILTER (WHERE noindex = true)  AS noindex_after,
        count(*) FILTER (WHERE noindex = false AND rge_valid_until >= CURRENT_DATE) AS index_rge_actif,
        count(*) FILTER (WHERE noindex = false AND claimed_at IS NOT NULL) AS index_claim,
        count(*) AS total
      FROM providers
      WHERE is_active = true
    `)
    console.log('\nAPRES :', after.rows[0])

    const totalElapsedSec = (Date.now() - scriptStart) / 1000
    console.log(
      `\nResume (${DRY_RUN ? 'dry-run' : 'write'}) — total ${formatEta(totalElapsedSec)} :`
    )
    console.log(`  - Passes en noindex : ${totalNoindexed}`)
    console.log(`  - Passes en index   : ${totalIndexed}`)
    if (shouldStop) {
      console.log('  - Statut : interrompu avant la fin (exit code 130)')
    }
  } finally {
    try {
      await client.end()
    } catch (endErr) {
      console.error('client.end() failed:', endErr)
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n[SIGINT] arrêt propre demandé, attente fin du batch en cours…')
  shouldStop = true
})
process.on('SIGTERM', () => {
  console.log('\n[SIGTERM] arrêt propre demandé, attente fin du batch en cours…')
  shouldStop = true
})

run()
  .then(() => {
    process.exit(shouldStop ? 130 : 0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
