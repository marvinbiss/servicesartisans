/**
 * Zones climatiques RT2012 — mapping code département → H1 / H2 / H3.
 *
 * Source : arrêté 26 octobre 2010 modifié, annexe IX (RT2012). Repris par les
 * fiches CEE BAR-TH-XXX dépendant du climat. Pour homogénéité avec
 * `src/lib/aides/climate-zones.ts` et `src/lib/cee/climate-zones.ts`, le set
 * canonique est lu depuis `@/lib/shared/climate-zones-data` — toute évolution
 * d'un département se fait à un seul endroit.
 *
 * Couverture v0 :
 *  - 95 départements métropole (01-95)
 *  - Corse : code département `'2A'` / `'2B'`. Le préfixe postal `'20'` est
 *    aussi mappé H3 par compatibilité avec les appelants qui passent un
 *    préfixe (sans préjuger 2A vs 2B).
 *  - DROM (971-978) et inconnu : fallback H2 documenté.
 *
 * Référence : `ATM_ZONES_CLIMATIQUES` (placeholder pending exact PDF URL).
 */

import { H2_DEPT_CODES, H3_DEPT_CODES } from '@/lib/shared/climate-zones-data'
import type { ZoneClimatique } from './types'

/**
 * Retourne la zone climatique RT2012 pour un code département INSEE 2-3 chars.
 *
 * @param deptCode code département (ex `'75'`, `'69'`, `'2A'`, `'2B'`, `'974'`)
 *                 ou préfixe postal 2 chars. Insensible aux espaces.
 * @returns `'H1'` | `'H2'` | `'H3'`. Fallback `'H2'` pour code inconnu ou DROM
 *          (hors scope v0).
 */
export function zoneClimatiqueForDept(deptCode: string | null | undefined): ZoneClimatique {
  if (!deptCode) return 'H2'
  const normalized = deptCode.trim().toUpperCase()
  if (!normalized) return 'H2'

  // Corse : préfixe postal '20' peut arriver avant désambiguation 2A/2B.
  if (normalized === '20' || normalized === '2A' || normalized === '2B') return 'H3'

  if (H3_DEPT_CODES.has(normalized)) return 'H3'
  if (H2_DEPT_CODES.has(normalized)) return 'H2'

  // DROM (971-978) : hors zonage RT2012 métropolitain. Fallback H2 documenté.
  if (normalized.startsWith('97') || normalized.startsWith('98')) return 'H2'

  // Toute valeur restante = métropole H1 (Nord-Est froid + reste non listé H2/H3).
  // Codes 01-99 métropole non listés H2/H3 sont par construction H1.
  if (/^\d{2}$/.test(normalized)) return 'H1'

  // Format inconnu (3+ chars hors '97x'/'98x', ou non numérique) : fallback H2.
  return 'H2'
}
