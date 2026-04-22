/**
 * Helper to compute a page-level Schema.org AggregateRating from a list of
 * providers shown on the page.
 *
 * Google rich snippet policy :
 *   - aggregateRating DOIT refléter des reviews traçables aux clients réels.
 *   - Les reviews agrégées DOIVENT porter sur l'entité principale de la page
 *     (ici : la liste des artisans d'une ville × service/opération donnée).
 *   - On filtre les providers à review_count > 0 ET rating_average > 0 pour
 *     éviter d'inclure des zéros qui biaisent la moyenne vers le bas et qui
 *     exposeraient la plateforme à une pénalité rich snippet abuse.
 *   - Si aucun provider n'a de review réel → on retourne null (pas d'étoiles
 *     en SERP plutôt qu'un fake).
 *
 * Pondération : moyenne pondérée par review_count (un artisan avec 20 avis
 * pèse 20× plus qu'un avec 1 avis), ce qui reflète la réalité statistique.
 *
 * Valeurs NUMERIC Supabase : les ratings reviennent parfois en string
 * (le connecteur postgres préserve la précision). On coerce via Number().
 */

type ProviderRating = {
  rating_average?: number | string | null
  review_count?: number | null
}

export type PageAggregateRating = {
  '@type': 'AggregateRating'
  ratingValue: string
  reviewCount: string
  bestRating: '5'
  worstRating: '1'
}

export function buildAggregateRatingFromProviders(
  providers: readonly ProviderRating[]
): PageAggregateRating | null {
  if (!providers || providers.length === 0) return null

  let totalReviews = 0
  let weightedRatingSum = 0

  for (const p of providers) {
    const rating = Number(p.rating_average ?? 0)
    const count = Number(p.review_count ?? 0)
    if (!Number.isFinite(rating) || !Number.isFinite(count)) continue
    if (rating <= 0 || count <= 0) continue
    totalReviews += count
    weightedRatingSum += rating * count
  }

  if (totalReviews === 0) return null

  const avg = weightedRatingSum / totalReviews
  if (avg <= 0 || avg > 5) return null

  return {
    '@type': 'AggregateRating',
    ratingValue: avg.toFixed(1),
    reviewCount: String(totalReviews),
    bestRating: '5',
    worstRating: '1',
  }
}
