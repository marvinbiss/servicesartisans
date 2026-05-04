#!/usr/bin/env node
/**
 * Extrait du content-gap Ahrefs existant (75K rows, daté 2026-04-18) les
 * keywords RGE / CEE / MaPrimeRénov' / rénovation énergétique où :
 *   - Au moins UN concurrent (pagesjaunes / travaux.com / izi-by-edf) rank top 30
 *   - SA n'est pas dans le top 50 (ou absent)
 *   - Volume mensuel >= 50
 *
 * Output : docs/ahrefs-renovation-keywords-extracted-2026-05-04.{json,md}
 *
 * Usage :
 *   node scripts/analyze-renovation-keywords-from-existing.mjs
 *
 * Limite assumée : ces 3 concurrents NE sont PAS les leaders RGE/CEE
 * (Effy, Heero, Sonergia absents) → résultat sera un FLOOR, pas un ceiling.
 * Pour le vrai gap RGE/CEE : pull séparé requis (voir RECOMMANDATIONS.md).
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse/sync'

const SRC = 'docs/ahrefs-audit-2026-04/normalized/ahrefs-content-gap.csv'

const PATTERNS = {
  maprimerenov: /maprimer[eé]nov|ma\s+prime\s+r[eé]nov|prime\s+r[eé]nov/i,
  cee: /\bcee\b|certificat.{0,15}d.{0,3}[eé]conomie|coup.{0,5}pouce|prime.{0,5}[eé]nergie/i,
  rge: /\brge\b|qualibat|qualipac|qualifelec|qualisol|qualibois|qualit.?enr/i,
  renovation: /r[eé]novation\s*[eé]nerg|isolation|pompe.{0,5}chaleur|chauffage|chaudi[eè]re|menuiserie|vmc|ballon.{0,5}thermo|panneau.{0,5}solaire|photovolta[iï]que/i,
  diagnostic: /\bdpe\b|audit\s+[eé]nerg|passoire\s+thermique/i,
  aides: /\beco.?pr[eê]t|eco.?ptz|aide.{0,15}r[eé]nov|anah|tva.{0,5}5/i,
}

function classifyKeyword(kw) {
  const matches = []
  for (const [cat, re] of Object.entries(PATTERNS)) {
    if (re.test(kw)) matches.push(cat)
  }
  return matches
}

function safeNum(v) {
  if (v === undefined || v === null || v === '') return 0
  const n = Number(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

const csvRaw = fs.readFileSync(SRC, 'utf8')
const records = parse(csvRaw, { columns: true, bom: true, skip_empty_lines: true })

console.log(`Loaded ${records.length} rows from ${SRC}`)

const COMPETITORS = ['pagesjaunes.fr', 'travaux.com', 'izi-by-edf.fr']

const out = []
for (const r of records) {
  const kw = r.Keyword || r['Keyword'] || ''
  if (!kw) continue
  const cats = classifyKeyword(kw)
  if (cats.length === 0) continue

  const volume = safeNum(r.Volume)
  if (volume < 50) continue

  const kd = safeNum(r.KD)
  const cpc = safeNum(r.CPC)
  const saPos = safeNum(r['servicesartisans.fr/: Organic Position'])
  if (saPos > 0 && saPos <= 50) continue

  let bestCompetitorPos = 999
  let bestCompetitor = ''
  for (const c of COMPETITORS) {
    const pos = safeNum(r[`${c}/: Organic Position`])
    if (pos > 0 && pos < bestCompetitorPos) {
      bestCompetitorPos = pos
      bestCompetitor = c
    }
  }
  if (bestCompetitorPos > 30) continue

  const score = volume * (1 / (kd + 5)) * (1 / (bestCompetitorPos + 1))

  out.push({
    keyword: kw,
    categories: cats,
    volume,
    kd,
    cpc,
    sa_position: saPos || null,
    best_competitor: bestCompetitor,
    best_competitor_position: bestCompetitorPos,
    opportunity_score: Math.round(score * 100) / 100,
  })
}

out.sort((a, b) => b.opportunity_score - a.opportunity_score)

const today = new Date().toISOString().slice(0, 10)
const jsonPath = `docs/ahrefs-renovation-keywords-extracted-${today}.json`
const mdPath = `docs/ahrefs-renovation-keywords-extracted-${today}.md`

fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2))

const byCategory = {}
for (const row of out) {
  for (const c of row.categories) {
    byCategory[c] = (byCategory[c] || 0) + 1
  }
}

const top200 = out.slice(0, 200)

const md = [
  `# Keywords Rénovation Énergétique extraits du content-gap Ahrefs`,
  ``,
  `**Date extraction** : ${today}`,
  `**Source** : \`${SRC}\` (snapshot 2026-04-18, 75K rows)`,
  `**Concurrents inclus** : Pages Jaunes, Travaux.com, IZI by EDF`,
  `**⚠️ Limite** : Effy / Heero / Sonergia / France-Renov / QuelleEnergie **absents** → résultats = FLOOR. Pull supplémentaire requis pour vraie domination niche.`,
  ``,
  `## Filtres appliqués`,
  ``,
  `- Keyword matche RGE / CEE / MaPrimeRénov' / rénovation / diagnostic / aides`,
  `- Volume mensuel ≥ 50`,
  `- Au moins 1 concurrent rank top 30`,
  `- SA absent ou rank > 50`,
  `- Score = volume × (1 / (KD + 5)) × (1 / (pos_concurrent + 1))`,
  ``,
  `## Résumé`,
  ``,
  `**${out.length} keywords actionnables identifiés.**`,
  ``,
  `### Par catégorie`,
  ``,
  ...Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `- **${c}** : ${n}`),
  ``,
  `## Top 200 opportunités`,
  ``,
  `| # | Keyword | Cat | Vol/mo | KD | Concurrent (pos) | SA | Score |`,
  `|---|---------|-----|--------|-----|------------------|-----|-------|`,
  ...top200.map(
    (r, i) =>
      `| ${i + 1} | ${r.keyword.replace(/\|/g, '\\|')} | ${r.categories.join(',')} | ${r.volume} | ${r.kd} | ${r.best_competitor.replace('.fr', '')} (#${r.best_competitor_position}) | ${r.sa_position ?? '—'} | ${r.opportunity_score} |`
  ),
  ``,
  `## Données complètes`,
  ``,
  `JSON : \`${jsonPath}\``,
  ``,
].join('\n')

fs.writeFileSync(mdPath, md)
console.log(`\n✓ Written ${out.length} keywords → ${jsonPath} + ${mdPath}`)
console.log(`  Top 5 :`)
out.slice(0, 5).forEach((r) =>
  console.log(`    [${r.opportunity_score}] ${r.keyword} (vol ${r.volume}, KD ${r.kd}, ${r.best_competitor} #${r.best_competitor_position})`)
)
