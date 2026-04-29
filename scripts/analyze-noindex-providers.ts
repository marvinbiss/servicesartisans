/**
 * Analyse des fiches artisan en NOINDEX
 *
 * Objectif : comprendre POURQUOI ~920K fiches sont en noindex,
 * identifier les sous-populations à promouvoir vers index, et
 * dimensionner les vagues d'enrichissement.
 *
 * Sortie : distribution, raisons probables (RGE / avis / desc / SIRET / claim),
 * cohortes promouvables, top spécialités/départements, échantillons.
 */
import { supabase } from './lib/supabase-admin'

type ProviderRow = {
  id: string
  name: string | null
  slug: string | null
  stable_id: string | null
  siret: string | null
  siren: string | null
  phone: string | null
  email: string | null
  website: string | null
  description: string | null
  specialty: string | null
  address_city: string | null
  address_department: string | null
  address_postal_code: string | null
  address_region: string | null
  latitude: number | null
  longitude: number | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean | null
  is_active: boolean | null
  noindex: boolean | null
  rge_qualifications: string[] | null
  rge_verified_at: string | null
  rge_expires_at: string | null
  claimed_at: string | null
  claimed_by: string | null
  user_id: string | null
}

const PAGE = 1000
const HEAVY_LIMIT = Number(process.env.HEAVY_LIMIT ?? 200000) // garde-fou mémoire
const fmt = (n: number | null | undefined) => (n == null ? '?' : n.toLocaleString('fr-FR'))

async function countWhere(
  build: (q: ReturnType<typeof supabase.from>) => any,
  label: string
): Promise<number | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q: any = build(supabase.from('providers').select('*', { count: 'exact', head: true }))
  const { count, error } = await q
  if (error) {
    console.error(`  ✖ count(${label}): ${error.message}`)
    return null
  }
  return count ?? 0
}

async function fetchSample(
  build: (q: ReturnType<typeof supabase.from>) => any,
  hardLimit = HEAVY_LIMIT
): Promise<ProviderRow[]> {
  const out: ProviderRow[] = []
  let offset = 0
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = build(
      supabase
        .from('providers')
        .select(
          'id, name, slug, stable_id, siret, siren, phone, email, website, description, specialty, address_city, address_department, address_postal_code, address_region, latitude, longitude, rating_average, review_count, is_verified, is_active, noindex, rge_qualifications, rge_verified_at, rge_expires_at, claimed_at, claimed_by, user_id'
        )
    )
    const { data, error } = await q.range(offset, offset + PAGE - 1)
    if (error) {
      console.error(`  ✖ fetch range ${offset}: ${error.message}`)
      break
    }
    if (!data || data.length === 0) break
    out.push(...(data as ProviderRow[]))
    process.stdout.write(`  Chargés: ${fmt(out.length)}\r`)
    offset += data.length
    if (data.length < PAGE) break
    if (out.length >= hardLimit) {
      console.log(`\n  ⚠ HEAVY_LIMIT atteint (${fmt(hardLimit)}), échantillonnage tronqué`)
      break
    }
  }
  process.stdout.write('\n')
  return out
}

function pct(n: number, t: number): string {
  return t > 0 ? `(${((n / t) * 100).toFixed(1)}%)` : ''
}

