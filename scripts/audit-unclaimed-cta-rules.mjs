#!/usr/bin/env node
/**
 * scripts/audit-unclaimed-cta-rules.mjs
 * --------------------------------------
 * DoD du backlog item P3-supply-claim-cta-audit (Tier 51).
 *
 * Source : CLAUDE.md "Critical Rules — NON-NEGOTIABLE" + memory
 * `servicesartisans-ceo-strategy-2026-04-20` (Pilier 1 supply-side broken)
 * + memory `servicesartisans-rge-phone-exception-2026-05-07` (exception
 * "tel public ADEME" sur fiches RGE actives).
 *
 * Règles NON-NÉGOCIABLES protégées par cet audit :
 *   1. NEVER display artisan phone numbers from DB on public pages
 *      → toute lecture de `artisan.phone` rendue dans un composant artisan
 *        doit être gatée par `isClaimed` OU par `isRgeActive`
 *        (helper `hasActiveRgeQualification`).
 *   2. NEVER add devis-CTAs targeting a specific unclaimed artisan
 *      → `ArtisanQuoteForm` / `ArtisanQuickQuote` / `ArtisanServices`
 *        restent gated `isClaimed` strictement (engagement plateforme).
 *      → CTA générique métier+ville (`buildDevisHref`) reste autorisé partout.
 *   3. NEVER recommend chatbots on ServicesArtisans (kills conversion)
 *      → aucun composant ne doit importer/render un chatbot widget.
 *
 * Pourquoi : ces règles sont hors-types (TypeScript ne peut pas détecter)
 * mais fondamentales business :
 *   - Phone unclaimed hors RGE = RGPD potentiel + données souvent fausses
 *   - Phone unclaimed RGE = OK (data.gouv.fr Etalab 2.0, mention source obligatoire)
 *   - Devis CTA artisan unclaimed = lead qui n'aboutira jamais
 *   - Chatbots = cannibalisent le funnel devis exclusif
 *
 * Vérifie sur src/components/artisan/**.tsx + ArtisanPageClient.tsx :
 *
 *   1. ArtisanSchema gate phone par `(isClaimed || isRgeActive) && artisan.phone`
 *      (anciennement `isClaimed && artisan.phone` — assoupli 2026-05-07).
 *   2. ArtisanSchema gate email par `isClaimed && artisan.email` (inchangé —
 *      l'email n'est pas exposé par l'ADEME public).
 *   3. ArtisanPageClient render `ArtisanRgeAdemeCard` si RGE unclaimed
 *      (remplace l'ancien bandeau négatif "pas encore rejoint").
 *   4. ArtisanPageClient render `ClaimButton` (gros, mobile) sur non-RGE
 *      unclaimed, ou inline discret via `ArtisanRgeAdemeCard` sur RGE unclaimed.
 *   5. Aucun composant artisan ne contient un import chatbot
 *      (intercom, drift, crisp, hubspot-chat, livechat, freshchat, tawk).
 *   6. ArtisanContactCard rendu UNIQUEMENT si isClaimed (gate parent).
 *   7. ArtisanServices rendu UNIQUEMENT si isClaimed (paid prestations).
 *   8. Devis CTA banner ("Obtenir mon devis") gated par isClaimed
 *      (vérifié dans page.tsx du template provider detail).
 *
 * Usage :
 *   node scripts/audit-unclaimed-cta-rules.mjs --strict
 *   node scripts/audit-unclaimed-cta-rules.mjs --json
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const ARTISAN_DIR = join(ROOT, 'src', 'components', 'artisan')
const PAGE_TSX = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'services',
  '[service]',
  '[location]',
  '[publicId]',
  'page.tsx'
)
const SCHEMA_TSX = join(ARTISAN_DIR, 'ArtisanSchema.tsx')
const CLIENT_TSX = join(ARTISAN_DIR, 'ArtisanPageClient.tsx')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const schemaSrc = read(SCHEMA_TSX)
const clientSrc = read(CLIENT_TSX)
const pageSrc = read(PAGE_TSX)

// Walk all artisan components
function walkTsx(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkTsx(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

const allArtisanTsx = walkTsx(ARTISAN_DIR)

const CHATBOT_IMPORTS = [
  'intercom',
  'drift-chat',
  'crisp-chat',
  '@crisp/web-sdk',
  'hubspot-chat',
  '@livechat',
  'tawk-to',
  'freshchat',
  'tidio',
  'zendesk-chat',
]
const chatbotViolations = []
for (const file of allArtisanTsx) {
  const src = readFileSync(file, 'utf8')
  for (const lib of CHATBOT_IMPORTS) {
    const re = new RegExp(`from\\s+['"][^'"]*${lib.replace(/[/.@-]/g, '[/.@-]')}[^'"]*['"]`)
    if (re.test(src)) {
      chatbotViolations.push({
        file: relative(ROOT, file).replace(/\\/g, '/'),
        lib,
      })
    }
  }
}

const checks = [
  {
    id: 'schema_phone_gated',
    label:
      'ArtisanSchema gate phone par `(isClaimed || isRgeActive) && artisan.phone` (exception RGE 2026-05-07)',
    ok:
      /canExposePhone\s*&&[\s\S]{0,80}?artisan\.phone/.test(schemaSrc) ||
      /\(isClaimed\s*\|\|\s*isRgeActive\)\s*&&[\s\S]{0,80}?artisan\.phone/.test(schemaSrc),
  },
  {
    id: 'schema_email_gated',
    label: 'ArtisanSchema gate email par `isClaimed && artisan.email` (inchangé)',
    ok:
      /isClaimed\s*&&\s*artisan\.email/.test(schemaSrc) ||
      /isClaimed[^|]+&&[^|]+email/.test(schemaSrc),
  },
  {
    id: 'rge_ademe_card_present',
    label:
      'ArtisanPageClient render `ArtisanRgeAdemeCard` sur RGE unclaimed (remplace bandeau négatif)',
    ok:
      /ArtisanRgeAdemeCard/.test(clientSrc) &&
      /isRgeUnclaimed\s*&&[\s\S]{0,400}?<ArtisanRgeAdemeCard/.test(clientSrc),
  },
  {
    id: 'rge_active_helper_used',
    label: 'ArtisanPageClient utilise `hasActiveRgeQualification` pour calculer `isRgeActive`',
    ok:
      /hasActiveRgeQualification/.test(clientSrc) &&
      /isRgeActive\s*=\s*hasActiveRgeQualification/.test(clientSrc),
  },
  {
    id: 'claim_cta_present',
    label: 'ClaimButton ou « Revendiquez » CTA présent dans flow unclaimed',
    ok:
      /ClaimButton/.test(clientSrc) ||
      /Revendiquer? cette fiche/i.test(clientSrc) ||
      /Revendiquez/i.test(clientSrc),
  },
  {
    id: 'no_chatbot_imports',
    label: `Aucun composant artisan importe un chatbot (actuel ${chatbotViolations.length} violations)`,
    ok: chatbotViolations.length === 0,
  },
  {
    id: 'contact_card_gated',
    label:
      'ArtisanContactCard rendu UNIQUEMENT si isClaimed (ou composant supprimé — refonte fiche 2026-06-07)',
    ok:
      !/ArtisanContactCard/.test(clientSrc) ||
      /\{isClaimed\s*&&[\s\S]{0,400}?<ArtisanContactCard/.test(clientSrc),
  },
  {
    id: 'services_card_gated',
    label: 'ArtisanServices rendu UNIQUEMENT si isClaimed (paid prestations)',
    ok: /\{isClaimed\s*&&[\s\S]{0,400}?<ArtisanServices/.test(clientSrc),
  },
  {
    id: 'devis_cta_banner_gated',
    label:
      'Bannière « Obtenir mon devis » gated par isClaimed dans page.tsx (ou retirée — refonte fiche 2026-06-07)',
    ok:
      !/Obtenir mon devis/.test(pageSrc) ||
      /\{isClaimed\s*&&[\s\S]{0,2000}?Obtenir mon devis/.test(pageSrc),
  },
]

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-supply-claim-cta-audit',
  source: 'CLAUDE.md NON-NEGOTIABLE rules + memory ceo-strategy-2026-04-20',
  total_checks: checks.length,
  passed: checks.length - failures.length,
  failures: failures.map((f) => ({ id: f.id, label: f.label })),
  chatbot_violations: chatbotViolations,
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Unclaimed CTA Rules Audit (DoD P3-supply-claim-cta-audit)\n')
  console.log(`  Source : CLAUDE.md NON-NEGOTIABLE rules`)
  console.log(`  Patterns : ${checks.length}`)
  console.log(`  OK       : ${checks.length - failures.length}`)
  console.log(`  Échecs   : ${failures.length}`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label}`)
  }
  if (chatbotViolations.length > 0) {
    console.log('\n  Chatbot imports détectés :')
    for (const v of chatbotViolations) {
      console.log(`    - ${v.file} → ${v.lib}`)
    }
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Toutes les règles supply-side respectées.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} règle(s) violée(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
