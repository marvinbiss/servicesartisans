#!/usr/bin/env npx tsx
/**
 * diag-rge-pac-paris.ts — V6 verify direct via admin
 * --------------------------------------------------
 * Test direct DB avec le code département pour vérifier que le bug est mort.
 */
import { supabase } from './lib/supabase-admin'

const SERVICE_TO_SPECIALTIES: Record<string, string[]> = {
  'pompe-a-chaleur': ['pompe-a-chaleur'],
  'isolation-thermique': ['isolation-thermique', 'isolation'],
  chauffagiste: ['chauffagiste'],
  'renovation-energetique': ['renovation-energetique'],
}

async function countByDept(service: string, deptCode: string) {
  const today = new Date().toISOString().slice(0, 10)
  const specialties = SERVICE_TO_SPECIALTIES[service]
  const { count, error } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .in('specialty', specialties)
    .eq('address_department', deptCode)
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
  if (error) throw error
  return count ?? 0
}

async function countByDeptName(service: string, deptName: string) {
  const today = new Date().toISOString().slice(0, 10)
  const specialties = SERVICE_TO_SPECIALTIES[service]
  const { count, error } = await supabase
    .from('providers')
    .select('id', { count: 'exact', head: true })
    .in('specialty', specialties)
    .eq('address_department', deptName)
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
  if (error) throw error
  return count ?? 0
}

async function main() {
  console.log(`\n=== Avant vs Après fix : RGE dept count ===\n`)
  const cases: Array<[string, string, string]> = [
    ['pompe-a-chaleur', '75', 'Paris'],
    ['pompe-a-chaleur', '69', 'Rhône'],
    ['pompe-a-chaleur', '13', 'Bouches-du-Rhône'],
    ['pompe-a-chaleur', '38', 'Isère'],
    ['isolation-thermique', '75', 'Paris'],
    ['chauffagiste', '59', 'Nord'],
    ['chauffagiste', '13', 'Bouches-du-Rhône'],
    ['renovation-energetique', '33', 'Gironde'],
  ]
  console.log(`${'service'.padEnd(24)} ${'dept'.padEnd(7)} avant(NAME)   après(CODE)`)
  console.log(`${'─'.repeat(24)} ${'─'.repeat(7)} ──────────  ─────────────`)
  let totalRecovered = 0
  for (const [service, code, name] of cases) {
    const old = await countByDeptName(service, name)
    const fix = await countByDept(service, code)
    totalRecovered += fix
    const verdict = fix > 0 && old === 0 ? ' ✅ recovered' : ''
    console.log(
      `${service.padEnd(24)} ${(code + ' ' + name).padEnd(7).slice(0, 7)} ${String(old).padStart(4)}        →  ${String(fix).padStart(4)}${verdict}`
    )
  }
  console.log(
    `\nTotal RGE providers recovered as indexable across these 8 cases: ${totalRecovered}`
  )

  // Estimation impact ampleur :
  // 19 services RGE × 60 villes prerendered = 1140 pages
  // + 19 services × 96 départements = 1824 pages
  // Toutes étaient noindex à cause du bug si dept fallback non trouvé.
  // Avec 45480 RGE non-null dept, énormément de pages basculent INDEX.
  const today = new Date().toISOString().slice(0, 10)
  const { data: deptDist } = await supabase
    .from('providers')
    .select('address_department, specialty')
    .eq('is_active', true)
    .not('rge_qualifications', 'is', null)
    .gte('rge_valid_until', today)
    .not('address_department', 'is', null)
    .limit(50000)
  const combos = new Set<string>()
  for (const r of deptDist ?? []) {
    combos.add(`${r.specialty}|${r.address_department}`)
  }
  console.log(`\nDistinct (specialty × dept_code) combos avec ≥1 RGE actif : ${combos.size}`)
  console.log(
    `(estimation pages /rge/[s]/[ville] et /rge/[s]/dept/[d] qui passent NOINDEX → INDEX)\n`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
