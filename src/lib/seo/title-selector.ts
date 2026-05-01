/**
 * Title selector partagé pour les templates pSEO.
 *
 * Stratégie : on construit plusieurs variants gradués du long (high-CTR) au
 * court (filet). On rotate via hash deterministe pour éviter qu'une même
 * combinaison service×ville bascule de variant entre 2 deploys (perte de
 * mémoire SERP Google). On retourne le 1er variant ≤ maxLen — sinon
 * `truncateTitle` du variant à l'offset (ellipsis sur frontière de mot).
 *
 * Pourquoi pas juste `truncateTitle` partout : 824 pages flagged
 * title-too-long par Screaming Frog (18/04). `Chauffagiste Dammartin-en-Goële
 * —…` ellipsis bouffe le mot-clé secondaire et tue le CTR. Le fitting permet
 * de servir un titre court mais COMPLET (intent signal préservé).
 *
 * Pure module — aucun I/O, importable côté SSR + tests.
 */

/**
 * Tronque un title à `maxLen` chars sur frontière de mot quand possible.
 * Guard contre maxLen ≤ 1 (retourne string vide).
 * Si le mot est unique (pas d'espace dans le slice), hard cut + ellipsis.
 */
export function truncateTitle(title: string, maxLen = 41): string {
  if (maxLen <= 1) return ''
  if (title.length <= maxLen) return title
  const slice = title.slice(0, maxLen - 1)
  const trimmed = slice.replace(/\s+\S*$/, '')
  return (trimmed.length > 0 ? trimmed : slice) + '…'
}

/**
 * Sélectionne le 1er variant ≤ maxLen via rotation hash.
 *
 * Hash → offset → rotated array (`[offset…end, 0…offset]`) → premier qui rentre.
 * Si aucun ne rentre (cas extrême, ville à long nom + tous les variants longs),
 * truncate le variant à l'offset (préserve la rotation hash entre deploys).
 *
 * @param variants Liste ordonnée du plus ambitieux (high-CTR) au plus court (filet).
 * @param hashSeed Hash deterministe pour rotate (ex. `hashCode(service+ville)`).
 * @param maxLen Limite avant brand suffix (default 41 → 60 chars total avec
 *   ` | ServicesArtisans` 19 chars, sous le cutoff Google ~60).
 */
export function selectFittingTitle(variants: string[], hashSeed: number, maxLen = 41): string {
  if (variants.length === 0) return ''
  const offset = Math.abs(hashSeed) % variants.length
  const rotated = variants.slice(offset).concat(variants.slice(0, offset))
  const fitting = rotated.find((v) => v.length <= maxLen)
  if (fitting) return fitting
  return truncateTitle(variants[offset], maxLen)
}
