/**
 * Smoke test — dashboard artisan endpoints
 *
 * Ping rapide les 4 endpoints /api/artisan/{rge,reputation,funnel,trends,stats}
 * contre un serveur local ou prod avec un cookie de session artisan.
 *
 * Usage :
 *   BASE_URL=http://localhost:3000 \
 *   SESSION_COOKIE="sb-xxx=value; ..." \
 *   npx tsx scripts/smoke-artisan-dashboard.ts
 *
 * Exit code 0 = tous les 200, payload shape conforme.
 * Exit code 1 = au moins un endpoint en erreur ou payload invalide.
 *
 * Ce script NE remplace PAS les E2E Playwright — il fournit un feedback
 * <5s pour valider qu'un déploiement donné répond correctement avant de
 * lancer les suites lourdes.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const SESSION_COOKIE = process.env.SESSION_COOKIE || ''

type EndpointCheck = {
  name: string
  path: string
  requiredKeys: string[]
}

const CHECKS: EndpointCheck[] = [
  {
    name: 'rge',
    path: '/api/artisan/rge',
    requiredKeys: ['hasRge', 'status', 'rgeValidUntil', 'daysUntilExpiry', 'qualifications'],
  },
  {
    name: 'reputation',
    path: '/api/artisan/reputation',
    requiredKeys: ['reviews', 'invitations'],
  },
  {
    name: 'funnel',
    path: '/api/artisan/funnel?days=30',
    requiredKeys: ['days', 'counts', 'rates', 'responseMedianMinutes', 'previousPeriod'],
  },
  {
    name: 'trends',
    path: '/api/artisan/trends?days=30',
    requiredKeys: ['days', 'series', 'totals'],
  },
  {
    name: 'stats',
    path: '/api/artisan/stats',
    requiredKeys: ['stats', 'profile', 'provider', 'recentDemandes'],
  },
]

type Result = {
  name: string
  status: number
  durationMs: number
  ok: boolean
  missingKeys: string[]
  error?: string
}

async function check(ep: EndpointCheck): Promise<Result> {
  const started = Date.now()
  try {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      headers: SESSION_COOKIE ? { cookie: SESSION_COOKIE } : {},
      redirect: 'manual',
    })
    const durationMs = Date.now() - started

    if (!res.ok) {
      return {
        name: ep.name,
        status: res.status,
        durationMs,
        ok: false,
        missingKeys: [],
        error: `HTTP ${res.status}`,
      }
    }

    const body = (await res.json()) as Record<string, unknown>
    const missingKeys = ep.requiredKeys.filter((k) => !(k in body))

    return {
      name: ep.name,
      status: res.status,
      durationMs,
      ok: missingKeys.length === 0,
      missingKeys,
    }
  } catch (err) {
    return {
      name: ep.name,
      status: 0,
      durationMs: Date.now() - started,
      ok: false,
      missingKeys: [],
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main() {
  console.log(`Smoke test dashboard artisan → ${BASE_URL}`)
  if (!SESSION_COOKIE) {
    console.log('⚠️  SESSION_COOKIE non défini — les checks vont probablement retourner 401.')
  }

  const results = await Promise.all(CHECKS.map(check))

  let allOk = true
  for (const r of results) {
    const statusIcon = r.ok ? '✅' : '❌'
    const details = r.error
      ? ` — ${r.error}`
      : r.missingKeys.length > 0
        ? ` — missing keys: ${r.missingKeys.join(', ')}`
        : ''
    console.log(`${statusIcon} ${r.name.padEnd(12)} ${r.status} · ${r.durationMs}ms${details}`)
    if (!r.ok) allOk = false
  }

  if (!allOk) {
    console.error('\nAu moins un endpoint a échoué.')
    process.exit(1)
  }
  console.log('\nTous les endpoints répondent correctement.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Smoke test fatal:', err)
  process.exit(1)
})
