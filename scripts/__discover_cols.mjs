import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e)
    const s = statSync(f)
    if (s.isDirectory()) {
      if (e === 'node_modules' || e.startsWith('.')) continue
      walk(f, out)
    } else if (/\.tsx?$/.test(e)) out.push(f)
  }
  return out
}

const tables = process.argv.slice(2)
const files = walk('src')

for (const t of tables) {
  const cols = new Set()
  const fileSet = new Set()
  for (const f of files) {
    const c = readFileSync(f, 'utf8')
    if (!c.includes(`from('${t}'`) && !c.includes(`from("${t}"`)) continue
    fileSet.add(f.replace(/\\/g, '/').replace('src/', ''))
    const re = new RegExp(`\\.from\\(\\s*['"\`]${t}['"\`].*?(?=\\.from\\(|\\n\\n|$)`, 'gs')
    for (const m of c.matchAll(re)) {
      const text = m[0]
      const sm = text.match(/\.select\(\s*['"`]([^'"`]+)['"`]/)
      if (sm) {
        for (const col of sm[1].split(',').map((s) => s.trim().split(':')[0].split('(')[0].trim())) {
          if (col && col !== '*') cols.add(col)
        }
      }
      for (const x of text.matchAll(/\.(eq|neq|gt|gte|lt|lte|like|ilike|is|in|order)\(\s*['"`]([\w]+)/g)) {
        cols.add(x[2])
      }
      // Also from .insert({...}) destructures
      const im = text.match(/\.insert\(\s*\{([^}]+)\}/)
      if (im) {
        for (const x of im[1].matchAll(/(\w+)\s*:/g)) cols.add(x[1])
      }
      const um = text.match(/\.update\(\s*\{([^}]+)\}/)
      if (um) {
        for (const x of um[1].matchAll(/(\w+)\s*:/g)) cols.add(x[1])
      }
    }
  }
  console.log(`${t}: [${[...cols].sort().join(', ')}]`)
  if (fileSet.size) console.log(`  files: ${[...fileSet].slice(0, 3).join(', ')}${fileSet.size > 3 ? `, +${fileSet.size - 3}` : ''}`)
}
