/**
 * Orphan Page Detection & Auto-Fix System
 *
 * Builds a static link graph from france.ts data, navigation.ts, and trade-content.ts
 * to identify pages in the sitemap with zero or insufficient internal links.
 *
 * No DB queries — fully static analysis.
 */

import { services, villes, departements, regions } from '@/lib/data/france'
import { getTradesSlugs } from '@/lib/data/trade-content'
import { popularServices, popularCities, relatedServices } from '@/lib/constants/navigation'
import { SITEMAP_CITY_COUNT, SITEMAP_CITY_COUNT_TIER2 } from '@/lib/seo/sitemap-config'

// ── Types ───────────────────────────────────────────────────────────────

export interface OrphanReport {
  totalPages: number
  linkedPages: number
  orphanPages: string[] // URLs with 0 internal links pointing to them
  weakPages: string[] // URLs with < 3 internal links
  depthOver3: string[] // URLs at depth > 3 from homepage
  maxDepth: number
  generatedAt: string
}

export interface RescueLink {
  page: string
  suggestedParent: string
}

// ── Helpers ─────────────────────────────────────────────────────────────

const serviceSlugs = services.map((s) => s.slug)
const tradeSlugs = getTradesSlugs()

/** Population cities used in Tier 1 sitemaps */
const tier1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
/** Population cities used in Tier 2 sitemaps */
const tier2Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)

function addLink(graph: Map<string, Set<string>>, from: string, to: string): void {
  let targets = graph.get(from)
  if (!targets) {
    targets = new Set<string>()
    graph.set(from, targets)
  }
  targets.add(to)
}

// ── Core Functions ──────────────────────────────────────────────────────

/**
 * Build an adjacency list of internal links by analyzing all static
 * linking patterns across the site.
 *
 * Returns Map<page, Set<pages it links to>>
 */
