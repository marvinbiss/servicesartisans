/**
 * Sitemap Dry-Run Stats — generates a report of URL distribution
 * before and after smart sitemap v2 pruning.
 *
 * Usage:
 *   npx tsx src/lib/seo/sitemap-stats.ts
 *   npx tsx src/lib/seo/sitemap-stats.ts --json
 */

import { services, villes, departements, regions, getQuartiersByVille } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getGuideSlugs } from '@/lib/data/guides'
import { articleSlugs } from '@/lib/data/blog/articles'
import { SITEMAP_TOP_CITIES } from '@/lib/seo/sitemap-manifest'

interface CategoryStats {
  name: string
  urls: number
  status: 'included' | 'excluded'
  reason?: string
}

export function generateSitemapStats(): {
  included: CategoryStats[]
  excluded: CategoryStats[]
  totalIncluded: number
  totalExcluded: number
} {
  const emergencySlugs = Object.keys(tradeContent).filter(s => tradeContent[s].emergencyInfo)
  const tradeSlugs = getTradesSlugs()
  const problemSlugs = getProblemSlugs()
  const guideSlugs = getGuideSlugs()

  // Count total quartiers
  let totalQuartiers = 0
  for (const v of villes) {
    totalQuartiers += (getQuartiersByVille(v.slug)?.length || 0)
  }

  // ── Included categories ───────────────────────────────────────────
  const included: CategoryStats[] = [
    { name: 'Homepage', urls: 1, status: 'included' },
    { name: 'Pages statiques', urls: 19, status: 'included' },
    { name: 'Blog articles', urls: articleSlugs.length, status: 'included' },
    { name: 'Services (hub + pages)', urls: 1 + services.length, status: 'included' },
    { name: 'Urgence (hub + pages)', urls: emergencySlugs.length, status: 'included' },
    { name: 'Tarifs (hub + pages)', urls: tradeSlugs.length, status: 'included' },
    { name: 'Devis (hub + pages)', urls: tradeSlugs.length, status: 'included' },
    { name: 'Avis (hub + pages)', urls: 1 + tradeSlugs.length, status: 'included' },
    { name: 'Problèmes (hub + pages)', urls: 1 + problemSlugs.length, status: 'included' },
    { name: 'Guides (hub + pages)', urls: 1 + guideSlugs.length, status: 'included' },
    { name: `Service × ville (top ${SITEMAP_TOP_CITIES})`, urls: services.length * SITEMAP_TOP_CITIES, status: 'included' },
    { name: 'Départements (hub + pages)', urls: 1 + departements.length, status: 'included' },
    { name: 'Régions (hub + pages)', urls: 1 + regions.length, status: 'included' },
  ]

  // ── Excluded categories ───────────────────────────────────────────
  const excluded: CategoryStats[] = [
    {
      name: 'Villes individuelles',
      urls: 1 + villes.length,
      status: 'excluded',
      reason: 'Maillage interne suffisant',
    },
    {
      name: 'Quartiers',
      urls: totalQuartiers,
      status: 'excluded',
      reason: 'Trop granulaire pour un jeune domaine',
    },
    {
      name: 'Service × quartier',
      urls: totalQuartiers * services.length,
      status: 'excluded',
      reason: 'Millions d\'URLs sans contenu unique',
    },
    {
      name: `Service × ville (villes ${SITEMAP_TOP_CITIES + 1}-${villes.length})`,
      urls: services.length * (villes.length - SITEMAP_TOP_CITIES),
      status: 'excluded',
      reason: 'Villes de population < top N',
    },
    {
      name: 'Devis × ville',
      urls: services.length * villes.length,
      status: 'excluded',
      reason: 'Pages template sans données uniques',
    },
    {
      name: 'Devis × quartier',
      urls: totalQuartiers * services.length,
      status: 'excluded',
      reason: 'Millions d\'URLs template',
    },
    {
      name: 'Urgence × ville',
      urls: emergencySlugs.length * villes.length,
      status: 'excluded',
      reason: 'Pages template sans données uniques',
    },
    {
      name: 'Tarifs × ville',
      urls: services.length * villes.length,
      status: 'excluded',
      reason: 'Pages template sans données uniques',
    },
    {
      name: 'Avis × ville',
      urls: tradeSlugs.length * villes.length,
      status: 'excluded',
      reason: 'Pas d\'avis réels, pages vides',
    },
    {
      name: 'Problèmes × ville',
      urls: problemSlugs.length * villes.length,
      status: 'excluded',
      reason: 'Pages template sans données uniques',
    },
    {
      name: 'Département × service',
      urls: departements.length * tradeSlugs.length,
      status: 'excluded',
      reason: 'Accessible via maillage, pas de contenu unique',
    },
    {
      name: 'Région × service',
      urls: regions.length * tradeSlugs.length,
      status: 'excluded',
      reason: 'Accessible via maillage',
    },
  ]

  const totalIncluded = included.reduce((sum, c) => sum + c.urls, 0)
  const totalExcluded = excluded.reduce((sum, c) => sum + c.urls, 0)

  return { included, excluded, totalIncluded, totalExcluded }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function printReport() {
  const { included, excluded, totalIncluded, totalExcluded } = generateSitemapStats()

  console.log('')
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║          SITEMAP SMART v2 — DRY RUN REPORT                 ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')

  console.log('  URLS INCLUSES DANS LE SITEMAP')
  console.log('  ─────────────────────────────────────────────────────')
  for (const cat of included) {
    const urlStr = formatNumber(cat.urls).padStart(8)
    console.log(`  ${urlStr}  ${cat.name}`)
  }
  console.log('  ─────────────────────────────────────────────────────')
  console.log(`  ${formatNumber(totalIncluded).padStart(8)}  TOTAL INCLUS`)
  console.log('')

  console.log('  URLS EXCLUES DU SITEMAP (toujours indexables via maillage)')
  console.log('  ─────────────────────────────────────────────────────')
  for (const cat of excluded) {
    const urlStr = formatNumber(cat.urls).padStart(8)
    console.log(`  ${urlStr}  ${cat.name}`)
    if (cat.reason) {
      console.log(`            → ${cat.reason}`)
    }
  }
  console.log('  ─────────────────────────────────────────────────────')
  console.log(`  ${formatNumber(totalExcluded).padStart(8)}  TOTAL EXCLU`)
  console.log('')

  const reduction = ((1 - totalIncluded / (totalIncluded + totalExcluded)) * 100).toFixed(1)
  console.log(`  Réduction : ${reduction}% des URLs retirées du sitemap`)
  console.log(`  Ratio     : ${formatNumber(totalIncluded)} inclus / ${formatNumber(totalIncluded + totalExcluded)} total`)
  console.log('')
}

// CLI entrypoint
if (typeof process !== 'undefined' && process.argv[1]?.includes('sitemap-stats')) {
  const isJson = process.argv.includes('--json')
  if (isJson) {
    const stats = generateSitemapStats()
    console.log(JSON.stringify(stats, null, 2))
  } else {
    printReport()
  }
}
