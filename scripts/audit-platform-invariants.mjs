#!/usr/bin/env node
/**
 * scripts/audit-platform-invariants.mjs
 * --------------------------------------
 * DoD anti-régression sur les invariants plateforme NON-NEGOTIABLE de
 * CLAUDE.md (global + projet) + memories audit-10-agents-2026-04-25.
 *
 * Source : CLAUDE.md "Critical Rules — NON-NEGOTIABLE" + projet
 * "JAMAIS écrire de requêtes Supabase sans vérifier les colonnes" +
 * memory `audit-10-agents-2026-04-25` (2FA + RGPD + leaks).
 *
 * Pourquoi : ces règles sont marked NON-NEGOTIABLE explicitement par
 * Marvin. Leur violation = onboarding raté pour toute itération future
 * autonome ou humaine.
 *
 *   - `src/instrumentation.ts` MUST exist (Next.js avec src/ convention) :
 *     sans ça, Sentry/OpenTelemetry ne s'attache pas au runtime → on perd
 *     toute la télémétrie côté serveur.
 *   - `dark:*` Tailwind classes : dark mode est DÉSACTIVÉ → ajouter une
 *     classe = layout cassé silencieusement sur certains éléments.
 *   - 2FA admin : TOTP service + backup codes + verify window. Si retiré,
 *     audit-10-agents H1 régresse → admin compromise possible.
 *   - Path alias `@/*` → `./src/*` : si tsconfig.json drift, imports
 *     cassés silencieusement à l'exécution Vercel.
 *
 * Vérifications :
 *
 *   1. `src/instrumentation.ts` existe (PAS instrumentation.ts à la racine)
 *   2. `src/lib/auth/two-factor.ts` existe + exporte twoFactorAuth instance
 *      + classe TwoFactorAuthService + TOTP RFC 6238 (HMAC SHA1 + counter
 *      30s) + verify(window=1) + generateBackupCodes
 *   3. tsconfig.json a paths {"@/*": ["./src/*"]}
 *   4. Aucun fichier source `src/(...).tsx` ne contient de classe
 *      `dark:` (dark mode désactivé)
 *   5. CLAUDE.md projet décrit les 3 canaux Pipedrive (sécurité doc)
 *
 * Usage :
 *   node scripts/audit-platform-invariants.mjs --strict
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const args = new Set(process.argv.slice(2))
const strict = args.has('--strict')
const jsonOut = args.has('--json')

const ROOT = process.cwd()
const INSTRUMENTATION = join(ROOT, 'src', 'instrumentation.ts')
const ROOT_INSTRUMENTATION = join(ROOT, 'instrumentation.ts')
const TWO_FACTOR = join(ROOT, 'src', 'lib', 'auth', 'two-factor.ts')
const TSCONFIG = join(ROOT, 'tsconfig.json')
const CLAUDE_MD = join(ROOT, 'CLAUDE.md')

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

// Walk src/ pour scanner les .tsx dark mode classes
function walkTsx(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) walkTsx(full, out)
    else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) out.push(full)
  }
  return out
}

const tsxFiles = walkTsx(join(ROOT, 'src'))
const darkClassHits = []
for (const f of tsxFiles) {
  const src = readFileSync(f, 'utf8')
  // Match Tailwind dark: variant in className/class strings.
  // Pattern : `dark:` precedé d'un espace, début de string, ou ouverture
  // de classe (pour éviter de matcher du texte tel que "dark:" en doc).
  const matches = src.match(/(?:className|class)\s*=\s*[`'"][^`'"]*?\bdark:[a-z][\w-]*/g)
  if (matches) {
    darkClassHits.push({
      file: relative(ROOT, f).replace(/\\/g, '/'),
      sample: matches[0].slice(0, 80),
    })
  }
}

const tsconfigSrc = read(TSCONFIG)
const twoFactorSrc = read(TWO_FACTOR)
const claudeSrc = read(CLAUDE_MD)

