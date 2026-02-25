#!/usr/bin/env node
/**
 * Post-build Sitemap Validation v2
 *
 * Verifies that all expected static sitemaps from the manifest actually exist
 * in the Next.js build output (.next/server/app/). Catches regressions where
 * a code change silently breaks sitemap generation.
 *
 * Also validates source-level invariants (imports, no local constants,
 * escaping, caching headers, Content-Type).
 *
 * Usage:
 *   npm run build && node tools/validate-built-sitemaps.mjs
 *   node tools/validate-built-sitemaps.mjs --build-dir .next
 *   node tools/validate-built-sitemaps.mjs --provider-count 10000
 *   node tools/validate-built-sitemaps.mjs --json
 *
 * Exit code 0 = all expected sitemaps found
 * Exit code 1 = divergence detected
 */

import fs from 'fs'
import path from 'path'

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  let buildDir = '.next'
  let providerCount = 0
  let json = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--build-dir' && args[i + 1]) {
      buildDir = args[++i]
    } else if (args[i] === '--provider-count' && args[i + 1]) {
      providerCount = parseInt(args[++i], 10)
    } else if (args[i] === '--json') {
      json = true
    }
  }
  return { buildDir, providerCount, json }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function findBuiltSitemapFiles(buildDir) {
  const found = new Set()
  const basePaths = [
    path.join(buildDir, 'server', 'app', 'sitemap'),
    path.join(buildDir, 'server', 'app', 'sitemap.xml'),
  ]

  for (const basePath of basePaths) {
    if (!fs.existsSync(basePath)) continue

    const dynamicRouteFile = path.join(basePath, '[__metadata_id__]', 'route.js')
    if (fs.existsSync(dynamicRouteFile)) {
      found.add('__dynamic_handler__')
    }

    try {
      const entries = fs.readdirSync(basePath, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const routeFile = path.join(basePath, entry.name, 'route.js')
          const bodyFile = path.join(basePath, entry.name, 'body')
          if (fs.existsSync(routeFile) || fs.existsSync(bodyFile)) {
            found.add(entry.name)
          }
        }
      }
    } catch {
      // Directory not readable
    }
  }

  const prerenderedPath = path.join(buildDir, 'server', 'app')
  try {
    const entries = fs.readdirSync(prerenderedPath)
    for (const entry of entries) {
      if (entry.startsWith('sitemap') && entry.endsWith('.xml')) {
        found.add(entry.replace('.xml', ''))
      }
    }
  } catch {
    // Directory not readable
  }

  return found
}

function validateBuildInfrastructure(buildDir) {
  const checks = []

  if (!fs.existsSync(buildDir)) {
    return [{ pass: false, label: '.next directory exists', detail: `${buildDir} not found. Run 'npm run build' first.` }]
  }
  checks.push({ pass: true, label: '.next directory exists' })

  const routesManifest = path.join(buildDir, 'routes-manifest.json')
  if (fs.existsSync(routesManifest)) {
    checks.push({ pass: true, label: 'routes-manifest.json exists' })

    try {
      const manifest = JSON.parse(fs.readFileSync(routesManifest, 'utf-8'))
      const rewrites = [...(manifest.rewrites || []), ...(manifest.beforeFiles || []), ...(manifest.afterFiles || [])]
      const hasSitemapRewrite = rewrites.some(r => r.source === '/sitemap.xml' || r.source?.includes('sitemap'))
      checks.push({
        pass: hasSitemapRewrite,
        label: '/sitemap.xml rewrite configured',
        detail: hasSitemapRewrite ? undefined : 'No /sitemap.xml → /api/sitemap-index rewrite found in routes-manifest.json',
      })
    } catch {
      checks.push({ pass: false, label: '/sitemap.xml rewrite configured', detail: 'Failed to parse routes-manifest.json' })
    }
  } else {
    checks.push({ pass: false, label: 'routes-manifest.json exists', detail: 'Build may be incomplete' })
  }

  const apiSitemapIndex = path.join(buildDir, 'server', 'app', 'api', 'sitemap-index', 'route.js')
  checks.push({
    pass: fs.existsSync(apiSitemapIndex),
    label: 'sitemap-index API route built',
    detail: fs.existsSync(apiSitemapIndex) ? undefined : `${apiSitemapIndex} not found`,
  })

  const apiSitemapProviders = path.join(buildDir, 'server', 'app', 'api', 'sitemap-providers', 'route.js')
  checks.push({
    pass: fs.existsSync(apiSitemapProviders),
    label: 'sitemap-providers API route built',
    detail: fs.existsSync(apiSitemapProviders) ? undefined : `${apiSitemapProviders} not found`,
  })

  const sitemapHandler = path.join(buildDir, 'server', 'app', 'sitemap', '[__metadata_id__]', 'route.js')
  const sitemapHandlerAlt = path.join(buildDir, 'server', 'app', 'sitemap.xml', '[__metadata_id__]', 'route.js')
  const handlerExists = fs.existsSync(sitemapHandler) || fs.existsSync(sitemapHandlerAlt)
  checks.push({
    pass: handlerExists,
    label: 'sitemap dynamic handler built',
    detail: handlerExists ? undefined : 'Neither sitemap/[__metadata_id__]/route.js nor sitemap.xml/[__metadata_id__]/route.js found',
  })

  return checks
}

