/**
 * Artisan Equipe [id] API
 * PUT:    Update a team member (Zod validation)
 * DELETE: Remove a team member
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireArtisan } from '@/lib/auth/artisan-guard'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const memberUpdateSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  role: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_active: z.boolean().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const body: unknown = await request.json()
    const validation = memberUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: validation.error.flatten() } },
        { status: 400 }
      )
    }

    const { name, email, phone, role, color, is_active } = validation.data

    // Verify ownership before update
    const { data: existing, error: fetchError } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', params.id)
      .eq('artisan_id', user!.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: { message: 'Membre introuvable' } },
        { status: 404 }
      )
    }

    const updatePayload: Record<string, unknown> = { name, email, role }
    if (phone !== undefined) updatePayload.phone = phone || null
    if (color !== undefined) updatePayload.color = color
    if (is_active !== undefined) updatePayload.is_active = is_active

    const { data, error } = await supabase
      .from('team_members')
      .update(updatePayload)
      .eq('id', params.id)
      .eq('artisan_id', user!.id)
      .select('id, name, email, phone, role, color, avatar_url, is_active, created_at')
      .single()

    if (error) {
      logger.error('Error updating team member:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la mise à jour du membre' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ member: data })
  } catch (error) {
    logger.error('Equipe PUT error:', error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: guardError, user, supabase } = await requireArtisan()
    if (guardError) return guardError

    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    // Verify ownership before delete
    const { data: existing, error: fetchError } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', params.id)
      .eq('artisan_id', user!.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: { message: 'Membre introuvable' } },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', params.id)
      .eq('artisan_id', user!.id)

    if (error) {
      logger.error('Error deleting team member:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression du membre' } },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('Equipe DELETE error:', error)
    return NextResponse.json({ success: false, error: { message: 'Erreur serveur' } }, { status: 500 })
  }
}
