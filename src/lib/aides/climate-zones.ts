/**
 * Zones climatiques RT2012 — lookup par code département + labels UI pour les
 * pages /aides/[slug]/maprimerenov (mise en contexte des bonifications CEE).
 *
 * Les sets H2/H3 sont importés depuis `src/lib/shared/climate-zones-data.ts`
 * (source unique partagée avec `src/lib/cee/climate-zones.ts`).
 */

import { H2_DEPT_CODES, H3_DEPT_CODES, type ClimateZone } from '@/lib/shared/climate-zones-data'

export type { ClimateZone }

export function deptToClimateZone(code: string): ClimateZone {
  if (H3_DEPT_CODES.has(code)) return 'H3'
  if (H2_DEPT_CODES.has(code)) return 'H2'
  return 'H1'
}

export const CLIMATE_ZONE_LABELS: Record<ClimateZone, string> = {
  H1: 'H1 (Nord, Est, Ile-de-France — climat froid)',
  H2: 'H2 (façade atlantique, sud-ouest — climat tempéré)',
  H3: 'H3 (pourtour méditerranéen — climat doux)',
}

export const CLIMATE_ZONE_IMPACT: Record<ClimateZone, string> = {
  H1: "Les primes CEE forfaitaires pour l'isolation et le chauffage sont les plus élevées en zone H1 (gains énergétiques supérieurs au froid). La pompe à chaleur air-eau et l'isolation combles sont particulièrement rentables.",
  H2: "Zone tempérée : les primes CEE sont intermédiaires. L'isolation des murs par l'extérieur (ITE) et la pompe à chaleur restent très amortissables, surtout en maison individuelle.",
  H3: "Zone chaude : les primes CEE sont réduites sur le chauffage mais la climatisation réversible (PAC air-air) et la protection solaire toiture deviennent compétitives. L'audit énergétique est souvent décisif.",
}
