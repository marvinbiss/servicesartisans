/**
 * CEE operation codes — leaf module sans imports.
 *
 * Source unique de vérité pour les codes CEE exposés au sitemap, IndexNow, et
 * lastmod queries. Avant ce module : 3 copies dupliquées (sitemap.ts /
 * lastmod-queries.ts / indexnow-submit/route.ts) maintenues à la main avec
 * justification "import cycle" stale (sitemap.ts dépend de lastmod-queries.ts,
 * pas l'inverse — aucun cycle réel).
 *
 * Modification : éditer ICI uniquement. Test cohérence
 * `__tests__/lib/cee/operation-codes-coherence.test.ts` vérifie l'alignement
 * avec DB seed (supabase/migrations/*cee*.sql) + CEE_OPERATION_GUIDES.
 *
 * ⚠️ bar-th-177 retiré 2026-05-03 — non seedé en DB ni dans CEE_OPERATION_GUIDES.
 * Réintégrer après migration seed + contenu éditorial.
 */

export const CEE_OPERATION_CODES = [
  'bar-en-101',
  'bar-en-102',
  'bar-en-103',
  'bar-en-104',
  'bar-en-108',
  'bar-th-112',
  'bar-th-113',
  'bar-th-125',
  'bar-th-127',
  'bar-th-129',
  'bar-th-143',
  'bar-th-148',
  'bar-th-159',
  'bar-th-161',
  'bar-th-171',
  'bar-th-172',
  'bar-th-173',
  'bar-th-174',
  'bar-th-175',
  'bar-se-104',
] as const

export type CeeOperationCode = (typeof CEE_OPERATION_CODES)[number]
