#!/usr/bin/env npx tsx
/**
 * supply-activation-outbound.ts — Cold outbound to the 553-artisan cohort
 * produced by `supply-activation-cohorts.ts`. Drives the 19 → 100 claimed
 * artisans target from the CEO playbook.
 *
 * Sends via Resend (already wired in the project). Respects RGPD with an
 * explicit opt-out link, caps per-day volume, audits every attempt to a CSV
 * log, and supports per-cohort templating.
 *
 * Usage:
 *   npx tsx scripts/supply-activation-outbound.ts --dry-run
 *   npx tsx scripts/supply-activation-outbound.ts --apply --cohort=A --limit=25
 *   npx tsx scripts/supply-activation-outbound.ts --apply --cap-per-day=50
 *
 * CSV input: docs/supply-activation-2026-04-20/all-cohorts-merged.csv
 * Audit log: docs/supply-activation-2026-04-20/outbound-log-{YYYY-MM-DD}.csv
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const SENDER =
  process.env.SUPPLY_OUTBOUND_SENDER || 'Marvin — ServicesArtisans <marvin@servicesartisans.fr>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'
const CSV_PATH = path.join(
  __dirname,
  '..',
  'docs',
  'supply-activation-2026-04-20',
  'all-cohorts-merged.csv'
)
const LOG_DIR = path.join(__dirname, '..', 'docs', 'supply-activation-2026-04-20')

type Row = {
  cohort: 'A' | 'B' | 'C' | 'D'
  reason: string
  id: string
  name: string
  siret: string
  email: string
  phone: string
  address_city: string
  address_city_resolved: string
  specialty: string
  data_quality_score: string
}

function parseCsv(filePath: string): Row[] {
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
  const lines = raw.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return []
  const header = splitCsvRow(lines[0])
  const out: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCsvRow(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) row[header[j]] = parts[j] ?? ''
    out.push(row as unknown as Row)
  }
  return out
}

function splitCsvRow(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (const ch of line) {
    if (ch === '"') inQ = !inQ
    else if (ch === ',' && !inQ) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.replace(/^"|"$/g, ''))
}

function escCsv(v: string): string {
  const s = String(v).replace(/"/g, '""')
  return /[,"\n]/.test(s) ? `"${s}"` : s
}

function optOutToken(email: string): string {
  const secret = process.env.OUTBOUND_OPT_OUT_SECRET || 'dev-only-secret-change-in-prod'
  return crypto.createHmac('sha256', secret).update(email.toLowerCase()).digest('hex').slice(0, 24)
}

function optOutUrl(email: string): string {
  const tok = optOutToken(email)
  const e = encodeURIComponent(email)
  return `${SITE_URL}/contact?opt-out=${tok}&email=${e}`
}

const CITY = (r: Row): string =>
  (r.address_city_resolved && r.address_city_resolved.trim()) || r.address_city || 'votre région'

function renderCohortA(r: Row): { subject: string; html: string; text: string } {
  const city = CITY(r)
  const name = r.name || 'Madame, Monsieur'
  const subject = `${name.split(' ')[0]}, votre fiche RGE sur ServicesArtisans`
  const claimUrl = `${SITE_URL}/artisan/revendiquer`
  const text = `Bonjour ${name},

Votre entreprise apparaît sur ServicesArtisans.fr avec vos qualifications RGE.
Vous êtes donc éligible aux demandes MaPrimeRénov' / CEE que nous recevons
quotidiennement sur le secteur ${city}.

Nous fonctionnons en leads exclusifs : 1 demande = 1 artisan, sans partage.
0 € pendant 6 mois — nous cherchons 100 artisans pilotes pour valider le modèle.

Revendiquez votre fiche (2 min) :
${claimUrl}?siret=${r.siret}

Marvin, fondateur
marvin@servicesartisans.fr

---
Désabonnement : ${optOutUrl(r.email)}`

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1f2937;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
<p>Bonjour <strong>${escapeHtml(name)}</strong>,</p>
<p>Votre entreprise apparaît sur <strong>ServicesArtisans.fr</strong> avec vos qualifications RGE. Vous êtes donc éligible aux demandes MaPrimeRénov' / CEE que nous recevons quotidiennement sur le secteur <strong>${escapeHtml(city)}</strong>.</p>
<p>Nous fonctionnons en <strong>leads exclusifs</strong> : 1 demande = 1 artisan, sans partage. <strong>0 € pendant 6 mois</strong> — nous cherchons 100 artisans pilotes pour valider le modèle.</p>
<p style="text-align:center;margin:32px 0">
  <a href="${claimUrl}?siret=${r.siret}" style="display:inline-block;background:#059669;color:#fff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:600">Revendiquer votre fiche (2 min)</a>
</p>
<p style="color:#6b7280;font-size:14px">Marvin, fondateur<br><a href="mailto:marvin@servicesartisans.fr">marvin@servicesartisans.fr</a></p>
<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="color:#9ca3af;font-size:12px">Vous recevez cet email car votre entreprise est publiée dans l'annuaire officiel ADEME RGE (france-renov.gouv.fr). <a href="${optOutUrl(r.email)}" style="color:#9ca3af">Se désabonner</a></p>
</body></html>`
  return { subject, html, text }
}

function renderCohortB(r: Row): { subject: string; html: string; text: string } {
  const city = CITY(r)
  const name = r.name || 'Madame, Monsieur'
  const spec = r.specialty || 'artisan'
  const subject = `Demandes de devis ${spec} à ${city}`
  const claimUrl = `${SITE_URL}/artisan/revendiquer`
  const text = `Bonjour ${name},

Nous recevons régulièrement des demandes de devis ${spec} à ${city} et votre
entreprise ressort sur notre plateforme.

Revendiquez votre fiche et recevez ces demandes en exclusivité (pas de partage,
pas d'abonnement pendant 6 mois).

${claimUrl}?siret=${r.siret}

Marvin, fondateur
marvin@servicesartisans.fr

---
Désabonnement : ${optOutUrl(r.email)}`

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1f2937;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
<p>Bonjour <strong>${escapeHtml(name)}</strong>,</p>
<p>Nous recevons régulièrement des demandes de devis <strong>${escapeHtml(spec)}</strong> à <strong>${escapeHtml(city)}</strong> et votre entreprise ressort sur notre plateforme.</p>
<p>Revendiquez votre fiche et recevez ces demandes <strong>en exclusivité</strong> (pas de partage, pas d'abonnement pendant 6 mois).</p>
<p style="text-align:center;margin:32px 0">
  <a href="${claimUrl}?siret=${r.siret}" style="display:inline-block;background:#059669;color:#fff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:600">Revendiquer ma fiche</a>
</p>
<p style="color:#6b7280;font-size:14px">Marvin, fondateur<br><a href="mailto:marvin@servicesartisans.fr">marvin@servicesartisans.fr</a></p>
<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="color:#9ca3af;font-size:12px">Vous recevez cet email car votre entreprise est publiée dans la base SIRENE officielle sur la commune de ${escapeHtml(city)}. <a href="${optOutUrl(r.email)}" style="color:#9ca3af">Se désabonner</a></p>
</body></html>`
  return { subject, html, text }
}

function renderCohortD(r: Row): { subject: string; html: string; text: string } {
  const name = r.name || 'Madame, Monsieur'
  const subject = `Votre compte ServicesArtisans — comment puis-je vous aider ?`
  const text = `Bonjour ${name},

Vous avez revendiqué votre fiche sur ServicesArtisans, mais je remarque que
nous ne nous sommes pas reparlé depuis. J'aimerais comprendre ce qui vous a
freiné ou ce que je peux améliorer pour que l'outil vous serve vraiment.

Un retour honnête en 2 lignes vaut de l'or pour nous.

Accéder à votre espace : ${SITE_URL}/espace-artisan

Marvin, fondateur

---
Désabonnement : ${optOutUrl(r.email)}`

  const html = `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1f2937;line-height:1.6;max-width:560px;margin:0 auto;padding:24px">
<p>Bonjour <strong>${escapeHtml(name)}</strong>,</p>
<p>Vous avez revendiqué votre fiche sur <strong>ServicesArtisans</strong>, mais je remarque que nous ne nous sommes pas reparlé depuis. J'aimerais comprendre ce qui vous a freiné ou ce que je peux améliorer pour que l'outil vous serve vraiment.</p>
<p>Un retour honnête en 2 lignes vaut de l'or pour nous.</p>
<p style="text-align:center;margin:32px 0">
  <a href="${SITE_URL}/espace-artisan" style="display:inline-block;background:#059669;color:#fff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:600">Accéder à mon espace</a>
</p>
<p style="color:#6b7280;font-size:14px">Marvin, fondateur</p>
<hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="color:#9ca3af;font-size:12px">Vous recevez cet email car vous avez un compte actif sur ServicesArtisans. <a href="${optOutUrl(r.email)}" style="color:#9ca3af">Se désabonner</a></p>
</body></html>`
  return { subject, html, text }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderFor(r: Row) {
  if (r.cohort === 'A') return renderCohortA(r)
  if (r.cohort === 'B') return renderCohortB(r)
  if (r.cohort === 'D') return renderCohortD(r)
  return null
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function sendOne(
  r: Row,
  dryRun: boolean
): Promise<{ ok: boolean; messageId: string; error?: string }> {
  const rendered = renderFor(r)
  if (!rendered) return { ok: false, messageId: '', error: 'no_template_for_cohort' }
  if (!r.email || !r.email.includes('@')) {
    return { ok: false, messageId: '', error: 'no_valid_email' }
  }
  if (dryRun) {
    return { ok: true, messageId: 'DRY_RUN' }
  }
  try {
    const { sendEmail } = await import('../src/lib/api/resend-client')
    const res = await sendEmail({
      from: SENDER,
      to: r.email.trim(),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: 'campaign', value: 'supply_activation_2026_04' },
        { name: 'cohort', value: r.cohort },
      ],
      headers: {
        'List-Unsubscribe': `<${optOutUrl(r.email)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    return { ok: true, messageId: res.id }
  } catch (err) {
    return { ok: false, messageId: '', error: (err as Error).message.slice(0, 200) }
  }
}

async function loadOptOuts(): Promise<Set<string>> {
  // Recorded in Supabase when a prospect follows the unsubscribe link.
  // For v1 we just rely on the contact form handler; treat every row as sendable.
  // TODO: create `outbound_opt_outs` table and wire it here before ramp-up.
  return new Set<string>()
}

async function loadAlreadySent(): Promise<Set<string>> {
  // Scan prior log files in LOG_DIR and dedupe by email.
  const sent = new Set<string>()
  if (!fs.existsSync(LOG_DIR)) return sent
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.startsWith('outbound-log-'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(LOG_DIR, file), 'utf-8')
    for (const line of raw.split(/\r?\n/).slice(1)) {
      const parts = splitCsvRow(line)
      if (parts[3] === 'sent' && parts[1]) sent.add(parts[1].toLowerCase())
    }
  }
  return sent
}

async function main() {
  const args = process.argv.slice(2)
  const apply = args.includes('--apply')
  const cohortArg = args.find((a) => a.startsWith('--cohort='))?.split('=')[1]
  const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1]
  const capArg = args.find((a) => a.startsWith('--cap-per-day='))?.split('=')[1]
  const limit = limitArg ? parseInt(limitArg, 10) : null
  const capPerDay = capArg ? parseInt(capArg, 10) : 50

  console.log(`📮 Supply outbound — ${apply ? 'APPLY' : 'DRY RUN'} | cap/day=${capPerDay}`)

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV missing: ${CSV_PATH}. Run supply-activation-cohorts.ts --write first.`)
    process.exit(1)
  }

  const rows = parseCsv(CSV_PATH)
  console.log(`   Loaded ${rows.length} candidates from merged CSV`)

  const optOuts = await loadOptOuts()
  const alreadySent = await loadAlreadySent()
  console.log(`   Opt-outs: ${optOuts.size} | Already sent: ${alreadySent.size}`)

  let pool = rows
    .filter((r) => !cohortArg || r.cohort === cohortArg)
    .filter((r) => r.email && r.email.includes('@'))
    .filter((r) => !optOuts.has(r.email.toLowerCase()))
    .filter((r) => !alreadySent.has(r.email.toLowerCase()))

  if (limit) pool = pool.slice(0, limit)
  pool = pool.slice(0, capPerDay)

  console.log(`   Sendable today: ${pool.length}`)

  if (pool.length === 0) {
    console.log('✅ Nothing to send.')
    return
  }

  if (!apply) {
    console.log('\n⏭️  DRY RUN — sample 3:')
    for (const r of pool.slice(0, 3)) {
      const rendered = renderFor(r)
      console.log(
        `     [${r.cohort}] → ${r.email} | ${rendered ? rendered.subject : 'NO_TEMPLATE'}`
      )
    }
    return
  }

  fs.mkdirSync(LOG_DIR, { recursive: true })
  const today = new Date().toISOString().slice(0, 10)
  const logPath = path.join(LOG_DIR, `outbound-log-${today}.csv`)
  const logExists = fs.existsSync(logPath)
  const logStream = fs.openSync(logPath, 'a')
  if (!logExists) {
    fs.writeSync(logStream, 'sent_at,email,cohort,status,message_id,error,provider_id\n')
  }

  let ok = 0
  let ko = 0
  for (const r of pool) {
    const result = await sendOne(r, false)
    fs.writeSync(
      logStream,
      [
        new Date().toISOString(),
        escCsv(r.email),
        r.cohort,
        result.ok ? 'sent' : 'failed',
        result.messageId,
        escCsv(result.error || ''),
        r.id,
      ].join(',') + '\n'
    )
    if (result.ok) ok++
    else ko++
    process.stdout.write(`\r   ${ok} sent / ${ko} failed / ${pool.length} total`)
    await sleep(1200) // ~50 emails/min, respects Resend free tier
  }
  fs.closeSync(logStream)
  console.log(`\n✅ Done: ${ok} sent, ${ko} failed. Log: ${logPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
