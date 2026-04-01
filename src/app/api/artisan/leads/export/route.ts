/**
 * Artisan Leads CSV Export
 * GET: Export all leads assigned to the authenticated artisan as CSV
 * Query params: status (optional), from/to (optional date range YYYY-MM-DD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const exportQuerySchema = z.object({
  status: z.string().max(50).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const MAX_EXPORT_ROWS = 5000

export const dynamic = 'force-dynamic'

/** Escape a value for CSV: wrap in quotes, double any existing quotes */
function csvEscape(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  // Always wrap in quotes to handle semicolons, newlines, quotes in values
  return `"${str.replace(/"/g, '""')}"`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Nouveau',
    viewed: 'Consulté',
    quoted: 'Devis envoyé',
    declined: 'Décliné',
  }
  return labels[status] || status
}

export async function GET(request: NextRequest) {
  try {
    const { error: guardError, supabase } = await requireArtisan()
    if (guardError) return guardError

    // Get provider
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Aucun profil artisan trouvé' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = request.nextUrl
    const parsed = exportQuerySchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const { status, from, to } = parsed.data

    // Build query — no pagination, fetch all (capped at MAX_EXPORT_ROWS)
    let query = supabase
      .from('lead_assignments')
      .select(`
        id,
        status,
        assigned_at,
        lead:devis_requests (
          id,
          service_name,
          city,
          postal_code,
          description,
          client_name,
          client_email,
          client_phone,
          created_at
        )
      `)
      .eq('provider_id', provider.id)
      .order('assigned_at', { ascending: false })
      .limit(MAX_EXPORT_ROWS)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (from) {
      query = query.gte('assigned_at', `${from}T00:00:00`)
    }

    if (to) {
      query = query.lte('assigned_at', `${to}T23:59:59`)
    }

    const { data: assignments, error: queryError } = await query

    if (queryError) {
      logger.error('Error exporting leads:', queryError)
      return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
    }

    // Build CSV
    const headers = ['Date', 'Client', 'Email', 'Téléphone', 'Service', 'Ville', 'Statut', 'Message']
    const headerRow = headers.map(csvEscape).join(';')

    interface LeadData {
      id: string
      service_name: string
      city: string | null
      postal_code: string | null
      description: string | null
      client_name: string
      client_email: string
      client_phone: string | null
      created_at: string
    }

    const rows = (assignments || []).map((a) => {
      // Supabase returns the joined row as an object (single FK) but TS types it as array
      const lead = (Array.isArray(a.lead) ? a.lead[0] : a.lead) as LeadData | null | undefined

      if (!lead) return null

      const ville = [lead.city, lead.postal_code].filter(Boolean).join(' ')

      return [
        csvEscape(formatDate(lead.created_at)),
        csvEscape(lead.client_name),
        csvEscape(lead.client_email),
        csvEscape(lead.client_phone),
        csvEscape(lead.service_name),
        csvEscape(ville),
        csvEscape(statusLabel(a.status)),
        csvEscape(lead.description),
      ].join(';')
    }).filter(Boolean)

    const today = new Date().toISOString().slice(0, 10)
    // BOM UTF-8 for Excel + header + rows
    const csv = '\uFEFF' + headerRow + '\n' + rows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-export-${today}.csv"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (error) {
    logger.error('Leads export error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
