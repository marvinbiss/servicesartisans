import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/export?type=providers|quotes|reviews&format=json|csv
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'providers'
    const format = url.searchParams.get('format') || 'json'

    let data: unknown[]
    let filename: string

    switch (type) {
      case 'providers': {
        const { data: providers } = await supabase
          .from('providers')
          .select('id, slug, company_name, city, phone, email, plan, is_active, created_at')
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
    console.error('Admin export error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
