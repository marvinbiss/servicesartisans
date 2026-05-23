/**
 * POST /api/cee/dossiers/[id]/justificatifs
 *
 * Upload d'une pièce justificative CEE par l'artisan propriétaire du dossier.
 *
 * Règles de sécurité (brique 2 — UI artisan, avril 2026) :
 *   - Auth obligatoire (401 si pas de session Supabase)
 *   - Vérifie que le dossier appartient à un `provider` dont `user_id` = `auth.uid()`
 *     (403 sinon). Pas de confiance dans un paramètre client.
 *   - Fail-closed : toute erreur d'upload est renvoyée au format `{ ok:false, error }`
 *     avec un code machine-readable (issu de `uploadJustificatif`).
 *   - Zéro PII dans les logs (code, taille, hash OK — jamais le nom du client).
 *
 * Body : multipart/form-data
 *   - file  : File binaire (JPG, PNG, WebP, HEIC, PDF)
 *   - code  : string — code du justificatif (ex. `photos_horodatees_geolocalisees_avant_apres`)
 *   - label : string — libellé affiché
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import {
  uploadJustificatif,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/cee/justificatifs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Champs texte du multipart (le binaire `file` reste géré tel quel). `code` et
// `label` sont requis non-vides — le handler les déréférence déjà comme tels.
const justificatifFieldsSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
})

interface RouteContext {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveParams(ctx: RouteContext): Promise<{ id: string }> {
  const p = ctx.params
  return p instanceof Promise ? await p : p
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: dossierId } = await resolveParams(context)
    if (!dossierId) {
      return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
    }

    const supabase = await createClient()

    // --- 1. Auth ------------------------------------------------------------
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }

    // --- 2. Fetch dossier + vérification ownership en UNE seule query -------
    // On joint `providers` via FK embedding (`!inner`) et on filtre sur le
    // `user_id` du provider. Si le user n'est pas propriétaire, le join
    // `inner` ne retourne aucune ligne → 404 (masque l'existence).
    // Fix TOCTOU : plus de 2e round-trip `.from('providers')` séparé.
    const { data: dossier, error: dossierError } = await supabase
      .from('cee_dossiers')
      .select('id, provider_id, status, operation_code, providers!inner(user_id)')
      .eq('id', dossierId)
      .eq('providers.user_id', user.id)
      .maybeSingle()

    if (dossierError || !dossier) {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    }

    // --- 3. Parse multipart -------------------------------------------------
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
    }

    const fileEntry = formData.get('file')

    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ ok: false, error: 'invalid_file' }, { status: 400 })
    }

    const fields = justificatifFieldsSchema.safeParse({
      code: formData.get('code'),
      label: formData.get('label'),
    })
    if (!fields.success) {
      return NextResponse.json({ ok: false, error: 'invalid_input' }, { status: 400 })
    }
    const { code, label } = fields.data

    // --- 4. Pré-validations rapides (avant lecture du buffer) ---------------
    if (!ALLOWED_MIME_TYPES.has(fileEntry.type)) {
      return NextResponse.json({ ok: false, error: 'mime_type_rejected' }, { status: 415 })
    }
    if (fileEntry.size === 0) {
      return NextResponse.json({ ok: false, error: 'empty_file' }, { status: 400 })
    }
    if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 413 })
    }

    const bytes = new Uint8Array(await fileEntry.arrayBuffer())

    // --- 5. Délégation au cœur métier (uploadJustificatif) -----------------
    const result = await uploadJustificatif(supabase, {
      dossierId,
      code,
      label,
      source: 'artisan',
      uploadedBy: user.id,
      file: {
        filename: fileEntry.name,
        mimeType: fileEntry.type,
        size: fileEntry.size,
        bytes,
      },
    })

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'unknown_error' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true, entry: result.entry }, { status: 201 })
  } catch (error) {
    logger.error('cee-justificatif-upload: unhandled error', error, {
      action: 'cee-justificatif-upload',
    })
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}
