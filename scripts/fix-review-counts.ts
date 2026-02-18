/**
 * Fix aberrant review_count values in providers table.
 * Uses paginated approach to avoid Supabase free tier timeouts.
 *
 * Run: npx tsx scripts/fix-review-counts.ts
 * Run with --fix: npx tsx scripts/fix-review-counts.ts --fix
 */
import { supabase } from './lib/supabase-admin'

const DRY_RUN = !process.argv.includes('--fix')
const MAX_REASONABLE_REVIEWS = 2000 // No artisan in France has > 2000 reviews

async function main() {
  console.log(`=== Fix Aberrant review_count ===`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (--fix pour appliquer)' : '⚠️  LIVE'}\n`)

  // Fetch providers with impossibly high review counts in small batches
  // We use rating_average > 0 to narrow scope (only 11K providers)
  console.log('── Recherche des review_count aberrants ──\n')

  const aberrant: any[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('id, name, specialty, address_city, review_count, rating_average, phone, siret')
      .gt('rating_average', 0)
      .gt('review_count', MAX_REASONABLE_REVIEWS)
      .order('review_count', { ascending: false })
      .range(offset, offset + 100)

    if (error) { console.error('Erreur:', error.message); break }
    if (!data || data.length === 0) break
    aberrant.push(...data)
    offset += data.length
    if (data.length < 100) break
  }

  if (aberrant.length === 0) {
    console.log(`Aucun provider avec review_count > ${MAX_REASONABLE_REVIEWS}. Tout est OK !`)
    return
  }

  console.log(`Trouvés: ${aberrant.length} providers avec review_count > ${MAX_REASONABLE_REVIEWS}\n`)

  // Group by value pattern to understand corruption
  const valueGroups: Record<string, number> = {}

  for (const p of aberrant) {
    const rc = p.review_count
    const rcStr = String(rc)
    console.log(`  ${(p.name || '?').substring(0, 45).padEnd(45)} | review_count: ${rc?.toLocaleString('fr-FR').padStart(15)}`)
    console.log(`    ${p.specialty || '?'} | ${p.address_city || '?'} | phone: ${p.phone || 'N/A'} | siret: ${p.siret || 'N/A'}`)

    // Check patterns
    if (rcStr.length >= 9 && rcStr.length <= 10) {
      console.log(`    ⚠️  Longueur ${rcStr.length} chiffres — ressemble à un n° de téléphone`)
    }
    if (rcStr.length === 14) {
      console.log(`    ⚠️  14 chiffres — ressemble à un SIRET`)
    }

    // Group by leading digits pattern
    const pattern = rcStr.substring(0, 3) + 'xxx'
    valueGroups[pattern] = (valueGroups[pattern] || 0) + 1
    console.log()
  }

  console.log('── Patterns de valeurs corrompues ──\n')
  for (const [pattern, count] of Object.entries(valueGroups).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pattern}: ${count} occurrences`)
  }

  // Check reviews table
  console.log('\n── Vérification vrais avis (table reviews) ──\n')

  const { error: revErr } = await supabase.from('reviews').select('id').limit(1)
  const hasReviewsTable = !revErr

  if (hasReviewsTable) {
    console.log('Table reviews existe.')
    for (const p of aberrant.slice(0, 5)) {
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', p.id)
      console.log(`  "${(p.name || '?').substring(0, 30)}": ${count ?? 0} vrais avis (vs ${p.review_count?.toLocaleString()} stocké)`)
    }
  } else {
    console.log(`Table reviews: ${revErr?.message}`)
  }

  // Apply fix
  if (!DRY_RUN) {
    console.log('\n── Application des corrections ──\n')
    let fixed = 0, errors = 0

    for (const p of aberrant) {
      let realCount = 0
      let realAvg = p.rating_average

      if (hasReviewsTable) {
        const { count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', p.id)
        if (count !== null) realCount = count

        if (realCount > 0) {
          const { data: ratings } = await supabase
            .from('reviews')
            .select('rating')
            .eq('provider_id', p.id)
          if (ratings && ratings.length > 0) {
            realAvg = Math.round(ratings.reduce((s, r) => s + (r.rating || 0), 0) / ratings.length * 10) / 10
          }
        }
      }

      const { error: updateErr } = await supabase
        .from('providers')
        .update({ review_count: realCount, rating_average: realCount > 0 ? realAvg : 0 })
        .eq('id', p.id)

      if (updateErr) {
        console.log(`  ❌ ${p.name}: ${updateErr.message}`)
        errors++
      } else {
        console.log(`  ✅ ${(p.name || '?').substring(0, 40).padEnd(40)} ${p.review_count?.toLocaleString()} → ${realCount}`)
        fixed++
      }
    }
    console.log(`\nTerminé: ${fixed} corrigés, ${errors} erreurs`)
  } else {
    console.log(`\n💡 Ajoutez --fix pour corriger: npx tsx scripts/fix-review-counts.ts --fix`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
