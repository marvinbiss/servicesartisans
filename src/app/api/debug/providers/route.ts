import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test env vars
  results.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  }

  // ---- ANON CLIENT (same as supabase.ts singleton) ----
  try {
    const anonUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const anonClient = createClient(anonUrl, anonKey)

    // Test A1: Simple select with anon key
    const ta1 = Date.now()
    const { data: anonSample, error: anonErr } = await anonClient
      .from('providers')
      .select('id, name, specialty, address_city')
      .eq('is_active', true)
      .limit(3)
    results.anonSimple = {
      rows: anonSample?.length ?? 0,
      data: anonSample,
      error: anonErr?.message || null,
      code: anonErr?.code || null,
      hint: (anonErr as Record<string, unknown>)?.hint || null,
      ms: Date.now() - ta1,
    }

    // Test A2: Plombier + Paris with anon key
    const ta2 = Date.now()
    const { data: anonPP, error: anonPPErr } = await anonClient
      .from('providers')
      .select('id, name, specialty, address_city')
      .in('specialty', ['plombier', 'plomberie', 'chauffagiste'])
      .ilike('address_city', '%Paris%')
      .eq('is_active', true)
      .limit(5)
    results.anonPlombierParis = {
      rows: anonPP?.length ?? 0,
      data: anonPP?.slice(0, 2),
      error: anonPPErr?.message || null,
      code: anonPPErr?.code || null,
      ms: Date.now() - ta2,
    }

    // Test A3: The exact query from getProvidersByServiceAndLocation
    // First: getServiceBySlug equivalent
    const ta3 = Date.now()
    const { data: svcData, error: svcErr } = await anonClient
      .from('services')
      .select('id, name, slug, is_active')
      .eq('slug', 'plombier')
      .single()
    results.anonServiceLookup = {
      data: svcData,
      error: svcErr?.message || null,
      code: svcErr?.code || null,
      ms: Date.now() - ta3,
    }

    // Second: getLocationBySlug equivalent
    const ta4 = Date.now()
    const { data: locData, error: locErr } = await anonClient
      .from('locations')
      .select('id, name, slug')
      .eq('slug', 'paris')
      .single()
    results.anonLocationLookup = {
      data: locData,
      error: locErr?.message || null,
      code: locErr?.code || null,
      ms: Date.now() - ta4,
    }

  } catch (err) {
    results.anonFatalError = err instanceof Error ? err.message : String(err)
  }

  // ---- ADMIN CLIENT (for comparison) ----
  try {
    const admin = createAdminClient()

    const t1 = Date.now()
    const { data: adminSample, error: adminErr } = await admin
      .from('providers')
      .select('id, name, specialty, address_city')
      .eq('is_active', true)
      .limit(3)
    results.adminSimple = {
      rows: adminSample?.length ?? 0,
      error: adminErr?.message || null,
      ms: Date.now() - t1,
    }

  } catch (err) {
    results.adminFatalError = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(results)
}
