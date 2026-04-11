/**
 * Zones climatiques RT2012 — mapping département → H1 / H2 / H3.
 *
 * Source : arrêté du 26 octobre 2010 relatif aux caractéristiques thermiques
 * (RT2012), annexe 1 — repris par les arrêtés CEE pour les forfaits kWhc
 * cumac dépendant du climat.
 *
 * Simplification : les sous-zones (H1a/b/c, H2a/b/c/d) sont collapsées aux
 * 3 zones principales — c'est la granularité utilisée par la plupart des
 * fiches CEE (BAR-TH-171/178/179/180 notamment).
 *
 * ⚠️ Usage : ce mapping produit une **estimation** de la prime CEE, pas un
 * montant opposable. Le forfait exact opposable au PNCEE reste celui calculé
 * via l'annexe de la fiche (zone climatique + Etas/COP + usage + surface).
 */

export type ClimateZone = 'H1' | 'H2' | 'H3'

/**
 * Départements méditerranéens H3 (chaud).
 * Source : arrêté 26/10/2010 annexe 1.
 */
const H3_DEPTS = new Set([
  // Dette : codes postaux haut pays 06 (>600m, ex 06420/06380) relèvent de H2 — simplification acceptable en P1
  '06', // Alpes-Maritimes (partie côtière — simplification)
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
 * Départements océaniques / sud-ouest H2 (tempéré doux).
 * Regroupe H2a (ouest), H2b (centre-ouest), H2c (sud-ouest), H2d (sud-est modéré).
 */
const H2_DEPTS = new Set([
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

/**
 * Convertit un code postal français en zone climatique RT2012.
 *
 * @param postalCode code postal 5 chiffres (ex: '75001', '13008'). Les codes
 *                   corses '20xxx' sont mappés en 2A/2B selon convention
 *                   INSEE (20000-20190 → 2A, 20200-20620 → 2B — simplification).
 * @returns 'H1' | 'H2' | 'H3' ou null si code postal invalide
 */
export function postalCodeToClimateZone(postalCode: string | null | undefined): ClimateZone | null {
  if (!postalCode || !/^\d{5}$/.test(postalCode)) return null

  // Cas Corse : préfixe 20 → 2A ou 2B selon tranche
  let dept = postalCode.slice(0, 2)
  if (dept === '20') {
    const num = parseInt(postalCode, 10)
    dept = num < 20200 ? '2A' : '2B'
  }

  if (H3_DEPTS.has(dept)) return 'H3'
  if (H2_DEPTS.has(dept)) return 'H2'
  return 'H1'
}
