import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  listerNumeros,
  rechercherNumerosDisponibles,
  acheterNumero,
  getHistoriqueAppels,
  calculerStatsAppels
} from '@/lib/api/twilio-calls'
import { verifyAdmin } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const callsQuerySchema = z.object({
  action: z.enum(['numbers', 'available', 'stats', 'history', 'artisan-stats']),
  areaCode: z.string().max(10).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  artisanId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(50),
})

// POST request schema
const callsPostSchema = z.object({
  action: z.enum(['buy', 'assign']),
  phoneNumber: z.string().max(20).optional(),
  ville: z.string().max(100).optional(),
  metier: z.string().max(100).optional(),
  artisanId: z.string().uuid().optional().nullable(),
  numeroId: z.string().uuid().optional(),
})

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
  const queryParams = {
    action: searchParams.get('action'),
    areaCode: searchParams.get('areaCode') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    artisanId: searchParams.get('artisanId') || undefined,
    limit: searchParams.get('limit') || '50',
  }

  const result = callsQuerySchema.safeParse(queryParams)
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid parameters', details: result.error.flatten() },
      { status: 400 }
    )
  }
  const { action, areaCode, startDate, endDate, artisanId, limit } = result.data

  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
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
        const numeros = await rechercherNumerosDisponibles({
          areaCode,
          limit: 20
        })
        return NextResponse.json({ success: true, data: numeros })
      }

      // Statistiques globales des appels
      case 'stats': {
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
    logger.error('API calls error', error)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}

// POST - Acheter un numéro ou assigner à un artisan
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const result = callsPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { action, phoneNumber, ville, metier, artisanId, numeroId } = result.data

    switch (action) {
      // Acheter un nouveau numéro
      case 'buy': {
        if (!phoneNumber) {
          return NextResponse.json(
            { error: 'phoneNumber is required for buy action' },
            { status: 400 }
          )
        }

        // Acheter via Twilio
        const numero = await acheterNumero(phoneNumber, ville || '', metier || '')
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
        if (!numeroId) {
          return NextResponse.json(
            { error: 'numeroId required' },
            { status: 400 }
          )
        }

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
    logger.error('API calls POST error', error)
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    )
  }
}
