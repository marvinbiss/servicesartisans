import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {}

  // Check Supabase connection
  try {
    const supabase = await createClient()
    const dbStart = Date.now()
    const { error } = await supabase.from('providers').select('id').limit(1)
    const dbLatency = Date.now() - dbStart

    if (error) {
      checks.database = { status: 'error', error: error.message }
    } else {
      checks.database = { status: 'ok', latency: dbLatency }
    }
  } catch (err) {
    checks.database = {
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown database error'
    }
  }

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v])
  if (missingEnvVars.length > 0) {
    checks.environment = {
      status: 'error',
      error: `Missing: ${missingEnvVars.join(', ')}`
    }
  } else {
    checks.environment = { status: 'ok' }
  }

  const totalLatency = Date.now() - startTime
  const allHealthy = Object.values(checks).every(c => c.status === 'ok')

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    latency: totalLatency,
    checks,
  }, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
