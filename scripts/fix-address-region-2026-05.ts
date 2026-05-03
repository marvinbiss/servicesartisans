/**
 * Fix providers.address_region — normalisation 2026-05.
 *
 * Audit F (2026-05-03) a révélé : 62.6% des artisans RGE avec address_region
 * non normalisée (null, code département, ou nom sans accent).
 *
 * Pipeline :
 *  1. Lit tous les providers avec address_region NULL ou non dans la liste normalisée.
 *  2. Calcule la région via resolveRegion(current, address_department, address_postal_code).
 *  3. UPDATE par batch de 500 avec retry par ligne en cas d'erreur batch.
 *  4. Reporte stats avant/après + cas non résolus pour investigation manuelle.
 *
 * Usage :
 *   npx tsx scripts/fix-address-region-2026-05.ts                # dry-run par défaut
 *   npx tsx scripts/fix-address-region-2026-05.ts --execute      # applique les UPDATEs
 *   npx tsx scripts/fix-address-region-2026-05.ts --execute --rge-only
 */
import { supabase } from './lib/supabase-admin'
import { REGIONS_NORMALIZED, REGION_ALIASES, resolveRegion } from './lib/france-regions'
import * as fs from 'fs'
import * as path from 'path'

const EXECUTE = process.argv.includes('--execute')
const RGE_ONLY = process.argv.includes('--rge-only')
const PAGE = 1000
const UPDATE_BATCH = 500
const MAX_PAGES = 1500 // garde-fou : 1.5M lignes max

type ProviderRow = {
  id: string
  address_region: string | null
  address_department: string | null
  address_postal_code: string | null
}

type Plan = {
  id: string
  before: string | null
  after: string
}

function isDirty(reg: string | null): boolean {
  if (reg === null) return true
  const trimmed = reg.trim()
  if (!trimmed) return true
  if (REGIONS_NORMALIZED.has(trimmed)) return false
  return true // alias, code dept, autre → tout ce qui n'est pas dans la set normalisée
}

function classify(reg: string | null): string {
  if (reg === null) return 'null'
  const t = reg.trim()
  if (!t) return 'empty'
  if (REGIONS_NORMALIZED.has(t)) return 'normalized'
  if (REGION_ALIASES[t]) return 'alias'
  if (/^\d{1,3}$/.test(t)) return 'code_dept'
  return 'other'
}

