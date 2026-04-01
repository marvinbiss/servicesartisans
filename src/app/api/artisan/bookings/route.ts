/**
 * GET /api/artisan/bookings
 * Récupère les bookings de l'artisan connecté pour un mois donné.
 * Utilise requireArtisan() pour l'authentification.
 *
 * Query params:
 *   - month: number (0-11)
 *   - year: number (ex: 2026)
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const querySchema = z.object({
  month: z.coerce.number().int().min(0).max(11),
  year: z.coerce.number().int().min(2020).max(2100),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error, user, provider, supabase } = await requireArtisan()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      month: searchParams.get('month'),
      year: searchParams.get('year'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres month et year requis (month: 0-11, year: 2020-2100)' },
        { status: 400 }
      )
    }

    const { month, year } = parsed.data

    // Calculer les bornes du mois
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0) // Dernier jour du mois
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    // Récupérer les bookings qui ont un slot dans ce mois
    // On joint avec availability_slots pour obtenir la date et les heures
    const { data: bookings, error: dbError } = await supabase
      .from('bookings')
      .select(`
        id,
        client_name,
        client_email,
        client_phone,
        service_description,
        status,
        created_at,
        slot:availability_slots!slot_id (
          id,
          date,
          start_time,
          end_time
        )
      `)
      .eq('artisan_id', user!.id)
      .in('status', ['confirmed', 'pending', 'completed'])

    if (dbError) {
      logger.error('Error fetching artisan bookings', { error: dbError })

      // Fallback: essayer sans le join si availability_slots ne match pas
      const { data: fallbackBookings, error: fallbackError } = await supabase
        .from('bookings')
        .select(`
          id,
          client_name,
          client_email,
          client_phone,
          service_description,
          status,
          scheduled_date,
          created_at
        `)
        .eq('provider_id', provider!.id)
        .in('status', ['confirmed', 'pending', 'completed'])
        .gte('scheduled_date', startStr)
        .lte('scheduled_date', endStr)
        .order('scheduled_date', { ascending: true })

      if (fallbackError) {
        logger.error('Fallback bookings query also failed', { error: fallbackError })
        return NextResponse.json(
          { error: 'Erreur lors de la récupération des réservations' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        bookings: (fallbackBookings ?? []).map(b => ({
          id: b.id,
          client_name: b.client_name,
          client_email: b.client_email,
          client_phone: b.client_phone,
          service_description: b.service_description,
          status: b.status,
          date: b.scheduled_date,
          start_time: null,
          end_time: null,
        })),
      })
    }

    // Filtrer par date du slot dans le mois demandé
    type SlotData = { id: string; date: string; start_time: string; end_time: string }
    const filtered = (bookings ?? [])
      .filter(b => {
        const slot = b.slot as unknown as SlotData | SlotData[] | null
        if (!slot) return false
        const slotObj = Array.isArray(slot) ? slot[0] : slot
        if (!slotObj?.date) return false
        return slotObj.date >= startStr && slotObj.date <= endStr
      })
      .map(b => {
        const slot = b.slot as unknown as SlotData | SlotData[] | null
        const slotObj = slot ? (Array.isArray(slot) ? slot[0] : slot) : null
        return {
          id: b.id,
          client_name: b.client_name,
          client_email: b.client_email,
          client_phone: b.client_phone,
          service_description: b.service_description,
          status: b.status,
          date: slotObj?.date ?? null,
          start_time: slotObj?.start_time ?? null,
          end_time: slotObj?.end_time ?? null,
        }
      })
      .sort((a, b) => {
        if (!a.date || !b.date) return 0
        const cmp = a.date.localeCompare(b.date)
        if (cmp !== 0) return cmp
        return (a.start_time ?? '').localeCompare(b.start_time ?? '')
      })

    return NextResponse.json({ bookings: filtered })
  } catch (err) {
    logger.error('Unexpected error in GET /api/artisan/bookings', { error: err })
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
