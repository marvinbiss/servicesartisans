/**
 * Admin Leads API
 * GET: Lead counts + active artisans for a city x metier
 * POST: Manual lead creation + direct assignment to a chosen provider
 *       (phone/external leads — bypasses the dispatch algorithm)
 * Uses service_role (bypasses RLS)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  getAdminLeadCounts,
  getActiveArtisans,
  createManualLead,
  logLeadEvent,
} from '@/lib/services/leads-service'
import { sendLeadAlert } from '@/lib/services/notifications-service'

const leadsQuerySchema = z.object({
  city: z.string().max(200).nullable().default(null),
  service: z.string().max(200).nullable().default(null),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Verify admin with services:read permission
    const auth = await requirePermission('services', 'read')

    if (!auth.success || !auth.admin) return auth.error

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const parsed = leadsQuerySchema.safeParse({
      city: searchParams.get('city') || null,
      service: searchParams.get('service') || null,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    // Sanitize search inputs to prevent ILIKE injection
    const city = parsed.data.city ? sanitizeSearchQuery(parsed.data.city) : null
    const service = parsed.data.service ? sanitizeSearchQuery(parsed.data.service) : null

    const filters = { city, service }

    const [{ leadsCreated, leadsAssigned }, artisans] = await Promise.all([
      getAdminLeadCounts(supabase, filters),
      getActiveArtisans(supabase, filters),
    ])

    return NextResponse.json({
      leadsCreated,
      leadsAssigned,
      artisans,
      artisanCount: artisans.length,
      filters: { city, service },
    })
  } catch (error) {
    logger.error('Admin leads GET error', error)
    return NextResponse.json({
      leadsCreated: 0,
      leadsAssigned: 0,
      artisans: [],
      artisanCount: 0,
      filters: { city: null, service: null },
    })
  }
}

const manualLeadSchema = z.object({
  providerId: z.string().uuid(),
  serviceName: z.string().min(2).max(200),
  city: z.string().min(1).max(200),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  description: z.string().min(5).max(5000),
  urgency: z.enum(['urgent', 'semaine', 'mois', 'flexible']).default('semaine'),
  clientName: z.string().min(2).max(200),
  clientEmail: z.string().email().max(320),
  clientPhone: z.string().min(6).max(32),
  notify: z.boolean().default(true),
})

export async function POST(request: Request) {
  const auth = await requirePermission('services', 'write')
  if (!auth.success || !auth.admin) return auth.error

  try {
    const body = await request.json()
    const parsed = manualLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Données invalides', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }
    const input = parsed.data

    const supabase = createAdminClient()

    // Provider must exist and be active — same guard as the targeted devis flow.
    const { data: provider } = await supabase
      .from('providers')
      .select('id, name, is_active')
      .eq('id', input.providerId)
      .single()

    if (!provider || !provider.is_active) {
      return NextResponse.json(
        { success: false, error: { message: 'Artisan introuvable ou inactif' } },
        { status: 404 }
      )
    }

    const { leadId, assignmentId } = await createManualLead(supabase, input)

    logLeadEvent(leadId, 'dispatched', {
      providerId: input.providerId,
      actorId: auth.admin.id,
      metadata: { reason: 'admin_manual_lead' },
    }).catch((err) => logger.warn('Manual lead event log failed', { leadId, error: err }))

    await logAdminAction(auth.admin.id, 'manual_lead_create', 'devis_request', leadId, {
      providerId: input.providerId,
      service: input.serviceName,
      city: input.city,
    })

    if (input.notify) {
      void sendLeadAlert({
        provider_ids: [input.providerId],
        service: input.serviceName,
        city: input.city,
        urgency: input.urgency,
        client_name: input.clientName,
        description: input.description,
      }).catch((err) => logger.error('Manual lead alert failed (non-blocking)', err))
    }

    return NextResponse.json({
      success: true,
      leadId,
      assignmentId,
      provider: { id: provider.id, name: provider.name },
    })
  } catch (error) {
    logger.error('Admin manual lead POST error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
