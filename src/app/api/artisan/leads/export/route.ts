/**
 * Artisan Leads CSV Export
 * GET: Export all leads assigned to the authenticated artisan as CSV
 * Query params: status (optional), from/to (optional date range YYYY-MM-DD)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { getProviderForUser, getLeadsForExport, type LeadData } from '@/lib/services/leads-service'

const exportQuerySchema = z.object({
  status: z.string().max(50).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
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
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const provider = await getProviderForUser(supabase, user.id)

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

    const assignments = await getLeadsForExport(supabase, provider.id, {
      status,
      from,
      to,
      limit: MAX_EXPORT_ROWS,
    })

    // Build CSV
    const headers = [
      'Date',
      'Client',
      'Email',
      'Téléphone',
      'Service',
      'Ville',
      'Statut',
      'Message',
    ]
    const headerRow = headers.map(csvEscape).join(';')

    const rows = assignments
      .map((a) => {
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
      })
      .filter(Boolean)

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
