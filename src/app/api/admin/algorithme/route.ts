/**
 * Admin Algorithm Config API
 * GET: Read current algorithm config
 * PATCH: Update algorithm config
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_ALGORITHM_CONFIG } from '@/types/algorithm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await verifyAdmin()
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const supabase = createAdminClient()

    // Essayer d'abord le schema app
    const { data, error } = await supabase
      .from('algorithm_config')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      // Retourner les defaults si la table n'existe pas encore
      return NextResponse.json({
        config: {
          id: 'default',
          ...DEFAULT_ALGORITHM_CONFIG,
          updated_at: new Date().toISOString(),
          updated_by: null,
        },
        source: 'defaults',
      })
    }

    return NextResponse.json({ config: data, source: 'database' })
  } catch {
    return NextResponse.json({
      config: {
        id: 'default',
        ...DEFAULT_ALGORITHM_CONFIG,
        updated_at: new Date().toISOString(),
        updated_by: null,
      },
      source: 'defaults',
    })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth.success || !auth.admin) return auth.error!

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    // Supprimer les champs non-modifiables
    const { id, created_at, ...updates } = body as Record<string, unknown>

    // Ajouter le metadata
    updates.updated_by = auth.admin.id
    updates.updated_at = new Date().toISOString()

    // Récupérer l'ID de la config actuelle
    const { data: current } = await supabase
      .from('algorithm_config')
      .select('id')
      .limit(1)
      .single()

    if (!current) {
      // Insert si pas encore de config
      const { data, error } = await supabase
        .from('algorithm_config')
        .insert(updates)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      await logAdminAction(
        auth.admin.id,
        'algorithm_config_create',
        'algorithm_config',
        data.id,
        updates
      )

      return NextResponse.json({ config: data, action: 'created' })
    }

    // Update la config existante
    const { data, error } = await supabase
      .from('algorithm_config')
      .update(updates)
      .eq('id', current.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminAction(
      auth.admin.id,
      'algorithm_config_update',
      'algorithm_config',
      current.id,
      updates
    )

    return NextResponse.json({ config: data, action: 'updated' })
  } catch (error) {
    console.error('Algorithm config PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
