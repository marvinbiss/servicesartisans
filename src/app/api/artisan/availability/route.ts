/**
 * CRUD /api/artisan/availability
 * Gere les creneaux de disponibilite (availability_slots) de l'artisan connecte.
 *
 * GET  — liste tous les slots de l'artisan, tries par date puis start_time
 * POST — cree un nouveau slot (avec validation Zod + anti-chevauchement)
 * DELETE — supprime un slot par ?slotId=uuid (ownership check)
 */

import { NextResponse } from 'next/server'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { logger } from '@/lib/logger'
import {
  getAllSlotsForArtisan,
  getSlotsForDateByArtisan,
  createSlot,
  getSlotById,
  deleteSlot,
  hasActiveBookingOnSlot,
  hasTimeOverlap,
} from '@/lib/services/bookings-service'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const createSlotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date attendu : AAAA-MM-JJ'),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format attendu : HH:MM'),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format attendu : HH:MM'),
    is_available: z.boolean().optional().default(true),
  })
  .refine((d) => d.end_time > d.start_time, {
    message: "L'heure de fin doit etre superieure a l'heure de debut",
    path: ['end_time'],
  })

const deleteSlotSchema = z.object({
  slotId: z.string().uuid('Identifiant de creneau invalide'),
})

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// GET — lister les creneaux
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { error, user, supabase } = await requireArtisan()
    if (error) return error

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { data: slots, error: dbError } = await getAllSlotsForArtisan(supabase, user!.id)

    if (dbError) {
      logger.error('Erreur DB GET availability_slots', dbError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors du chargement des creneaux' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, slots: slots ?? [] })
  } catch (err) {
    logger.error('GET /api/artisan/availability unexpected error', err)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST — creer un creneau
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const { error, user, supabase } = await requireArtisan()
    if (error) return error

    const body = await request.json()
    const parsed = createSlotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Données invalides', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { date, start_time, end_time, is_available } = parsed.data
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const artisanId = user!.id

    // --- Verification anti-chevauchement ---
    const { data: existing, error: overlapErr } = await getSlotsForDateByArtisan(
      supabase,
      artisanId,
      date
    )

    if (overlapErr) {
      logger.error('Erreur DB overlap check', overlapErr)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la verification des chevauchements' } },
        { status: 500 }
      )
    }

    if (hasTimeOverlap(existing ?? [], start_time, end_time)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Ce creneau chevauche un creneau existant sur cette date' },
        },
        { status: 409 }
      )
    }

    // --- Insertion ---
    const { data: newSlot, error: insertErr } = await createSlot(supabase, {
      artisan_id: artisanId,
      date,
      start_time,
      end_time,
      is_available,
    })

    if (insertErr) {
      logger.error('Erreur DB insert availability_slot', insertErr)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la creation du creneau' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, slot: newSlot }, { status: 201 })
  } catch (err) {
    logger.error('POST /api/artisan/availability unexpected error', err)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE — supprimer un creneau
// ---------------------------------------------------------------------------

export async function DELETE(request: Request) {
  try {
    const { error, user, supabase } = await requireArtisan()
    if (error) return error

    const { searchParams } = new URL(request.url)
    const parsed = deleteSlotSchema.safeParse({ slotId: searchParams.get('slotId') })

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Parametre slotId invalide', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { slotId } = parsed.data

    // Verifier que le slot appartient a l'artisan
    const { data: slot, error: fetchErr } = await getSlotById(supabase, slotId)

    if (fetchErr || !slot) {
      return NextResponse.json(
        { success: false, error: { message: 'Creneau introuvable' } },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (slot.artisan_id !== user!.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Vous ne pouvez pas supprimer ce creneau' } },
        { status: 403 }
      )
    }

    // Verifier qu'aucune reservation active n'est liee a ce creneau
    const hasActive = await hasActiveBookingOnSlot(supabase, slotId)

    if (hasActive) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Ce créneau a une réservation active et ne peut pas être supprimé' },
        },
        { status: 409 }
      )
    }

    const { error: deleteErr } = await deleteSlot(supabase, slotId)

    if (deleteErr) {
      logger.error('Erreur DB delete availability_slot', deleteErr)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression du creneau' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('DELETE /api/artisan/availability unexpected error', err)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
