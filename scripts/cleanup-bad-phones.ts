/**
 * Nettoyage des numéros de téléphone incorrectement assignés.
 *
 * Problèmes identifiés :
 *   1. Migrations seed (104, 105) ont assigné des numéros FICTIFS
 *      (0145678901–05, 0612345601–05, 0472345601–05, 0491234501–05,
 *       0634567801–05, 0320456701–05, 0656789001–05, 0678901201–05)
 *   2. import-gm-phones.ts itération 3 (seuil 0.10) a assigné des numéros
 *      réels au MAUVAIS artisan (fuzzy matching trop agressif)
 *
 * Ce script :
 *   - Supprime tous les numéros fictifs des seeds
 *   - Identifie les numéros dupliqués (même numéro sur plusieurs artisans)
 *   - Affiche des stats avant de modifier
 *
 * Usage :
 *   npx tsx scripts/cleanup-bad-phones.ts              # dry-run (par défaut)
 *   npx tsx scripts/cleanup-bad-phones.ts --apply       # applique les changements
 *
 * IMPORTANT : Toujours lancer en dry-run d'abord !
 */
import { Client } from 'pg'

const PG_URL = process.env.DATABASE_URL
  || 'postgresql://postgres:BEB6LnGlT6U9bkTe@db.umjmbdbwcsxrvfqktiui.supabase.co:5432/postgres'

const DRY_RUN = !process.argv.includes('--apply')

// ── Numéros fictifs des migrations seed 104 et 105 ──
const FAKE_PHONES = [
  // Migration 104 — Paris
  '0145678901', '0145678902', '0145678903', '0145678904', '0145678905',
  '0612345601', '0612345602', '0612345603', '0612345604', '0612345605',
  // Migration 105 — Lyon
  '0472345601', '0472345602', '0472345603', '0472345604', '0472345605',
  '0678901201', '0678901202', '0678901203', '0678901204', '0678901205',
  // Migration 105 — Marseille
  '0491234501', '0491234502', '0491234503', '0491234504', '0491234505',
  '0634567801', '0634567802', '0634567803', '0634567804', '0634567805',
  // Migration 105 — Lille
  '0320456701', '0320456702', '0320456703', '0320456704', '0320456705',
  '0656789001', '0656789002', '0656789003', '0656789004', '0656789005',
]

