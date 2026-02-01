import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Liste des services
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

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: services, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      services: services || [],
    })
  } catch (error) {
    console.error('Admin services list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// POST - Créer un service
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, icon, parent_id, meta_title, meta_description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: { message: 'Le nom est requis' } },
        { status: 400 }
      )
    }

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('services')
      .insert({
        name,
        slug,
        description,
        icon,
        parent_id,
        meta_title: meta_title || name,
        meta_description: meta_description || description,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'service.create',
      entity_type: 'service',
      entity_id: data.id,
      new_data: { name, slug },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      service: data,
      message: 'Service créé avec succès',
    })
  } catch (error) {
    console.error('Admin service create error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
