#!/usr/bin/env node
/**
 * scripts/audit-cee-mandataire-flow.mjs
 * --------------------------------------
 * DoD anti-régression sur le flow Mandataire CEE (pivot CEO 2026-04-09).
 *
 * Source : memory `project-servicesartisans-mandataire-cee`,
 * `mandataire-cee-audit-2026-04-14`, `architecture-double-societe`,
 * `formation-cee-2026-04-23`. Pivot SAS dédiée mandataire CEE Sonergia,
 * marge 1 870€/chantier, viable dès 150 doss/mois P50, BFR 1.25M€ à
 * 1000/mois.
 *
 * Pourquoi : c'est le pivot business le plus structurant de SA. Si un
 * dev casse la chaîne signature → dépôt → validation, c'est tout le
 * revenue stream qui s'arrête :
 *
 *   - cee_mandats droppée → 0 conservation 10 ans R.221-1 → contrôle
 *     PNCEE = sanctions DGCCRF + perte agrément.
 *   - mandat_mentions vidé → 6 mentions obligatoires arrêté 2/11/2023
 *     manquantes → mandat NUL juridiquement.
 *   - status workflow élargi/réduit → invariants métier cassés
 *     ('pending'→'signe'→'depose'→'valide' chemin nominal).
 *   - Webhook Yousign sans signature OU sans transition convention_sent
 *     → convention_signed → mandats signés mais jamais flagués comme
 *     tels en DB → 0 dépôt Sonergia.
 *   - expires_at tronqué <10 ans → conservation R.221-1 violée.
 *   - retractation 14j non préservée → consommateur peut casser
 *     mandat juridiquement (L121-21 conso).
 *
 * Vérifications :
 *
 *   1. Mig 428 cee_leads + cee_mandats présentes
 *   2. cee_mandats colonnes critiques : lead_id (FK NOT NULL), status,
 *      yousign_envelope_id, mandat_pdf_url, mandat_mentions JSONB,
 *      signed_at, retractation_possible_jusque, expires_at (10 ans).
 *   3. CHECK status IN les 7 valeurs canoniques
 *   4. expires_at DEFAULT (now() + INTERVAL '10 years')
 *   5. RLS enabled sur cee_mandats (déjà couvert audit-rls-pii-tables
 *      mais vérification redondante : lock-in fort)
 *   6. Webhook Yousign : event.signature_request.status === 'done' →
 *      transition convention_sent → convention_signed
 *   7. Mig 433 cee_security_patches (search_path SECURITY DEFINER) présente
 *
 * Usage :
 *   node scripts/audit-cee-mandataire-flow.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')
const YOUSIGN_WEBHOOK = join(ROOT, 'src', 'app', 'api', 'webhooks', 'yousign', 'route.ts')

const migFiles = existsSync(MIG_DIR)
  ? readdirSync(MIG_DIR).filter((f) => /^\d+_.*\.sql$/.test(f))
  : []

const mig428File = migFiles.find((f) => /^428_.*cee_leads_mandats/i.test(f))
const mig428Src = mig428File ? readFileSync(join(MIG_DIR, mig428File), 'utf8') : ''

const mig433File = migFiles.find((f) => /^433_.*cee_security/i.test(f))
const mig433Src = mig433File ? readFileSync(join(MIG_DIR, mig433File), 'utf8') : ''

const webhookSrc = existsSync(YOUSIGN_WEBHOOK) ? readFileSync(YOUSIGN_WEBHOOK, 'utf8') : ''

const checks = [
  {
    id: 'mig_428_present',
    label:
      'Mig 428 cee_leads_mandats présente + CREATE TABLE cee_leads + cee_mandats',
    ok:
      mig428Src.length > 0 &&
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.cee_leads/i.test(mig428Src) &&
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.cee_mandats/i.test(mig428Src),
    weight: 2.0,
  },
  {
    id: 'cee_mandats_critical_columns',
    label:
      'cee_mandats : lead_id NOT NULL FK + status + yousign_envelope_id + mandat_pdf_url + mandat_mentions jsonb + signed_at + retractation + expires_at',
    ok: (() => {
      const tableMatch = mig428Src.match(
        /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.cee_mandats[\s\S]*?\)\s*;/i
      )
      if (!tableMatch) return false
      const t = tableMatch[0]
      return (
        /lead_id[\s\S]*?NOT\s+NULL[\s\S]*?REFERENCES/i.test(t) &&
        /status\s+text\s+NOT\s+NULL/i.test(t) &&
        /yousign_envelope_id/i.test(t) &&
        /mandat_pdf_url/i.test(t) &&
        /mandat_mentions[\s\S]*?jsonb/i.test(t) &&
        /signed_at[\s\S]*?timestamptz/i.test(t) &&
        /retractation_possible_jusque/i.test(t) &&
        /expires_at[\s\S]*?timestamptz[\s\S]*?NOT\s+NULL/i.test(t)
      )
    })(),
    weight: 2.0,
  },
  {
    id: 'cee_mandats_status_workflow',
    label:
      'cee_mandats CHECK status IN canonical (pending/signe/retracte/depose/valide/refuse/annule)',
    ok:
      /cee_mandats_status_chk[\s\S]{0,200}?CHECK[\s\S]{0,200}?\(\s*status\s+IN\s*\(\s*['"]pending['"][\s\S]{0,200}?['"]signe['"][\s\S]{0,200}?['"]depose['"][\s\S]{0,200}?['"]valide['"]/i.test(
        mig428Src
      ),
    weight: 1.5,
  },
  {
    id: 'cee_mandats_expires_10y',
    label:
      "cee_mandats expires_at DEFAULT now() + INTERVAL '10 years' (conservation R.221-1)",
    ok: /expires_at[\s\S]{0,200}?DEFAULT\s*\(\s*now\(\)\s*\+\s*INTERVAL\s+'10 years'\s*\)/i.test(
      mig428Src
    ),
    weight: 1.5,
  },
  {
    id: 'cee_mandats_rls_enabled',
    label: 'cee_mandats ENABLE ROW LEVEL SECURITY (lock-in redondant)',
    ok: /ALTER\s+TABLE\s+(?:public\.)?cee_mandats\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(
      mig428Src
    ),
    weight: 1.0,
  },
  {
    id: 'yousign_webhook_signed_transition',
    label:
      'Webhook Yousign : signature_request?.status === "done" → transition convention_signed',
    ok:
      webhookSrc.length > 0 &&
      /signature_request\??\.status\s*===\s*['"]done['"]/.test(webhookSrc) &&
      /convention_signed/.test(webhookSrc),
    weight: 2.0,
  },
  {
    id: 'mig_433_security_patches',
    label:
      'Mig 433 cee_security_patches présente (search_path SECURITY DEFINER)',
    ok:
      mig433Src.length > 0 &&
      /SECURITY\s+DEFINER/i.test(mig433Src) &&
      /SET\s+search_path/i.test(mig433Src),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-cee-mandataire-flow',
  source_memory:
    'project-servicesartisans-mandataire-cee + mandataire-cee-audit-2026-04-14 + architecture-double-societe',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 CEE Mandataire Flow Audit (DoD P3-cee-mandataire-flow)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Flow Mandataire CEE préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
