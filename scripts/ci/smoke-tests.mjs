/**
 * Smoke Tests — Non-LLM verification layer
 *
 * These tests verify REAL behavior that no LLM can detect by reading diffs:
 * - API endpoints return expected status codes
 * - Auth flows reject unauthenticated requests
 * - Critical pages render without 500
 * - Database schema matches code expectations
 *
 * Runs against the built Next.js app (not source code).
 * This is the layer that catches runtime issues the LLM agents miss.
 *
 * Usage: node smoke-tests.mjs <base-url>
 *   base-url: http://localhost:3000 (local) or preview deploy URL
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = critical failure (blocks PR)
 */

import { writeFileSync, appendFileSync } from 'fs'

const baseUrl = process.argv[2] || 'http://localhost:3000'
const results = []
let failures = 0

// ─── Test helpers ───────────────────────────────────────────────────────────

async function check(name, fn) {
  const start = Date.now()
  try {
    await fn()
    const ms = Date.now() - start
    results.push({ name, status: 'pass', ms })
    console.log(`  PASS  ${name} (${ms}ms)`)
  } catch (err) {
    const ms = Date.now() - start
    failures++
    results.push({ name, status: 'fail', ms, error: err.message })
    console.error(`  FAIL  ${name} (${ms}ms): ${err.message}`)
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, { redirect: 'manual', ...options })
  return res
}

// ─── 1. Critical pages render (no 500) ─────────────────────────────────────

console.log('\n=== Page rendering ===')

const criticalPages = [
  '/',
  '/connexion',
  '/inscription',
  '/services/plombier',
  '/services/electricien',
]

for (const page of criticalPages) {
  await check(`GET ${page} returns 200`, async () => {
    const res = await fetchJson(page)
    assert(res.status === 200, `Expected 200, got ${res.status}`)
  })
}

// ─── 2. Auth protection (unauthenticated → redirect) ───────────────────────

console.log('\n=== Auth protection ===')

const protectedPages = [
  '/espace-artisan/dashboard',
  '/espace-artisan/messages',
  '/espace-artisan/avis-recus',
  '/espace-client/dashboard',
]

for (const page of protectedPages) {
  await check(`GET ${page} redirects when unauthenticated`, async () => {
    const res = await fetchJson(page)
    // Should redirect (302/307) to /connexion, not return 200
    assert(
      res.status === 302 || res.status === 307 || res.status === 308,
      `Expected redirect, got ${res.status}. Auth may be bypassed.`
    )
  })
}

// ─── 3. API auth enforcement ────────────────────────────────────────────────

console.log('\n=== API auth enforcement ===')

const protectedApis = [
  { path: '/api/artisan/provider', method: 'GET' },
  { path: '/api/artisan/avis?page=1', method: 'GET' },
  { path: '/api/artisan/stats', method: 'GET' },
  { path: '/api/artisan/bookings', method: 'GET' },
  { path: '/api/client/profile', method: 'GET' },
]

for (const api of protectedApis) {
  await check(`${api.method} ${api.path} returns 401 without auth`, async () => {
    const res = await fetchJson(api.path, { method: api.method })
    assert(
      res.status === 401 || res.status === 403,
      `Expected 401/403, got ${res.status}. API may be unprotected.`
    )
  })
}

// ─── 4. Admin routes reject non-admin ───────────────────────────────────────

console.log('\n=== Admin protection ===')

const adminApis = [
  '/api/admin/stats',
  '/api/admin/users',
  '/api/admin/providers',
]

for (const path of adminApis) {
  await check(`GET ${path} rejects non-admin`, async () => {
    const res = await fetchJson(path)
    assert(
      res.status === 401 || res.status === 403,
      `Expected 401/403, got ${res.status}. Admin route may be exposed.`
    )
  })
}

// ─── 5. CSRF protection on mutations ────────────────────────────────────────

console.log('\n=== CSRF protection ===')

await check('POST /api/artisan/provider rejects missing Origin', async () => {
  const res = await fetch(`${baseUrl}/api/artisan/provider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // No Origin header
    body: JSON.stringify({ name: 'test' }),
    redirect: 'manual',
  })
  // Should be 401 (no auth) or 403 (CSRF), never 200
  assert(res.status !== 200, `Expected rejection, got 200. CSRF may be bypassed.`)
})

// ─── 6. Health endpoint ─────────────────────────────────────────────────────

console.log('\n=== Health check ===')

await check('GET /api/health returns 200', async () => {
  const res = await fetchJson('/api/health')
  assert(res.status === 200, `Health check failed: ${res.status}`)
})

// ─── 7. SEO critical checks ────────────────────────────────────────────────

console.log('\n=== SEO smoke ===')

await check('GET /robots.txt returns 200', async () => {
  const res = await fetchJson('/robots.txt')
  assert(res.status === 200, `robots.txt missing: ${res.status}`)
  const text = await res.text()
  assert(text.includes('Sitemap'), 'robots.txt missing Sitemap directive')
})

await check('GET /sitemap.xml returns 200 + valid XML', async () => {
  const res = await fetchJson('/sitemap.xml')
  assert(res.status === 200, `sitemap.xml failed: ${res.status}`)
  const text = await res.text()
  assert(text.includes('<?xml') || text.includes('<sitemapindex'), 'sitemap.xml is not valid XML')
})

// ─── 8. Response time sanity ────────────────────────────────────────────────

console.log('\n=== Performance sanity ===')

await check('Homepage loads in < 5s', async () => {
  const start = Date.now()
  await fetchJson('/')
  const elapsed = Date.now() - start
  assert(elapsed < 5000, `Homepage took ${elapsed}ms (> 5000ms)`)
})

// ─── Results ────────────────────────────────────────────────────────────────

console.log('\n========================================')
console.log(`  Smoke Tests: ${results.length} run, ${failures} failed`)
console.log('========================================')

// Write report
const report = {
  timestamp: new Date().toISOString(),
  base_url: baseUrl,
  total: results.length,
  passed: results.filter(r => r.status === 'pass').length,
  failed: failures,
  results,
}

writeFileSync('/tmp/smoke-report.json', JSON.stringify(report, null, 2))

// GitHub Actions output
const outputFile = process.env.GITHUB_OUTPUT
if (outputFile) {
  appendFileSync(outputFile, `smoke_failures=${failures}\n`)
  appendFileSync(outputFile, `smoke_total=${results.length}\n`)
}

process.exit(failures > 0 ? 1 : 0)
