import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Liste des utilisateurs avec filtres et pagination
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all' // all, clients, artisans, banned
    const status = searchParams.get('status') || 'all' // all, active, inactive
    const plan = searchParams.get('plan') || 'all' // all, gratuit, pro, premium
    const search = searchParams.get('search') || ''

    const offset = (page - 1) * limit

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    // Filtre par type d'utilisateur
    if (filter === 'clients') {
      query = query.eq('user_type', 'client')
    } else if (filter === 'artisans') {
      query = query.eq('user_type', 'artisan')
    } else if (filter === 'banned') {
      query = query.eq('is_banned', true)
    }

    // Filtre par statut
    if (status === 'active') {
      query = query.eq('is_verified', true).neq('is_banned', true)
    } else if (status === 'inactive') {
      query = query.or('is_verified.eq.false,is_banned.eq.true')
    }

    // Filtre par plan
    if (plan !== 'all') {
      query = query.eq('subscription_plan', plan)
    }

    // Recherche
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      users: users || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel utilisateur (admin only)
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
    const { email, full_name, phone, user_type, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Email et mot de passe requis' } },
        { status: 400 }
      )
    }

    // Créer l'utilisateur avec Supabase Auth
    // Note: En production, utiliser le service role key pour créer des utilisateurs
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
      },
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json(
        { success: false, error: { message: authError.message } },
        { status: 400 }
      )
    }

    // Le profil devrait être créé automatiquement par un trigger
    // Mais on met à jour les infos supplémentaires
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name,
          phone,
          user_type: user_type || 'client',
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: 'Utilisateur créé avec succès',
    })
  } catch (error) {
    console.error('Admin user creation error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