function topN<T extends string>(map: Map<T, number>, n = 20): [T, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║   ANALYSE FICHES ARTISAN EN NOINDEX                          ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  // ─── 1. CARDINALITÉ NOINDEX ──────────────────────────────
  console.log('── 1. CARDINALITÉ ──\n')
  const totalEst = await countWhere((q) => q, 'total')
  const noindexTrue = await countWhere((q) => q.eq('noindex', true), 'noindex=true')
  const noindexFalse = await countWhere((q) => q.eq('noindex', false), 'noindex=false')
  const noindexNull = await countWhere((q) => q.is('noindex', null), 'noindex IS NULL')
  console.log(`  Total providers          ${fmt(totalEst).padStart(10)}`)
  console.log(
    `  noindex = true           ${fmt(noindexTrue).padStart(10)} ${noindexTrue && totalEst ? pct(noindexTrue, totalEst) : ''}`
  )
  console.log(
    `  noindex = false          ${fmt(noindexFalse).padStart(10)} ${noindexFalse && totalEst ? pct(noindexFalse, totalEst) : ''}`
  )
  console.log(
    `  noindex IS NULL          ${fmt(noindexNull).padStart(10)} ${noindexNull && totalEst ? pct(noindexNull, totalEst) : ''}`
  )

  if (!noindexTrue || noindexTrue === 0) {
    console.log('\nAucune fiche noindex=true en base. Stop.')
    return
  }

  // ─── 2. CROISEMENTS RAPIDES (counts) ────────────────────
  console.log('\n── 2. CROISEMENTS NOINDEX × SIGNAUX ──\n')

  const crosses: Array<[string, (q: any) => any]> = [
    ['noindex × is_active=true        ', (q) => q.eq('noindex', true).eq('is_active', true)],
    ['noindex × is_active=false       ', (q) => q.eq('noindex', true).eq('is_active', false)],
    ['noindex × is_verified=true      ', (q) => q.eq('noindex', true).eq('is_verified', true)],
    [
      'noindex × claimed_at IS NOT NULL',
      (q) => q.eq('noindex', true).not('claimed_at', 'is', null),
    ],
    ['noindex × user_id IS NOT NULL   ', (q) => q.eq('noindex', true).not('user_id', 'is', null)],
    ['noindex × review_count > 0      ', (q) => q.eq('noindex', true).gt('review_count', 0)],
    ['noindex × review_count >= 3     ', (q) => q.eq('noindex', true).gte('review_count', 3)],
    ['noindex × review_count >= 10    ', (q) => q.eq('noindex', true).gte('review_count', 10)],
    ['noindex × rating_average >= 4.0 ', (q) => q.eq('noindex', true).gte('rating_average', 4.0)],
    ['noindex × siret IS NOT NULL     ', (q) => q.eq('noindex', true).not('siret', 'is', null)],
    ['noindex × phone IS NOT NULL     ', (q) => q.eq('noindex', true).not('phone', 'is', null)],
    ['noindex × website IS NOT NULL   ', (q) => q.eq('noindex', true).not('website', 'is', null)],
    ['noindex × email IS NOT NULL     ', (q) => q.eq('noindex', true).not('email', 'is', null)],
    ['noindex × latitude IS NOT NULL  ', (q) => q.eq('noindex', true).not('latitude', 'is', null)],
    ['noindex × slug IS NOT NULL      ', (q) => q.eq('noindex', true).not('slug', 'is', null)],
    ['noindex × stable_id IS NOT NULL ', (q) => q.eq('noindex', true).not('stable_id', 'is', null)],
    [
      'noindex × rge non vide          ',
      (q) => q.eq('noindex', true).not('rge_qualifications', 'is', null),
    ],
  ]

  for (const [label, build] of crosses) {
    const n = await countWhere(build, label)
    const p = n != null && noindexTrue ? pct(n, noindexTrue) : ''
    console.log(`  ${label}  ${fmt(n).padStart(10)}  ${p}`)
  }

  // ─── 3. ÉCHANTILLON LOURD POUR DISTRIBUTIONS ────────────
  console.log('\n── 3. ÉCHANTILLON POUR DISTRIBUTIONS ──\n')
  console.log(`  Cap mémoire: ${fmt(HEAVY_LIMIT)} (override via HEAVY_LIMIT env)`)
  const sample = await fetchSample((q) => q.eq('noindex', true), HEAVY_LIMIT)
  const t = sample.length
  console.log(`  Lignes analysées: ${fmt(t)}`)
  if (t === 0) return

  // Quality score (mêmes signaux que analyze-providers, + RGE bonus séparé)
  const score = (p: ProviderRow) =>
    (p.siret && p.siret.length > 0 ? 1 : 0) +
    (p.description && p.description.length > 50 ? 1 : 0) +
    ((p.review_count || 0) > 0 ? 1 : 0) +
    (p.is_verified === true ? 1 : 0) +
    (p.specialty && p.specialty.length > 0 ? 1 : 0) +
    (p.phone && p.phone.length > 0 ? 1 : 0)

  const dist: Record<number, number> = {}
  let withRGE = 0
  let withReviews = 0
  let withDescLong = 0
  let withSlug = 0
  let withStableId = 0
  let claimed = 0
  let active = 0
  let withGPS = 0
  let descMissing = 0
  let descShort = 0

  for (const p of sample) {
    const s = score(p)
    dist[s] = (dist[s] || 0) + 1
    if (p.rge_qualifications && p.rge_qualifications.length > 0) withRGE++
    if ((p.review_count || 0) > 0) withReviews++
    if (p.description && p.description.length > 50) withDescLong++
    if (!p.description || p.description.length === 0) descMissing++
    else if (p.description.length <= 50) descShort++
    if (p.slug && p.slug.length > 0) withSlug++
    if (p.stable_id && p.stable_id.length > 0) withStableId++
    if (p.claimed_at) claimed++
    if (p.is_active === true) active++
    if (p.latitude != null) withGPS++
  }

  console.log('\n── 4. SCORE QUALITÉ (sur échantillon noindex) ──\n')
  console.log('  Score = SIRET + Desc>50c + reviews>0 + Verified + Specialty + Phone\n')
  for (let s = 6; s >= 0; s--) {
    const n = dist[s] || 0
    const bar = '█'.repeat(Math.round((n / t) * 60))
    console.log(`  Score ${s}: ${fmt(n).padStart(8)} ${bar} ${pct(n, t)}`)
  }
  let gte3 = 0
  let gte2 = 0
  for (let s = 6; s >= 3; s--) gte3 += dist[s] || 0
  for (let s = 6; s >= 2; s--) gte2 += dist[s] || 0
  console.log(`\n  >= 3 signaux (publiables) : ${fmt(gte3)} ${pct(gte3, t)}`)
  console.log(`  == 2 signaux (1 enrichissement à faire) : ${fmt(gte2 - gte3)}`)
  console.log(`  < 2 signaux (profils minces) : ${fmt(t - gte2)}`)

  // ─── 5. SIGNAUX ABSOLUS ──────────────────────────────
  console.log('\n── 5. SIGNAUX ABSOLUS (sur échantillon noindex) ──\n')
  console.log(`  Avec RGE              ${fmt(withRGE).padStart(10)} ${pct(withRGE, t)}`)
  console.log(`  Avec avis             ${fmt(withReviews).padStart(10)} ${pct(withReviews, t)}`)
  console.log(`  Description >50c      ${fmt(withDescLong).padStart(10)} ${pct(withDescLong, t)}`)
  console.log(`  Description vide      ${fmt(descMissing).padStart(10)} ${pct(descMissing, t)}`)
  console.log(`  Description <=50c     ${fmt(descShort).padStart(10)} ${pct(descShort, t)}`)
  console.log(`  Avec slug             ${fmt(withSlug).padStart(10)} ${pct(withSlug, t)}`)
  console.log(`  Avec stable_id        ${fmt(withStableId).padStart(10)} ${pct(withStableId, t)}`)
  console.log(`  Revendiquée (claimed) ${fmt(claimed).padStart(10)} ${pct(claimed, t)}`)
  console.log(`  is_active=true        ${fmt(active).padStart(10)} ${pct(active, t)}`)
  console.log(`  GPS renseigné         ${fmt(withGPS).padStart(10)} ${pct(withGPS, t)}`)

  // ─── 6. RAISONS PROBABLES DE NOINDEX (mutuellement non exclusives) ──
  console.log('\n── 6. RAISONS PROBABLES DU NOINDEX ──\n')
  let noRGEandNoReviews = 0
  let onlyMissingDesc = 0
  let onlyMissingReviews = 0
  let onlyMissingVerified = 0
  let onlyMissingSiret = 0
  let onlyMissingPhone = 0
  let onlyMissingSpecialty = 0
  let inactive = 0

  for (const p of sample) {
    if (!p.is_active) inactive++
    const noRGE = !p.rge_qualifications || p.rge_qualifications.length === 0
    const noReviews = (p.review_count || 0) === 0
    if (noRGE && noReviews) noRGEandNoReviews++

    if (score(p) === 2) {
      const missingDesc = !p.description || p.description.length <= 50
      const missingReviews = noReviews
      const missingVerified = p.is_verified !== true
      const missingSiret = !p.siret || p.siret.length === 0
      const missingPhone = !p.phone || p.phone.length === 0
      const missingSpecialty = !p.specialty || p.specialty.length === 0
      // missing exactly one of these would push to 3
      // Count which single field is missing (heuristic: smallest remaining gap)
      // Approximation: cumul individuel par champ manquant
      if (missingDesc) onlyMissingDesc++
      if (missingReviews) onlyMissingReviews++
      if (missingVerified) onlyMissingVerified++
      if (missingSiret) onlyMissingSiret++
      if (missingPhone) onlyMissingPhone++
      if (missingSpecialty) onlyMissingSpecialty++
    }
  }
  console.log(
    `  Pas de RGE & pas d'avis (cause #1 attendue)  ${fmt(noRGEandNoReviews).padStart(10)} ${pct(noRGEandNoReviews, t)}`
  )
  console.log(
    `  is_active = false                            ${fmt(inactive).padStart(10)} ${pct(inactive, t)}`
  )
  console.log('\n  Score=2 : cumul des champs manquants pour passer à 3')
  console.log(`    description courte/manquante  ${fmt(onlyMissingDesc).padStart(10)}`)
  console.log(`    pas d'avis                    ${fmt(onlyMissingReviews).padStart(10)}`)
  console.log(`    pas vérifié                   ${fmt(onlyMissingVerified).padStart(10)}`)
  console.log(`    pas de SIRET                  ${fmt(onlyMissingSiret).padStart(10)}`)
  console.log(`    pas de téléphone              ${fmt(onlyMissingPhone).padStart(10)}`)
  console.log(`    pas de spécialité             ${fmt(onlyMissingSpecialty).padStart(10)}`)

  // ─── 7. COHORTES « PROMOUVABLES » VERS INDEX ───────────
  console.log('\n── 7. COHORTES PROMOUVABLES VERS INDEX ──\n')
  const cohortRGE = sample.filter((p) => p.rge_qualifications && p.rge_qualifications.length > 0)
  const cohortReviewsOnly = sample.filter(
    (p) =>
      (!p.rge_qualifications || p.rge_qualifications.length === 0) &&
      (p.review_count || 0) >= 3 &&
      (p.rating_average || 0) >= 4.0
  )
  const cohortClaimed = sample.filter((p) => p.claimed_at && !p.is_verified)
  const cohortDescReady = sample.filter(
    (p) =>
      (p.description?.length ?? 0) > 50 &&
      (p.specialty?.length ?? 0) > 0 &&
      (p.address_city?.length ?? 0) > 0 &&
      (p.review_count || 0) === 0
  )
  const cohortNoSlug = sample.filter((p) => !p.slug || !p.stable_id)

  console.log(
    `  RGE certifiés (priorité 1)          ${fmt(cohortRGE.length).padStart(10)} → publier en priorité`
  )
  console.log(
    `  Avis ≥3 et note ≥4 sans RGE          ${fmt(cohortReviewsOnly.length).padStart(10)} → review-led publish`
  )
  console.log(
    `  Revendiquées non-vérifiées          ${fmt(cohortClaimed.length).padStart(10)} → workflow vérif batch`
  )
  console.log(
    `  Desc + spécialité + ville sans avis ${fmt(cohortDescReady.length).padStart(10)} → seed avis flywheel`
  )
  console.log(
    `  Sans slug ou stable_id              ${fmt(cohortNoSlug.length).padStart(10)} → migration URL avant publish`
  )

  // ─── 8. TOP SPÉCIALITÉS / DÉPARTEMENTS NOINDEX ─────────
  console.log('\n── 8. TOP SPÉCIALITÉS (noindex) ──\n')
  const specMap = new Map<string, number>()
  const deptMap = new Map<string, number>()
  for (const p of sample) {
    const s = (p.specialty && p.specialty.length > 0 ? p.specialty : '(aucune)') as string
    specMap.set(s, (specMap.get(s) || 0) + 1)
    const d = (p.address_department || '(inconnu)') as string
    deptMap.set(d, (deptMap.get(d) || 0) + 1)
  }
  for (const [k, v] of topN(specMap, 25)) {
    console.log(`  ${k.padEnd(32)} ${fmt(v).padStart(10)}`)
  }
  console.log('\n── 9. TOP DÉPARTEMENTS (noindex) ──\n')
  for (const [k, v] of topN(deptMap, 25)) {
    console.log(`  ${k.padEnd(32)} ${fmt(v).padStart(10)}`)
  }

  // ─── 10. ÉCHANTILLON ALÉATOIRE 10 PROFILS ─────────────
  console.log('\n── 10. ÉCHANTILLON 10 PROFILS NOINDEX ──\n')
  const shuffled = [...sample].sort(() => Math.random() - 0.5).slice(0, 10)
  for (const p of shuffled) {
    const sigs = [
      p.siret ? 'SIRET' : null,
      (p.description?.length ?? 0) > 50 ? 'DESC' : null,
      (p.review_count || 0) > 0 ? `AVIS:${p.review_count}` : null,
      p.is_verified ? 'VERIF' : null,
      p.specialty ? 'SPEC' : null,
      p.phone ? 'TEL' : null,
      p.rge_qualifications && p.rge_qualifications.length > 0
        ? `RGE:${p.rge_qualifications.length}`
        : null,
      p.claimed_at ? 'CLAIM' : null,
      p.slug ? 'SLUG' : null,
    ].filter(Boolean)
    console.log(
      `  ${(p.name || '?').slice(0, 40).padEnd(40)} | ${(p.specialty || '-').padEnd(18)} | ${p.address_city || '-'} (${p.address_department || '-'})`
    )
    console.log(`    score=${score(p)}/6 [${sigs.join(',')}] active=${p.is_active}`)
  }

  // ─── 11. RÉSUMÉ EXEC ─────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║                       RÉSUMÉ                                 ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')
  console.log(
    `Total noindex base                : ${fmt(noindexTrue)} ${noindexTrue && totalEst ? pct(noindexTrue, totalEst) : ''}`
  )
  console.log(`Échantillon analysé                : ${fmt(t)}`)
  console.log(`  Score >=3 (publiables direct)    : ${fmt(gte3)} ${pct(gte3, t)}`)
  console.log(`  Score ==2 (1 enrichissement)     : ${fmt(gte2 - gte3)} ${pct(gte2 - gte3, t)}`)
  console.log(`  Score <2 (profils minces)        : ${fmt(t - gte2)} ${pct(t - gte2, t)}`)
  console.log(`  RGE certifiés                    : ${fmt(cohortRGE.length)}`)
  console.log(`  Avis >=3 & note >=4 (sans RGE)   : ${fmt(cohortReviewsOnly.length)}`)
  console.log(`  Revendiquées non vérifiées       : ${fmt(cohortClaimed.length)}`)
  console.log(`  Sans slug/stable_id              : ${fmt(cohortNoSlug.length)}`)
  console.log()
  console.log('SUGGESTIONS')
  console.log(
    '  Vague A — promouvoir les RGE certifiés (sitemap + noindex=false) : impact SEO immédiat'
  )
  console.log('  Vague B — review-led publish : >=3 avis & note >=4 (cible flywheel)')
  console.log('  Vague C — auto-description Sonnet/Haiku sur cohorte score=2 (manque desc)')
  console.log('  Vague D — workflow vérification revendiquées : améliore score=2 → 3')
  console.log('  Hors scope : score<2 sans projet de claim ni RGE — laisser noindex')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
