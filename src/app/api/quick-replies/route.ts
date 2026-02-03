/**
 * Quick Reply Templates API
 * GET: List user's templates
 * POST: Create new template
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const templateSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  shortcut: z.string().max(20).optional(),
  category: z.string().max(50).optional().default('general'),
})

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: templates, error } = await supabase
      .from('quick_reply_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (error) {
      logger.error('Fetch templates error', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    return NextResponse.json(templates)
  } catch (error) {
    logger.error('Get templates error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = templateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: template, error } = await supabase
      .from('quick_reply_templates')
      .insert({
        user_id: user.id,
        ...parsed.data,
      })
      .select()
      .single()

    if (error) {
      logger.error('Create template error', error)
      return NextResponse.json(
        { error: 'Impossible de créer le modèle' },
        { status: 500 }
      )
    }

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    logger.error('Create template error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('quick_reply_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Delete template error', error)
      return NextResponse.json(
        { error: 'Impossible de supprimer le modèle' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete template error', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
