/**
 * Génère des fichiers SQL à coller dans le SQL Editor de Supabase.
 * Batch de 1000 UPDATEs par fichier.
 */
import * as fs from 'fs'
import * as path from 'path'

const MATCHES_FILE = path.join(__dirname, '.enrich-data', 'matches', 'matches-full.jsonl')
const OUTPUT_DIR = path.join(__dirname, '.enrich-data', 'matches', 'sql')

interface MatchResult {
  artisanId: string
  phone: string
  score: number
}

function main() {
  // Load & deduplicate
  const lines = fs.readFileSync(MATCHES_FILE, 'utf-8').trim().split('\n')
  const allResults: MatchResult[] = []
  for (const line of lines) {
    try { allResults.push(JSON.parse(line)) } catch {}
  }
  const phoneSet = new Set<string>()
  const artisanSet = new Set<string>()
  const deduped: MatchResult[] = []
  for (const r of [...allResults].sort((a, b) => b.score - a.score)) {
    if (phoneSet.has(r.phone) || artisanSet.has(r.artisanId)) continue
    phoneSet.add(r.phone)
    artisanSet.add(r.artisanId)
    deduped.push(r)
  }

  console.log(`${deduped.length} matches uniques`)

  // Create output dir
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // Generate SQL files — using VALUES + UPDATE FROM approach
  // Single file with temp table approach
  const BATCH = 1000
  const numFiles = Math.ceil(deduped.length / BATCH)

  for (let f = 0; f < numFiles; f++) {
    const batch = deduped.slice(f * BATCH, (f + 1) * BATCH)
    const values = batch.map(r => {
      const phone = r.phone.replace(/'/g, "''")
      return `  ('${r.artisanId}', '${phone}')`
    }).join(',\n')

    const sql = `-- Batch ${f + 1}/${numFiles} (${batch.length} updates)
UPDATE providers AS p
SET phone = v.phone
FROM (VALUES
${values}
) AS v(id, phone)
WHERE p.id = v.id::uuid
AND p.phone IS NULL;
`
    fs.writeFileSync(path.join(OUTPUT_DIR, `batch-${String(f + 1).padStart(2, '0')}.sql`), sql)
  }

  // Also generate a single "do it all" file
  const allValues = deduped.map(r => {
    const phone = r.phone.replace(/'/g, "''")
    return `  ('${r.artisanId}', '${phone}')`
  }).join(',\n')

  const allSql = `-- ALL ${deduped.length} updates in one query
UPDATE providers AS p
SET phone = v.phone
FROM (VALUES
${allValues}
) AS v(id, phone)
WHERE p.id = v.id::uuid
AND p.phone IS NULL;
`
  fs.writeFileSync(path.join(OUTPUT_DIR, 'all-updates.sql'), allSql)

  console.log(`Fichiers générés dans ${OUTPUT_DIR}:`)
  console.log(`  - ${numFiles} fichiers batch (${BATCH}/fichier)`)
  console.log(`  - 1 fichier all-updates.sql (${deduped.length} total)`)
  console.log(`\nCopiez all-updates.sql dans le SQL Editor de Supabase et exécutez.`)
  console.log(`Ou exécutez les batches un par un si all-updates timeout.`)
}

main()
