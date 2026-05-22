/**
 * Gate Sprint 4 — PAC leads 30 jours (devis_requests).
 *
 * Compte les demandes de devis associées au cluster PAC sur 30 jours. La
 * colonne `devis_requests.service_name` stocke soit le slug (climaticien
 * notamment, cf. serviceNames map dans src/lib/services/devis-service.ts),
 * soit la version résolue libre venant du simulateur Pipedrive (pivot full
 * RGE 2026-05-03). On matche donc large via ILIKE sur les variantes
 * connues : `pompe-a-chaleur`, `pac-air-eau`, `pac-air-air`, `pac-eau-eau`,
 * `pac-geothermie`, et les libellés FR équivalents (`pompe à chaleur`).
 *
 * Variables d'env (toutes obligatoires) :
 *   NEXT_PUBLIC_SUPABASE_URL    URL projet Supabase
 *   SUPABASE_SERVICE_ROLE_KEY   clé service_role (bypass RLS)
 *
 * Variables optionnelles :
 *   PAC_LEADS_BASELINE       baseline 30j (défaut 0 = pas de gate quantitatif)
 *   PAC_LEADS_TARGET         cible 30j (défaut 100)
 *
 * Sortie : tmp/gate-s4-{ISO}.json
 *
 * Usage :
 *   npx tsx scripts/gates/sprint4-pac-leads.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') })

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/types/database'

const REPO_ROOT = path.join(__dirname, '..', '..')
const TMP_DIR = path.join(REPO_ROOT, 'tmp')

const TARGET = Number(process.env.PAC_LEADS_TARGET ?? '100')
const BASELINE = Number(process.env.PAC_LEADS_BASELINE ?? '0')

// service_name peut contenir le slug brut ou le libellé. ILIKE pattern '%xxx%'.
const PAC_SERVICE_PATTERNS: readonly string[] = [
  '%pompe-a-chaleur%',
  '%pompe à chaleur%',
  '%pompe a chaleur%',
  '%pac-air-eau%',
  '%pac-air-air%',
  '%pac-eau-eau%',
  '%pac-geothermie%',
  '%pac air-eau%',
  '%pac air-air%',
  '%pac géothermie%',
  '%climaticien%',
]

type GateResult = {
  gate: 'S4'
  metric: 'pac_leads_30d'
  current: number
  baseline: number
  delta_pct: number
  target_pct: number
  passed: boolean
  checked_at: string
  notes: string
}

async function main(): Promise<void> {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    // eslint-disable-next-line no-console
    console.error(
      'FATAL : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local'
    )
    process.exit(1)
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  // Build OR clause for ILIKE patterns. PostgREST `.or()` accepts a CSV of
  // filters; `ilike` syntax = `ilike.<pattern>`.
  const orClause = PAC_SERVICE_PATTERNS.map((p) => `service_name.ilike.${p}`).join(',')

  const { count, error } = await supabase
    .from('devis_requests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since)
    .or(orClause)

  if (error) {
    // eslint-disable-next-line no-console
    console.error('FATAL : Supabase query failed', error)
    process.exit(2)
  }

  const current = count ?? 0
  const deltaPct = TARGET > 0 ? ((current - TARGET) / TARGET) * 100 : 0
  const passed = current >= TARGET

  const result: GateResult = {
    gate: 'S4',
    metric: 'pac_leads_30d',
    current,
    baseline: BASELINE,
    delta_pct: Number(deltaPct.toFixed(2)),
    target_pct: 0,
    passed,
    checked_at: new Date().toISOString(),
    notes:
      `Source : devis_requests. Patterns ILIKE service_name : ${PAC_SERVICE_PATTERNS.join(', ')}. ` +
      `Cible 30j : ${TARGET}.`,
  }

  const outPath = path.join(TMP_DIR, `gate-s4-${result.checked_at.replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2))
  // eslint-disable-next-line no-console
  console.log(
    `\nGate S4 ${passed ? 'PASS' : 'FAIL'} — ${current}/${TARGET} leads PAC 30j. Résultat dans ${outPath}`
  )

  if (!passed) process.exit(1)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[gate-s4] FATAL :', err)
  process.exit(2)
})