export function buildLinkGraph(): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>()

  // ── 1. Homepage links ─────────────────────────────────────────────
  const home = '/'

  // Homepage → popular services (from navigation.ts)
  for (const svc of popularServices) {
    addLink(graph, home, `/services/${svc.slug}`)
  }

  // Homepage → popular cities (from navigation.ts)
  for (const city of popularCities) {
    addLink(graph, home, `/villes/${city.slug}`)
  }

  // Homepage → hub pages
  const hubPaths = [
    '/services',
    '/tarifs',
    '/urgence',
    '/devis',
    '/avis',
    '/blog',
    '/guides',
    '/faq',
    '/barometre',
    '/departements',
    '/regions',
    '/villes',
  ]
  for (const hub of hubPaths) {
    addLink(graph, home, hub)
  }

  // ── 2. /services hub → all service pages ──────────────────────────
  for (const svc of serviceSlugs) {
    addLink(graph, '/services', `/services/${svc}`)
  }

  // ── 3. Service hub pages → cities and cross-intent ────────────────
  for (const svc of serviceSlugs) {
    const svcPath = `/services/${svc}`

    // Service page → popular cities for that service
    for (const city of popularCities) {
      addLink(graph, svcPath, `/services/${svc}/${city.slug}`)
    }

    // Service page → first N cities by population (nearby cities pattern)
    const topCities = tier1Cities.slice(0, 20)
    for (const city of topCities) {
      addLink(graph, svcPath, `/services/${svc}/${city.slug}`)
    }

    // Cross-intent: service → tarifs, devis, urgence, avis for same service
    addLink(graph, svcPath, `/tarifs/${svc}`)
    addLink(graph, svcPath, `/devis/${svc}`)
    addLink(graph, svcPath, `/urgence/${svc}`)
    addLink(graph, svcPath, `/avis/${svc}`)

    // Related services from navigation.ts
    const related = relatedServices[svc]
    if (related) {
      for (const relSlug of related) {
        addLink(graph, svcPath, `/services/${relSlug}`)
      }
    }
  }

  // ── 4. Service×city pages → cross-intent and geo links ────────────
  for (const svc of serviceSlugs) {
    for (const city of tier1Cities) {
      const svcCityPath = `/services/${svc}/${city.slug}`

      // Cross-intent links (5 intents)
      addLink(graph, svcCityPath, `/services/${svc}/${city.slug}`)
      addLink(graph, svcCityPath, `/services/${svc}/${city.slug}`)
      addLink(graph, svcCityPath, `/urgence/${svc}/${city.slug}`)
      addLink(graph, svcCityPath, `/avis/${svc}/${city.slug}`)

      // Back to service hub and city page
      addLink(graph, svcCityPath, `/services/${svc}`)
      addLink(graph, svcCityPath, `/villes/${city.slug}`)

      // Related services in same city
      const related = relatedServices[svc]
      if (related) {
        for (const relSlug of related.slice(0, 3)) {
          addLink(graph, svcCityPath, `/services/${relSlug}/${city.slug}`)
        }
      }
    }
  }

  // ── 5. Intent hub pages → service hubs ────────────────────────────
  for (const intent of ['tarifs', 'devis', 'urgence', 'avis'] as const) {
    const intentHub = `/${intent}`
    for (const svc of tradeSlugs) {
      addLink(graph, intentHub, `/${intent}/${svc}`)
    }
  }

  // ── 6. Intent×service pages → cities ──────────────────────────────
  for (const intent of ['tarifs', 'devis', 'urgence'] as const) {
    for (const svc of tradeSlugs) {
      const intentSvcPath = `/${intent}/${svc}`
      // Link to top cities
      for (const city of tier1Cities.slice(0, 20)) {
        addLink(graph, intentSvcPath, `/${intent}/${svc}/${city.slug}`)
      }
      // Back to hub
      addLink(graph, intentSvcPath, `/${intent}`)
      addLink(graph, intentSvcPath, `/services/${svc}`)
    }
  }
  // Avis service pages → cities (Tier 2 only)
  for (const svc of tradeSlugs) {
    const avisSvcPath = `/avis/${svc}`
    for (const city of tier2Cities.slice(0, 20)) {
      addLink(graph, avisSvcPath, `/avis/${svc}/${city.slug}`)
    }
    addLink(graph, avisSvcPath, '/avis')
    addLink(graph, avisSvcPath, `/services/${svc}`)
  }

  // ── 7. Intent×service×city → back-links ───────────────────────────
  for (const intent of ['tarifs', 'devis', 'urgence'] as const) {
    for (const svc of tradeSlugs) {
      for (const city of tier1Cities) {
        const path = `/${intent}/${svc}/${city.slug}`
        addLink(graph, path, `/${intent}/${svc}`)
        addLink(graph, path, `/services/${svc}/${city.slug}`)
        addLink(graph, path, `/villes/${city.slug}`)
      }
    }
  }
  // Avis×service×city (Tier 2)
  for (const svc of tradeSlugs) {
    for (const city of tier2Cities) {
      const path = `/avis/${svc}/${city.slug}`
      addLink(graph, path, `/avis/${svc}`)
      addLink(graph, path, `/services/${svc}/${city.slug}`)
      addLink(graph, path, `/villes/${city.slug}`)
    }
  }

  // ── 8. City pages (/villes/X) ─────────────────────────────────────
  // /villes hub → all city pages
  for (const city of tier1Cities) {
    addLink(graph, '/villes', `/villes/${city.slug}`)
  }

  // City pages → services in that city + department
  for (const city of tier1Cities) {
    const cityPath = `/villes/${city.slug}`
    // Popular services in this city
    for (const svc of popularServices) {
      addLink(graph, cityPath, `/services/${svc.slug}/${city.slug}`)
    }
    // Link to department
    const dept = departements.find((d) => d.code === city.departementCode)
    if (dept) {
      addLink(graph, cityPath, `/departements/${dept.slug}`)
    }
  }

  // ── 9. Geographic hierarchy ───────────────────────────────────────
  // /departements hub → all departments
  for (const dept of departements) {
    addLink(graph, '/departements', `/departements/${dept.slug}`)
  }

  // Department pages → cities in that department + services
  for (const dept of departements) {
    const deptPath = `/departements/${dept.slug}`
    // Dept → cities
    const deptCities = tier1Cities.filter((c) => c.departementCode === dept.code)
    for (const city of deptCities) {
      addLink(graph, deptPath, `/villes/${city.slug}`)
    }
    // Dept → services in dept
    for (const svc of tradeSlugs.slice(0, 15)) {
      addLink(graph, deptPath, `/departements/${dept.slug}/${svc}`)
    }
    // Dept → parent region
    const region = regions.find((r) => r.departments.some((rd) => rd.code === dept.code))
    if (region) {
      addLink(graph, deptPath, `/regions/${region.slug}`)
    }
  }

  // Dept×service pages → back-links
  for (const dept of departements) {
    for (const svc of tradeSlugs) {
      const path = `/departements/${dept.slug}/${svc}`
      addLink(graph, path, `/departements/${dept.slug}`)
      addLink(graph, path, `/services/${svc}`)
    }
  }

  // /regions hub → all regions
  for (const region of regions) {
    addLink(graph, '/regions', `/regions/${region.slug}`)
  }

  // Region pages → departments + services
  for (const region of regions) {
    const regionPath = `/regions/${region.slug}`
    for (const dept of region.departments) {
      addLink(graph, regionPath, `/departements/${dept.slug}`)
    }
    for (const svc of tradeSlugs.slice(0, 15)) {
      addLink(graph, regionPath, `/regions/${region.slug}/${svc}`)
    }
  }

  // Region×service pages → back-links
  for (const region of regions) {
    for (const svc of tradeSlugs) {
      const path = `/regions/${region.slug}/${svc}`
      addLink(graph, path, `/regions/${region.slug}`)
      addLink(graph, path, `/services/${svc}`)
    }
  }

  // ── 10. Barometre pages ───────────────────────────────────────────
  addLink(graph, '/barometre', '/barometre/regions')
  addLink(graph, '/barometre', '/barometre/tarifs')
  for (const region of regions) {
    addLink(graph, '/barometre/regions', `/barometre/regions/${region.slug}`)
    addLink(graph, `/barometre/regions/${region.slug}`, '/barometre/regions')
    addLink(graph, `/barometre/regions/${region.slug}`, `/regions/${region.slug}`)
  }
  for (const svc of tradeSlugs) {
    addLink(graph, '/barometre/tarifs', `/barometre/tarifs/${svc}`)
    addLink(graph, `/barometre/tarifs/${svc}`, '/barometre/tarifs')
    addLink(graph, `/barometre/tarifs/${svc}`, `/tarifs/${svc}`)
  }

  return graph
}

