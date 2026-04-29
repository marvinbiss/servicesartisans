/**
 * Source unique de vérité pour les zones climatiques RT2012 utilisées par
 * `src/lib/cee/climate-zones.ts` (lookup par code postal) ET
 * `src/lib/aides/climate-zones.ts` (lookup par code département + labels UI).
 *
 * Source officielle : arrêté du 26 octobre 2010 (RT2012) modifié 30 mars 2017,
 * annexe IX. Repris dans les fiches CEE BAR-TH-171/178/179/180.
 *
 * Simplification documentée : les sous-zones H1a/b/c, H2a/b/c/d sont collapsées
 * aux 3 zones principales — granularité utilisée par les fiches CEE forfait.
 *
 * ⚠️ Toute modification de ces sets est partagée par les deux modules. Les
 * tests `aides/climate-zones.test.ts` et tout test futur sur `cee/climate-zones`
 * vérifieront la cohérence post-modification.
 */

export type ClimateZone = 'H1' | 'H2' | 'H3'

/**
 * Départements méditerranéens H3 (chaud).
 * Note dette : codes postaux haut pays 06 (>600 m, ex 06420/06380) relèvent
 * théoriquement de H2 — simplification acceptable au niveau département.
 */
export const H3_DEPT_CODES: ReadonlySet<string> = new Set([
  '06', // Alpes-Maritimes (partie côtière)
  '11', // Aude
  '13', // Bouches-du-Rhône
  '2A', // Corse-du-Sud
  '2B', // Haute-Corse
  '30', // Gard
  '34', // Hérault
  '66', // Pyrénées-Orientales
  '83', // Var
  '84', // Vaucluse
])

/**
 * Départements océaniques / sud-ouest H2 (tempéré).
 * Regroupe H2a (ouest), H2b (centre-ouest), H2c (sud-ouest), H2d (sud-est modéré).
 */
export const H2_DEPT_CODES: ReadonlySet<string> = new Set([
  // Façade atlantique (H2a/b)
  '14', // Calvados
  '17', // Charente-Maritime
  '22', // Côtes-d'Armor
  '29', // Finistère
  '35', // Ille-et-Vilaine
  '44', // Loire-Atlantique
  '50', // Manche
  '56', // Morbihan
  '76', // Seine-Maritime
  '85', // Vendée
  // Centre-ouest / sud-ouest (H2c)
  '16', // Charente
  '24', // Dordogne
  '31', // Haute-Garonne
  '32', // Gers
  '33', // Gironde
  '40', // Landes
  '46', // Lot
  '47', // Lot-et-Garonne
  '64', // Pyrénées-Atlantiques
  '65', // Hautes-Pyrénées
  '79', // Deux-Sèvres
  '81', // Tarn
  '82', // Tarn-et-Garonne
  '86', // Vienne
  // Sud-est modéré (H2d) hors méditerranée franche
  '04', // Alpes-de-Haute-Provence
  '07', // Ardèche
  '09', // Ariège
  '12', // Aveyron
  '26', // Drôme
  '48', // Lozère
])
