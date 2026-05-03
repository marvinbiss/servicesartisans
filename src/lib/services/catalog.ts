/**
 * Canonical service catalog — Single Source of Truth (SSoT) for trade slugs.
 *
 * Cleanup Vague 2 audit 2026-05-03 : centralise les 21 métiers actifs
 * post-pivot full RGE (2026-05-03). Tous les autres modules (navigation,
 * topical-clusters, internal-links, devis-service, service-naf-mapping,
 * trade-content, supabase mappings) DOIVENT consommer ce catalog ou utiliser
 * `isCanonicalServiceSlug()` pour valider qu'un slug est encore vivant.
 *
 * Source upstream : src/lib/data/france-light.ts (services array). Ce module
 * en re-exporte la projection slug-only pour économiser le bundle client et
 * fournir le type `ServiceSlug` strict.
 */

import {
  CANONICAL_SERVICE_SLUGS,
  CANONICAL_SERVICE_SLUGS_SET,
} from '@/lib/services/canonical-slugs'

/**
 * Re-export sous l'ancien nom pour préserver la compatibilité des call-sites
 * existants. La source réelle vit dans `canonical-slugs.ts` (leaf, Edge-safe).
 */
export const SERVICE_SLUGS_CANONICAL: readonly string[] = CANONICAL_SERVICE_SLUGS

export function isCanonicalServiceSlug(slug: string): boolean {
  return CANONICAL_SERVICE_SLUGS_SET.has(slug)
}

export function getCanonicalServiceCount(): number {
  return CANONICAL_SERVICE_SLUGS.length
}
