/**
 * replay-mig-400-403.mjs — restaure les données compliance CEE écrasées/manquantes.
 *
 * Contexte (2026-06-05) : mig 384 a été (re)jouée au SQL editor ce jour, ce qui a
 * écrasé les verbatims de l'audit 403 (rge_formulation_arrete, rge_qualifications,
 * rge_decret_category) ; et mig 400 (justificatifs_requis) n'a jamais été effective
 * live (0 item sur toutes les fiches actives → page dossier artisan sans check-list,
 * gap-check loi 2025-594 inopérant).
 *
 * Ce script rejoue le DML de 400 (+ split photos de 407) puis 403, via PostgREST
 * service_role. Idempotent : garde anti-double-append sur les notes 403.
 *
 * Usage :
 *   node scripts/replay-mig-400-403.mjs            # dry-run (affiche le diff)
 *   node scripts/replay-mig-400-403.mjs --apply    # applique
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
const APPLY = process.argv.includes('--apply')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ---------------------------------------------------------------------------
// Helpers parsing SQL
// ---------------------------------------------------------------------------

/** Déséchappe une chaîne SQL single-quoted ('' → ') */
const unq = (s) => s.replace(/''/g, "'")

/**
 * Concatène les littéraux adjacents d'une valeur SQL :
 * 'abc '\n  'def' → "abc def". Gère le préfixe E'' (\\n → \n).
 */
function joinSqlString(raw) {
  let out = ''
  const re = /E?'((?:[^']|'')*)'/g
  let m
  while ((m = re.exec(raw)) !== null) {
    let piece = unq(m[1])
    if (raw.slice(m.index, m.index + 1) === 'E') piece = piece.replace(/\\n/g, '\n')
    out += piece
  }
  return out
}

// ---------------------------------------------------------------------------
// 1. Mig 400 — justificatifs_requis par groupe
// ---------------------------------------------------------------------------

function parseMig400() {
  const sql = readFileSync(resolve('supabase/migrations/400_cee_justificatifs_requis.sql'), 'utf8')
  const blocks = []
  const re =
    /SET justificatifs_requis = '(\[[\s\S]*?\])'::jsonb,[\s\S]*?WHERE code (?:= '([A-Z0-9-]+)'|IN \(([^)]+)\))/g
  let m
  while ((m = re.exec(sql)) !== null) {
    const json = JSON.parse(unq(m[1]))
    const codes = m[2] ? [m[2]] : m[3].match(/[A-Z0-9-]+/g)
    blocks.push({ codes, justificatifs: json })
  }
  return blocks
}

/** Split mig 407 : remplace l'item photo fourre-tout par avant + après. */
function apply407Split(items) {
  const OLD = 'photos_horodatees_geolocalisees_avant_apres'
  const avant = {
    code: 'photos_avant_travaux',
    label: 'Photos horodatées avant travaux avec géolocalisation EXIF',
    source: 'loi_2025-594',
    obligatoire: true,
    duree_conservation_annees: 6,
    exif_geotag: true,
  }
  const apres = {
    code: 'photos_apres_travaux',
    label: 'Photos horodatées après travaux avec géolocalisation EXIF',
    source: 'loi_2025-594',
    obligatoire: true,
    duree_conservation_annees: 6,
    exif_geotag: true,
  }
  const out = []
  for (const it of items) {
    if (it.code === OLD) out.push(avant, apres)
    else out.push(it)
  }
  return out
}

// ---------------------------------------------------------------------------
// 2. Mig 403 — audit verbatim PDF DGEC (17 fiches)
// ---------------------------------------------------------------------------

