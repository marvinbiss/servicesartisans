import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getProvidersByServiceAndLocation, getProviderCountByServiceAndLocation, getProviderCountByService } from '@/lib/supabase'

const schema = z.object({
  service: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  rge: z.enum(['0', '1']).optional(),
})

export const revalidate = 3600 // ISR - revalidate every hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = schema.safeParse({
    service: searchParams.get('service'),
    location: searchParams.get('location') || undefined,
    offset: searchParams.get('offset'),
    limit: searchParams.get('limit'),
    rge: searchParams.get('rge') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { message: 'Paramètres invalides' } }, { status: 400 })
  }

  const { service, location, offset, limit, rge } = parsed.data
  const rgeOnly = rge === '1'

  try {
    // If location provided: fetch providers for service+location
    // If no location: fetch providers for service only (hub page)
    const [providers, totalCount] = await Promise.all([
      location
        ? getProvidersByServiceAndLocation(service, location, { limit, offset, rgeOnly })
        : getProvidersByServiceAndLocation(service, 'france', { limit, offset, rgeOnly }).catch(() => []),
      location
        ? getProviderCountByServiceAndLocation(service, location, { rgeOnly }).catch(() => 0)
        : getProviderCountByService(service).catch(() => 0),
    ])

    return NextResponse.json({ providers: providers || [], totalCount }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
