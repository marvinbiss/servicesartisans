import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProvidersByServiceAndLocation } from '@/lib/supabase'

const schema = z.object({
  service: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = schema.safeParse({
    service: searchParams.get('service'),
    location: searchParams.get('location'),
    offset: searchParams.get('offset'),
    limit: searchParams.get('limit'),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const { service, location, offset, limit } = parsed.data

  try {
    const providers = await getProvidersByServiceAndLocation(service, location, { limit, offset })
    return NextResponse.json({ providers: providers || [] })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