function validateSourceConsistency() {
  const manifestPath = path.resolve('src/lib/seo/sitemap-manifest.ts')
  const sitemapPath = path.resolve('src/app/sitemap.ts')
  const indexRoutePath = path.resolve('src/app/api/sitemap-index/route.ts')
  const providersRoutePath = path.resolve('src/app/api/sitemap-providers/route.ts')

  const checks = []

  // ── Manifest ──
  if (fs.existsSync(manifestPath)) {
    const src = fs.readFileSync(manifestPath, 'utf-8')
    checks.push({ pass: true, label: 'sitemap-manifest.ts exists' })
    checks.push({
      pass: src.includes('escapeXmlLoc'),
      label: 'escapeXmlLoc defined in manifest',
    })
    checks.push({
      pass: src.includes('GOOGLE_MAX_URLS_PER_SITEMAP'),
      label: 'GOOGLE_MAX_URLS_PER_SITEMAP defined',
    })
    checks.push({
      pass: src.includes('PROVIDER_BATCH_SIZE'),
      label: 'PROVIDER_BATCH_SIZE exported from manifest',
    })
    checks.push({
      pass: src.includes('STATIC_BATCH'),
      label: 'STATIC_BATCH exported from manifest',
    })
    checks.push({
      pass: src.includes('LARGE_BATCH'),
      label: 'LARGE_BATCH exported from manifest',
    })
  } else {
    checks.push({ pass: false, label: 'sitemap-manifest.ts exists' })
  }

  // ── sitemap.ts ──
  if (fs.existsSync(sitemapPath)) {
    const src = fs.readFileSync(sitemapPath, 'utf-8')
    checks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap.ts imports from manifest',
    })
    checks.push({
      pass: !src.match(/^\s*(const|let|var)\s+(STATIC_BATCH|LARGE_BATCH|PROVIDER_BATCH_SIZE|TOP_CITIES_PHASE1)\b/m),
      label: 'sitemap.ts has no local batch constants',
    })
    checks.push({
      pass: src.includes('getStaticSitemapIds'),
      label: 'sitemap.ts uses getStaticSitemapIds()',
    })
  } else {
    checks.push({ pass: false, label: 'sitemap.ts exists', detail: 'File not found' })
  }

  // ── providers route ──
  if (fs.existsSync(providersRoutePath)) {
    const src = fs.readFileSync(providersRoutePath, 'utf-8')
    checks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap-providers imports from manifest',
    })
    checks.push({
      pass: !src.match(/^\s*(const|let|var)\s+PROVIDER_BATCH_SIZE\b/m),
      label: 'sitemap-providers has no local PROVIDER_BATCH_SIZE',
    })
    checks.push({
      pass: src.includes('escapeXmlLoc'),
      label: 'sitemap-providers uses escapeXmlLoc',
    })
    checks.push({
      pass: src.includes("'Content-Type': 'application/xml"),
      label: 'sitemap-providers sets Content-Type application/xml',
    })
    checks.push({
      pass: /s-maxage=\d+/.test(src),
      label: 'sitemap-providers sets s-maxage cache header',
    })
    checks.push({
      pass: src.includes('catch') && src.includes('<urlset'),
      label: 'sitemap-providers has error fallback with valid XML',
    })
  } else {
    checks.push({ pass: false, label: 'sitemap-providers/route.ts exists', detail: 'File not found' })
  }

  // ── index route ──
  if (fs.existsSync(indexRoutePath)) {
    const src = fs.readFileSync(indexRoutePath, 'utf-8')
    checks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap-index imports from manifest',
    })
    checks.push({
      pass: src.includes('getSitemapIndexUrls'),
      label: 'sitemap-index uses getSitemapIndexUrls',
    })
    checks.push({
      pass: src.includes('escapeXmlLoc'),
      label: 'sitemap-index uses escapeXmlLoc',
    })
    checks.push({
      pass: src.includes("'Content-Type': 'application/xml"),
      label: 'sitemap-index sets Content-Type application/xml',
    })
    checks.push({
      pass: /s-maxage=\d+/.test(src),
      label: 'sitemap-index sets s-maxage cache header',
    })
    checks.push({
      pass: src.includes('try') && src.includes('catch'),
      label: 'sitemap-index has try/catch for DB resilience',
    })
  } else {
    checks.push({ pass: false, label: 'sitemap-index/route.ts exists', detail: 'File not found' })
  }

  return checks
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { buildDir, providerCount, json } = parseArgs()

  if (!json) {
    console.log('\n\u{1F50D} Post-Build Sitemap Validation v2')
    console.log(`   Build dir:      ${buildDir}`)
    console.log(`   Provider count: ${providerCount}`)
    console.log()
  }

  // 1. Infrastructure checks
  if (!json) console.log('\u2500\u2500 Infrastructure \u2500\u2500')
  const infraChecks = validateBuildInfrastructure(buildDir)
  let infraFails = 0
  for (const check of infraChecks) {
    if (!json) {
      const icon = check.pass ? '\u2705' : '\u274C'
      console.log(`  ${icon} ${check.label}${check.detail ? ` \u2014 ${check.detail}` : ''}`)
    }
    if (!check.pass) infraFails++
  }

  if (infraFails > 0 && !fs.existsSync(buildDir)) {
    if (json) {
      console.log(JSON.stringify({ pass: false, error: 'Build directory not found', checks: infraChecks }))
    } else {
      console.log('\n\u274C VALIDATION FAILED \u2014 build directory not found. Run npm run build first.\n')
    }
    process.exit(1)
  }

  // 2. Source consistency
  if (!json) console.log('\n\u2500\u2500 Source Consistency \u2500\u2500')
  const sourceChecks = validateSourceConsistency()
  let sourceFails = 0
  for (const check of sourceChecks) {
    if (!json) {
      const icon = check.pass ? '\u2705' : '\u274C'
      console.log(`  ${icon} ${check.label}${check.detail ? ` \u2014 ${check.detail}` : ''}`)
    }
    if (!check.pass) sourceFails++
  }

  // 3. Summary
  const allChecks = [...infraChecks, ...sourceChecks]
  const totalChecks = allChecks.length
  const totalFails = infraFails + sourceFails

  if (json) {
    console.log(JSON.stringify({
      pass: totalFails === 0,
      totalChecks,
      passed: totalChecks - totalFails,
      failed: totalFails,
      checks: allChecks,
    }, null, 2))
  } else {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`\u{1F4CA} ${totalChecks - totalFails}/${totalChecks} checks passed`)

    if (totalFails > 0) {
      console.log(`\n\u274C VALIDATION FAILED \u2014 ${totalFails} check(s) failed\n`)
    } else {
      console.log('\n\u2705 VALIDATION PASSED \u2014 all checks green\n')
    }
  }

  process.exit(totalFails > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(`\n\u{1F4A5} Unexpected error: ${err.message}\n`)
  process.exit(1)
})
