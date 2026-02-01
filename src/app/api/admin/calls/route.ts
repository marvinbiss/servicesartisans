import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  listerNumeros,
  rechercherNumerosDisponibles,
  acheterNumero,
  getHistoriqueAppels,
  calculerStatsAppels
} from '@/lib/api/twilio-calls'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * API Admin pour la gestion des appels et numéros virtuels
 */

// GET - Récupérer les stats et l'historique des appels
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  try {
    // Vérifier l'authentification admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      // Lister les numéros virtuels
      case 'numbers': {
        const numeros = await listerNumeros()

        // Enrichir avec les données de la base
        const { data: numerosDb } = await supabase
          .from('numeros_virtuels')
          .select('*, artisan:providers(id, name)')

        const enriched = numeros.map(n => {
          const dbInfo = numerosDb?.find(db => db.phone_number === n.phoneNumber)
          return {
            ...n,
            artisan: dbInfo?.artisan || null,
            stats: dbInfo?.stats || null
          }
        })

        return NextResponse.json({ success: true, data: enriched })
      }

      // Rechercher des numéros disponibles à l'achat
      case 'available': {
        const areaCode = searchParams.get('areaCode') || undefined
        const numeros = await rechercherNumerosDisponibles({
          areaCode,
          limit: 20
        })
        return NextResponse.json({ success: true, data: numeros })
      }

      // Statistiques globales des appels
      case 'stats': {
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const appels = await getHistoriqueAppels({
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          limit: 1000
        })

        const stats = calculerStatsAppels(appels)
        return NextResponse.json({ success: true, data: stats })
      }

      // Historique des appels
      case 'history': {
        const artisanId = searchParams.get('artisanId')
        const limit = parseInt(searchParams.get('limit') || '50')

        const query = supabase
          .from('appels_logs')
          .select('*, artisan:providers(id, name)')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (artisanId) {
          query.eq('artisan_id', artisanId)
        }

        const { data: appels, error } = await query

        if (error) throw error

        return NextResponse.json({ success: true, data: appels })
      }

      // Stats par artisan
      case 'artisan-stats': {
        const artisanId = searchParams.get('artisanId')
        if (!artisanId) {
          return NextResponse.json(
            { error: 'artisanId required' },
            { status: 400 }
          )
        }

        const { data: appels } = await supabase
          .from('appels_logs')
          .select('*')
          .eq('artisan_id', artisanId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (!appels) {
          return NextResponse.json({ success: true, data: null })
        }

        const completed = appels.filter(a => a.status === 'completed')
        const missed = appels.filter(a => ['busy', 'no-answer', 'failed'].includes(a.status))

        const stats = {
          total: appels.length,
          completed: completed.length,
          missed: missed.length,
          avgDuration: completed.length > 0
            ? Math.round(completed.reduce((sum, a) => sum + (a.duration || 0), 0) / completed.length)
            : 0,
          responseRate: appels.length > 0
            ? Math.round((completed.length / appels.length) * 100)
            : 0,
          leadsGenerated: completed.filter(a => (a.duration || 0) >= 30).length
        }

        return NextResponse.json({ success: true, data: stats })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API calls error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}

// POST - Acheter un numéro ou assigner à un artisan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      // Acheter un nouveau numéro
      case 'buy': {
        const { phoneNumber, ville, metier, artisanId } = body

        // Acheter via Twilio
        const numero = await acheterNumero(phoneNumber, ville, metier)
        if (!numero) {
          return NextResponse.json(
            { error: 'Failed to purchase number' },
            { status: 500 }
          )
        }

        // Enregistrer en base
        const { data, error } = await supabase
          .from('numeros_virtuels')
          .insert({
            phone_number: numero.phoneNumber,
            friendly_name: numero.friendlyName,
            ville,
            metier,
            artisan_id: artisanId || null,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
      }

      // Assigner un numéro à un artisan
      case 'assign': {
        const { numeroId, artisanId } = body

        const { data, error } = await supabase
          .from('numeros_virtuels')
          .update({
            artisan_id: artisanId,
            updated_at: new Date().toISOString()
          })
          .eq('id', numeroId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('API calls POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
