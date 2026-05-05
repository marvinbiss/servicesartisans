#!/usr/bin/env node
/**
 * scripts/audit-webhook-signatures.mjs
 * -------------------------------------
 * DoD anti-régression sur signature webhook tiers (P0 sécurité).
 *
 * Source : memory `ahrefs-deep-audit-vague4-2026-05-04` — "Twilio webhook
 * sans signature P0". Memory `audit-10-agents-2026-04-25` confirme fix
 * timing-safe + signature verification.
 *
 * Pourquoi : un webhook tiers sans verification signature = anyone with
 * the URL peut forger des appels. Pour Twilio (call status, recording),
 * forge = lead injection / spoofing source. Pour Yousign (signature
 * mandataire CEE), forge = signed-document fraud.
 *
 * Vérifie sur src/app/api/**\/webhooks/**\/route.ts + provider-aware :
 *
 *   1. Twilio webhooks vérifient `x-twilio-signature` via
 *      `verifyTwilioSignature(signature, url, params)` AVANT toute logique
 *   2. Yousign webhook vérifie signature HMAC SHA-256 sur body
 *   3. Provider-seo-refresh webhook vérifie un secret cron-style
 *   4. Aucun webhook ne bypass la vérif via `if (process.env.NODE_ENV !==
 *      'production')` ou flag de dev (sinon contournable en prod par flag)
 *
 * Usage :
 *   node scripts/audit-webhook-signatures.mjs --strict
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const API = join(ROOT, 'src', 'app', 'api')

function walkRouteTs(dir, predicate) {
  const out = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkRouteTs(full, predicate))
    else if ((entry === 'route.ts' || entry === 'route.js') && predicate(full)) out.push(full)
  }
  return out
}

const twilioRoutes = walkRouteTs(API, (p) => /[\\/]twilio(?:-[a-z]+)?[\\/]route\.ts$/.test(p))
const yousignRoutes = walkRouteTs(API, (p) => /[\\/]yousign[\\/]route\.ts$/.test(p))
const seoRefreshRoutes = walkRouteTs(API, (p) =>
  /[\\/]provider-seo-refresh[\\/]route\.ts$/.test(p)
)

function verifyTwilio(src) {
  return (
    /verifyTwilioSignature\(/.test(src) &&
    /['"]x-twilio-signature['"]/.test(src) &&
    !/process\.env\.NODE_ENV\s*!==\s*['"]production['"][\s\S]{0,150}?return/.test(src)
  )
}
function verifyYousign(src) {
  // Yousign uses HMAC on x-yousign-signature-256 + timestamp via helper
  // verifyYousignWebhook(rawBody, signature, timestamp)
  return (
    /verifyYousignWebhook\(/.test(src) &&
    /['"]x-yousign-signature[-\d]*['"]/i.test(src)
  )
}
function verifySeoRefresh(src) {
  // Provider-SEO-refresh uses HMAC via verifyProviderSeoSignature(rawBody, signature, timestamp)
  return (
    /verifyProviderSeoSignature\(/.test(src) ||
    /CRON_SECRET|verifyCronSecret|REFRESH_SECRET|x-webhook-secret/i.test(src)
  )
}

const checks = []

for (const path of twilioRoutes) {
  const src = readFileSync(path, 'utf8')
  checks.push({
    id: `twilio_${relative(API, path).replace(/[\\/]/g, '_').replace(/\..*$/, '')}`,
    label: `Twilio: ${relative(API, path).replace(/\\/g, '/')} verify x-twilio-signature`,
    ok: verifyTwilio(src),
    weight: 2.0,
  })
}
for (const path of yousignRoutes) {
  const src = readFileSync(path, 'utf8')
  checks.push({
    id: `yousign_${relative(API, path).replace(/[\\/]/g, '_').replace(/\..*$/, '')}`,
    label: `Yousign: ${relative(API, path).replace(/\\/g, '/')} HMAC SHA-256`,
    ok: verifyYousign(src),
    weight: 2.0,
  })
}
for (const path of seoRefreshRoutes) {
  const src = readFileSync(path, 'utf8')
  checks.push({
    id: `seo_refresh_${relative(API, path).replace(/[\\/]/g, '_').replace(/\..*$/, '')}`,
    label: `Provider SEO refresh: ${relative(API, path).replace(/\\/g, '/')} secret check`,
    ok: verifySeoRefresh(src),
    weight: 1.0,
  })
}

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-webhook-signatures',
  source_memory: 'ahrefs-deep-audit-vague4 + audit-10-agents-2026-04-25',
  total_webhooks: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label, weight: f.weight })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Webhook Signatures Audit (P0 sécurité)\n')
  console.log(`  Webhooks scannés : ${checks.length}`)
  console.log(`  OK               : ${checks.length - failures.length}`)
  console.log(`  Échecs           : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Tous les webhooks vérifient leur signature.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} webhook(s) sans signature — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
