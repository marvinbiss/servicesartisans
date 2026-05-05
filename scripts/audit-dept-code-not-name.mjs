#!/usr/bin/env node
/**
 * audit-dept-code-not-name.mjs — anti-régression du bug 2026-05-05
 * ----------------------------------------------------------------
 * Le 2026-05-05 on a découvert que `providers.address_department` stocke des
 * CODES INSEE ('75', '69', '2A') et non des NOMS ('Paris', 'Rhône'). Toutes
 * les queries `.eq('address_department', NAME)` renvoyaient 0 silencieusement.
 *
 * Conséquences observées :
 *   • /rge/pompe-a-chaleur/paris en NOINDEX (1 PAC RGE en dept 75 mais query→0)
 *   • dept fallback toujours 0 sur /services /avis /problemes /rge
 *   • 1903 combos (specialty × dept_code) potentiellement noindex à tort
 *
 * Ce hook bloque tout commit qui ré-introduit `location.department_name`
 * comme arg pour les fonctions qui filtrent `address_department`.
 */
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const FORBIDDEN_CALLS = [
  'getRgeProvidersByServiceAndDepartement',
  'getRgeCountByServiceAndDepartementStrict',
  'getReviewStatsByDept',
  'getTopReviewsByDept',
  'getProvidersByServiceAndDepartment',
  'hasDeptProviderFallback',
]

const FORBIDDEN_ARGS = [
  /,\s*location\.department_name\b/,
  /,\s*villeData\.departement\b(?!Code)/,
  /,\s*dept\.name\b/,
  /,\s*ville\.departement\b(?!Code)/,
]

const SCAN_DIRS = [
  'src/app',
  'src/components',
  'src/lib/seo',
]

function listFiles() {
  try {
    const out = execSync(
      `git ls-files ${SCAN_DIRS.join(' ')} -- '*.ts' '*.tsx'`,
      { encoding: 'utf8', cwd: process.cwd() }
    )
    return out.split('\n').filter((f) => f.trim().length > 0)
  } catch {
    // Fallback: just find them
    const out = execSync(
      `node -e "const fs=require('fs'),path=require('path');function walk(d){return fs.readdirSync(d).flatMap(f=>{const p=path.join(d,f);return fs.statSync(p).isDirectory()?walk(p):[p]})};const files=${JSON.stringify(SCAN_DIRS)}.flatMap(walk).filter(f=>/\\.(ts|tsx)$/.test(f));console.log(files.join('\\n'))"`,
      { encoding: 'utf8' }
    )
    return out.split('\n').filter((f) => f.trim().length > 0)
  }
}

const violations = []
for (const file of listFiles()) {
  let src
  try {
    src = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const fn of FORBIDDEN_CALLS) {
    const callPattern = new RegExp(`\\b${fn}\\s*\\(([^)]*)\\)`, 'gms')
    let m
    while ((m = callPattern.exec(src)) !== null) {
      const argsBlock = m[1]
      for (const argRe of FORBIDDEN_ARGS) {
        if (argRe.test(argsBlock)) {
          // Compute line number
          const upTo = src.slice(0, m.index)
          const line = upTo.split(/\r?\n/).length
          violations.push({
            file,
            line,
            fn,
            offending: m[0].slice(0, 200).replace(/\s+/g, ' '),
          })
          break
        }
      }
    }
  }
}

const strict = process.argv.includes('--strict')

if (violations.length === 0) {
  console.log('✅ audit-dept-code-not-name : aucun appel ne passe un nom de département.')
  process.exit(0)
}

console.error(`\n❌ ${violations.length} appel(s) passent un NOM de département au lieu du CODE :\n`)
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`)
  console.error(`    fn   : ${v.fn}`)
  console.error(`    code : ${v.offending}`)
  console.error(`    fix  : passer le CODE INSEE (ex: location.department_code)`)
  console.error()
}
console.error(
  '  Source de vérité : `providers.address_department` stocke le code 2-3 chars\n' +
    '  (sirene seeders : codePostalEtablissement.substring(0,2)).\n' +
    '  Voir bug post-mortem 2026-05-05 dans memory ServicesArtisans.\n'
)

process.exit(strict ? 1 : 0)
