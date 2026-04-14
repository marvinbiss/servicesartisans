/**
 * SEO Pruning Module — Automatic noindex strategy for under-performing pages
 *
 * Strategy (Kevin Indig / Ryan Darani playbook):
 * - Pages that don't rank after 6 months should be noindexed
 * - Remove 10-20% of lowest-performing pages annually
 * - "Pages that don't contribute traffic are dead weight, not authority"
 *
 * This module does NOT delete pages. It identifies candidates for noindex
 * based on content quality signals available at render time.
 *
 * Human-in-the-loop: the cron audit generates a report — no automatic changes.
 */

// ---------------------------------------------------------------------------
// Noindex URL patterns — pages identified as thin/low-value
// ---------------------------------------------------------------------------

/**
 * Static URL patterns that should always be noindexed.
 * These are pages with no SEO value or intentionally thin content.
 * Matches are prefix-based unless the pattern ends with '$' (exact match).
 */
export const NOINDEX_PATTERNS: string[] = [
  // Auth & private pages (already handled by middleware X-Robots-Tag)
  '/connexion',
  '/inscription',
  '/inscription-artisan',
  '/mot-de-passe-oublie',
  '/espace-client',
  '/espace-artisan',
  '/admin',
  // Legal/utility pages — no SEO value
  '/accessibilite',
  '/cgv',
  '/confidentialite',
  '/mentions-legales',
  '/partenaires',
  '/presse',
  '/mes-favoris',
  '/plan-du-site',
  '/carrieres',
  // Widget embed page
  '/widget',
]

// ---------------------------------------------------------------------------
// Pruning thresholds — configurable constants
// ---------------------------------------------------------------------------

/** Minimum provider count for a service×city page to be worth indexing */
export const MIN_PROVIDERS_SERVICE_CITY = 0
// Note: set to 0 because hub pages have rich content even without providers.
// The real pruning signal is the combination of 0 providers + no unique data.

/** Minimum provider count for a quartier page to be worth indexing */
export const MIN_PROVIDERS_QUARTIER = 0
// Quartier pages are already noindexed by default (follow: true, index: false).
// This threshold is for the audit report to flag quartier pages that COULD be indexed.

/** Provider count below which a service×city page is flagged as "thin" in audit */
export const THIN_PAGE_PROVIDER_THRESHOLD = 1

/** Minimum percentage of unique content differentiation (for audit heuristic) */
export const MIN_DIFFERENTIATION_PERCENT = 85

// ---------------------------------------------------------------------------
// shouldNoindex — runtime check for metadata generation
// ---------------------------------------------------------------------------

interface NoindexContext {
  /** Number of active providers for this page's service×location */
  providerCount?: number
  /** Whether this is a quartier-level page (deeper nesting = thinner content) */
  isQuartierPage?: boolean
  /** Whether this page has unique data beyond template (commune stats, trade content, etc.) */
  hasUniqueData?: boolean
}

/**
 * Determines if a page should be noindexed based on URL pattern and content signals.
 *
 * @param pathname - The URL pathname (e.g., '/services/plombier/paris')
 * @param context - Optional content quality signals
 * @returns true if the page should have robots: { index: false }
 */
export function shouldNoindex(pathname: string, context?: NoindexContext): boolean {
  const normalizedPath = pathname.toLowerCase()

  // 1. Check static noindex patterns
  for (const pattern of NOINDEX_PATTERNS) {
    if (normalizedPath === pattern || normalizedPath.startsWith(pattern + '/')) {
      return true
    }
  }

  // 2. Quartier pages are noindexed by default (thin content, deep nesting)
  // Pattern: /villes/{ville}/{quartier} or /devis/{service}/{location}/{quartier}
  if (context?.isQuartierPage) {
    return true
  }

  // 3. Service×city pages with 0 providers AND no unique data
  // These are the "dead weight" pages Ryan Darani warns about.
  // BUT: we fail-open during build (providerCount defaults to 1) to avoid
  // accidentally noindexing pages when the DB is down.
  if (context?.providerCount === 0 && context?.hasUniqueData === false) {
    return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Audit helpers — used by the cron pruning audit
// ---------------------------------------------------------------------------

export interface PruningCandidate {
  url: string
  reason: PruningReason
  providerCount: number
  pageType: PageType
  priority: 'high' | 'medium' | 'low'
}

export type PruningReason =
  | 'zero_providers'
  | 'low_providers'
  | 'quartier_thin'
  | 'static_noindex'
  | 'low_differentiation'

export type PageType =
  | 'service_city'
  | 'service_quartier'
  | 'devis_quartier'
  | 'ville_quartier'
  | 'provider_page'
  | 'static_page'

/**
 * Classify a URL into its page type for audit categorization.
 */
export function classifyPageType(pathname: string): PageType {
  // /services/{service}/{location}/{publicId} — individual provider
  if (/^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)) return 'provider_page'
  // /services/{service}/{location} — service×city
  if (/^\/services\/[^/]+\/[^/]+$/.test(pathname)) return 'service_city'
  // /devis/{service}/{location}/{quartier}
  if (/^\/devis\/[^/]+\/[^/]+\/[^/]+$/.test(pathname)) return 'devis_quartier'
  // /villes/{ville}/{quartier}
  if (/^\/villes\/[^/]+\/[^/]+$/.test(pathname)) return 'ville_quartier'
  return 'static_page'
}

/**
 * Calculate a differentiation score based on provider count and data richness.
 * Returns a percentage (0-100).
 *
 * Heuristic:
 * - Pages with >5 providers = high differentiation (providers create unique data)
 * - Pages with 1-5 providers = moderate differentiation
 * - Pages with 0 providers = relies entirely on template content + commune data
 * - Pages with commune stats data get a bonus
 */
export function calculateDifferentiation(
  providerCount: number,
  hasCommuneData: boolean,
  hasTradeContent: boolean
): number {
  let score = 0

  // Provider-based differentiation (up to 60 points)
  if (providerCount >= 10) score += 60
  else if (providerCount >= 5) score += 45
  else if (providerCount >= 2) score += 30
  else if (providerCount >= 1) score += 15
  // 0 providers = 0 points from this axis

  // Commune data bonus (up to 25 points)
  if (hasCommuneData) score += 25

  // Trade-specific content bonus (up to 15 points)
  if (hasTradeContent) score += 15

  return Math.min(score, 100)
}
