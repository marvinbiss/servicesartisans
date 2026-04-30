/**
 * name-quality — heuristiques de qualité de nom commercial pour estimer la
 * probabilité de match Google Places SANS appeler l'API.
 *
 * Permet de produire un audit preflight (avant le backfill payant) en
 * classifiant les providers par niveau de confiance attendu.
 *
 * Pure logique déterministe — pas de dépendance Next.js / DB. Testable.
 */

/**
 * Stop-words "génériques métier" qui n'apportent aucune désambiguation
 * sur Google Places (ex : un provider nommé "ENTREPRISE GENERALE BATIMENT"
 * va matcher des centaines de places, score quasi nul). Source : extrait
 * de l'analyse `enrich-google-all.ts` qui catégorise les noms à fort taux
 * de collision.
 */
export const GENERIC_TRADE_WORDS: ReadonlySet<string> = new Set([
  'plomberie',
  'plombier',
  'plombiers',
  'chauffage',
  'chauffagiste',
  'chauffagistes',
  'electricite',
  'electricien',
  'electriciens',
  'peinture',
  'peintre',
  'peintres',
  'menuiserie',
  'menuisier',
  'menuisiers',
  'maconnerie',
  'macon',
  'macons',
  'carrelage',
  'carreleur',
  'carreleurs',
  'couverture',
  'couvreur',
  'couvreurs',
  'serrurerie',
  'serrurier',
  'serruriers',
  'isolation',
  'platrier',
  'platrerie',
  'renovation',
  'batiment',
  'travaux',
  'construction',
  'entreprise',
  'artisan',
  'services',
  'service',
  'general',
  'generale',
  'multi',
  'pro',
  'plus',
  'france',
  'sud',
  'nord',
  'est',
  'ouest',
  'climatisation',
  'terrassement',
  'demolition',
  'assainissement',
  'domotique',
  'ramonage',
  'etancheite',
  'depannage',
  'paysagiste',
  'vitrier',
  'charpentier',
  'charpente',
  'toiture',
  'facade',
  'ravalement',
  'enduit',
  'cloture',
  'amenagement',
  'interieur',
  'exterieur',
  'habitat',
  'logement',
  'maison',
  'techni',
  'technique',
  'professionnel',
  'groupe',
  'agence',
  'cabinet',
  'atelier',
  'bureau',
])

/**
 * Forme juridique stop-words (SARL, SAS, EURL…). N'aident pas à matcher
 * sur Google Places qui ignore ces tokens.
 */
const LEGAL_FORMS_RE =
  /\b(sarl|sas|sa|eurl|sasu|eirl|ei|sci|snc|scop|scp|selarl|auto[- ]?entrepreneur|micro[- ]?entreprise|ets|etablissements?|entreprise|societe|ste|monsieur|madame|m\.|mme|mr|dr)\b/gi

/**
 * Normalisation : NFD + lowercase + suppression formes juridiques + ponctuation.
 * Aligne avec `normalizeText` de `enrich-google-all.ts` pour cohérence des
 * stats (audit preflight ↔ matching réel).
 */
export function normalizeProviderName(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(LEGAL_FORMS_RE, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extrait les tokens distinctifs d'un nom : tokens normalisés ≥ 2 chars
 * qui ne sont ni génériques métier ni purement numériques.
 *
 * Plus le nombre de tokens distinctifs est élevé, meilleure est la
 * disambiguation Google Places.
 */
export function extractDistinctiveTokens(name: string): string[] {
  const norm = normalizeProviderName(name)
  return norm
    .split(' ')
    .filter((t) => t.length >= 2)
    .filter((t) => !GENERIC_TRADE_WORDS.has(t))
    .filter((t) => !/^\d+$/.test(t))
}

/**
 * Niveau de confiance attendu pour un match Google Places.
 *
 *   high   : au moins 2 tokens distinctifs ET SIRET 14 chiffres ET CP présent
 *            → match attendu ~85-95% (signal nom + signal géo + signal SIRET).
 *   medium : 1 token distinctif OU CP absent OU nom uniquement générique
 *            → match attendu ~50-70% (Places renvoie souvent plusieurs
 *            résultats, top retenu mais audit recommandé).
 *   low    : nom 100% générique (que des stop-words) OU SIRET invalide
 *            → match attendu ~10-30% (forte probabilité de no_match ou
 *            de mauvaise attribution).
 *   skip   : SIRET absent ou format invalide → backfill skip d'office.
 */
export type MatchConfidence = 'high' | 'medium' | 'low' | 'skip'

export type ProviderEligibilityInput = {
  name: string
  siret: string | null | undefined
  postalCode: string | null | undefined
}

export function classifyProviderConfidence(input: ProviderEligibilityInput): MatchConfidence {
  const siret = (input.siret ?? '').trim()
  if (!/^\d{14}$/.test(siret)) return 'skip'

  const tokens = extractDistinctiveTokens(input.name)
  const hasPostal = !!(input.postalCode && /^\d{5}$/.test(input.postalCode.trim()))

  if (tokens.length === 0) return 'low'
  if (tokens.length >= 2 && hasPostal) return 'high'
  if (tokens.length >= 1 && hasPostal) return 'medium'
  if (tokens.length >= 2) return 'medium'
  return 'low'
}

/**
 * Coût attendu (en USD) du backfill complet d'un set de providers.
 *
 * Hypothèses de pricing (Places API New, mai 2026, Field Mask basique) :
 *   - Text Search Pro : $0.032 / call (1 call = 1 provider en mode "find one")
 *
 * Note : Google offre $200/mois de crédit gratuit (~6 250 calls/mois) qui
 * absorbe une partie du coût. Calcule donc le coût brut ; le caller
 * applique le crédit s'il le souhaite.
 *
 * Ne compte que les providers `high` + `medium` (les `low` produisent
 * trop de bruit, les `skip` sont court-circuités côté script avant call).
 */
export function estimateBackfillCostUsd(buckets: Record<MatchConfidence, number>): number {
  const callable = (buckets.high ?? 0) + (buckets.medium ?? 0) + (buckets.low ?? 0)
  return Math.round(callable * 0.032 * 100) / 100
}

/**
 * Match rate attendu (0..1) en se basant sur la composition des buckets.
 * Utilise des poids empiriques : high=0.9, medium=0.6, low=0.2.
 */
export function estimateMatchRate(buckets: Record<MatchConfidence, number>): number {
  const high = buckets.high ?? 0
  const medium = buckets.medium ?? 0
  const low = buckets.low ?? 0
  const total = high + medium + low
  if (total === 0) return 0
  const weighted = high * 0.9 + medium * 0.6 + low * 0.2
  return Math.round((weighted / total) * 1000) / 1000
}
