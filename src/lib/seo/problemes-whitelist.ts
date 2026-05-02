/**
 * Whitelist des combos /problemes/[probleme]/[ville] gardés en index Google.
 *
 * Stratégie 140K vague 2 #7 (2026-04-29) — voir docs/strategy-140k-2026-04-29.md.
 *
 * Vague 2 #12 nettoyage 2026-05-02 : tier resserré 200/100/50 → 100/50/25
 * pour aller plus loin dans la densité>volume. Bottom 50 % des combos avait
 * <0.1 imp/page/mois GSC sur la fenêtre 90j post-vague 2 #7. -3 775 URLs.
 *
 * Avant tout pivot : 61 problèmes × 500 villes = 30 500 URLs (cannibalisation
 * /services massive — la majorité des SERP rank /services/[s]/[v] pour les
 * requêtes problème + ville).
 *
 * Allocation tier basée sur urgencyLevel (Ahrefs vol search corrélé à
 * l'urgence) :
 *   - haute   → top 100 villes (pages réellement utiles, intention transac)
 *   - moyenne → top 50 villes
 *   - basse   → top 25 villes
 * Total ≈ 3 775 URLs (-87 % vs baseline 30K). Le reste est noindex et
 * 301-redirigé vers /services/${primaryService}/${ville}.
 *
 * Critères :
 *   - Vol search "problème + ville" décroît rapidement avec la population
 *   - Top 25/50/100 villes INSEE = 50-80 % de l'intention adressable
 *   - Garde l'archive éditoriale long-tail désindexée mais redirigée
 *     (préserve le PageRank externe accumulé)
 *
 * Edge runtime safe : Sets en mémoire, lookup O(1), zéro I/O.
 *
 * Évolutivité : ouvrir le quota villes par tier si la cohorte rank top 5
 * sur >30 % des combos après 90 jours (signal de demande).
 */

import { villes } from '@/lib/data/france'
import { getProblemBySlug } from '@/lib/data/problems'

const TOP_HAUTE = 100
const TOP_MOYENNE = 50
const TOP_BASSE = 25

const top200CitiesSet: ReadonlySet<string> = new Set(villes.slice(0, TOP_HAUTE).map((v) => v.slug))
const top100CitiesSet: ReadonlySet<string> = new Set(
  villes.slice(0, TOP_MOYENNE).map((v) => v.slug)
)
const top50CitiesSet: ReadonlySet<string> = new Set(villes.slice(0, TOP_BASSE).map((v) => v.slug))

/**
 * Combo (probleme, ville) éligible au reste indexable de /problemes/[p]/[v].
 * Tout combo hors whitelist doit être redirigé 301 vers /services/[s]/[v].
 */
export function isProblemeIndexable(problemSlug: string, villeSlug: string): boolean {
  const problem = getProblemBySlug(problemSlug)
  if (!problem) return false

  switch (problem.urgencyLevel) {
    case 'haute':
      return top200CitiesSet.has(villeSlug)
    case 'moyenne':
      return top100CitiesSet.has(villeSlug)
    case 'basse':
      return top50CitiesSet.has(villeSlug)
    default:
      return false
  }
}

/**
 * Retourne la liste plate des combos indexables pour le sitemap.
 * Itère problèmes × villes du bon tier (pas de produit cartésien complet).
 */
export function getIndexableProblemeCombos(
  problemSlugs: ReadonlyArray<string>
): Array<{ problemSlug: string; villeSlug: string }> {
  const top200 = villes.slice(0, TOP_HAUTE)
  const top100 = villes.slice(0, TOP_MOYENNE)
  const top50 = villes.slice(0, TOP_BASSE)
  const result: Array<{ problemSlug: string; villeSlug: string }> = []

  for (const problemSlug of problemSlugs) {
    const problem = getProblemBySlug(problemSlug)
    if (!problem) continue
    const cities =
      problem.urgencyLevel === 'haute'
        ? top200
        : problem.urgencyLevel === 'moyenne'
          ? top100
          : top50
    for (const ville of cities) {
      result.push({ problemSlug, villeSlug: ville.slug })
    }
  }

  return result
}
