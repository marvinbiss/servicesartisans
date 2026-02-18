/**
 * Analyse des providers — Distribution qualité & publiabilité
 * v3: uses Supabase REST API (service_role) + in-memory analysis
 * Fix: no 'noindex' column, handles null counts
 */
import { supabase } from './lib/supabase-admin'

async function analyze() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   ANALYSE PROVIDERS — ServicesArtisans           ║')
  console.log('╚══════════════════════════════════════════════════╝\n')

  // ─── 1. TOTAUX GÉNÉRAUX ───
  console.log('── 1. TOTAUX GÉNÉRAUX ──\n')

  // Use estimated count for very large unfiltered queries
  const { count: totalEst } = await supabase
    .from('providers')
    .select('*', { count: 'estimated', head: true })
  console.log(`Total providers (estimé):    ${totalEst?.toLocaleString('fr-FR') ?? '?'}`)

  const { count: inactive } = await supabase
    .from('providers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false)
  console.log(`  is_active=false:           ${inactive?.toLocaleString('fr-FR') ?? '?'}`)
  console.log(`  is_active=true (estimé):   ${totalEst && inactive != null ? (totalEst - inactive).toLocaleString('fr-FR') : '?'}`)

  // ─── 2. CHARGER TOUS LES PROVIDERS AVEC AVIS ───
  console.log('\n── 2. CHARGEMENT DES PROVIDERS AVEC AVIS ──\n')

  const allRated: any[] = []
  let offset = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('providers')
      .select('id, name, siret, siren, phone, email, description, specialty, address_city, address_department, address_postal_code, review_count, rating_average, is_verified, is_active, slug, stable_id, website, latitude')
      .gt('rating_average', 0)
      .range(offset, offset + batchSize - 1)

    if (error) {
      console.error(`Erreur batch ${offset}:`, error.message)
      break
    }
    if (!data || data.length === 0) break
    allRated.push(...data)
    process.stdout.write(`  Chargés: ${allRated.length}...\r`)
    offset += data.length
    if (data.length < batchSize) break
  }
  console.log(`\n  Total chargés: ${allRated.length.toLocaleString('fr-FR')} providers avec rating > 0\n`)

  // ─── 3. DISTRIBUTION DES AVIS ───
  console.log('── 3. DISTRIBUTION DES AVIS ──\n')

  for (const t of [1, 3, 5, 10, 20, 50, 100]) {
    const n = allRated.filter(p => (p.review_count || 0) >= t).length
    console.log(`  review_count >= ${String(t).padStart(3)}: ${n.toLocaleString('fr-FR')}`)
  }

  console.log('\n  Distribution notes:')
  for (const r of [4.5, 4.0, 3.5, 3.0, 2.0, 1.0]) {
    const n = allRated.filter(p => p.rating_average >= r).length
    console.log(`  rating >= ${r}: ${n.toLocaleString('fr-FR')}`)
  }

  // ─── 4. SIGNAUX QUALITÉ ───
  console.log('\n── 4. SIGNAUX QUALITÉ (providers avec rating > 0) ──\n')

  const t = allRated.length
  const pct = (n: number) => t > 0 ? `(${(n / t * 100).toFixed(1)}%)` : ''

  const stats = {
    siret: allRated.filter(p => p.siret && p.siret.length > 0).length,
    siren: allRated.filter(p => p.siren && p.siren.length > 0).length,
    descLong: allRated.filter(p => p.description && p.description.length > 50).length,
    descShort: allRated.filter(p => p.description && p.description.length > 0 && p.description.length <= 50).length,
    reviews: allRated.filter(p => (p.review_count || 0) > 0).length,
    phone: allRated.filter(p => p.phone && p.phone.length > 0).length,
    email: allRated.filter(p => p.email && p.email.length > 0).length,
    website: allRated.filter(p => p.website && p.website.length > 0).length,
    verified: allRated.filter(p => p.is_verified === true).length,
    specialty: allRated.filter(p => p.specialty && p.specialty.length > 0).length,
    city: allRated.filter(p => p.address_city && p.address_city.length > 0).length,
    dept: allRated.filter(p => p.address_department != null).length,
    slug: allRated.filter(p => p.slug && p.slug.length > 0).length,
    stableId: allRated.filter(p => p.stable_id && p.stable_id.length > 0).length,
    active: allRated.filter(p => p.is_active === true).length,
    gps: allRated.filter(p => p.latitude != null).length,
  }

  console.log(`Sur ${t.toLocaleString('fr-FR')} providers avec rating > 0:`)
  console.log(`  SIRET:              ${stats.siret.toLocaleString('fr-FR').padStart(8)} ${pct(stats.siret)}`)
  console.log(`  SIREN:              ${stats.siren.toLocaleString('fr-FR').padStart(8)} ${pct(stats.siren)}`)
  console.log(`  Description >50c:   ${stats.descLong.toLocaleString('fr-FR').padStart(8)} ${pct(stats.descLong)}`)
  console.log(`  Description <=50c:  ${stats.descShort.toLocaleString('fr-FR').padStart(8)}`)
  console.log(`  review_count > 0:   ${stats.reviews.toLocaleString('fr-FR').padStart(8)} ${pct(stats.reviews)}`)
  console.log(`  Téléphone:          ${stats.phone.toLocaleString('fr-FR').padStart(8)} ${pct(stats.phone)}`)
  console.log(`  Email:              ${stats.email.toLocaleString('fr-FR').padStart(8)} ${pct(stats.email)}`)
  console.log(`  Site web:           ${stats.website.toLocaleString('fr-FR').padStart(8)} ${pct(stats.website)}`)
  console.log(`  Vérifié:            ${stats.verified.toLocaleString('fr-FR').padStart(8)} ${pct(stats.verified)}`)
  console.log(`  Spécialité:         ${stats.specialty.toLocaleString('fr-FR').padStart(8)} ${pct(stats.specialty)}`)
  console.log(`  Ville:              ${stats.city.toLocaleString('fr-FR').padStart(8)} ${pct(stats.city)}`)
  console.log(`  Département:        ${stats.dept.toLocaleString('fr-FR').padStart(8)} ${pct(stats.dept)}`)
  console.log(`  GPS:                ${stats.gps.toLocaleString('fr-FR').padStart(8)} ${pct(stats.gps)}`)
  console.log(`  Slug:               ${stats.slug.toLocaleString('fr-FR').padStart(8)} ${pct(stats.slug)}`)
  console.log(`  stable_id:          ${stats.stableId.toLocaleString('fr-FR').padStart(8)} ${pct(stats.stableId)}`)
  console.log(`  is_active:          ${stats.active.toLocaleString('fr-FR').padStart(8)} ${pct(stats.active)}`)

  // ─── 5. QUALITY SCORE SIMULATION ───
  console.log('\n── 5. SIMULATION QUALITY SCORE ──')
  console.log('Score = SIRET + Desc>50c + review_count>0 + Vérifié + Spécialité + Téléphone\n')

  function calcScore(p: any): number {
    return (
      (p.siret && p.siret.length > 0 ? 1 : 0) +
      (p.description && p.description.length > 50 ? 1 : 0) +
      ((p.review_count || 0) > 0 ? 1 : 0) +
      (p.is_verified === true ? 1 : 0) +
      (p.specialty && p.specialty.length > 0 ? 1 : 0) +
      (p.phone && p.phone.length > 0 ? 1 : 0)
    )
  }

  const scoreDist: Record<number, number> = {}
  for (const p of allRated) {
    const score = calcScore(p)
    scoreDist[score] = (scoreDist[score] || 0) + 1
  }

  for (let s = 6; s >= 0; s--) {
    const n = scoreDist[s] || 0
    const bar = '█'.repeat(Math.round(n / t * 60))
    console.log(`  Score ${s}: ${n.toLocaleString('fr-FR').padStart(8)} ${bar} (${(n / t * 100).toFixed(1)}%)`)
  }

  let gte3 = 0, gte2 = 0
  for (let s = 6; s >= 3; s--) gte3 += (scoreDist[s] || 0)
  for (let s = 6; s >= 2; s--) gte2 += (scoreDist[s] || 0)
  const lt2 = t - gte2

  console.log(`\n  >= 3 signaux (INDEXABLE):        ${gte3.toLocaleString('fr-FR')}`)
  console.log(`  == 2 signaux (1 champ = indexé):  ${(gte2 - gte3).toLocaleString('fr-FR')}`)
  console.log(`  < 2 signaux (profils minces):     ${lt2.toLocaleString('fr-FR')}`)

  // ─── 6. QUE MANQUE-T-IL AUX SCORE=2 ? ───
  console.log('\n── 6. QUE MANQUE-T-IL AUX SCORE=2 POUR PASSER À 3 ? ──\n')

  const at2 = allRated.filter(p => calcScore(p) === 2)
  console.log(`Providers avec score=2: ${at2.length.toLocaleString('fr-FR')}`)

  const missingFields: Record<string, number> = { siret: 0, description: 0, verified: 0, specialty: 0, phone: 0, reviews: 0 }
  for (const p of at2) {
    if (!p.siret || p.siret.length === 0) missingFields.siret++
    if (!p.description || p.description.length <= 50) missingFields.description++
    if (p.is_verified !== true) missingFields.verified++
    if (!p.specialty || p.specialty.length === 0) missingFields.specialty++
    if (!p.phone || p.phone.length === 0) missingFields.phone++
    if ((p.review_count || 0) === 0) missingFields.reviews++
  }

  const sorted = Object.entries(missingFields).sort((a, b) => a[1] - b[1])
  for (const [field, count] of sorted) {
    const action = {
      siret: 'enrichir via API SIRENE',
      description: 'auto-générer (métier+ville+avis)',
      verified: 'vérification batch',
      specialty: 'mapper depuis NAF/siren',
      phone: 'enrichir Pages Jaunes/Google',
      reviews: 'solliciter avis clients',
    }[field] || ''
    console.log(`  Manque ${field.padEnd(15)} ${count.toLocaleString('fr-FR').padStart(6)} → ${action}`)
  }

  // ─── 7. PRÉREQUIS URL ───
  console.log('\n── 7. PRÉREQUIS URL (slug + stable_id) sur score >= 3 ──\n')

  const ready = allRated.filter(p => calcScore(p) >= 3)
  const readySlug = ready.filter(p => p.slug && p.slug.length > 0).length
  const readyStable = ready.filter(p => p.stable_id && p.stable_id.length > 0).length
  const readyBoth = ready.filter(p => p.slug && p.slug.length > 0 && p.stable_id && p.stable_id.length > 0).length
  const readyNeither = ready.filter(p => (!p.slug || p.slug.length === 0) && (!p.stable_id || p.stable_id.length === 0)).length

  console.log(`Providers score >= 3:    ${ready.length.toLocaleString('fr-FR')}`)
  console.log(`  Ont slug:              ${readySlug.toLocaleString('fr-FR')}`)
  console.log(`  Ont stable_id:         ${readyStable.toLocaleString('fr-FR')}`)
  console.log(`  Ont les deux:          ${readyBoth.toLocaleString('fr-FR')} ✅ URL prête`)
  console.log(`  Manquent les deux:     ${readyNeither.toLocaleString('fr-FR')} ⚠️ à générer`)

  // ─── 8. TOP SPÉCIALITÉS ───
  console.log('\n── 8. TOP 25 SPÉCIALITÉS (providers avec avis) ──\n')

  const specCounts: Record<string, { count: number, avgRating: number, avgReviews: number }> = {}
  for (const p of allRated) {
    const spec = p.specialty || '(aucune)'
    if (!specCounts[spec]) specCounts[spec] = { count: 0, avgRating: 0, avgReviews: 0 }
    specCounts[spec].count++
    specCounts[spec].avgRating += p.rating_average || 0
    specCounts[spec].avgReviews += p.review_count || 0
  }
  const sortedSpecs = Object.entries(specCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 25)
  for (const [spec, data] of sortedSpecs) {
    const avgR = (data.avgRating / data.count).toFixed(2)
    const avgRev = (data.avgReviews / data.count).toFixed(1)
    console.log(`  ${spec.padEnd(28)} ${String(data.count).padStart(6)} artisans | note: ${avgR} | avis moy: ${avgRev}`)
  }

  // ─── 9. TOP DÉPARTEMENTS ───
  console.log('\n── 9. TOP 20 DÉPARTEMENTS (providers avec avis) ──\n')

  const deptCounts: Record<string, number> = {}
  for (const p of allRated) {
    const dept = p.address_department || '(inconnu)'
    deptCounts[dept] = (deptCounts[dept] || 0) + 1
  }
  const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)
  for (const [dept, count] of sortedDepts) {
    console.log(`  ${dept.padEnd(20)} ${count.toLocaleString('fr-FR').padStart(6)}`)
  }

  // ─── 10. TOP 15 ARTISANS ───
  console.log('\n── 10. TOP 15 ARTISANS (par nombre d\'avis) ──\n')

  const topSorted = [...allRated].sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
  for (const p of topSorted.slice(0, 15)) {
    const score = calcScore(p)
    const sigs = [
      p.siret ? 'SIRET' : null,
      p.description && p.description.length > 50 ? 'DESC' : null,
      (p.review_count || 0) > 0 ? 'AVIS' : null,
      p.is_verified ? 'VERIF' : null,
      p.specialty ? 'SPEC' : null,
      p.phone ? 'TEL' : null,
    ].filter(Boolean)
    console.log(`  ${(p.name || '?').substring(0, 40).padEnd(40)} | ${(p.specialty || '?').padEnd(15)} | ${p.address_city || '?'}`)
    console.log(`    ${p.review_count || 0} avis | note ${p.rating_average} | score ${score}/6 [${sigs.join(',')}]`)
    console.log(`    slug=${p.slug ? 'OUI' : 'NON'} | stable_id=${p.stable_id ? 'OUI' : 'NON'} | active=${p.is_active}`)
    console.log()
  }

  // ─── 11. COUVERTURE GLOBALE (échantillon) ───
  console.log('── 11. COUVERTURE CHAMPS (échantillon 5000 providers aléatoires) ──\n')

  // Fetch a random sample of all providers to estimate field coverage
  const { data: sample } = await supabase
    .from('providers')
    .select('siret, siren, phone, email, website, description, specialty, address_city, address_department, latitude, slug, stable_id, rating_average, review_count')
    .limit(5000)

  if (sample) {
    const s = sample.length
    const show = (label: string, filter: (p: any) => boolean) => {
      const n = sample.filter(filter).length
      const estTotal = totalEst ? Math.round(n / s * totalEst) : 0
      console.log(`  ${label.padEnd(20)} ${(n / s * 100).toFixed(1).padStart(6)}% → estimé ${estTotal.toLocaleString('fr-FR')} / ${totalEst?.toLocaleString('fr-FR')}`)
    }
    show('SIRET', p => p.siret && p.siret.length > 0)
    show('SIREN', p => p.siren && p.siren.length > 0)
    show('Téléphone', p => p.phone && p.phone.length > 0)
    show('Email', p => p.email && p.email.length > 0)
    show('Site web', p => p.website && p.website.length > 0)
    show('Desc >50c', p => p.description && p.description.length > 50)
    show('Spécialité', p => p.specialty && p.specialty.length > 0)
    show('Ville', p => p.address_city && p.address_city.length > 0)
    show('Département', p => p.address_department != null)
    show('GPS', p => p.latitude != null)
    show('Slug', p => p.slug && p.slug.length > 0)
    show('stable_id', p => p.stable_id && p.stable_id.length > 0)
    show('Rating > 0', p => p.rating_average > 0)
    show('Reviews > 0', p => (p.review_count || 0) > 0)
  }

  // ─── RÉSUMÉ FINAL ───
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                 RÉSUMÉ — PLAN D\'ACTION                       ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  console.log(`Total providers:                     ${totalEst?.toLocaleString('fr-FR') ?? '?'}`)
  console.log(`⚠️  Colonne 'noindex' ABSENTE:        Migration nécessaire !`)
  console.log(`Avec avis (rating > 0):              ${allRated.length.toLocaleString('fr-FR')}`)
  console.log(`  Score >= 3 (publiables):           ${gte3.toLocaleString('fr-FR')}`)
  console.log(`  Score == 2 (1 enrichissement):     ${(gte2 - gte3).toLocaleString('fr-FR')}`)
  console.log(`  Score < 2 (trop mince):            ${lt2.toLocaleString('fr-FR')}`)
  console.log()
  console.log(`ACTIONS PRIORITAIRES:`)
  console.log(`  1. ⚠️  Créer colonne 'noindex' (migration SQL)`)
  console.log(`  2. Générer descriptions auto pour ${(gte2 - gte3).toLocaleString('fr-FR')} providers score=2`)
  console.log(`  3. Générer slug + stable_id pour ${readyNeither} providers sans URL`)
  console.log(`  4. Publier les ${gte3.toLocaleString('fr-FR')} avec score >= 3`)
}

analyze().catch(e => { console.error(e); process.exit(1) })
