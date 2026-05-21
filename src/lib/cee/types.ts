/**
 * Types deterministic calculator CEE 2026.
 *
 * Companion du calculator MPR (src/lib/aides/types.ts, Ralph 12 c60e95250).
 *
 * Le set `Geste` est réutilisé tel quel depuis `@/lib/aides` pour garantir la
 * symétrie cross-aide :
 *  - le Critic YMYL fact-checke un même output LLM contre MPR ET CEE,
 *  - les gold cases promptfoo référencent un seul vocabulaire,
 *  - l'éventuel MCP tool `get_bareme_cee` v0.2 partage le même contrat,
 *  - le simulateur SA peut afficher MPR + CEE côte à côte sans transcodage.
 *
 * NOTE — pac_air_air : éligible CEE (fiche BAR-TH-129) mais NON éligible MPR.
 * C'est le cas critique de désymétrie, surfacé via `CumulRule.cumulableMPR`.
 */

import type { Geste, MenageCategorie } from '@/lib/aides'
import type { SourceRefCEE } from './__sources-cee'

export type { Geste, MenageCategorie }
export type { SourceRefCEE }

/** Alias pour clarté de lecture côté CEE. */
export type GesteCEE = Geste

/**
 * Zones climatiques RT2012 (arrêté 26 octobre 2010), reprises par les fiches
 * CEE BAR-TH-XXX pour les forfaits kWh cumac dépendant du climat.
 *
 * Source unique partagée avec `@/lib/shared/climate-zones-data`.
 */
export type ZoneClimatique = 'H1' | 'H2' | 'H3'

export type TypeLogement = 'maison_individuelle' | 'appartement' | 'tous'

export type ForfaitKwhCumac = {
  geste: GesteCEE
  /**
   * Forfait kWh cumac (1 cumac = 1 kWh économisé actualisé sur durée de vie).
   * `null` = forfait paramétrique (dépend surface m² / puissance kW / COP) non
   * couvert v0 — sera étendu v0.2 avec helpers `computePacForfait(...)`.
   */
  kwhCumac: number | null
  /**
   * Zone climatique applicable. `undefined` = forfait indépendant de la zone
   * (ex: isolation combles, VMC). Les fiches PAC notamment varient par zone.
   */
  zone?: ZoneClimatique
  typeLogement: TypeLogement
  sourceRef: SourceRefCEE
  /** Fiche standardisée référence (e.g., "BAR-TH-104"). */
  fiche: string
  notes?: string
}

export type BonusCoupDePouce = {
  geste: GesteCEE
  menageCategorie: MenageCategorie
  /** Multiplicateur appliqué au forfait CEE de base (1.0 = pas de bonus). */
  multiplicateur: number
  sourceRef: SourceRefCEE
  notes?: string
}

export type CumulRule = {
  geste: GesteCEE
  cumulableMPR: boolean
  cumulableEcoPTZ: boolean
  cumulableTVA55: boolean
  sourceRef: SourceRefCEE
  notes?: string
}

export type CalculCEEInput = {
  geste: GesteCEE
  zone: ZoneClimatique
  typeLogement: 'maison_individuelle' | 'appartement'
  menageCategorie: MenageCategorie
  /**
   * Prix marché kWh cumac en €/MWh cumac (override optionnel).
   * Défaut : `PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac`.
   */
  prixMarcheEurParMWhCumac?: number
}

export type CalculCEEResult =
  | {
      eligible: true
      kwhCumacForfait: number
      kwhCumacAvecBonus: number
      bonusMultiplicateur: number
      prixUnitaireEurParMWh: number
      montantTotalEur: number
      sourceRefs: ReadonlyArray<SourceRefCEE>
      fiche: string
      notes?: string
    }
  | { eligible: false; reason: string; sourceRef?: SourceRefCEE }
