#!/usr/bin/env node
/**
 * scripts/plan-coverage.mjs
 * --------------------------
 * Calcule la couverture du plan SEO 90j depuis docs/plan-seo-90j-backlog.yml.
 *
 * RÈGLES :
 *   1. Couverture = sum(impact_clics_j_p50 des items completed)
 *                 / sum(impact_clics_j_p50 de tous les items)
 *      → métrique pondérée business, pas juste % d'items.
 *
 *   2. Couverture full-auto = couverture en excluant items human_required=true.
 *      → ce que Ralph loop peut atteindre sans Marvin.
 *
 *   3. AHREFS-FIRST gate : un item PENDING/IN_PROGRESS sans
 *      ahrefs.ahrefs_csv_source valide (non null, non 'n/a' sauf pour
 *      cluster_pillar=0 cross-cutting) est INVALIDE → l'audit refuse
 *      le commit qui l'a introduit. C'est l'application de la règle
 *      mémoire `servicesartisans-ahrefs-first-rule`.
 *
 *   4. Tri "next item" pour ralph loop :
 *      a. status=pending
 *      b. blocked_by tous completed
 *      c. human_required=false
 *      d. cluster_pillar prioritaire (1+2 > 0)
 *      e. ROI = impact_clics_j_p50 / max(effort_hours, 0.5) DESC
 *
 * Usage :
 *   node scripts/plan-coverage.mjs                # human report
 *   node scripts/plan-coverage.mjs --json         # JSON output
 *   node scripts/plan-coverage.mjs --next         # next ralph-eligible item
 *   node scripts/plan-coverage.mjs --strict       # exit 1 if Ahrefs gap
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

const args = new Set(process.argv.slice(2))
const jsonOut = args.has('--json')
const nextOut = args.has('--next')
const strict = args.has('--strict')

const ROOT = process.cwd()
const BACKLOG_PATH = join(ROOT, 'docs', 'plan-seo-90j-backlog.yml')

function loadBacklog() {
  const src = readFileSync(BACKLOG_PATH, 'utf8')
  const parsed = yaml.load(src)
  if (!parsed || !parsed.items || !Array.isArray(parsed.items)) {
    throw new Error('Backlog YAML invalide : items[] manquant')
  }
  return parsed
}

function isAhrefsValid(item) {
  // Items completed n'ont pas besoin d'Ahrefs (peuvent être techniques).
  if (item.status === 'completed') return true
  // Cross-cutting items (cluster_pillar=0) peuvent avoir 'n/a'.
  const ahrefs = item.ahrefs ?? {}
  if (ahrefs.cluster_pillar === 0) return true
  const src = ahrefs.ahrefs_csv_source
  if (!src || src === 'n/a' || src === '' || src === null) return false
  return true
}

function computeCoverage(backlog) {
  const items = backlog.items
  const totalImpact = items.reduce((s, it) => s + (it.impact_clics_j_p50 || 0), 0)
  const completed = items.filter((it) => it.status === 'completed')
  const completedImpact = completed.reduce((s, it) => s + (it.impact_clics_j_p50 || 0), 0)

  const autoItems = items.filter((it) => !it.human_required)
  const autoTotal = autoItems.reduce((s, it) => s + (it.impact_clics_j_p50 || 0), 0)
  const autoCompleted = autoItems
    .filter((it) => it.status === 'completed')
    .reduce((s, it) => s + (it.impact_clics_j_p50 || 0), 0)

  const ahrefsGaps = items.filter((it) => !isAhrefsValid(it))

  return {
    coverage_pct: totalImpact > 0 ? (completedImpact / totalImpact) * 100 : 0,
    coverage_full_auto_pct: autoTotal > 0 ? (autoCompleted / autoTotal) * 100 : 0,
    items_done: completed.length,
    items_total: items.length,
    items_auto_total: autoItems.length,
    impact_completed: completedImpact,
    impact_total: totalImpact,
    impact_auto_total: autoTotal,
    ahrefs_gaps: ahrefsGaps.map((it) => ({ id: it.id, status: it.status })),
    ahrefs_gaps_count: ahrefsGaps.length,
  }
}

function pickNextItem(backlog) {
  const items = backlog.items
  const completedIds = new Set(items.filter((it) => it.status === 'completed').map((it) => it.id))

  const eligible = items.filter((it) => {
    if (it.status !== 'pending') return false
    if (it.human_required) return false
    const blocked = (it.blocked_by ?? []).some((id) => !completedIds.has(id))
    if (blocked) return false
    return isAhrefsValid(it)
  })

  if (eligible.length === 0) return null

  eligible.sort((a, b) => {
    // Cross-cutting (cluster_pillar=0) en dernier
    const ap = a.ahrefs?.cluster_pillar ?? 0
    const bp = b.ahrefs?.cluster_pillar ?? 0
    if (ap === 0 && bp !== 0) return 1
    if (bp === 0 && ap !== 0) return -1

    const aRoi = (a.impact_clics_j_p50 || 0) / Math.max(a.effort_hours || 0.5, 0.5)
    const bRoi = (b.impact_clics_j_p50 || 0) / Math.max(b.effort_hours || 0.5, 0.5)
    return bRoi - aRoi
  })

  return eligible[0]
}

function main() {
  const backlog = loadBacklog()
  const coverage = computeCoverage(backlog)
  const next = pickNextItem(backlog)

  if (jsonOut) {
    console.log(
      JSON.stringify(
        {
          coverage,
          next: next
            ? {
                id: next.id,
                title: next.title,
                impact: next.impact_clics_j_p50,
                effort: next.effort_hours,
                roi: (next.impact_clics_j_p50 || 0) / Math.max(next.effort_hours || 0.5, 0.5),
                dod: next.dod,
              }
            : null,
        },
        null,
        2
      )
    )
  } else if (nextOut) {
    if (!next) {
      console.log('Aucun item ralph-éligible disponible.')
      process.exit(2)
    }
    console.log(`\nNext ralph-eligible :  ${next.id}`)
    console.log(`  ${next.title}`)
    console.log(
      `  impact P50    : +${next.impact_clics_j_p50} clics/j   |  effort ${next.effort_hours}h   |  ROI ${((next.impact_clics_j_p50 || 0) / Math.max(next.effort_hours || 0.5, 0.5)).toFixed(0)} clics/h`
    )
    console.log(
      `  Ahrefs        : ${next.ahrefs?.kw_primary ?? 'n/a'}  vol=${next.ahrefs?.volume_ahrefs ?? '?'}  KD=${next.ahrefs?.kd_ahrefs ?? '?'}  CPC=${next.ahrefs?.cpc_ahrefs ?? '?'}€`
    )
    console.log(`  Source CSV    : ${next.ahrefs?.ahrefs_csv_source ?? 'n/a'}`)
    console.log(`  DoD           : ${next.dod}\n`)
  } else {
    console.log('\n📊 Plan SEO 90j — Couverture\n')
    console.log(`  Couverture pondérée impact      : ${coverage.coverage_pct.toFixed(1)}%`)
    console.log(`  Couverture full-auto (Ralph)    : ${coverage.coverage_full_auto_pct.toFixed(1)}%`)
    console.log(`  Items completed                  : ${coverage.items_done} / ${coverage.items_total}`)
    console.log(
      `  Impact capté                     : ${coverage.impact_completed} / ${coverage.impact_total} clics/j`
    )
    if (coverage.ahrefs_gaps_count > 0) {
      console.log(`\n  ⚠️  Items SANS source Ahrefs valide : ${coverage.ahrefs_gaps_count}`)
      for (const g of coverage.ahrefs_gaps) console.log(`     - ${g.id} (${g.status})`)
    } else {
      console.log('\n  ✅ Tous les items pending/in_progress citent une source Ahrefs.')
    }
    if (next) {
      console.log(
        `\n  ▶️  Next ralph-eligible : ${next.id} — ROI ${((next.impact_clics_j_p50 || 0) / Math.max(next.effort_hours || 0.5, 0.5)).toFixed(0)} clics/h`
      )
    } else {
      console.log('\n  🟢 Aucun item ralph-éligible (tout fait ou bloqué humain).')
    }
    console.log('')
  }

  if (strict && coverage.ahrefs_gaps_count > 0) process.exit(1)
}

main()
