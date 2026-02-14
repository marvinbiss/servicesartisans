import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

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

    const supabase = createAdminClient()
    const url = new URL(request.url)
    const queryParams = {
      type: url.searchParams.get('type') || 'providers',
      format: url.searchParams.get('format') || 'json',
    }
    const result = exportQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { type, format } = result.data

    let data: unknown[]
    let filename: string

    switch (type) {
      case 'providers': {
        const { data: providers } = await supabase
          .from('providers')
          .select('id, slug, name, address_city, phone, email, is_active, created_at')
          .order('created_at', { ascending: false })
        data = providers || []
        filename = 'providers'
        break
      }
      case 'quotes': {
        const { data: quotes } = await supabase
          .from('quotes')
          .select('id, provider_id, client_name, client_email, status, created_at')
          .order('created_at', { ascending: false })
        data = quotes || []
        filename = 'quotes'
        break
      }
      case 'reviews': {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('id, provider_id, author_name, rating, comment, is_visible, created_at')
          .order('created_at', { ascending: false })
        data = reviews || []
        filename = 'reviews'
        break
      }
      default:
        return NextResponse.json(
          { success: false, error: { message: 'Type d\'export invalide' } },
          { status: 400 }
        )
    }

    // Log d'audit pour l'export de données
    await logAdminAction(authResult.admin.id, 'data.export', 'settings', type, { format, recordCount: data.length })

    if (format === 'csv') {
      if (data.length === 0) {
        return new NextResponse('No data', { status: 200 })
      }

      const headers = Object.keys(data[0] as object)
      const csv = [
        headers.join(','),
        ...data.map(row =>
          headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(',')
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
