/**
 * Registre des versions de barèmes simulateur aides rénovation.
 *
 * À chaque nouvelle version officielle (arrêté ANAH annuel, MAJ CEE, etc.) :
 *   1. Créer un fichier `YYYY-MM.ts` exportant `BAREMES_YYYY_MM: BaremesSnapshot`
 *   2. Ajouter la version ici dans BAREMES_REGISTRY
 *   3. Mettre à jour `CURRENT_BAREMES_VERSION` si la nouvelle version devient active
 *   4. Insérer une ligne dans la table `baremes_versions` (Supabase)
 *
 * Les estimations existantes référencent leur `barometre_version` d'origine et
 * restent reconstructibles à l'identique même après MAJ.
 *
 * Refs :
 *  - docs/simulateur-architecture.md §3, §4, §8
 *  - docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md
 */

import 'server-only'
import { BAREMES_2026_01, BAREME_VERSION, zoneFromCodePostal, isIdf } from './2026-01'
import type {
  BaremesSnapshot,
  ZoneLookup,
  PlafondsAnahRow,
  MprAccompagneTaux,
  CdpFourchette,
  SurfaceFactorBucket,
  SurfaceAmpleurBucket,
  VmcRType,
  VmcRTypeCollectif,
  BarTh171TrancheSurface,
} from './2026-01'

export { BAREMES_2026_01, BAREME_VERSION, zoneFromCodePostal, isIdf }

export type {
  BaremesSnapshot,
  ZoneLookup,
  PlafondsAnahRow,
  MprAccompagneTaux,
  CdpFourchette,
  SurfaceFactorBucket,
  SurfaceAmpleurBucket,
  VmcRType,
  VmcRTypeCollectif,
  BarTh171TrancheSurface,
}

/**
 * Registre indexé par identifiant de version.
 * Clé = valeur stockée dans `simulateur_estimations.barometre_version`.
 */
export const BAREMES_REGISTRY: Readonly<Record<string, BaremesSnapshot>> = {
  '2026-01-14': BAREMES_2026_01,
}

/**
 * Version active utilisée pour les nouveaux calculs.
 * À incrémenter lors d'une MAJ barème (ne pas supprimer les anciennes versions).
 */
export const CURRENT_BAREMES_VERSION = '2026-01-14'

/**
 * Retourne les barèmes d'une version donnée (ou la version courante par défaut).
 * Throw si la version est inconnue — garantit la traçabilité stricte.
 */
export function getBaremes(version: string = CURRENT_BAREMES_VERSION): BaremesSnapshot {
  const b = BAREMES_REGISTRY[version]
  if (!b) {
    throw new Error(`Baremes version inconnue: ${version}`)
  }
  return b
}
