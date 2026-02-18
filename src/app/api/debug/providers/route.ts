import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  try {
    const supabase = createAdminClient()
    results.adminClientOk = true

    // Test 1: Simple count with exact
    const t1 = Date.now()
    const { count, error: countErr } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    results.countQuery = {
      count,
      error: countErr?.message || null,
      code: countErr?.code || null,
      ms: Date.now() - t1,
    }

    // Test 2: Fetch 5 providers (no count)
    const t2 = Date.now()
    const { data: sample, error: sampleErr } = await supabase
      .from('providers')
      .select('id, name, specialty, address_city, is_active')
      .eq('is_active', true)
      .limit(5)
    results.sampleQuery = {
      rows: sample?.length ?? 0,
      data: sample,
      error: sampleErr?.message || null,
      code: sampleErr?.code || null,
      ms: Date.now() - t2,
    }

    // Test 3: The exact query from service pages (plombier + paris)
    const t3 = Date.now()
    const { data: plombierParis, error: ppErr } = await supabase
      .from('providers')
      .select('id, name, specialty, address_city')
      .in('specialty', ['plombier', 'plomberie', 'chauffagiste'])
      .ilike('address_city', '%Paris%')
      .eq('is_active', true)
      .limit(10)
    results.plombierParisQuery = {
      rows: plombierParis?.length ?? 0,
      data: plombierParis?.slice(0, 3),
      error: ppErr?.message || null,
      code: ppErr?.code || null,
      ms: Date.now() - t3,
    }

    // Test 4: Check env vars (masked)
    results.envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    }

  } catch (err) {
    results.fatalError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(results)
}
