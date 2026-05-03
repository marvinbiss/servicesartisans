/**
 * Fix broken markdown links vers `/services/{serrurier,vitrier,carreleur,cuisiniste}`
 * dans les batches blog. Pivot full RGE 2026-05-03 a supprimé ces 4 services
 * du catalogue (gone-paths.ts retourne 410). Les liens restants en blog
 * pointent vers du 410 → broken.
 *
 * Stratégie : retirer le wrapping markdown `[texte](url)` → `texte` (le mot
 * reste visible mais sans hyperlien). Conserve le sens narratif sans casser
 * le SEO interne.
 *
 * Usage : npx tsx scripts/fix-broken-links-pivot-rge.ts (dry-run par défaut)
 *         npx tsx scripts/fix-broken-links-pivot-rge.ts --execute
 */
import * as fs from 'fs'
import * as path from 'path'

const REPO = String.raw`C:\Users\USER\Downloads\servicesartisans`
const EXECUTE = process.argv.includes('--execute')

// 4 services retirés au pivot full RGE 2026-05-03 :
// 5 services retirés au pivot pure-play 2026-05-02 :
// 16 services niche retirés au pivot 2026-05-01 :
// → tous renvoient 410 via gone-paths.ts. Tous les liens internes vers
//   `/services/<slug>` ou `/services/<slug>/<ville>` sont broken.
const REMOVED = [
  // Pivot full RGE 2026-05-03
  'serrurier',
  'vitrier',
  'carreleur',
  'cuisiniste',
  // Pivot pure-play 2026-05-02
  'jardinier',
  'paysagiste',
  'demenageur',
  'nettoyage',
  'alarme-securite',
  // Pivot niche 2026-05-01
  'solier',
  'terrassier',
  'metallier',
  'ferronnier',
  'poseur-de-parquet',
  'miroitier',
  'storiste',
  'architecte-interieur',
  'decorateur',
  'domoticien',
  'pisciniste',
  'antenniste',
  'ascensoriste',
  'geometre',
  'desinsectisation',
  'deratisation',
]

// Match [text](url) where url ends with /services/<removed> (with optional ville).
// `[^\]\n]+` exclut explicitement `\n` pour éviter le match cross-line qui a
// englouti le `content: [` array opening en même temps qu'un markdown link
// (bug 2026-05-03 sur existing-articles.ts).
// Keep `text`, drop the link wrapper.
const PATTERNS: { regex: RegExp; description: string }[] = REMOVED.map((slug) => ({
  regex: new RegExp(`\\[([^\\]\\n]+)\\]\\(\\s*/services/${slug}(?:[/#?][^\\)\\n]*)?\\s*\\)`, 'g'),
  description: `markdown link to /services/${slug}`,
}))

// Bonus: handle the bare `/services/<removed>` href in JSX/TSX (without markdown)
// We keep them in a separate report — needs case-by-case fix (UI link).
const BARE_HREF_PATTERN = new RegExp(`href=["'\`]/services/(?:${REMOVED.join('|')})[/"'\`]`)

const targets: string[] = []
function walk(dir: string) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(f.name)) continue
      walk(p)
    } else if (/\.(ts|tsx|js|jsx|md|mdx)$/.test(f.name)) {
      targets.push(p)
    }
  }
}
walk(path.join(REPO, 'src'))

console.log('='.repeat(70))
console.log(`FIX broken markdown links — mode: ${EXECUTE ? 'EXECUTE' : 'DRY-RUN'}`)
console.log('='.repeat(70))
console.log(`Scannés : ${targets.length} fichiers\n`)

let totalEdits = 0
const bareHrefFiles: string[] = []

for (const file of targets) {
  let text = fs.readFileSync(file, 'utf8')
  let editsInFile = 0
  for (const { regex } of PATTERNS) {
    const matches = text.match(regex)
    if (matches) {
      editsInFile += matches.length
      text = text.replace(regex, '$1')
    }
  }
  if (BARE_HREF_PATTERN.test(text)) {
    bareHrefFiles.push(path.relative(REPO, file))
  }
  if (editsInFile > 0) {
    totalEdits += editsInFile
    console.log(`  ${editsInFile} → ${path.relative(REPO, file)}`)
    if (EXECUTE) fs.writeFileSync(file, text, 'utf8')
  }
}

console.log(`\nTotal edits : ${totalEdits}${EXECUTE ? ' (appliqués)' : ' (dry-run, à confirmer)'}`)

if (bareHrefFiles.length > 0) {
  console.log(`\n⚠️ Fichiers contenant un href= bare vers ces services (à fix manuellement) :`)
  bareHrefFiles.forEach((f) => console.log(`  ${f}`))
}

if (!EXECUTE) {
  console.log('\nRelancer avec --execute pour appliquer.')
}