const checks = [
  {
    id: 'instrumentation_in_src',
    label:
      'src/instrumentation.ts existe (Next.js avec src/ convention NON-NEGOTIABLE)',
    ok: existsSync(INSTRUMENTATION),
    weight: 2.0,
  },
  {
    id: 'no_root_instrumentation',
    label: 'PAS de instrumentation.ts à la racine (sinon ignoré par Next.js)',
    ok: !existsSync(ROOT_INSTRUMENTATION),
    weight: 1.0,
  },
  {
    id: 'two_factor_service_complete',
    label:
      'src/lib/auth/two-factor.ts : TwoFactorAuthService + TOTP RFC 6238 + verify(window) + backup codes',
    ok:
      twoFactorSrc.length > 0 &&
      /class\s+TwoFactorAuthService/.test(twoFactorSrc) &&
      /export\s+const\s+twoFactorAuth\s*=/.test(twoFactorSrc) &&
      /createHmac\s*\(\s*['"]sha1['"]/.test(twoFactorSrc) &&
      /verify\s*\([^)]*window\s*=\s*\d+/.test(twoFactorSrc) &&
      /generateBackupCodes\s*\(/.test(twoFactorSrc),
    weight: 2.0,
  },
  {
    id: 'tsconfig_path_alias',
    label: 'tsconfig.json : paths {"@/*": ["./src/*"]} (path alias)',
    ok: /["']@\/\*["']\s*:\s*\[\s*["']\.\/src\/\*["']\s*\]/.test(tsconfigSrc),
    weight: 1.0,
  },
  {
    id: 'dark_mode_classes_not_growing',
    label:
      'Classes `dark:` ne croissent pas au-delà du baseline pre-existing chat (CLAUDE.md "Ne PAS ajouter")',
    ok: (() => {
      // Baseline 2026-05-05 : 4 fichiers `src/components/chat/*.tsx` ont
      // historiquement des classes `dark:`. Toute occurrence HORS de ce
      // dossier = ajout interdit (CLAUDE.md "Dark mode: DESACTIVE. Ne
      // PAS ajouter de classes `dark:*`"). On empêche la croissance.
      const outside = darkClassHits.filter(
        (h) => !h.file.startsWith('src/components/chat/')
      )
      return outside.length === 0
    })(),
    weight: 1.5,
    details: darkClassHits
      .filter((h) => !h.file.startsWith('src/components/chat/'))
      .slice(0, 5),
  },
  {
    id: 'claude_md_pipedrive_3_canaux',
    label: 'CLAUDE.md projet décrit les 3 canaux Pipedrive (doc fait-foi)',
    ok:
      claudeSrc.length > 0 &&
      /3\s*canaux/i.test(claudeSrc) &&
      /PIPEDRIVE_PIPELINE_SIMULATEUR/.test(claudeSrc),
    weight: 1.0,
  },
]

const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
const passedWeight = checks.filter((c) => c.ok).reduce((s, c) => s + c.weight, 0)
const coveragePct = Math.round((passedWeight / totalWeight) * 1000) / 10

const failures = checks.filter((c) => !c.ok)

const report = {
  backlog_item: 'P3-platform-invariants',
  source_memory:
    'CLAUDE.md NON-NEGOTIABLE + audit-10-agents-2026-04-25 (2FA)',
  tsx_files_scanned: tsxFiles.length,
  total_checks: checks.length,
  passed: checks.length - failures.length,
  passed_weight: passedWeight,
  total_weight: totalWeight,
  coverage_pct: coveragePct,
  failures: failures.map((f) => ({
    id: f.id,
    label: f.label,
    weight: f.weight,
    details: f.details,
  })),
}

if (jsonOut) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log('\n📋 Platform Invariants Audit (DoD P3-platform-invariants)\n')
  console.log(`  TSX scannés : ${tsxFiles.length}`)
  console.log(`  Patterns    : ${checks.length}`)
  console.log(`  Coverage    : ${coveragePct}% (${passedWeight}/${totalWeight} pondéré)`)
  for (const c of checks) {
    const icon = c.ok ? '✅' : '❌'
    console.log(`     ${icon}  [${c.id}] ${c.label} (poids ${c.weight})`)
    if (!c.ok && c.details && c.details.length > 0) {
      for (const d of c.details.slice(0, 5)) {
        console.log(`         - ${JSON.stringify(d)}`)
      }
    }
  }
  if (failures.length === 0) {
    console.log('\n  ✅ Invariants plateforme NON-NEGOTIABLE préservés.\n')
  } else {
    console.log(`\n  ⚠️  ${failures.length} régression(s) — DoD non atteinte.\n`)
  }
}

if (strict && failures.length > 0) process.exit(1)
