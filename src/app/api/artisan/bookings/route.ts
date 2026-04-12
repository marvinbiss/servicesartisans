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
import {
  getArtisanBookingsForMonth,
  getAvailableSlotsForArtisanMonth,
  extractSlotFromJoin,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

const querySchema = z.object({
  month: z.coerce.number().int().min(0).max(11),
  year: z.coerce.number().int().min(2020).max(2100),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { error, user, supabase } = await requireArtisan()
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
    const { data: bookings, error: dbError } = await getArtisanBookingsForMonth(
      supabase,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user!.id,
      startStr,
      endStr
    )

    if (dbError) {
      logger.error('Error fetching artisan bookings', { error: dbError })
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      )
    }

    // Filtrer par date du slot dans le mois demandé
    type SlotData = { id: string; date: string; start_time: string; end_time: string }
    const filtered = (bookings ?? [])
      .filter((b) => {
        const slot = extractSlotFromJoin(b.slot as SlotData | SlotData[] | null)
        if (!slot?.date) return false
        return slot.date >= startStr && slot.date <= endStr
      })
      .map((b) => {
        const slot = extractSlotFromJoin(b.slot as SlotData | SlotData[] | null)
        return {
          id: b.id,
          client_name: b.client_name,
          client_email: b.client_email,
          client_phone: b.client_phone,
          service_description: b.service_description,
          status: b.status,
          date: slot?.date ?? null,
          start_time: slot?.start_time ?? null,
          end_time: slot?.end_time ?? null,
        }
      })
      .sort((a, b) => {
        if (!a.date || !b.date) return 0
        const cmp = a.date.localeCompare(b.date)
        if (cmp !== 0) return cmp
        return (a.start_time ?? '').localeCompare(b.start_time ?? '')
      })

    // ─── Récupérer les créneaux de disponibilité du mois ──────────────
    const { data: availabilitySlots, error: slotsError } = await getAvailableSlotsForArtisanMonth(
      supabase,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user!.id,
      startStr,
      endStr
    )

    if (slotsError) {
      logger.warn('Error fetching availability slots (non-blocking)', { error: slotsError })
    }

    return NextResponse.json({
      bookings: filtered,
      availabilitySlots: (availabilitySlots ?? []).map((s) => ({
        id: s.id,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
      })),
    })
  } catch (err) {
    logger.error('Unexpected error in GET /api/artisan/bookings', { error: err })
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
