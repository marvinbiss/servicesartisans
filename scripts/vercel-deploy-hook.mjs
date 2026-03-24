#!/usr/bin/env node
/**
 * Vercel Deploy Hook → GitHub Actions trigger.
 *
 * Add this as a Vercel post-deploy webhook, OR use it as a
 * serverless function to bridge Vercel deploys to GitHub Actions.
 *
 * Setup (one-time):
 * 1. Create a GitHub PAT with "repo" scope (or fine-grained with "actions:write")
 * 2. Add to Vercel env: GITHUB_DISPATCH_TOKEN
 * 3. Add Vercel deploy hook URL pointing to /api/hooks/deploy-complete
 *
 * Alternative: run manually after deploy:
 *   GITHUB_DISPATCH_TOKEN=ghp_xxx node scripts/vercel-deploy-hook.mjs
 */

const GITHUB_TOKEN = process.env.GITHUB_DISPATCH_TOKEN || process.env.GITHUB_TOKEN
const REPO = 'marvinbiss/servicesartisans'

async function triggerWorkflow() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_DISPATCH_TOKEN not set')
    process.exit(1)
  }

  const res = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'vercel-deploy',
      client_payload: {
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL_ENV || 'production',
      },
    }),
  })

  if (res.status === 204) {
    console.log('✅ GitHub Actions cache warmup triggered')
  } else {
    const body = await res.text()
    console.error(`❌ Failed to trigger: HTTP ${res.status} — ${body}`)
    process.exit(1)
  }
}

triggerWorkflow()
