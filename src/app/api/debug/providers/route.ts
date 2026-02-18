import { NextResponse } from 'next/server'
import { getProvidersByServiceAndLocation } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test the ACTUAL function used by the service page
  const t1 = Date.now()
  try {
    const providers = await getProvidersByServiceAndLocation('plombier', 'paris')
    results.getProvidersByServiceAndLocation = {
      count: providers.length,
      firstThree: providers.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        address_city: p.address_city,
      })),
      ms: Date.now() - t1,
    }
  } catch (err) {
    results.getProvidersByServiceAndLocation = {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : null,
      ms: Date.now() - t1,
    }
  }

  // Test IS_BUILD value at runtime
  results.runtime = {
    NEXT_PHASE: process.env.NEXT_PHASE || 'NOT_SET',
    IS_BUILD: process.env.NEXT_PHASE === 'phase-production-build',
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json(results)
}
