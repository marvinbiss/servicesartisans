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
 *
 * Fallback Google Places (2026-05-06, mig 483 + audit SEO 10-agents 04-28 #5) :
 *   - Si un provider a `review_count = 0` first-party MAIS un `google_rating`
 *     valide (place_id présent, rating ∈ [1, 5], count ≥ 3, business_status =
 *     OPERATIONAL), on prend le rating Google de CE provider comme proxy.
 *   - Source par-artisan, pas cross-source : chaque ligne agrégée = la
 *     réalité d'avis d'UN artisan donné (first-party OR Google), jamais un
 *     mélange sur le même artisan. L'agrégat page reste cohérent (= moyenne
 *     pondérée des ratings des artisans de la liste).
 *   - Garde-fous identiques à `ArtisanSchema.tsx` (count ≥ 3, OPERATIONAL) —
 *     mimer la barre d'affichage Google empêche d'émettre des étoiles SERP
 *     sur des données trop fines (1-2 avis = pas représentatif).
 */

type ProviderRating = {
  rating_average?: number | string | null
  review_count?: number | null
  // Google Places fallback (mig 483 columns)
  google_rating?: number | string | null
  google_user_ratings_total?: number | null
  google_business_status?: string | null
  google_place_id?: string | null
}

export type PageAggregateRating = {
  '@type': 'AggregateRating'
  ratingValue: string
  reviewCount: string
  bestRating: '5'
  worstRating: '1'
}

/**
 * Returns the (rating, count) pair to use for a single provider, picking
 * first-party reviews if any, else Google Places fallback if it passes the
 * strict guards. Returns null if neither source is usable.
 */
function pickProviderRating(p: ProviderRating): { rating: number; count: number } | null {
  // Source 1 — first-party (always preferred when present)
  const fpRating = Number(p.rating_average ?? 0)
  const fpCount = Number(p.review_count ?? 0)
  if (Number.isFinite(fpRating) && Number.isFinite(fpCount) && fpRating > 0 && fpCount > 0) {
    return { rating: fpRating, count: fpCount }
  }

  // Source 2 — Google Places fallback (strict guards = mêmes que ArtisanSchema)
  const gRating = Number(p.google_rating ?? 0)
  const gCount = Number(p.google_user_ratings_total ?? 0)
  if (
    p.google_place_id &&
    Number.isFinite(gRating) &&
    Number.isFinite(gCount) &&
    gRating >= 1 &&
    gRating <= 5 &&
    gCount >= 3 &&
    p.google_business_status === 'OPERATIONAL'
  ) {
    return { rating: gRating, count: gCount }
  }

  return null
}

export function buildAggregateRatingFromProviders(
  providers: readonly ProviderRating[]
): PageAggregateRating | null {
  if (!providers || providers.length === 0) return null

  let totalReviews = 0
  let weightedRatingSum = 0

  for (const p of providers) {
    const picked = pickProviderRating(p)
    if (!picked) continue
    totalReviews += picked.count
    weightedRatingSum += picked.rating * picked.count
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
