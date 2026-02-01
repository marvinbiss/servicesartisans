import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const bulkUpdateSchema = z.object({
  provider_ids: z.array(z.string().uuid()).min(1).max(100),
  updates: z.object({
    is_active: z.boolean().optional(),
    plan: z.enum(['free', 'pro', 'premium', 'inactive']).optional(),
    is_verified: z.boolean().optional(),
  }),
})

const bulkDeleteSchema = z.object({
  provider_ids: z.array(z.string().uuid()).min(1).max(100),
  hard_delete: z.boolean().default(false),
})

// PATCH /api/providers/bulk - Bulk update providers
export async function PATCH(request: NextRequest) {
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
    const parsed = bulkUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const { provider_ids, updates } = parsed.data

    const { data, error } = await supabase
      .from('providers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('id', provider_ids)
      .select('id')

    if (error) throw error

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    })
  } catch (error) {
    logger.error('Bulk update providers error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE /api/providers/bulk - Bulk delete providers
export async function DELETE(request: NextRequest) {
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
    const parsed = bulkDeleteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides' } },
        { status: 400 }
      )
    }

    const { provider_ids, hard_delete } = parsed.data

    if (hard_delete) {
      const { error } = await supabase
        .from('providers')
        .delete()
        .in('id', provider_ids)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('providers')
        .update({
          is_active: false,
          plan: 'inactive',
          updated_at: new Date().toISOString(),
        })
        .in('id', provider_ids)

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      deleted: provider_ids.length,
    })
  } catch (error) {
    logger.error('Bulk delete providers error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
