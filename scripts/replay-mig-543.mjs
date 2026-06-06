/**
 * replay-mig-543.mjs — seed des référentiels CEE en prod via PostgREST.
 *
 * Contexte (2026-06-06) : zones_climatiques_ref, cee_operations_ref et
 * cee_forfaits étaient VIDES depuis mig 424 → les FK NOT NULL de cee_dossiers
 * rendaient toute création de dossier impossible (tunnel mort).
 *
 * Rejoue le DML de supabase/migrations/543_cee_referentiels_seed.sql :
 *   1. cee_operations_ref : 7 fiches BAR
 *   2. zones_climatiques_ref : toutes les communes (zone par département,
 *      même mapping que src/lib/shared/climate-zones-data.ts)
 *   3. cee_forfaits : 7 ops × 3 zones × 4 catégories revenus (barème indicatif)
 *
 * Idempotent : upsert ignoreDuplicates sur les clés naturelles.
 *
 * Usage :
 *   node scripts/replay-mig-543.mjs            # dry-run (compte seulement)
 *   node scripts/replay-mig-543.mjs --apply    # applique
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mapping départements → zones (source : src/lib/shared/climate-zones-data.ts)
const H3 = new Set(['06', '11', '13', '2A', '2B', '30', '34', '66', '83', '84'])
const H2 = new Set([
  '14', '17', '22', '29', '35', '44', '50', '56', '76', '85',
  '16', '24', '31', '32', '33', '40', '46', '47', '64', '65', '79', '81', '82', '86',
  '04', '07', '09', '12', '26', '48',
])
const zoneFor = (dept) => (H3.has(dept) ? 'H3' : H2.has(dept) ? 'H2' : 'H1')

const OPERATIONS = [
  { code: 'BAR-TH-171', libelle: 'Pompe à chaleur de type air/eau' },
  { code: 'BAR-TH-129', libelle: 'Pompe à chaleur de type air/air' },
  { code: 'BAR-EN-101', libelle: 'Isolation de combles ou de toitures' },
  { code: 'BAR-EN-102', libelle: 'Isolation des murs' },
  { code: 'BAR-EN-103', libelle: "Isolation d'un plancher" },
  { code: 'BAR-TH-112', libelle: 'Appareil indépendant de chauffage au bois' },
  { code: 'BAR-TH-148', libelle: 'Chauffe-eau thermodynamique à accumulation' },
]

// [code, kwhc_base, prime_base_cts] — parité mig 543 / bareme.ts / form
const FORFAIT_BASES = [
  ['BAR-TH-171', 30000, 80000],
  ['BAR-TH-129', 18000, 45000],
  ['BAR-EN-101', 1500, 1200],
  ['BAR-EN-102', 2500, 2000],
  ['BAR-EN-103', 1200, 1000],
  ['BAR-TH-112', 15000, 60000],
  ['BAR-TH-148', 20000, 70000],
]
const ZONES = [['H1', 1.2], ['H2', 1.0], ['H3', 0.8]]
const CATEGORIES = [
  ['tres_modeste', 1.5],
  ['modeste', 1.5],
  ['intermediaire', 1.0],
  ['superieur', 1.0],
]

async function count(table) {
  const { count: c, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`${table}: ${error.message}`)
  return c
}

async function main() {
  console.log(`=== Replay mig 543 — référentiels CEE (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===\n`)

  console.log('Avant :')
  for (const t of ['cee_operations_ref', 'zones_climatiques_ref', 'cee_forfaits']) {
    console.log(`  ${t}: ${await count(t)}`)
  }

  if (!APPLY) {
    console.log('\nDry-run — relancer avec --apply pour insérer.')
    return
  }

  // 1. Operations
  const opRows = OPERATIONS.map((o) => ({
    code: o.code,
    libelle: o.libelle,
    famille: 'BAR',
    fiche_url: null,
    date_debut: '2026-01-01',
  }))
  {
    const { error } = await supabase
      .from('cee_operations_ref')
      .upsert(opRows, { onConflict: 'code', ignoreDuplicates: true })
    if (error) throw new Error(`cee_operations_ref: ${error.message}`)
    console.log(`\n✓ cee_operations_ref : ${opRows.length} rows upsertées`)
  }

  // 2. Zones climatiques depuis communes (paginé)
  const PAGE = 1000
  let from = 0
  let total = 0
  for (;;) {
    const { data, error } = await supabase
      .from('communes')
      .select('code_insee, code_postal, name, departement_code')
      .order('code_insee')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`communes read: ${error.message}`)
    if (!data || data.length === 0) break

    const rows = data
      .filter((c) => /^[0-9AB]{5}$/.test(c.code_insee))
      .map((c) => ({
        code_insee: c.code_insee,
        code_postal: /^[0-9]{5}$/.test(c.code_postal ?? '') ? c.code_postal : null,
        commune: c.name,
        departement: c.departement_code,
        zone: zoneFor(c.departement_code),
        note: 'Seed mig 543 (table communes) — zone par département RT2012, sous-zones collapsées',
      }))

    const { error: upErr } = await supabase
      .from('zones_climatiques_ref')
      .upsert(rows, { onConflict: 'code_insee', ignoreDuplicates: true })
    if (upErr) throw new Error(`zones upsert (offset ${from}): ${upErr.message}`)
    total += rows.length
    from += PAGE
    if (data.length < PAGE) break
  }
  console.log(`✓ zones_climatiques_ref : ${total} rows traitées`)

  // 3. Forfaits (cross join)
  const forfaitRows = []
  for (const [code, kwhcBase, primeBaseCts] of FORFAIT_BASES) {
    for (const [zone, zMult] of ZONES) {
      for (const [categorie, cMult] of CATEGORIES) {
        forfaitRows.push({
          operation_code: code,
          zone,
          categorie_revenus: categorie,
          montant_kwh_cumac: Math.round(kwhcBase * zMult),
          prime_forfait_eur_cts: Math.round(primeBaseCts * zMult * cMult),
          date_validite_debut: '2026-01-01',
          source_doc:
            'Barème indicatif interne SA Energy v1 (2026-06) — montant opposable recalculé au dépôt délégataire',
        })
      }
    }
  }
  {
    const { error } = await supabase.from('cee_forfaits').upsert(forfaitRows, {
      onConflict: 'operation_code,zone,categorie_revenus,date_validite_debut',
      ignoreDuplicates: true,
    })
    if (error) throw new Error(`cee_forfaits: ${error.message}`)
    console.log(`✓ cee_forfaits : ${forfaitRows.length} rows upsertées`)
  }

  console.log('\nAprès :')
  for (const t of ['cee_operations_ref', 'zones_climatiques_ref', 'cee_forfaits']) {
    console.log(`  ${t}: ${await count(t)}`)
  }
}

main().catch((e) => {
  console.error('ERREUR:', e.message)
  process.exit(1)
})
