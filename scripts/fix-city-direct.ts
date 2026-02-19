/**
 * Correction directe via PostgreSQL :
 *   1. Crée les index GIN trigram + fonctionnels sur address_city
 *   2. Backfill les codes INSEE → noms de villes (geo.api.gouv.fr)
 *
 * Utilise une connexion pg directe avec statement_timeout = 0
 * pour éviter les timeouts Supabase sur 743K rows.
 *
 * Usage:
 *   npx tsx scripts/fix-city-direct.ts            # Exécution complète
 *   npx tsx scripts/fix-city-direct.ts --dry-run   # Simulation
 */

import { Client } from 'pg'

const PG_URL = 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'
const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = 2000

async function main() {
  const t0 = Date.now()

  if (DRY_RUN) console.log('🏃 MODE DRY RUN\n')

  // 1. Connect
  console.log('Connexion PostgreSQL directe...')
  const client = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  await client.query('SET statement_timeout = 0')
  console.log(`✅ Connecté (${Date.now() - t0}ms)\n`)

  // 2. Create indexes
  console.log('═══════════════════════════════════════')
  console.log('ÉTAPE 1 : Création des index')
  console.log('═══════════════════════════════════════\n')

  const indexes = [
    {
      name: 'pg_trgm extension',
      sql: 'CREATE EXTENSION IF NOT EXISTS pg_trgm',
    },
    {
      name: 'idx_providers_city_lower',
      sql: `CREATE INDEX IF NOT EXISTS idx_providers_city_lower
            ON providers (lower(address_city))
            WHERE is_active = TRUE AND address_city IS NOT NULL`,
    },
    {
      name: 'idx_providers_city_trgm',
      sql: `CREATE INDEX IF NOT EXISTS idx_providers_city_trgm
            ON providers USING gin (address_city gin_trgm_ops)
            WHERE is_active = TRUE AND address_city IS NOT NULL`,
    },
    {
      name: 'idx_providers_specialty_city_lower_active',
      sql: `CREATE INDEX IF NOT EXISTS idx_providers_specialty_city_lower_active
            ON providers (specialty, lower(address_city))
            WHERE is_active = TRUE`,
    },
  ]

  for (const idx of indexes) {
    const t = Date.now()
    console.log(`  Création ${idx.name}...`)
    if (!DRY_RUN) {
      await client.query(idx.sql)
    }
    console.log(`  ✅ ${idx.name} (${Date.now() - t}ms)`)
  }

  // 3. Download communes
  console.log('\n═══════════════════════════════════════')
  console.log('ÉTAPE 2 : Backfill INSEE → noms de villes')
  console.log('═══════════════════════════════════════\n')

  console.log('  Téléchargement des communes françaises...')
  const response = await fetch('https://geo.api.gouv.fr/communes?fields=code,nom&limit=50000')
  if (!response.ok) {
    console.error('  ❌ Erreur API geo:', response.statusText)
    await client.end()
    process.exit(1)
  }

  const communes: Array<{ code: string; nom: string }> = await response.json()
  const communeMap = new Map<string, string>()
  for (const c of communes) {
    communeMap.set(c.code, c.nom)
  }
  console.log(`  ${communeMap.size} communes chargées`)

  // 4. Count providers with numeric address_city
  const countResult = await client.query(`
    SELECT COUNT(*) as cnt
    FROM providers
    WHERE address_city ~ '^[0-9]{4,5}$'
  `)
  const totalToFix = parseInt(countResult.rows[0].cnt, 10)
  console.log(`  ${totalToFix} providers avec code INSEE à corriger`)

  if (totalToFix === 0) {
    console.log('  ✅ Aucun code INSEE à corriger, tout est déjà OK')
    await client.end()
    return
  }

  // 5. Get distinct INSEE codes
  const codesResult = await client.query(`
    SELECT DISTINCT address_city as code
    FROM providers
    WHERE address_city ~ '^[0-9]{4,5}$'
    ORDER BY address_city
  `)

  const inseeCodes = codesResult.rows.map((r: { code: string }) => r.code)
  console.log(`  ${inseeCodes.length} codes INSEE distincts`)

  // 6. Batch update
  let resolved = 0
  let notFound = 0
  let errors = 0

  for (let i = 0; i < inseeCodes.length; i += BATCH_SIZE) {
    const batch = inseeCodes.slice(i, i + BATCH_SIZE)

    for (const code of batch) {
      const cityName = communeMap.get(code)
      if (!cityName) {
        notFound++
        continue
      }

      if (DRY_RUN) {
        if (resolved < 10) console.log(`    [DRY RUN] ${code} → ${cityName}`)
        resolved++
        continue
      }

      try {
        const result = await client.query(
          `UPDATE providers SET address_city = $1 WHERE address_city = $2`,
          [cityName, code]
        )
        resolved += result.rowCount || 0
      } catch (err: any) {
        errors++
        console.error(`    ❌ Erreur pour ${code}:`, err.message)
      }
    }

    const progress = Math.min(i + BATCH_SIZE, inseeCodes.length)
    if (progress % 500 < BATCH_SIZE || progress === inseeCodes.length) {
      console.log(`  ... ${progress}/${inseeCodes.length} codes traités (${resolved} providers corrigés)`)
    }
  }

  console.log(`\n  ✅ Backfill terminé:`)
  console.log(`     ${resolved} providers corrigés`)
  console.log(`     ${notFound} codes INSEE inconnus`)
  console.log(`     ${errors} erreurs`)

  // 7. Verify
  if (!DRY_RUN) {
    const verifyResult = await client.query(`
      SELECT COUNT(*) as cnt
      FROM providers
      WHERE address_city ~ '^[0-9]{4,5}$'
    `)
    const remaining = parseInt(verifyResult.rows[0].cnt, 10)
    console.log(`\n  Vérification : ${remaining} providers avec code INSEE restants`)

    // Show top 10 cities by count
    const topCities = await client.query(`
      SELECT address_city, COUNT(*) as cnt
      FROM providers
      WHERE is_active = TRUE AND address_city IS NOT NULL
        AND address_city !~ '^[0-9]+$'
      GROUP BY address_city
      ORDER BY cnt DESC
      LIMIT 10
    `)
    console.log('\n  Top 10 villes après correction :')
    for (const row of topCities.rows) {
      console.log(`    ${row.address_city}: ${row.cnt} artisans`)
    }
  }

  await client.end()
  console.log(`\n✅ Terminé en ${((Date.now() - t0) / 1000).toFixed(1)}s`)
}

main().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message)
  process.exit(1)
})
