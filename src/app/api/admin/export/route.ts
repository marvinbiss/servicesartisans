import { NextRequest, NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { exportData, type ExportType } from '@/lib/services/admin-stats-service'

// GET query params schema
const exportQuerySchema = z.object({
  type: z.enum(['providers', 'quotes', 'reviews']).optional().default('providers'),
  format: z.enum(['json', 'csv']).optional().default('json'),
})

export const dynamic = 'force-dynamic'

// GET /api/admin/export?type=providers|quotes|reviews&format=json|csv
export async function GET(request: NextRequest) {
  try {
    // Verify admin with settings:read permission (data export)
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const url = new URL(request.url)
    const queryParams = {
      type: url.searchParams.get('type') || 'providers',
      format: url.searchParams.get('format') || 'json',
    }
    const result = exportQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Paramètres invalides', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const { type, format } = result.data

    // Log d'audit AVANT l'export — si exportData throw, l'intent reste tracé.
    await logAdminAction(authResult.admin.id, 'data.export', 'settings', type, {
      format,
    })

    const { data, filename } = await exportData(type as ExportType)

    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('No data', { status: 200 })
      }

      // CSV formula injection guard : Excel/Sheets interprètent toute cellule
      // commençant par =, +, -, @, tab ou CR comme formule. On préfixe par un
      // apostrophe (OWASP CSV injection mitigation).
      const escapeCell = (raw: unknown): string => {
        const s = JSON.stringify(raw ?? '')
        if (s.length < 2) return s
        const firstChar = s.charAt(1)
        if (['=', '+', '-', '@', '\t', '\r'].includes(firstChar)) {
          return `"'${s.slice(1)}`
        }
        return s
      }

      const headers = Object.keys(data[0] as object)
      const csv = [
        headers.join(','),
        ...data.map((row) =>
          headers.map((h) => escapeCell((row as Record<string, unknown>)[h])).join(',')
        ),
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}_${Date.now()}.csv"`,
        },
      })
    }

    // JSON format
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}_${Date.now()}.json"`,
      },
    })
  } catch (error) {
    logger.error('Admin export error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
