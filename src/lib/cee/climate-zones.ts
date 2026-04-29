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

// Source unique partagée avec src/lib/aides/climate-zones.ts.
// Toute modification doit l'être ici : src/lib/shared/climate-zones-data.ts.
import { H2_DEPT_CODES, H3_DEPT_CODES, type ClimateZone } from '@/lib/shared/climate-zones-data'

export type { ClimateZone }

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

  if (H3_DEPT_CODES.has(dept)) return 'H3'
  if (H2_DEPT_CODES.has(dept)) return 'H2'
  return 'H1'
}