/**
 * Compute incoming link counts and identify orphan/weak pages.
 */
export function findOrphans(linkGraph: Map<string, Set<string>>, allPages: string[]): OrphanReport {
  // Build incoming link count map
  const incomingCount = new Map<string, number>()
  for (const page of allPages) {
    incomingCount.set(page, 0)
  }

  const graphEntries = Array.from(linkGraph.entries())
  for (let i = 0; i < graphEntries.length; i++) {
    const targets = Array.from(graphEntries[i][1])
    for (let j = 0; j < targets.length; j++) {
      const target = targets[j]
      if (incomingCount.has(target)) {
        incomingCount.set(target, (incomingCount.get(target) ?? 0) + 1)
      }
    }
  }

  const orphanPages: string[] = []
  const weakPages: string[] = []

  for (const page of allPages) {
    // Homepage is never orphan
    if (page === '/') continue

    const count = incomingCount.get(page) ?? 0
    if (count === 0) {
      orphanPages.push(page)
    } else if (count < 3) {
      weakPages.push(page)
    }
  }

  // Compute depth
  const depthMap = getDepthFromHomepage(linkGraph)
  const depthOver3: string[] = []
  for (const page of allPages) {
    const depth = depthMap.get(page)
    if (depth === undefined || depth > 3) {
      if (page !== '/') depthOver3.push(page)
    }
  }

  let maxDepth = 0
  depthMap.forEach((depth) => {
    if (depth > maxDepth) maxDepth = depth
  })

  return {
    totalPages: allPages.length,
    linkedPages: allPages.length - orphanPages.length,
    orphanPages,
    weakPages,
    depthOver3,
    maxDepth,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * For each orphan, suggest the nearest logical parent page that should link to it.
 */
export function generateRescueLinks(orphans: string[]): RescueLink[] {
  const results: RescueLink[] = []

  for (const orphan of orphans) {
    const parts = orphan.split('/').filter(Boolean)

    if (parts.length === 0) continue

    // /services/plombier/lyon → /services/plombier
    // /tarifs/plombier/lyon → /tarifs/plombier
    // /departements/rhone/plombier → /departements/rhone
    // /barometre/regions/ile-de-france → /barometre/regions
    if (parts.length >= 2) {
      const parentPath = '/' + parts.slice(0, parts.length - 1).join('/')
      results.push({ page: orphan, suggestedParent: parentPath })
    } else {
      // Single-segment like /services, /tarifs → homepage
      results.push({ page: orphan, suggestedParent: '/' })
    }
  }

  return results
}

/**
 * BFS from homepage to compute click depth for every reachable page.
 */
export function getDepthFromHomepage(linkGraph: Map<string, Set<string>>): Map<string, number> {
  const depthMap = new Map<string, number>()
  const queue: string[] = ['/']
  depthMap.set('/', 0)

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    const currentDepth = depthMap.get(current) ?? 0
    const neighbors = linkGraph.get(current)

    if (!neighbors) continue

    const neighborList = Array.from(neighbors)
    for (let i = 0; i < neighborList.length; i++) {
      const neighbor = neighborList[i]
      if (!depthMap.has(neighbor)) {
        depthMap.set(neighbor, currentDepth + 1)
        queue.push(neighbor)
      }
    }
  }

  return depthMap
}

/**
 * Generate the full list of canonical page paths (without domain).
 * Mirrors the logic in src/app/sitemap.ts.
 */
export function getAllPagePaths(): string[] {
  const pages: string[] = ['/']

  // Static/hub pages
  const staticPaths = [
    '/services',
    '/tarifs',
    '/urgence',
    '/devis',
    '/avis',
    '/blog',
    '/guides',
    '/faq',
    '/barometre',
    '/barometre/regions',
    '/barometre/tarifs',
    '/comparaison',
    '/glossaire',
    '/normes',
    '/statistiques-artisans-france',
    '/a-propos',
    '/contact',
    '/comment-ca-marche',
    '/notre-processus-de-verification',
    '/politique-avis',
    '/mediation',
    '/garantie',
    '/outils/calculateur-prix',
    '/outils/diagnostic',
    '/carte-artisans',
    '/artisans',
    '/avant-apres',
    '/calendrier-travaux',
    '/checklist-travaux',
    '/badge-artisan',
    '/verifier-artisan',
    '/widget-prix',
    '/plan-du-site',
    '/villes',
    '/departements',
    '/regions',
  ]
  pages.push(...staticPaths)

  // Service hub pages
  for (const svc of serviceSlugs) {
    pages.push(`/services/${svc}`)
  }

  // Service × city (Tier 1)
  for (const svc of serviceSlugs) {
    for (const city of tier1Cities) {
      pages.push(`/services/${svc}/${city.slug}`)
    }
  }

  // Intent hub pages per service
  for (const svc of tradeSlugs) {
    pages.push(`/tarifs/${svc}`)
    pages.push(`/devis/${svc}`)
    pages.push(`/urgence/${svc}`)
    pages.push(`/avis/${svc}`)
  }

  // Intent × city (Tier 1: urgence only — tarifs/devis have no [ville] route)
  for (const svc of tradeSlugs) {
    for (const city of tier1Cities) {
      pages.push(`/urgence/${svc}/${city.slug}`)
    }
  }

  // Avis × service × city (Tier 2)
  for (const svc of tradeSlugs) {
    for (const city of tier2Cities) {
      pages.push(`/avis/${svc}/${city.slug}`)
    }
  }

  // City pages
  for (const city of tier1Cities) {
    pages.push(`/villes/${city.slug}`)
  }

  // Department pages
  for (const dept of departements) {
    pages.push(`/departements/${dept.slug}`)
  }

  // Dept × service
  for (const dept of departements) {
    for (const svc of tradeSlugs) {
      pages.push(`/departements/${dept.slug}/${svc}`)
    }
  }

  // Region pages
  for (const region of regions) {
    pages.push(`/regions/${region.slug}`)
  }

  // Region × service
  for (const region of regions) {
    for (const svc of tradeSlugs) {
      pages.push(`/regions/${region.slug}/${svc}`)
    }
  }

  // Barometre sub-pages
  for (const region of regions) {
    pages.push(`/barometre/regions/${region.slug}`)
  }
  for (const svc of tradeSlugs) {
    pages.push(`/barometre/tarifs/${svc}`)
  }

  // Deduplicate as a safety net against future accidental double-pushes
  return Array.from(new Set(pages))
}
