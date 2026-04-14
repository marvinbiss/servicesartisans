/**
 * GET /api/cee/commissions — historique versements artisan
 *
 * Retourne les commissions de l'artisan courant (RLS via partner_id → user_id).
 * Fail-open : retourne [] en cas d'absence de partner ou d'erreur DB.
 *
 * Sécurité :
 *   - Auth obligatoire (401)
 *   - RLS via createClient() (user_id = auth.uid())
 *   - Filtrage explicite partner_id pour defense in depth
 *   - Zéro PII dans les logs
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  requireArtisanAuth,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/cee/route-helpers'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Enum migration 432 : cee_commissions.status
const VALID_STATUSES = ['due', 'batched', 'sent', 'confirmed', 'failed', 'cancelled'] as const
type CommissionStatus = (typeof VALID_STATUSES)[number]
function isValidStatus(s: string): s is CommissionStatus {
  return (VALID_STATUSES as readonly string[]).includes(s)
}

export async function GET(request: NextRequest) {
  const auth = await requireArtisanAuth()
  if (!auth.ok) return auth.response
  const { ctx } = auth

  try {
    // Resolve partner for this user
    const { data: partner, error: partnerError } = await ctx.supabase
      .from('cee_artisan_partners')
      .select('id')
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (partnerError) {
      logger.error('cee-commissions: partner lookup error', partnerError, {
        action: 'cee-commissions-list',
      })
      return serverErrorResponse('READ_FAILED', 'Erreur serveur')
    }

    if (!partner) {
      return NextResponse.json({ success: true, data: [] })
    }

    // Parse query params
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10)), 100) : 50

    let query = ctx.supabase
      .from('cee_commissions')
      .select(
        'id, dossier_id, amount_cts, currency, status, payment_method, ' +
          'payment_reference, invoice_number, scheduled_at, sent_at, ' +
          'confirmed_at, failed_at, failure_reason, created_at, updated_at'
      )
      .eq('partner_id', partner.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (statusFilter) {
      if (!isValidStatus(statusFilter)) {
        return badRequestResponse('INVALID_STATUS', `status doit être l'un de: ${VALID_STATUSES.join(', ')}`)
      }
      query = query.eq('status', statusFilter)
    }

    const { data: commissions, error: listError } = await query

    if (listError) {
      logger.warn('cee-commissions: DB error (fail-open)', {
        action: 'cee-commissions-list-db',
        error: listError.message,
      })
      return NextResponse.json({ success: true, data: [] })
    }

    return NextResponse.json({ success: true, data: commissions ?? [] })
  } catch (error) {
    logger.error('cee-commissions: unhandled error', error, {
      action: 'cee-commissions-catch',
    })
    return serverErrorResponse('INTERNAL_ERROR', 'Erreur serveur')
  }
}