async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('  NETTOYAGE DES NUMÉROS DE TÉLÉPHONE')
  console.log('  Mode : ' + (DRY_RUN ? '🔍 DRY-RUN (aucune modification)' : '⚠️  APPLICATION'))
  console.log('='.repeat(60))

  const client = new Client({
    connectionString: PG_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })
  await client.connect()
  console.log('  Connexion Postgres OK\n')

  // ════════════════════════════════════════════════════════
  // ÉTAPE 1 : Compter les artisans avec téléphone
  // ════════════════════════════════════════════════════════
  const totalRes = await client.query(
    `SELECT
       COUNT(*) as total,
       COUNT(phone) FILTER (WHERE phone IS NOT NULL) as with_phone
     FROM providers
     WHERE is_active = true`
  )
  const { total, with_phone } = totalRes.rows[0]
  console.log(`  Total artisans actifs : ${Number(total).toLocaleString('fr-FR')}`)
  console.log(`  Avec téléphone :        ${Number(with_phone).toLocaleString('fr-FR')}`)

  // ════════════════════════════════════════════════════════
  // ÉTAPE 2 : Trouver les numéros fictifs des seeds
  // ════════════════════════════════════════════════════════
  console.log('\n── Étape 1 : Numéros fictifs des seeds ──')

  const placeholders = FAKE_PHONES.map((_, i) => `$${i + 1}`).join(',')
  const fakeRes = await client.query(
    `SELECT id, name, phone, address_city, specialty
     FROM providers
     WHERE phone IN (${placeholders})
     ORDER BY phone, name`,
    FAKE_PHONES
  )

  console.log(`  Artisans avec numéros fictifs : ${fakeRes.rows.length}`)
  if (fakeRes.rows.length > 0) {
    // Afficher les 10 premiers
    for (const row of fakeRes.rows.slice(0, 10)) {
      console.log(`    ${row.phone} → ${row.name} (${row.address_city || '?'}, ${row.specialty || '?'})`)
    }
    if (fakeRes.rows.length > 10) {
      console.log(`    ... et ${fakeRes.rows.length - 10} autres`)
    }
  }

  // ════════════════════════════════════════════════════════
  // ÉTAPE 3 : Trouver les numéros dupliqués
  // ════════════════════════════════════════════════════════
  console.log('\n── Étape 2 : Numéros dupliqués (même numéro sur plusieurs artisans) ──')

  const dupRes = await client.query(
    `SELECT phone, COUNT(*) as cnt, array_agg(name ORDER BY name) as names
     FROM providers
     WHERE phone IS NOT NULL AND is_active = true
     GROUP BY phone
     HAVING COUNT(*) > 1
     ORDER BY COUNT(*) DESC
     LIMIT 50`
  )

  let totalDuplicateArtisans = 0
  for (const row of dupRes.rows) {
    totalDuplicateArtisans += Number(row.cnt) - 1 // on garde 1, on supprime les doublons
  }
  console.log(`  Numéros en double : ${dupRes.rows.length}`)
  console.log(`  Artisans avec numéro dupliqué à nettoyer : ${totalDuplicateArtisans}`)
  if (dupRes.rows.length > 0) {
    for (const row of dupRes.rows.slice(0, 5)) {
      const names = row.names.slice(0, 3).join(', ')
      console.log(`    ${row.phone} → ${row.cnt}x (${names}${row.cnt > 3 ? '...' : ''})`)
    }
  }

  // ════════════════════════════════════════════════════════
  // ÉTAPE 4 : Appliquer les corrections
  // ════════════════════════════════════════════════════════

  if (DRY_RUN) {
    console.log('\n' + '─'.repeat(60))
    console.log('  🔍 DRY-RUN terminé. Pour appliquer :')
    console.log('     npx tsx scripts/cleanup-bad-phones.ts --apply')
    console.log('─'.repeat(60))
    await client.end()
    return
  }

  console.log('\n── Application des corrections ──')

  // 4a. Supprimer les numéros fictifs
  console.log('\n  [1/2] Suppression des numéros fictifs...')
  const fakeCleanup = await client.query(
    `UPDATE providers
     SET phone = NULL, updated_at = NOW()
     WHERE phone IN (${placeholders})
     RETURNING id, name, phone`,
    FAKE_PHONES
  )
  console.log(`    → ${fakeCleanup.rowCount} artisans nettoyés (numéros fictifs)`)

  // 4b. Supprimer les doublons (garder le premier artisan qui a le numéro, mettre NULL pour les autres)
  console.log('\n  [2/2] Nettoyage des numéros dupliqués...')
  const dupCleanup = await client.query(
    `WITH ranked AS (
       SELECT id, phone,
              ROW_NUMBER() OVER (PARTITION BY phone ORDER BY
                claimed_at DESC NULLS LAST,
                source_id IS NOT NULL DESC,
                review_count DESC NULLS LAST,
                created_at ASC
              ) as rn
       FROM providers
       WHERE phone IS NOT NULL
    )
    UPDATE providers p
    SET phone = NULL, updated_at = NOW()
    FROM ranked r
    WHERE p.id = r.id AND r.rn > 1
    RETURNING p.id, p.name`
  )
  console.log(`    → ${dupCleanup.rowCount} doublons nettoyés`)

  // Résumé final
  const finalRes = await client.query(
    `SELECT COUNT(phone) FILTER (WHERE phone IS NOT NULL) as with_phone
     FROM providers WHERE is_active = true`
  )
  console.log(`\n  Artisans avec téléphone après nettoyage : ${Number(finalRes.rows[0].with_phone).toLocaleString('fr-FR')}`)

  await client.end()

  console.log('\n' + '='.repeat(60))
  console.log('  ✅ NETTOYAGE TERMINÉ')
  console.log(`  Numéros fictifs supprimés : ${fakeCleanup.rowCount}`)
  console.log(`  Doublons nettoyés :         ${dupCleanup.rowCount}`)
  console.log('='.repeat(60) + '\n')
}

main().catch(err => {
  console.error('ERREUR:', err)
  process.exit(1)
})
