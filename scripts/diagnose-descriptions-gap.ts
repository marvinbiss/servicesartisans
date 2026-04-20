/**
 * Diagnostic ponctuel — pourquoi certaines fiches RGE restent sur l'ancien
 * template au lieu de la nouvelle description LLM ?
 *
 * Cas constaté 2026-04-20 : sur 8 fiches RGE isolation-thermique Paris
 * sampled, 5 affichent encore le vieux template ("Contactez pour devis
 * gratuit") alors qu'elles sont RGE actives.
 *
 * Ce script interroge Supabase pour chaque SIRET :
 *   1. Provider DB state : is_active, rge_valid_until, description length,
 *      rge_qualifications count
 *   2. Draft pipeline state : provider_descriptions_draft status + timestamps
 *   3. Eligibility au sens du pipeline (is_active + rge_valid_until > today)
 *
 * Usage : npx tsx scripts/diagnose-descriptions-gap.ts [siret1] [siret2] ...
 * Sans args, utilise le sample hardcodé.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

const DEFAULT_SAMPLE = [
  '928760172', // 2M ENERGIE-BORDEAUX
  '887698223', // BH ENERGY
  '494866502', // DELTA FRANCE
  '981552466', // ECO PLUS
  '892108226', // EH IMPACT
  '894139260', // AXE ISOL (controle — devrait avoir description longue)
  '450780838', // A.A.A.CIMIANO (controle — sait déjà avoir description)
]

async function main() {
  const sirets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_SAMPLE
  const today = new Date().toISOString().slice(0, 10)
  const supabase = createAdminClient()

  console.log(`Diagnostic descriptions gap — today=${today}`)
  console.log(`Sample size: ${sirets.length}\n`)

  // Les "SIRET" issus de l'URL sont en réalité les 9 premiers digits (SIREN).
  // On fait un OR des `like` pour chaque préfixe. Supabase PostgREST gère ça
  // via `.or()` avec la syntaxe PostgREST.
  const orFilter = sirets.map((s) => `siret.like.${s}*`).join(',')
  const { data: providers, error: pErr } = await supabase
    .from('providers')
    .select(
      'id, siret, name, is_active, rge_valid_until, description, rge_qualifications, address_city, noindex'
    )
    .or(orFilter)

  if (pErr) {
    console.error('providers query error:', pErr)
    process.exit(1)
  }

  if (!providers || providers.length === 0) {
    console.log('No providers found for these SIRETs.')
    return
  }

  const providerIds = providers.map((p) => p.id)
  const { data: drafts, error: dErr } = await supabase
    .from('provider_descriptions_draft')
    .select(
      'provider_id, status, prompt_version, rubric_version, generated_at, judged_at, published_at, judge_score, judge_breakdown'
    )
    .in('provider_id', providerIds)

  if (dErr) {
    console.error('drafts query error:', dErr)
    process.exit(1)
  }

  const draftsByProvider = new Map<string, unknown[]>()
  for (const d of drafts ?? []) {
    const arr = draftsByProvider.get(d.provider_id as string) ?? []
    arr.push(d)
    draftsByProvider.set(d.provider_id as string, arr)
  }

  for (const p of providers) {
    const qualCount = Array.isArray(p.rge_qualifications) ? p.rge_qualifications.length : 0
    const descLen = (p.description ?? '').length
    const validUntil = p.rge_valid_until ? String(p.rge_valid_until).slice(0, 10) : 'null'
    const eligible = p.is_active === true && validUntil > today
    const pDrafts = (draftsByProvider.get(p.id as string) ?? []) as Array<Record<string, unknown>>

    console.log(`─ ${p.name} (SIRET ${p.siret})`)
    console.log(`  id=${p.id}`)
    console.log(
      `  is_active=${p.is_active} rge_valid_until=${validUntil} eligible=${eligible} noindex=${p.noindex}`
    )
    console.log(`  rge_qualifications=${qualCount} description_length=${descLen}`)
    if (pDrafts.length === 0) {
      console.log(`  drafts: NONE — never submitted to pipeline`)
    } else {
      for (const d of pDrafts) {
        console.log(
          `  draft: status=${d.status} prompt=${d.prompt_version} rubric=${d.rubric_version} score=${d.judge_score ?? 'null'} breakdown=${JSON.stringify(d.judge_breakdown ?? {}).slice(0, 120)}`
        )
      }
    }
    console.log('')
  }

  // Aggregates
  const noDraft = providers.filter((p) => (draftsByProvider.get(p.id as string) ?? []).length === 0)
  const withDraft = providers.length - noDraft.length
  const judgedFail = (drafts ?? []).filter((d) => d.status === 'judged_fail').length
  const published = (drafts ?? []).filter((d) => d.status === 'published').length
  console.log(
    `TOTAL ${providers.length} providers | no-draft=${noDraft.length} with-draft=${withDraft} | published=${published} judged_fail=${judgedFail}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
