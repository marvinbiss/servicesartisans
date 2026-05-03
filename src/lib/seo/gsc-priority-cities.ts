/**
 * Cities with significant GSC impressions — prioritized in sitemap
 * regardless of population ranking.
 * Updated via weekly GSC audit loop.
 *
 * Pivot RGE 2026-05-01 : les 16 métiers Tier C (deratisation, desinsectisation,
 * antenniste, …) ont été supprimés. Beaucoup de ces villes étaient initialement
 * priorisées pour leur signal GSC sur deratisation/désinsectisation.
 * Liste à rafraîchir au prochain audit GSC ; conservée pour l'instant car
 * certaines villes captent encore du trafic sur les services survivants
 * (vitrier, electricien, peintre-en-batiment, demenageur, alarme-securite…).
 *
 * Last update: 2026-02-25 (GSC Queries export)
 */
export const GSC_PRIORITY_CITIES: string[] = [
  // Île-de-France suburbs
  'trappes',
  'villemoisson-sur-orge',
  'stains',
  'le-plessis-trevise',
  'montgeron',
  'vaucresson',
  'montigny-le-bretonneux',
  'le-chesnay-rocquencourt',
  'bry-sur-marne',
  'rosny-sous-bois',
  'fresnes',
  'ermont',
  'thiais',
  'plaisir',
  'elancourt',
  'croissy-sur-seine',
  'tremblay-en-france',
  'gonesse',
  'le-perreux-sur-marne',
  'chatenay-malabry',
  'athis-mons',
  'etampes',
  'domont',
  'villepinte',
  'sannois',
  'les-lilas',
  'le-kremlin-bicetre',
  'bois-colombes',
  'saint-cloud',
  'saint-mande',
  'chatillon',
  'villiers-sur-marne',
  'deuil-la-barre',
  'guyancourt',
  'pontoise',
  'romainville',
  'villejuif',
  'sevran',
  'alfortville',
  'poissy',
  // Var / PACA
  'la-londe-les-maures',
  'vidauban',
  'cuers',
  'brignoles',
  'le-muy',
  'sollies-pont',
  'cabasse',
  'carqueiranne',
  // Autres régions
  'voiron',
  'montluel',
  'juvignac',
  'castelsarrasin',
  'gosier',
  'saran',
  'la-chapelle-saint-luc',
]

/**
 * Pages in position 5-20 with significant impressions.
 * Receive internal link boosts via CrossLinks.
 * Updated via weekly GSC audit loop.
 *
 * Pivot RGE 2026-05-01 : 17 entrées retirées (16 deratisation + 1 antenniste)
 * suite à la suppression des 16 métiers Tier C niche. À rafraîchir au prochain
 * audit GSC quand la nouvelle data sera disponible.
 *
 * Last update: 2026-02-25 (GSC Queries export)
 */
// Pivot pure-play 2026-05-02 + full RGE 2026-05-03 :
// retrait des entrées pointant vers les services supprimés (demenageur,
// alarme-securite, vitrier, etc.) qui retournent maintenant 410 via
// gone-paths.ts — boostage SEO sur du 410 = gaspillage budget crawl.
export const GSC_BOOST_PAGES: string[] = [
  // Position 5-20, impressions >= 5 — uniquement services survivants au pivot
  '/services/electricien/courbevoie',
  '/services/peintre-en-batiment/le-plessis-trevise',
]