async function main() {
  console.log('='.repeat(80))
  console.log(
    `FIX address_region — mode: ${EXECUTE ? 'EXECUTE' : 'DRY-RUN'}${RGE_ONLY ? ' [RGE-only]' : ''}`
  )
  console.log('='.repeat(80))

  const stats = {
    scanned: 0,
    clean: 0,
    null_in: 0,
    code_dept_in: 0,
    alias_in: 0,
    other_in: 0,
    resolved: 0,
    unresolved: 0,
    updated: 0,
    update_errors: 0,
  }

  const plans: Plan[] = []
  const unresolved: ProviderRow[] = []

  // ---- 1. Scan paginé ----
  console.log('\n[1] Scan providers (pagination 1000)...')
  for (let page = 0; page < MAX_PAGES; page++) {
    let query = supabase
      .from('providers')
      .select('id, address_region, address_department, address_postal_code')
      .eq('is_active', true)
      .order('id', { ascending: true })
      .range(page * PAGE, (page + 1) * PAGE - 1)

    if (RGE_ONLY) query = query.not('rge_qualifications', 'is', null)

    const { data, error } = await query
    if (error) {
      console.error(`  ERREUR page ${page} :`, error.message)
      break
    }
    if (!data || data.length === 0) break

    stats.scanned += data.length

    for (const row of data as ProviderRow[]) {
      const cat = classify(row.address_region)
      if (cat === 'normalized') {
        stats.clean++
        continue
      }
      if (cat === 'null' || cat === 'empty') stats.null_in++
      else if (cat === 'code_dept') stats.code_dept_in++
      else if (cat === 'alias') stats.alias_in++
      else stats.other_in++

      const resolved = resolveRegion({
        current_region: row.address_region,
        department: row.address_department,
        postal_code: row.address_postal_code,
      })

      if (resolved && REGIONS_NORMALIZED.has(resolved)) {
        if (resolved === row.address_region) {
          // déjà OK (cas alias === normalisé identique)
          stats.clean++
        } else {
          stats.resolved++
          plans.push({ id: row.id, before: row.address_region, after: resolved })
        }
      } else {
        stats.unresolved++
        if (unresolved.length < 200) unresolved.push(row)
      }
    }

    if (data.length < PAGE) break
    if (page % 10 === 9)
      console.log(`  ... page ${page + 1} (${stats.scanned} scannés, ${plans.length} à corriger)`)
  }

  console.log('\n--- Stats scan ---')
  console.log('  Total scannés       :', stats.scanned)
  console.log('  Déjà normalisés     :', stats.clean)
  console.log('  Null/empty          :', stats.null_in)
  console.log('  Code département    :', stats.code_dept_in)
  console.log('  Alias / variante    :', stats.alias_in)
  console.log('  Autre               :', stats.other_in)
  console.log('  → Résolus           :', stats.resolved)
  console.log('  → Non résolus       :', stats.unresolved)
  console.log('  → À UPDATE          :', plans.length)

  // Distribution avant/après
  const targetCount = new Map<string, number>()
  for (const p of plans) {
    targetCount.set(p.after, (targetCount.get(p.after) || 0) + 1)
  }
  console.log('\n--- Distribution cible ---')
  Array.from(targetCount.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([r, n]) => console.log(`  ${r.padEnd(35)} : ${n}`))

  // Sample non résolus
  if (unresolved.length > 0) {
    console.log('\n--- Samples non résolus (max 10) ---')
    for (const r of unresolved.slice(0, 10)) {
      console.log(
        `  id=${r.id.slice(0, 8)}…  region="${r.address_region}"  dept="${r.address_department}"  postal="${r.address_postal_code}"`
      )
    }
  }

  // Dump artefacts
  const OUT_DIR = String.raw`C:\Users\USER\Downloads\_phase0_audit\F_supply`
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const planFile = path.join(
    OUT_DIR,
    EXECUTE ? 'address_region_executed.csv' : 'address_region_plan.csv'
  )
  fs.writeFileSync(
    planFile,
    ['id,before,after', ...plans.map((p) => `${p.id},"${p.before ?? ''}","${p.after}"`)].join('\n'),
    'utf-8'
  )
  console.log(`\n  >>> Plan écrit : ${planFile} (${plans.length} lignes)`)

  if (unresolved.length > 0) {
    const uFile = path.join(OUT_DIR, 'address_region_unresolved.csv')
    fs.writeFileSync(
      uFile,
      [
        'id,address_region,address_department,address_postal_code',
        ...unresolved.map(
          (r) =>
            `${r.id},"${r.address_region ?? ''}","${r.address_department ?? ''}","${r.address_postal_code ?? ''}"`
        ),
      ].join('\n'),
      'utf-8'
    )
    console.log(`  >>> Non résolus : ${uFile} (${unresolved.length} lignes)`)
  }

  // ---- 2. UPDATE batch ----
  if (!EXECUTE) {
    console.log('\n[2] DRY-RUN — aucun UPDATE émis. Relancer avec --execute pour appliquer.')
    return
  }

  if (plans.length === 0) {
    console.log('\n[2] Rien à mettre à jour.')
    return
  }

  console.log(`\n[2] UPDATE par batch de ${UPDATE_BATCH}...`)
  // On regroupe par valeur cible pour minimiser les round-trips :
  // UPDATE WHERE id IN (...) avec la même nouvelle région.
  const grouped = new Map<string, string[]>()
  for (const p of plans) {
    const arr = grouped.get(p.after) || []
    arr.push(p.id)
    grouped.set(p.after, arr)
  }

  for (const [region, ids] of grouped.entries()) {
    let updatedForRegion = 0
    for (let i = 0; i < ids.length; i += UPDATE_BATCH) {
      const chunk = ids.slice(i, i + UPDATE_BATCH)
      const { error } = await supabase
        .from('providers')
        .update({ address_region: region })
        .in('id', chunk)
      if (error) {
        console.error(`  ERREUR UPDATE [${region}] chunk ${i}-${i + chunk.length} :`, error.message)
        // retry par ligne
        for (const id of chunk) {
          const { error: e1 } = await supabase
            .from('providers')
            .update({ address_region: region })
            .eq('id', id)
          if (e1) stats.update_errors++
          else {
            stats.updated++
            updatedForRegion++
          }
        }
      } else {
        stats.updated += chunk.length
        updatedForRegion += chunk.length
      }
    }
    console.log(`  ${region.padEnd(35)} : ${updatedForRegion} mis à jour`)
  }

  console.log('\n--- Bilan UPDATE ---')
  console.log('  Lignes mises à jour :', stats.updated)
  console.log('  Erreurs UPDATE      :', stats.update_errors)

  // ---- 3. Vérification post-update sur sous-ensemble RGE ----
  console.log('\n[3] Vérification post-update (artisans RGE actifs)...')
  const { data: verif, error: e3 } = await supabase
    .from('providers')
    .select('address_region')
    .not('rge_qualifications', 'is', null)
    .eq('is_active', true)
    .limit(20000)
  if (e3) {
    console.error('  ERREUR vérif :', e3.message)
  } else if (verif) {
    let nullAfter = 0
    let dirtyAfter = 0
    let cleanAfter = 0
    for (const r of verif) {
      const reg = r.address_region as string | null
      if (reg === null || !reg.trim()) nullAfter++
      else if (REGIONS_NORMALIZED.has(reg.trim())) cleanAfter++
      else dirtyAfter++
    }
    console.log(`  Sur ${verif.length} RGE actifs :`)
    console.log(
      `    - normalisés : ${cleanAfter} (${((100 * cleanAfter) / verif.length).toFixed(1)}%)`
    )
    console.log(`    - null       : ${nullAfter}`)
    console.log(`    - dirty      : ${dirtyAfter}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('FIX address_region TERMINÉ.')
  console.log('='.repeat(80))
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
