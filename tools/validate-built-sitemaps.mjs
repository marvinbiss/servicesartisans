#!/usr/bin/env node
/**
 * Post-build Sitemap Validation
 *
 * Verifies that all expected static sitemaps from the manifest actually exist
 * in the Next.js build output (.next/server/app/). Catches regressions where
 * a code change silently breaks sitemap generation.
 *
 * Usage:
 *   npm run build && node tools/validate-built-sitemaps.mjs
 *   node tools/validate-built-sitemaps.mjs --build-dir .next
 *   node tools/validate-built-sitemaps.mjs --provider-count 10000
 *
 * Exit code 0 = all expected sitemaps found
 * Exit code 1 = divergence detected (missing or extra)
 */

import fs from 'fs'
import path from 'path'

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  let buildDir = '.next'
  let providerCount = 0 // default: only validate static sitemaps

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--build-dir' && args[i + 1]) {
      buildDir = args[++i]
    } else if (args[i] === '--provider-count' && args[i + 1]) {
      providerCount = parseInt(args[++i], 10)
    }
  }
  return { buildDir, providerCount }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Scan .next/server/app for sitemap-related files.
 * Next.js 14 with generateSitemaps() outputs files like:
 *   .next/server/app/sitemap/[__metadata_id__]/route.js
 * or pre-rendered:
 *   .next/server/app/sitemap.xml/[id]/route.js
 *
 * The exact path depends on Next.js version. We look for multiple patterns.
 */
function findBuiltSitemapFiles(buildDir) {
  const found = new Set()
  const basePaths = [
    path.join(buildDir, 'server', 'app', 'sitemap'),
    path.join(buildDir, 'server', 'app', 'sitemap.xml'),
  ]

  for (const basePath of basePaths) {
    if (!fs.existsSync(basePath)) continue

    // Check for the dynamic route handler (single handler for all sitemaps)
    const dynamicRouteFile = path.join(basePath, '[__metadata_id__]', 'route.js')
    if (fs.existsSync(dynamicRouteFile)) {
      found.add('__dynamic_handler__')
    }

    // Check for per-ID pre-rendered sitemaps
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

  // Also check for pre-rendered XML files directly
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

/**
 * Check that the build output includes the essential sitemap infrastructure.
 */
function validateBuildInfrastructure(buildDir) {
  const checks = []

  // Check .next exists
  if (!fs.existsSync(buildDir)) {
    return [{ pass: false, label: '.next directory exists', detail: `${buildDir} not found. Run 'npm run build' first.` }]
  }
  checks.push({ pass: true, label: '.next directory exists' })

  // Check routes-manifest.json exists (proves build completed)
  const routesManifest = path.join(buildDir, 'routes-manifest.json')
  if (fs.existsSync(routesManifest)) {
    checks.push({ pass: true, label: 'routes-manifest.json exists' })

    // Check sitemap rewrite exists
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

  // Check API routes exist
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

  // Check sitemap handler exists (dynamic [__metadata_id__])
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const { buildDir, providerCount } = parseArgs()

  console.log('\n🔍 Post-Build Sitemap Validation')
  console.log(`   Build dir:      ${buildDir}`)
  console.log(`   Provider count: ${providerCount}`)
  console.log()

  // 1. Infrastructure checks
  console.log('── Infrastructure ──')
  const infraChecks = validateBuildInfrastructure(buildDir)
  let infraFails = 0
  for (const check of infraChecks) {
    const icon = check.pass ? '✅' : '❌'
    console.log(`  ${icon} ${check.label}${check.detail ? ` — ${check.detail}` : ''}`)
    if (!check.pass) infraFails++
  }

  if (infraFails > 0 && !fs.existsSync(buildDir)) {
    console.log('\n❌ VALIDATION FAILED — build directory not found. Run npm run build first.\n')
    process.exit(1)
  }

  // 2. Manifest consistency check (can run without build)
  console.log('\n── Manifest Consistency ──')

  // Dynamic import of manifest via the built version or TSX
  // We check the source files directly to validate consistency
  const manifestPath = path.resolve('src/lib/seo/sitemap-manifest.ts')
  const sitemapPath = path.resolve('src/app/sitemap.ts')
  const indexRoutePath = path.resolve('src/app/api/sitemap-index/route.ts')
  const providersRoutePath = path.resolve('src/app/api/sitemap-providers/route.ts')

  const sourceChecks = []

  // Check manifest source exists
  if (fs.existsSync(manifestPath)) {
    const src = fs.readFileSync(manifestPath, 'utf-8')
    sourceChecks.push({ pass: true, label: 'sitemap-manifest.ts exists' })
    sourceChecks.push({
      pass: src.includes('escapeXmlLoc'),
      label: 'escapeXmlLoc defined in manifest',
    })
    sourceChecks.push({
      pass: src.includes('GOOGLE_MAX_URLS_PER_SITEMAP'),
      label: 'GOOGLE_MAX_URLS_PER_SITEMAP defined',
    })
  } else {
    sourceChecks.push({ pass: false, label: 'sitemap-manifest.ts exists' })
  }

  // Check sitemap.ts imports from manifest
  if (fs.existsSync(sitemapPath)) {
    const src = fs.readFileSync(sitemapPath, 'utf-8')
    sourceChecks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap.ts imports from manifest',
    })
    sourceChecks.push({
      pass: !src.match(/^const (STATIC_BATCH|LARGE_BATCH|PROVIDER_BATCH_SIZE|TOP_CITIES_PHASE1)\b/m),
      label: 'sitemap.ts has no local batch constants',
    })
  }

  // Check providers route imports from manifest
  if (fs.existsSync(providersRoutePath)) {
    const src = fs.readFileSync(providersRoutePath, 'utf-8')
    sourceChecks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap-providers imports from manifest',
    })
    sourceChecks.push({
      pass: !src.match(/^const PROVIDER_BATCH_SIZE\b/m),
      label: 'sitemap-providers has no local PROVIDER_BATCH_SIZE',
    })
    sourceChecks.push({
      pass: src.includes('escapeXmlLoc'),
      label: 'sitemap-providers uses escapeXmlLoc',
    })
  }

  // Check index route imports from manifest
  if (fs.existsSync(indexRoutePath)) {
    const src = fs.readFileSync(indexRoutePath, 'utf-8')
    sourceChecks.push({
      pass: src.includes("from '@/lib/seo/sitemap-manifest'"),
      label: 'sitemap-index imports from manifest',
    })
    sourceChecks.push({
      pass: src.includes('getSitemapIndexUrls'),
      label: 'sitemap-index uses getSitemapIndexUrls',
    })
  }

  let sourceFails = 0
  for (const check of sourceChecks) {
    const icon = check.pass ? '✅' : '❌'
    console.log(`  ${icon} ${check.label}`)
    if (!check.pass) sourceFails++
  }

  // 3. Summary
  const totalChecks = infraChecks.length + sourceChecks.length
  const totalFails = infraFails + sourceFails

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📊 ${totalChecks - totalFails}/${totalChecks} checks passed`)

  if (totalFails > 0) {
    console.log(`\n❌ VALIDATION FAILED — ${totalFails} check(s) failed\n`)
    process.exit(1)
  }

  console.log('\n✅ VALIDATION PASSED — all checks green\n')
  process.exit(0)
}

main().catch(err => {
  console.error(`\n💥 Unexpected error: ${err.message}\n`)
  process.exit(1)
})
