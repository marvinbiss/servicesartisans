#!/usr/bin/env node
/**
 * scripts/audit-reviews-flywheel.mjs
 * -----------------------------------
 * DoD anti-régression sur le flywheel reviews (devis → invitation HMAC →
 * page publique → review).
 *
 * Source : memory `servicesartisans-reviews-flywheel-2026-04-18` —
 * Migration 454 + helper invitation-token HMAC + cron send-review-invitations
 * + page publique /invitation-avis/[token]. Pivot CEO Pillar #2 (compound
 * SEO + supply trust signal). 0 reviews actuellement → 31 invits avec
 * scheduled_at=J+7, premier envoi 2026-04-27.
 *
 * Pourquoi : si un dev casse une étape du flywheel, on perd le compounding :
 *
 *   - HMAC token retiré → tokens prédictibles via /invitation-avis/<id>
 *     → spam reviews falsifiés ou exposition email user.
 *   - Migration 454 droppée → pas de table review_invitations → cron
 *     plante silencieusement → 0 invitation envoyée.
 *   - Cron send-review-invitations renommé/désactivé → flywheel mort,
 *     supply trust signal=0, conversion -25 à -40%.
 *   - Page /invitation-avis/[token] supprimée → invits arrivent dans des
 *     mailbox mais lien 404 → bounce email pénalité reputation.
 *   - Submit endpoint sans verify token → injection reviews côté tiers.
 *
 * Vérifications :
 *
 *   1. Migration 454 contient `CREATE TABLE public.review_invitations` +
 *      colonnes critiques (token_hash, scheduled_at, sent_at, expires_at,
 *      devis_request_id).
 *   2. Helper `src/lib/reviews/invitation-token.ts` :
 *      - export `createInvitationToken()` (return plaintext + hash)
 *      - utilise crypto + HMAC SHA-256 (jamais bcrypt/MD5/SHA-1)
 *      - export `verifyInvitationToken(plaintext, hash)`
 *   3. Helper `src/lib/reviews/invitations.ts` exporte
 *      `createInvitationForDevis()`.
 *   4. Cron `src/app/api/cron/send-review-invitations/route.ts` existe.
 *   5. Page `src/app/(public)/invitation-avis/[token]/page.tsx` existe
 *      (renommée depuis donner-avis pour éviter conflit slug Next.js).
 *   6. Submit endpoint `src/app/api/reviews/submit-invitation/[token]/route.ts`
 *      vérifie le token avant insert review.
 *
 * Usage :
 *   node scripts/audit-reviews-flywheel.mjs --strict
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const MIG_DIR = join(ROOT, 'supabase', 'migrations')

const TOKEN_LIB = join(ROOT, 'src', 'lib', 'reviews', 'invitation-token.ts')
const INVIT_LIB = join(ROOT, 'src', 'lib', 'reviews', 'invitations.ts')
const CRON_ROUTE = join(
  ROOT,
  'src',
  'app',
  'api',
  'cron',
  'send-review-invitations',
  'route.ts'
)
const PUBLIC_PAGE = join(
  ROOT,
  'src',
  'app',
  '(public)',
  'invitation-avis',
  '[token]',
  'page.tsx'
)
const SUBMIT_ROUTE = join(
  ROOT,
  'src',
  'app',
  'api',
  'reviews',
  'submit-invitation',
  '[token]',
  'route.ts'
)

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

const migFiles = existsSync(MIG_DIR)
  ? readdirSync(MIG_DIR).filter((f) => /^\d+_.*\.sql$/.test(f))
  : []
const mig454File = migFiles.find((f) => /^454_/.test(f))
const mig454Src = mig454File ? readFileSync(join(MIG_DIR, mig454File), 'utf8') : ''

const tokenSrc = read(TOKEN_LIB)
const invitSrc = read(INVIT_LIB)
const cronSrc = read(CRON_ROUTE)
const submitSrc = read(SUBMIT_ROUTE)

const checks = [
  {
    id: 'mig_454_present',
    label: 'Migration 454 review_invitations présente',
    ok:
      mig454Src.length > 0 &&
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.review_invitations/i.test(
        mig454Src
      ),
    weight: 2.0,
  },
  {
    id: 'mig_454_critical_columns',
    label:
      'Mig 454 contient token_hash + scheduled_at + sent_at + expires_at + devis_request_id',
    ok:
      /token_hash/i.test(mig454Src) &&
      /scheduled_at/i.test(mig454Src) &&
      /sent_at/i.test(mig454Src) &&
      /expires_at/i.test(mig454Src) &&
      /devis_request_id/i.test(mig454Src),
    weight: 1.5,
  },
  {
    id: 'token_helper_sha256_random',
    label:
      'invitation-token.ts utilise SHA-256 + randomBytes ≥32 (pas MD5/SHA-1, pas Math.random)',
    ok: (() => {
      if (tokenSrc.length === 0) return false
      if (!/createHash\s*\(\s*['"]sha256['"]/i.test(tokenSrc)) return false
      if (/createHash\s*\(\s*['"](md5|sha1)['"]/i.test(tokenSrc)) return false
      if (/Math\.random/i.test(tokenSrc)) return false
      // randomBytes(N) littéral ≥32 OU randomBytes(VAR) avec VAR=K, K≥32
      const lit = tokenSrc.match(/randomBytes\s*\(\s*(\d+)/i)
      if (lit && Number(lit[1]) >= 32) return true
      const ref = tokenSrc.match(/randomBytes\s*\(\s*([A-Z_][A-Z_0-9]*)\s*\)/i)
      if (ref) {
        const varName = ref[1]
        const varDef = tokenSrc.match(
          new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*(\\d+)`, 'i')
        )
        if (varDef && Number(varDef[1]) >= 32) return true
      }
      return false
    })(),
    weight: 2.0,
  },
  {
    id: 'token_helper_exports',
    label:
      'invitation-token.ts exporte createInvitationToken + hashInvitationToken (verify = hash + ===)',
    ok:
      /export\s+(?:function|const)\s+createInvitationToken/.test(tokenSrc) &&
      /export\s+(?:function|const)\s+hashInvitationToken/.test(tokenSrc),
    weight: 1.5,
  },
  {
    id: 'invitations_lib_creates',
    label:
      'invitations.ts exporte createInvitationForDevis (utilise createInvitationToken)',
    ok:
      invitSrc.length > 0 &&
      /export\s+async\s+function\s+createInvitationForDevis/.test(invitSrc) &&
      /createInvitationToken\s*\(/.test(invitSrc),
    weight: 1.5,
  },
  {
    id: 'cron_send_invitations_exists',
    label:
      'cron send-review-invitations existe + insert dans review_invitations OU update sent_at',
    ok:
      cronSrc.length > 0 &&
      (/review_invitations/.test(cronSrc) || /sent_at/.test(cronSrc)),
    weight: 1.5,
  },
  {
    id: 'public_invitation_page_exists',
    label:
      'page /invitation-avis/[token] existe (renommée depuis donner-avis)',
    ok: existsSync(PUBLIC_PAGE),
    weight: 1.5,
  },
  {
    id: 'submit_endpoint_verifies_token',
    label:
      'submit-invitation/[token]/route.ts vérifie le token (hashInvitationToken + lookup token_hash)',
    ok:
      submitSrc.length > 0 &&
      /hashInvitationToken\s*\(/.test(submitSrc) &&
      /token_hash/.test(submitSrc),
    weight: 2.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-reviews-flywheel',
  source_memory: 'servicesartisans-reviews-flywheel-2026-04-18',
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
  console.log('\n📋 Reviews Flywheel Audit (DoD P3-reviews-flywheel)\n')
  console.log(`  Patterns  : ${checks.length}`)
  console.log(`  Coverage  : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Flywheel reviews préservé.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
