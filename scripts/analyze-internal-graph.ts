/**
 * Internal linking graph snapshot.
 *
 * Scans every `.tsx` under `src/app` + `src/components` for `<Link href=` and
 * `href=` attributes (string literals + template literals with known prefixes),
 * builds an inbound-count table per canonical route prefix, and prints:
 *
 *   - Top 20 most-linked routes
 *   - Routes with < 3 inbound links (orphan candidates)
 *   - North Star: % of indexable route prefixes with ≥5 inbound links
 *
 * Usage: npx tsx scripts/analyze-internal-graph.ts [--json]
 *
 * This is a static-analysis heuristic — it cannot evaluate runtime-generated
 * hrefs (e.g. `href={`/services/${slug}/${city}`}`). Those links count against
 * a bucket identified by the static prefix ("/services/*").
 */
import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'src')

type LinkHit = { from: string; to: string; bucket: string }

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
      walk(p, out)
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      out.push(p)
    }
  }
  return out
}

function toBucket(href: string): string {
  if (!href.startsWith('/')) return '__external__'
  const clean = href.split('?')[0].split('#')[0]
  const segs = clean.split('/').filter(Boolean)
  if (segs.length === 0) return '/'
  const head = segs[0]
  if (['services', 'tarifs', 'devis', 'avis', 'urgence', 'problemes'].includes(head)) {
    return segs.length === 1 ? `/${head}` : `/${head}/*`
  }
  if (head === 'blog') return segs.length === 1 ? '/blog' : '/blog/*'
  if (head === 'guides') return segs.length === 1 ? '/guides' : '/guides/*'
  if (head === 'villes') return segs.length === 1 ? '/villes' : '/villes/*'
  if (head === 'departements') return segs.length === 1 ? '/departements' : '/departements/*'
  if (head === 'regions') return segs.length === 1 ? '/regions' : '/regions/*'
  if (head === 'rge') return segs.length === 1 ? '/rge' : '/rge/*'
  if (head === 'cee') return segs.length === 1 ? '/cee' : '/cee/*'
  if (head === 'artisan') return segs.length === 1 ? '/artisan' : '/artisan/*'
  if (head === 'artisans-rge') return '/artisans-rge/*'
  if (head === 'barometre')
    return segs.length === 1 ? '/barometre' : `/barometre/${segs.slice(1).join('/')}`
  return clean.length > 64 ? clean.slice(0, 64) + '…' : clean
}

const HREF_RE =
  /(?:href|Link[^>]*?href)\s*=\s*(?:"([^"]+)"|'([^']+)'|\{`([^`$}]+)(?:\$\{[^}]*\}[^`]*)?`\})/g

function collect(): LinkHit[] {
  const files = walk(SRC)
  const hits: LinkHit[] = []
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/')
    const src = fs.readFileSync(file, 'utf-8')
    let m: RegExpExecArray | null
    HREF_RE.lastIndex = 0
    while ((m = HREF_RE.exec(src)) !== null) {
      const raw = m[1] ?? m[2] ?? m[3] ?? ''
      if (!raw) continue
      if (raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:'))
        continue
      if (raw.startsWith('http') && !raw.startsWith('https://servicesartisans.fr')) continue
      const to = raw.replace(/^https:\/\/servicesartisans\.fr/, '') || '/'
      hits.push({ from: rel, to, bucket: toBucket(to) })
    }
  }
  return hits
}

function main() {
  const hits = collect()
  const byBucket = new Map<string, Set<string>>()
  for (const h of hits) {
    if (h.bucket === '__external__') continue
    const set = byBucket.get(h.bucket) ?? new Set<string>()
    set.add(h.from)
    byBucket.set(h.bucket, set)
  }
  const rows = [...byBucket.entries()]
    .map(([bucket, froms]) => ({ bucket, inbound: froms.size }))
    .sort((a, b) => b.inbound - a.inbound)

  const totalBuckets = rows.length
  const strong = rows.filter((r) => r.inbound >= 5).length
  const weak = rows.filter((r) => r.inbound < 3)
  const medium = rows.filter((r) => r.inbound >= 3 && r.inbound < 5)

  if (process.argv.includes('--json')) {
    process.stdout.write(
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          totalBuckets,
          northStarPct: Math.round((strong / totalBuckets) * 1000) / 10,
          distribution: { strong: strong, medium: medium.length, weak: weak.length },
          rows,
        },
        null,
        2
      )
    )
    return
  }

  console.log('\n=== INTERNAL GRAPH SNAPSHOT ===')
  console.log(`Total route buckets: ${totalBuckets}`)
  console.log(
    `North Star (buckets with ≥5 inbound): ${strong}/${totalBuckets} (${((strong / totalBuckets) * 100).toFixed(1)}%)`
  )
  console.log(`  ≥5 inbound:  ${strong}`)
  console.log(`  3-4 inbound: ${medium.length}`)
  console.log(`  <3 inbound:  ${weak.length}  (orphan candidates)`)

  console.log('\n--- TOP 20 MOST-LINKED ---')
  for (const r of rows.slice(0, 20)) {
    console.log(`  ${String(r.inbound).padStart(4)}  ${r.bucket}`)
  }

  console.log(`\n--- ORPHAN CANDIDATES (<3 inbound, first 30) ---`)
  for (const r of weak.slice(0, 30)) {
    console.log(`  ${String(r.inbound).padStart(4)}  ${r.bucket}`)
  }

  console.log('\nRun with --json to pipe into dashboards.')
}

main()
