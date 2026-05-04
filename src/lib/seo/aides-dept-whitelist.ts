/**
 * Whitelist des combos /aides/[dept]/[aide] gardés en index Google.
 *
 * Stratégie 140K vague 2 #11 (2026-05-02).
 *
 * Avant : 11 aides hors MaPrimeRénov' × 101 départements = 1 111 URLs.
 *   Volume search par dept × aide générique très faible (P5 < 50/mois sur
 *   Ahrefs sur la majorité). Templates pSEO sans data dept-spécifique →
 *   thin content cannibalisant les pages aides racines.
 *
 * Après : top 30 dépts × 5 aides à fort volume CEE/MPR = 150 URLs (-87 %).
 *   Le reste est noindex+drop sitemap. Les pages restent accessibles (les
 *   handlers vivent toujours), mais Google n'a plus de signal sitemap →
 *   crawl budget économisé sur le bottom 87 %.
 *
 * Critères :
 *   - Top 30 dépts INSEE = ~70 % de la population française adressable.
 *   - 5 aides retenues = celles avec volume search positif Ahrefs et
 *     intention transactionnelle (pas info pure) :
 *       cee, eco-ptz, tva-5-5, aide-pompe-a-chaleur, aide-isolation
 *
 * MaPrimeRénov' n'est PAS dans cette liste (déjà émise dans le shard
 * 'static' du sitemap, pour les 101 dépts — legacy, on ne touche pas
 * pour ne pas casser la cohérence canonique des MPR existantes).
 *
 * Edge runtime safe : Sets en mémoire, lookup O(1), zéro I/O.
 */

/**
 * Top 30 départements par population (source INSEE 2024).
 * Couvre ~70 % de la population française.
 */
export const AIDES_INDEXED_DEPTS: ReadonlySet<string> = new Set([
  'paris',
  'nord',
  'bouches-du-rhone',
  'rhone',
  'hauts-de-seine',
  'seine-saint-denis',
  'val-de-marne',
  'gironde',
  'haute-garonne',
  'pas-de-calais',
  'yvelines',
  'seine-et-marne',
  'essonne',
  'val-d-oise',
  'alpes-maritimes',
  'isere',
  'loire-atlantique',
  'herault',
  'bas-rhin',
  'ille-et-vilaine',
  'moselle',
  'maine-et-loire',
  'finistere',
  'haut-rhin',
  'gard',
  'oise',
  'var',
  'puy-de-dome',
  'sarthe',
  'morbihan',
])

/**
 * Aides à fort volume search avec intention transactionnelle.
 * Exclus : maprimerenov (déjà émis dans shard static),
 *          aides micro-volume (cheque-energie, coup-de-pouce, maprimeadapt,
 *          aide-fenetres, aide-chaudiere, aide-audit-energetique).
 */
export const AIDES_INDEXED_SLUGS: ReadonlySet<string> = new Set([
  'cee',
  'eco-ptz',
  'tva-5-5',
  'aide-pompe-a-chaleur',
  'aide-isolation',
])

/**
 * Sprint 3 territorial 2026-05-04 — aides cumulables MaPrimeRénov' + CEE.
 *
 * Audit STRATEGIE-RENOVATION-ENERGETIQUE.md prescrit Sprint 3 = 96 dépts ×
 * 2 aides (maprimerenov + cee). Ces 2 aides ont volume search élevé sur
 * TOUS les dépts (pas juste le top 30) car requêtes type
 * "maprimerenov [dept]" / "prime CEE [dept]" sont massivement recherchées.
 *
 * Pour ces 2 aides UNIQUEMENT, on lève la restriction top 30 dépts —
 * tous les départements indexés via la route /aides/[slug]/[aide].
 *
 * Note : `maprimerenov` est aussi servi par /aides/[slug]/maprimerenov/
 * (route dédiée, plus enrichie). Cette whitelist couvre la route fallback
 * /aides/[slug]/[aide] qui reste indexable pour cohérence sitemap.
 */
export const AIDES_TERRITORIAL_FULL_COVERAGE: ReadonlySet<string> = new Set(['cee', 'maprimerenov'])

/**
 * Combo (dept, aide) éligible au sitemap.
 *
 * Sprint 3 territorial : si l'aide est dans `AIDES_TERRITORIAL_FULL_COVERAGE`,
 * tous les départements (96+) sont indexables. Sinon, fallback sur la
 * whitelist top 30 dépts × 5 aides à fort volume.
 */
export function isAidesDeptIndexable(deptSlug: string, aideSlug: string): boolean {
  if (AIDES_TERRITORIAL_FULL_COVERAGE.has(aideSlug)) return true
  return AIDES_INDEXED_DEPTS.has(deptSlug) && AIDES_INDEXED_SLUGS.has(aideSlug)
}
