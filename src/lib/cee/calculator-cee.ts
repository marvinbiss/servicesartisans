/**
 * Calculator CEE 2026 — fonctions pures.
 *
 * Zéro I/O, zéro LLM. Ground-truth pour :
 *   1. Critic YMYL (Ralph 8) — compare output LLM vs ce calculator
 *   2. Promptfoo eval — gold cases CEE auto-vérifiables (v0.2)
 *   3. MCP tool `get_bareme_cee` (v0.2)
 *   4. Simulateur SA `/simulateur-aides-renovation` (migration sprint séparé)
 *
 * Formule v0 :
 *   montantTotalEur = round( forfait_kwhCumac × multiplicateurBonus
 *                            × prixMarcheEurParMWhCumac / 1000 )
 *
 *   Note : kWh cumac × (€/MWh) / 1000 = € (conversion MWh → kWh).
 *
 * v0 ne gère pas les gestes paramétriques (forfait `null`). Le calculator
 * retourne `eligible:false` avec `reason` explicite — c'est le contrat que
 * le Critic utilise pour pré-bloquer un output LLM qui citerait un montant.
 */

import { getBonus, getForfait } from './forfaits-cee-2026'
import { PRIX_MARCHE_CEE_2026 } from './prix-marche'
import type { CalculCEEInput, CalculCEEResult, SourceRefCEE } from './types'

export function computeCEEAmount(input: CalculCEEInput): CalculCEEResult {
  const forfait = getForfait(input.geste, input.zone, input.typeLogement)
  if (!forfait) {
    return {
      eligible: false,
      reason: `Aucun forfait CEE trouvé pour geste ${input.geste} zone ${input.zone} typeLogement ${input.typeLogement}`,
    }
  }

  if (forfait.kwhCumac === null) {
    return {
      eligible: false,
      reason:
        forfait.notes ??
        `Forfait paramétrique non implémenté v0 pour ${input.geste} (fiche ${forfait.fiche})`,
      sourceRef: forfait.sourceRef,
    }
  }

  const bonus = getBonus(input.geste, input.menageCategorie)
  const multiplicateur = bonus?.multiplicateur ?? 1.0

  const kwhCumacAvecBonus = Math.round(forfait.kwhCumac * multiplicateur)

  const prixUnitaire =
    input.prixMarcheEurParMWhCumac ?? PRIX_MARCHE_CEE_2026.prixMoyenEurParMWhCumac

  const montantTotalEur = Math.round((kwhCumacAvecBonus * prixUnitaire) / 1000)

  const sourceRefs: SourceRefCEE[] = [forfait.sourceRef]
  if (bonus) sourceRefs.push(bonus.sourceRef)
  sourceRefs.push(PRIX_MARCHE_CEE_2026.sourceRef)

  return {
    eligible: true,
    kwhCumacForfait: forfait.kwhCumac,
    kwhCumacAvecBonus,
    bonusMultiplicateur: multiplicateur,
    prixUnitaireEurParMWh: prixUnitaire,
    montantTotalEur,
    sourceRefs,
    fiche: forfait.fiche,
    notes: forfait.notes,
  }
}
