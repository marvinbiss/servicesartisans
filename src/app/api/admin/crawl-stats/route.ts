import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { getCrawlStats } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const authResult = await requirePermission('audit', 'read')
  if (!authResult.success || !authResult.admin) {
    return authResult.error
  }

  const result = await getCrawlStats()

  return NextResponse.json(result)
}
