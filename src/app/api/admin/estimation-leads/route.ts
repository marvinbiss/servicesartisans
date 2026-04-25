/**
 * Admin API — Estimation Leads
 * Liste et gestion des leads capturés par le widget estimation IA
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { z } from 'zod'
import { paginationSchema } from '@/lib/validations/schemas'
import { getEstimationLeads, deleteEstimationLead } from '@/lib/services/admin-stats-service'

export const dynamic = 'force-dynamic'

const querySchema = paginationSchema.extend({
  source: z.enum(['all', 'chat', 'callback']).default('all'),
  search: z.string().optional(),
  metier: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const auth = await requirePermission('audit', 'read')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams))

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await getEstimationLeads(parsed.data)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('audit', 'write')

  if (!auth.success || !auth.admin) return auth.error

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await deleteEstimationLead(id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
