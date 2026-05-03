/**
 * Whitelist des combos /urgence/[service]/[ville] gardés en index Google.
 *
 * Stratégie 140K vague 2 #4 (2026-04-29) — voir docs/strategy-140k-2026-04-29.md.
 *
 * Avant : 47 services × 2 267 villes = 106 549 URLs urgence (cannibalisation
 * massive de /services/[s]/[v], similarité 50.5 % mesurée).
 *
 * Après : 4 services réellement urgents × 25 villes top démographie = 100 URLs.
 * Le reste (≈106 449) est redirigé 301 vers /services/[s]/[v] (canonical
 * durable qui contient déjà les sections "urgence" / "garde week-end").
 *
 * Critères de sélection des 4 services :
 *   - Search volume "urgence + métier" > 100/mois (Ahrefs FR)
 *   - Intervention naturellement urgente (fuite, panne courant, perte clés,
 *     panne chauffage en hiver)
 *   - Validés par data Ahrefs : top page actuelle = /urgence/plombier/caen
 *     (18 trafic/mois sur "plombier caen 24h24", rank #2)
 *
 * Critères des 25 villes (top démographie INSEE 2024 — couvre ~28 % population
 * + match les 152 KW Ahrefs actuellement classants pour SA) :
 *   - Toutes les villes avec >100 000 habitants
 *   - + quelques villes Ahrefs-vérifiées (ex: Caen rank #2)
 *
 * Edge runtime safe : Set<string> en mémoire, lookup O(1), zéro I/O.
 *
 * Évolutivité : à reconfirmer trimestriellement via vol search Ahrefs.
 * Quand le flywheel reviews + DR croissent, on peut ouvrir à 50 villes.
 */

// Pivot full RGE 2026-05-03 (revert partiel) :
//   - `serrurier` retiré (commodity sans qualif RGE possible — cf.
//     PIVOT_RGE_REMOVED_SLUGS, métier coupé du catalogue, /services/serrurier/*
//     répond 410 via gone-paths → impossible de pointer un canonical vers 410).
//   - `couvreur` ajouté (RGE Qualibat 7113 — fuite toiture, tempête).
//   - `climaticien` ajouté (RGE QualiPAC — panne canicule, fluide frigorigène).
// Doit rester un sous-ensemble strict de URGENCE_RGE_COMPATIBLE_SLUGS.
export const URGENCE_INDEXED_SERVICES: ReadonlySet<string> = new Set([
  'plombier',
  'electricien',
  'chauffagiste',
  'couvreur',
  'climaticien',
])

export const URGENCE_INDEXED_CITIES: ReadonlySet<string> = new Set([
  // Top 25 INSEE par population (métropole + DOM)
  'paris',
  'marseille',
  'lyon',
  'toulouse',
  'nice',
  'nantes',
  'montpellier',
  'strasbourg',
  'bordeaux',
  'lille',
  'rennes',
  'reims',
  'saint-etienne',
  'le-havre',
  'toulon',
  'grenoble',
  'dijon',
  'angers',
  'nimes',
  'villeurbanne',
  'saint-denis',
  'aix-en-provence',
  'le-mans',
  'clermont-ferrand',
  'brest',
  // Caen explicitement gardé (rank #2 Ahrefs sur "plombier caen 24h24")
  'caen',
])

/**
 * Combo (service, ville) éligible au reste indexable de /urgence/[s]/[v].
 * Tout combo hors whitelist doit être redirigé 301 vers /services/[s]/[v].
 */
export function isUrgenceIndexable(serviceSlug: string, villeSlug: string): boolean {
  return URGENCE_INDEXED_SERVICES.has(serviceSlug) && URGENCE_INDEXED_CITIES.has(villeSlug)
}
