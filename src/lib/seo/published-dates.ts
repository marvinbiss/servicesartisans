/**
 * Registry centralisé des `datePublished` (Schema.org Article + ArticleMeta).
 *
 * Pourquoi ce module ?
 *   - Avant 2026-05-03 : 14 pages déclaraient un `const PUBLISHED_DATE` per-page,
 *     13 partageaient le même literal `'2024-01-15T08:00:00.000Z'` copy-paste.
 *   - Risque : drift par copie-décalage, audit dispersé, rebrandings difficiles.
 *
 * Pattern d'usage côté page :
 * ```
 * import { getPublishedDate } from '@/lib/seo/published-dates'
 * const PUBLISHED_DATE = getPublishedDate('/aides')
 * ```
 *
 * Modification : éditer ICI. Ces dates sont des FAITS historiques (date de
 * première publication réelle de la page) — ne pas les changer sans raison
 * (rebrand complet, refonte structurelle). Le `dateModified` (REVIEW_DATE
 * per-page) sert pour la freshness signal.
 */

const FALLBACK_PUBLISHED_DATE = '2024-01-15T08:00:00.000Z' as const

const PUBLISHED_DATES: Record<string, string> = {
  '/aides': '2024-01-15T08:00:00.000Z',
  '/blog': '2024-01-15T08:00:00.000Z',
  '/blog/categorie': '2024-01-15T08:00:00.000Z',
  '/blog/tag': '2024-01-15T08:00:00.000Z',
  '/communes': '2024-01-15T08:00:00.000Z',
  '/devis': '2024-01-15T08:00:00.000Z',
  '/devis/[service]': '2024-01-15T08:00:00.000Z',
  '/diagnostic': '2024-02-10T08:00:00.000Z',
  '/regions': '2024-01-15T08:00:00.000Z',
  '/services/[service]/[location]': '2024-01-15T08:00:00.000Z',
  '/tarifs': '2024-01-15T08:00:00.000Z',
  '/tarifs/[service]': '2024-01-15T08:00:00.000Z',
  '/travaux': '2024-03-12T08:00:00.000Z',
  '/urgence': '2024-01-15T08:00:00.000Z',
}

/**
 * Retourne la date de première publication d'une page.
 * Si la route n'est pas enregistrée, retourne le fallback (datée mais
 * neutre — préfère ajouter un mapping explicite ci-dessus).
 */
export function getPublishedDate(route: string): string {
  return PUBLISHED_DATES[route] ?? FALLBACK_PUBLISHED_DATE
}

/** Liste figée des routes enregistrées (pour tests cohérence). */
export const REGISTERED_PUBLISHED_ROUTES: readonly string[] = Object.freeze(
  Object.keys(PUBLISHED_DATES)
)
