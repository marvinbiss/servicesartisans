import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'

export const dynamic = 'force-dynamic'

type GdprQueueRow = {
  id: string
  source: 'access' | 'deletion' | 'export'
  request_type: 'access' | 'rectification' | 'deletion' | 'export'
  status: string
  requester_email: string | null
  requester_name: string | null
  user_id: string | null
  created_at: string
  scheduled_at: string | null
  days_pending: number
  legal_breach: boolean
}

// GET — Liste des demandes RGPD agrégées sur les 3 tables actives.
//
// Audit 2026-04-25 (agent #3 BLOCKER) : la version précédente retournait
// `{ requests: [] }` en dur avec commentaire « table supprimée en migration 100 ».
// Or migration 329 (2026-02-21) a recréé `deletion_requests` et
// `data_export_requests`, et migration 375 a créé `gdpr_access_requests`.
// Les demandes arrivaient en DB mais aucun admin ne les voyait → risque CNIL
// Art. 12.3 (1 mois max pour répondre).
export async function GET(_request: NextRequest) {
  try {
    const authResult = await requirePermission('users', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const admin = createAdminClient()
    const now = Date.now()
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000

    const [accessRes, deletionRes, exportRes] = await Promise.all([
      admin
        .from('gdpr_access_requests')
        .select('id, request_type, requester_name, requester_email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      admin
        .from('deletion_requests')
        .select('id, user_id, status, scheduled_deletion_at, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
      admin
        .from('data_export_requests')
        .select('id, user_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    if (accessRes.error) logger.error('admin/gdpr: gdpr_access_requests query', accessRes.error)
    if (deletionRes.error) logger.error('admin/gdpr: deletion_requests query', deletionRes.error)
    if (exportRes.error) logger.error('admin/gdpr: data_export_requests query', exportRes.error)

    const rows: GdprQueueRow[] = []

    for (const r of accessRes.data ?? []) {
      const created = new Date(r.created_at).getTime()
      const days = Math.floor((now - created) / 86_400_000)
      rows.push({
        id: r.id,
        source: 'access',
        request_type: r.request_type as 'access' | 'rectification',
        status: r.status,
        requester_email: r.requester_email,
        requester_name: r.requester_name,
        user_id: null,
        created_at: r.created_at,
        scheduled_at: null,
        days_pending: days,
        legal_breach:
          (r.status === 'pending' || r.status === 'processing') && now - created > oneMonthMs,
      })
    }

    for (const r of deletionRes.data ?? []) {
      const created = new Date(r.created_at).getTime()
      const days = Math.floor((now - created) / 86_400_000)
      const scheduled = r.scheduled_deletion_at
      const overdue = scheduled ? new Date(scheduled).getTime() < now : false
      rows.push({
        id: r.id,
        source: 'deletion',
        request_type: 'deletion',
        status: r.status,
        requester_email: null,
        requester_name: null,
        user_id: r.user_id,
        created_at: r.created_at,
        scheduled_at: scheduled,
        days_pending: days,
        legal_breach: r.status === 'scheduled' && overdue,
      })
    }

    for (const r of exportRes.data ?? []) {
      const created = new Date(r.created_at).getTime()
      const days = Math.floor((now - created) / 86_400_000)
      rows.push({
        id: r.id,
        source: 'export',
        request_type: 'export',
        status: r.status,
        requester_email: null,
        requester_name: null,
        user_id: r.user_id,
        created_at: r.created_at,
        scheduled_at: null,
        days_pending: days,
        legal_breach:
          (r.status === 'pending' || r.status === 'processing' || r.status === 'failed') &&
          now - created > oneMonthMs,
      })
    }

    rows.sort((a, b) => {
      if (a.legal_breach !== b.legal_breach) return a.legal_breach ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const breachCount = rows.filter((r) => r.legal_breach).length

    return NextResponse.json({
      success: true,
      requests: rows,
      total: rows.length,
      breachCount,
      legalRiskWarning:
        breachCount > 0
          ? `${breachCount} demande(s) en violation potentielle du délai CNIL Art. 12.3 (>30 jours sans traitement)`
          : null,
    })
  } catch (error) {
    logger.error('Admin GDPR requests error', error)
    captureError(error, { tags: { route: 'api/admin/gdpr', critical: 'true' } })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
