/**
 * Rollback script : restaure providers.noindex à l'état pré-migration à partir de
 * la table snapshot `providers_noindex_snapshot` (cf. migration 456).
 *
 * Modes :
 *   (défaut) — CIBLÉ : ne touche que les providers dont le noindex actuel
 *              diffère du snapshot (minimise les écritures et l'impact
 *              revalidation).
 *   --full   — force tous les providers snapshot à revenir à noindex_before.
 *   --since <ISO> — limite le revert aux snapshots pris depuis timestamp ISO.
 *   --dry-run — aucun UPDATE, remonte uniquement les counts via SELECT.
 *   --help   — affiche l'usage et quitte.
 *
 * Pré-requis : la table `providers_noindex_snapshot` doit être populée
 * (étape runbook séparée après la migration DDL).
 *
 * Graceful shutdown : SIGINT/SIGTERM → flag `shouldStop` → fin propre du batch
 * en cours + fermeture de la connexion Postgres via try/finally.
 *
 * Idempotence : en mode CIBLÉ, le WHERE filtre sur p.noindex <> s.noindex_before,
 * donc relancer le script après un run complet remonte 0 rows.
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
  const match = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    console.error('Cannot extract project ref from NEXT_PUBLIC_SUPABASE_URL')
    process.exit(1)
  }
  const ref = match[1]
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

function printHelpAndExit(): never {
  console.log(`Usage: tsx scripts/revert-noindex-non-rge.ts [options]

Options:
  --dry-run          Aucun UPDATE exécuté, remonte les counts cibles.
  --full             Revert TOUS les providers snapshot à noindex_before
                     (par défaut : seulement ceux qui diffèrent).
  --since <ISO_ts>   Revert uniquement les snapshots pris depuis ce timestamp
                     (format ISO 8601, ex: 2026-04-21T00:00:00Z).
  --help             Affiche cette aide et quitte.
`)
  process.exit(0)
}

type Args = {
  dryRun: boolean
  full: boolean
  since: string | null
}

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  if (argv.includes('--help')) printHelpAndExit()

  const dryRun = argv.includes('--dry-run')
  const full = argv.includes('--full')

  let since: string | null = null
  const sinceIdx = argv.indexOf('--since')
  if (sinceIdx !== -1) {
    const value = argv[sinceIdx + 1]
    if (!value || value.startsWith('--')) {
      console.error('--since requires an ISO 8601 timestamp argument.')
      process.exit(1)
    }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      console.error(`--since value "${value}" is not a valid ISO 8601 timestamp.`)
      process.exit(1)
    }
    since = parsed.toISOString()
  }

  return { dryRun, full, since }
}

const PG_URL = buildPgUrl()
const BATCH_SIZE = 5000

let shouldStop = false

function formatEta(secondsRemaining: number): string {
  if (!Number.isFinite(secondsRemaining) || secondsRemaining <= 0) return 'n/a'
  const m = Math.floor(secondsRemaining / 60)
  const s = Math.floor(secondsRemaining % 60)
  return `${m}m${s.toString().padStart(2, '0')}s`
}

async function run() {
  const { dryRun, full, since } = parseArgs()

  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    await client.query('SET statement_timeout = 0')
    await client.query("SET lock_timeout = '30s'")

    // Sanity check — snapshot table must exist and be populated.
    const snapshotCheck = await client.query(
      `SELECT to_regclass('public.providers_noindex_snapshot') AS tbl`
    )
    if (!snapshotCheck.rows[0].tbl) {
      console.error(
        "ERREUR : table providers_noindex_snapshot introuvable. Applique d'abord la migration 456."
      )
      process.exit(2)
    }

    const snapshotCount = await client.query(
      `SELECT count(*)::bigint AS n FROM providers_noindex_snapshot`
    )
    const snapRows = Number(snapshotCount.rows[0].n)
    if (snapRows === 0) {
      console.error(
        'ERREUR : providers_noindex_snapshot est VIDE. Remplis-la (runbook étape INSERT) avant de rollback.'
      )
      process.exit(2)
    }
    console.log(
      `Snapshot OK : ${snapRows} rows. Mode: ${full ? 'FULL' : 'CIBLE'}${since ? ` since=${since}` : ''}${dryRun ? ' [dry-run]' : ''}`
    )

    const sinceFilter = since ? `AND s.snapshotted_at >= '${since}'::timestamptz` : ''
    const diffFilter = full ? '' : 'AND p.noindex IS DISTINCT FROM s.noindex_before'

    // Phase 1 — diagnostic avant
    const before = await client.query(`
      SELECT
        count(*) FILTER (WHERE p.noindex = false) AS indexables_before,
        count(*) FILTER (WHERE p.noindex = true)  AS noindex_before,
        count(*) AS total_scope
      FROM providers p
      JOIN providers_noindex_snapshot s ON s.provider_id = p.id
      WHERE 1=1
        ${sinceFilter}
    `)
    console.log('AVANT :', before.rows[0])

    const scriptStart = Date.now()

    console.log(`\n--- Phase 2 : restauration noindex depuis snapshot ---`)
    let totalReverted = 0

    if (dryRun) {
      const preview = await client.query(`
        SELECT count(*) AS cible
        FROM providers p
        JOIN providers_noindex_snapshot s ON s.provider_id = p.id
        WHERE 1=1
          ${diffFilter}
          ${sinceFilter}
      `)
      totalReverted = Number(preview.rows[0].cible)
      console.log(`  [dry-run] cible revert : ${totalReverted} rows`)
    } else {
      let batch = 0
      while (!shouldStop) {
        batch++
        const t0 = Date.now()
        const result = await client.query(`
          WITH cible AS (
            SELECT p.id, s.noindex_before
            FROM providers p
            JOIN providers_noindex_snapshot s ON s.provider_id = p.id
            WHERE 1=1
              ${diffFilter}
              ${sinceFilter}
            LIMIT ${BATCH_SIZE}
            FOR UPDATE OF p SKIP LOCKED
          )
          UPDATE providers p
          SET noindex = cible.noindex_before
          FROM cible
          WHERE p.id = cible.id
            AND p.noindex IS DISTINCT FROM cible.noindex_before
        `)
        const elapsed = Date.now() - t0
        const rows = result.rowCount ?? 0
        totalReverted += rows
        const elapsedSec = Math.max(0.001, (Date.now() - scriptStart) / 1000)
        const rowsPerSec = totalReverted / elapsedSec
        console.log(
          `  batch ${batch}: ${rows} rows en ${elapsed}ms (cumul ${totalReverted}, ${rowsPerSec.toFixed(0)} rows/s)`
        )
        if (rows === 0) break
      }
      if (shouldStop) {
        console.log('  → interruption demandée (SIGINT/SIGTERM), revert arrêté proprement')
      }
    }

    // Phase 3 — diagnostic après
    const after = await client.query(`
      SELECT
        count(*) FILTER (WHERE p.noindex = false) AS indexables_after,
        count(*) FILTER (WHERE p.noindex = true)  AS noindex_after,
        count(*) AS total_scope
      FROM providers p
      JOIN providers_noindex_snapshot s ON s.provider_id = p.id
      WHERE 1=1
        ${sinceFilter}
    `)
    console.log('\nAPRES :', after.rows[0])

    const totalElapsedSec = (Date.now() - scriptStart) / 1000
    console.log(
      `\nResume (${dryRun ? 'dry-run' : 'write'}) — total ${formatEta(totalElapsedSec)} :`
    )
    console.log(`  - Revertés : ${totalReverted}`)
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
