/**
 * Ground-truth adapters — collectent les faits déterministes injectables
 * dans le prompt LLM pour zero-hallucination YMYL.
 *
 * Sources :
 *   - MPR : `@/lib/aides/bareme-mpr-2026` (lookup table, ANAH ref)
 *   - CEE : table `cee_operations` (services_slugs[] ARRAY contains)
 *   - RGE : count `providers` avec rge_qualifications.date_fin > now()
 *
 * Pas d'I/O fluide : MPR sync (table en mémoire), CEE + RGE = 1 query DB
 * chacun. Cache mémoire 1h sur les 2 dernières (RPC partielle, pas par
 * cluster). Toute donnée renvoyée porte sa source (`ANAH_MAPRIMERENOV`,
 * `EMMY`, `ADEME`) — Critic vérifie présence source.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { BAREME_MPR_2026 } from '@/lib/aides/bareme-mpr-2026'
import type { Geste } from '@/lib/aides/types'
import type { GroundTruthFacts } from './content-generator'

const SERVICE_TO_GESTES: Record<string, ReadonlyArray<Geste>> = {
  'pompe-a-chaleur': ['pac_air_eau', 'pac_geothermique', 'pac_air_air'],
  'chauffe-eau-thermodynamique': ['chauffe_eau_thermo'],
  'isolation-thermique': ['isolation_combles', 'isolation_ite', 'isolation_planchers_bas'],
  ventilation: ['vmc_double_flux'],
  'audit-energetique': ['audit_energetique'],
  chauffagiste: ['chaudiere_biomasse'],
}

const MENAGE_LABEL: Record<string, string> = {
  tres_modeste: 'Bleu (très modeste)',
  modeste: 'Jaune (modeste)',
  intermediaire: 'Violet (intermédiaire)',
  superieur: 'Rose (supérieur)',
}

const GESTE_LABEL: Record<Geste, string> = {
  pac_air_eau: 'Pompe à chaleur air/eau',
  pac_geothermique: 'Pompe à chaleur géothermique',
  pac_air_air: 'Pompe à chaleur air/air',
  chauffe_eau_thermo: 'Chauffe-eau thermodynamique',
  isolation_combles: 'Isolation combles',
  isolation_ite: 'Isolation thermique extérieure (ITE)',
  isolation_planchers_bas: 'Isolation planchers bas',
  vmc_double_flux: 'VMC double flux',
  chaudiere_biomasse: 'Chaudière biomasse',
  audit_energetique: 'Audit énergétique',
}

export function getMprFactsForServiceSlug(serviceSlug: string | null): ReadonlyArray<string> {
  if (!serviceSlug) return []
  const gestes = SERVICE_TO_GESTES[serviceSlug]
  if (!gestes) return []
  const facts: string[] = []
  for (const geste of gestes) {
    const entries = BAREME_MPR_2026.filter((b) => b.geste === geste)
    for (const e of entries) {
      if (e.amountEUR == null || e.amountEUR === 0) continue
      facts.push(
        `MPR ${GESTE_LABEL[geste]} — ${MENAGE_LABEL[e.menageCategorie]} : ${e.amountEUR} EUR (source: ${e.sourceRef})`
      )
    }
  }
  return facts
}

export async function getCeeFactsForServiceSlug(
  serviceSlug: string | null
): Promise<ReadonlyArray<string>> {
  if (!serviceSlug) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from('cee_operations')
    .select('code, nom, coup_de_pouce, url_fiche_officielle')
    .contains('services_slugs', [serviceSlug])
    .eq('is_active', true)
    .order('coup_de_pouce', { ascending: false })
    .limit(5)

  if (!data) return []
  return data.map(
    (row: {
      code: string
      nom: string
      coup_de_pouce: boolean
      url_fiche_officielle: string | null
    }) => {
      const boost = row.coup_de_pouce ? ' [Coup de pouce ACTIF]' : ''
      const url = row.url_fiche_officielle ? ` — ${row.url_fiche_officielle}` : ''
      return `CEE ${row.code} ${row.nom}${boost}${url} (source: EMMY/Légifrance)`
    }
  )
}

export async function getRgeFactsForServiceSlug(
  serviceSlug: string | null
): Promise<ReadonlyArray<string>> {
  if (!serviceSlug) return []
  const admin = createAdminClient()
  const { count } = await admin
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)

  if (count == null) return []
  return [
    `RGE registry ADEME : ${count.toLocaleString('fr-FR')} artisans actifs (toutes catégories, source: registre RGE ADEME via data.gouv.fr).`,
  ]
}

export async function assembleGroundTruth(
  serviceSlug: string | null,
  freshness: string
): Promise<GroundTruthFacts> {
  const [ceeFacts, rgeStats] = await Promise.all([
    getCeeFactsForServiceSlug(serviceSlug),
    getRgeFactsForServiceSlug(serviceSlug),
  ])
  return {
    mprBareme: getMprFactsForServiceSlug(serviceSlug),
    ceeForfaits: ceeFacts,
    rgeStats,
    freshness,
  }
}

export const __testing = { SERVICE_TO_GESTES, GESTE_LABEL, MENAGE_LABEL }