function parseMig403() {
  const sql = readFileSync(resolve('supabase/migrations/403_cee_rge_audit_pdf_dgec.sql'), 'utf8')
  const updates = []
  const re = /UPDATE cee_operations\s+SET ([\s\S]*?)\s+WHERE code = '([A-Z0-9-]+)';/g
  let m
  while ((m = re.exec(sql)) !== null) {
    const body = m[1]
    const code = m[2]
    const u = { code }
    const status = body.match(/rge_requirement_status = '([a-z_]+)'/)
    if (status) u.rge_requirement_status = status[1]
    u.rge_qualifications_requises = []
    const cat = body.match(/rge_decret_category = '\{([\d,]*)\}'::INT\[\]/)
    u.rge_decret_category = cat && cat[1] ? cat[1].split(',').map(Number) : []
    const form = body.match(/rge_formulation_arrete =\s*((?:E?'(?:[^']|'')*'\s*)+),/)
    if (form) u.rge_formulation_arrete = joinSqlString(form[1])
    const notes = body.match(/notes = COALESCE\(notes, ''\) \|\| ((?:E?'(?:[^']|'')*'\s*)+),/)
    if (notes) u.notesAppendix = joinSqlString(notes[1])
    updates.push(u)
  }
  return updates
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const g400 = parseMig400()
const g403 = parseMig403()
console.log(`mig 400 : ${g400.length} groupes parsés (${g400.flatMap((g) => g.codes).length} codes)`)
console.log(`mig 403 : ${g403.length} updates parsés`)
if (g403.length !== 17) throw new Error('parse 403 incomplet — attendu 17')
if (g400.length < 9) throw new Error('parse 400 incomplet — attendu >= 9 groupes')

const { data: liveRows, error: liveErr } = await supabase
  .from('cee_operations')
  .select('code,is_active,notes,justificatifs_requis,rge_requirement_status')
if (liveErr) throw liveErr
const live = new Map(liveRows.map((r) => [r.code, r]))

let planned = 0

// --- 400 + 407 -------------------------------------------------------------
for (const grp of g400) {
  const justifs = apply407Split(grp.justificatifs)
  for (const code of grp.codes) {
    const row = live.get(code)
    if (!row) {
      console.log(`  [400] ${code} ABSENT live — skip`)
      continue
    }
    if (!row.is_active) {
      console.log(`  [400] ${code} inactif — skip (condition mig 400)`)
      continue
    }
    const already = Array.isArray(row.justificatifs_requis) && row.justificatifs_requis.length > 0
    if (already) {
      console.log(`  [400] ${code} a déjà ${row.justificatifs_requis.length} items — skip`)
      continue
    }
    planned++
    console.log(`  [400] ${code} → ${justifs.length} justificatifs`)
    if (APPLY) {
      const { error } = await supabase
        .from('cee_operations')
        .update({ justificatifs_requis: justifs, updated_at: new Date().toISOString() })
        .eq('code', code)
      if (error) throw new Error(`400 ${code}: ${error.message}`)
    }
  }
}

// --- 403 ---------------------------------------------------------------------
for (const u of g403) {
  const row = live.get(u.code)
  if (!row) {
    console.log(`  [403] ${u.code} ABSENT live — skip`)
    continue
  }
  const patch = {
    rge_requirement_status: u.rge_requirement_status,
    rge_qualifications_requises: u.rge_qualifications_requises,
    rge_decret_category: u.rge_decret_category,
    rge_formulation_arrete: u.rge_formulation_arrete,
    updated_at: new Date().toISOString(),
  }
  // Garde anti-double-append : marqueur unique par code
  const marker = `[audit 2026-04-11] ${u.code}`
  if (u.notesAppendix && !(row.notes || '').includes(marker)) {
    patch.notes = (row.notes || '') + u.notesAppendix
  }
  planned++
  console.log(
    `  [403] ${u.code} → status=${u.rge_requirement_status} cat=[${u.rge_decret_category}] notes+=${patch.notes ? 'oui' : 'déjà'}`
  )
  if (APPLY) {
    const { error } = await supabase.from('cee_operations').update(patch).eq('code', u.code)
    if (error) throw new Error(`403 ${u.code}: ${error.message}`)
  }
}

console.log(`\n${APPLY ? 'APPLIQUÉ' : 'DRY-RUN'} — ${planned} updates${APPLY ? '' : ' (relancer avec --apply)'}`)
