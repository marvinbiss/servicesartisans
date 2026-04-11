/**
 * Admin API — CEE Délégataires
 * ----------------------------------------------------------------------------
 * PATCH /api/admin/cee-delegataires/[id]
 * Met à jour un délégataire (statut actif/inactif, SIRET, notes).
 *
 * Auth : `requirePermission('settings', 'write')`.
 * Mapping : le champ applicatif `is_active` bascule la colonne DB `statut`
 * entre 'actif' et 'inactif' (cf. migration 386).
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const uuidSchema = z.string().uuid()

const patchSchema = z
  .object({
    is_active: z.boolean().optional(),
    statut: z.enum(['partenaire', 'prospect', 'actif', 'inactif']).optional(),
    siret: z
      .string()
      .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
      .nullable()
      .optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .strict()

const SELECT_COLS =
  'id, slug, nom_commercial, raison_sociale, siret, type, vague_priorite, statut, url_site, operations_supportees, notes, updated_at'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requirePermission('settings', 'write')
  if (!auth.success || !auth.admin) {
    return (
      auth.error ??
      NextResponse.json({ success: false, error: { message: 'Non autorisé' } }, { status: 403 })
    )
  }

  const { id } = await context.params
  const idCheck = uuidSchema.safeParse(id)
  if (!idCheck.success) {
    return NextResponse.json(
      { success: false, error: { message: 'Identifiant invalide' } },
      { status: 400 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: { message: 'Corps de requête invalide' } },
      { status: 400 }
    )
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Données invalides',
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = {}

  if (typeof parsed.data.is_active === 'boolean') {
    updates.statut = parsed.data.is_active ? 'actif' : 'inactif'
  }
  if (parsed.data.statut !== undefined) {
    updates.statut = parsed.data.statut
  }
  if (parsed.data.siret !== undefined) {
    updates.siret = parsed.data.siret
  }
  if (parsed.data.notes !== undefined) {
    updates.notes = parsed.data.notes
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, error: { message: 'Aucun champ à mettre à jour' } },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Garde-fou vague 1 : la contrainte DB `cee_delegataires_vague1_not_inactive`
  // (migration 386) interdit de passer une ligne vague_priorite=1 en statut
  // 'inactif'. On pré-vérifie pour renvoyer un 422 explicite plutôt que
  // laisser Postgres lever une erreur générique captée en 500.
  if (updates.statut === 'inactif') {
    const { data: current, error: fetchError } = await supabase
      .from('cee_delegataires')
      .select('vague_priorite')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json(
        { success: false, error: { message: 'Délégataire introuvable' } },
        { status: 404 }
      )
    }
    if (current.vague_priorite === 1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'vague1_cannot_be_inactive',
            message:
              'Un délégataire en vague 1 (POC mandataire) ne peut pas être désactivé. Rétrograde-le en vague 2 ou 3 avant.',
          },
        },
        { status: 422 }
      )
    }
  }

  const { data, error } = await supabase
    .from('cee_delegataires')
    .update(updates)
    .eq('id', id)
    .select(SELECT_COLS)
    .single()

  if (error || !data) {
    logger.error('cee_delegataires update error', {
      id,
      message: error?.message,
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la mise à jour' } },
      { status: 500 }
    )
  }

  await logAdminAction(auth.admin.id, 'cee_delegataire_update', 'cee_delegataires', id, updates)

  revalidatePath('/admin/(dashboard)/cee/delegataires')

  return NextResponse.json({ success: true, delegataire: data })
}
