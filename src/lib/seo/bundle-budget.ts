/**
 * Bundle budget checker — Bouclier 4 plan ULTRA DOMINATION SEO v2.
 *
 * Pure logic : prend un manifest Next.js + sizes pré-calculées + budgets,
 * sort un rapport + violations. Le wrapper CLI (`scripts/check-bundle-budget.ts`)
 * fait l'I/O fichier et exit non-zero sur violation.
 *
 * Pourquoi côté pSEO : 459K pages indexées qui dépendent du même
 * first-load JS. +50KB sur le bundle = +50KB × milliards de hits/an Google.
 * Une régression silencieuse ici saigne le budget crawl + LCP.
 *
 * Mesures :
 *   - `firstLoadBytes(route)` : somme des chunks référencés par la route +
 *      rootMainFiles (shared) sans double-counting.
 *   - `largestChunks` : top N par taille brute.
 *   - `violations` : kind = 'route' (first-load over budget) ou 'chunk'
 *      (single chunk over budget), avec delta absolu.
 */

export type BundleManifest = {
  pages: Record<string, string[]>
  rootMainFiles?: string[]
}

export type BundleBudgets = {
  /** Budget first-load JS global pour toute route non overridée (octets). */
  firstLoadJSGlobal: number
  /** Budget max pour un chunk individuel (octets). */
  chunkBudget: number
  /** Overrides par route (clé = pattern exact, ex `/services/[service]/[location]`). */
  routeOverrides?: Record<string, number>
  /** Routes à ignorer. Exact match par défaut, prefix glob avec `/foo/*`. */
  ignoreRoutes?: string[]
}

/**
 * Test une route contre un pattern. Pattern terminant par `*` =
 * prefix match (ex `/admin/*` matche `/admin/users/page`). Sinon exact.
 */
export function matchesIgnorePattern(route: string, pattern: string): boolean {
  if (pattern.endsWith('*')) {
    return route.startsWith(pattern.slice(0, -1))
  }
  return route === pattern
}

function isIgnored(route: string, patterns: readonly string[]): boolean {
  for (const p of patterns) {
    if (matchesIgnorePattern(route, p)) return true
  }
  return false
}

export type BundleViolation =
  | { kind: 'route'; route: string; actual: number; budget: number; delta: number }
  | { kind: 'chunk'; chunk: string; actual: number; budget: number; delta: number }

export type RouteSummary = {
  route: string
  firstLoadBytes: number
  budget: number
  chunks: number
}

export type BundleReport = {
  routes: RouteSummary[]
  largestChunks: Array<{ chunk: string; bytes: number }>
  violations: BundleViolation[]
}

/**
 * Calcule le first-load bytes d'une route : union (page chunks ∪ rootMainFiles)
 * pour ne pas compter deux fois les chunks partagés.
 */
export function computeFirstLoadBytes(
  manifest: BundleManifest,
  fileSizes: Record<string, number>,
  route: string
): number {
  const pageChunks = manifest.pages[route] ?? []
  const rootChunks = manifest.rootMainFiles ?? []
  const seen = new Set<string>()
  let total = 0
  for (const chunk of [...pageChunks, ...rootChunks]) {
    if (seen.has(chunk)) continue
    seen.add(chunk)
    total += fileSizes[chunk] ?? 0
  }
  return total
}

/**
 * Renvoie le budget effectif pour une route (override sinon global).
 */
export function resolveRouteBudget(route: string, budgets: BundleBudgets): number {
  return budgets.routeOverrides?.[route] ?? budgets.firstLoadJSGlobal
}

/**
 * Top N chunks par taille décroissante (pour rapport visuel).
 */
export function topChunks(
  fileSizes: Record<string, number>,
  limit = 10
): Array<{ chunk: string; bytes: number }> {
  return Object.entries(fileSizes)
    .filter(([name]) => name.endsWith('.js'))
    .map(([chunk, bytes]) => ({ chunk, bytes }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit)
}

/**
 * Audit complet : routes + chunks + violations.
 */
export function checkBundleBudgets(
  manifest: BundleManifest,
  fileSizes: Record<string, number>,
  budgets: BundleBudgets
): BundleReport {
  const ignorePatterns = budgets.ignoreRoutes ?? []
  const routes: RouteSummary[] = []
  const violations: BundleViolation[] = []

  for (const route of Object.keys(manifest.pages)) {
    if (isIgnored(route, ignorePatterns)) continue
    const firstLoadBytes = computeFirstLoadBytes(manifest, fileSizes, route)
    const budget = resolveRouteBudget(route, budgets)
    routes.push({
      route,
      firstLoadBytes,
      budget,
      chunks: manifest.pages[route].length,
    })
    if (firstLoadBytes > budget) {
      violations.push({
        kind: 'route',
        route,
        actual: firstLoadBytes,
        budget,
        delta: firstLoadBytes - budget,
      })
    }
  }

  for (const [chunk, bytes] of Object.entries(fileSizes)) {
    if (!chunk.endsWith('.js')) continue
    if (bytes > budgets.chunkBudget) {
      violations.push({
        kind: 'chunk',
        chunk,
        actual: bytes,
        budget: budgets.chunkBudget,
        delta: bytes - budgets.chunkBudget,
      })
    }
  }

  routes.sort((a, b) => b.firstLoadBytes - a.firstLoadBytes)

  return {
    routes,
    largestChunks: topChunks(fileSizes, 10),
    violations,
  }
}

/**
 * Format human-readable d'un nombre d'octets (KB, MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}
