/**
 * Artisan Avatar API
 * POST: Upload avatar image
 * DELETE: Remove avatar image
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const AVATARS_BUCKET = 'avatars'
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Extract the storage path from a Supabase public URL.
 * Public URLs follow the pattern: .../storage/v1/object/public/avatars/<path>
 */
function extractStoragePath(url: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.substring(idx + marker.length)
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Get provider by user_id
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé. Contactez le support.' },
        { status: 404 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non supporté. Types acceptés: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum: 5MB' },
        { status: 400 }
      )
    }

    // Generate file path
    const ext = MIME_TO_EXT[file.type] || 'jpg'
    const filePath = `${user.id}/${Date.now()}-avatar.${ext}`

    // If provider has existing avatar_url, try to delete old file (best-effort)
    if (provider.avatar_url) {
      const oldPath = extractStoragePath(provider.avatar_url)
      if (oldPath) {
        await supabase.storage
          .from(AVATARS_BUCKET)
          .remove([oldPath])
          .catch((err) => {
            logger.error('Error deleting old avatar:', err)
          })
      }
    }

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to avatars bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (uploadError) {
      logger.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: `Erreur d'upload: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AVATARS_BUCKET)
      .getPublicUrl(uploadData.path)

    // Update providers.avatar_url
    const { error: updateError } = await supabase
      .from('providers')
      .update({
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', provider.id)

    if (updateError) {
      logger.error('Error updating provider avatar_url:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    logger.error('Avatar POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Verify user is an artisan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil introuvable' },
        { status: 404 }
      )
    }

    if (profile.role !== 'artisan') {
      return NextResponse.json(
        { error: 'Accès réservé aux artisans' },
        { status: 403 }
      )
    }

    // Get provider by user_id
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, avatar_url')
      .eq('user_id', user.id)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Aucun profil artisan trouvé. Contactez le support.' },
        { status: 404 }
      )
    }

    // If provider has avatar_url, delete from storage and clear field
    if (provider.avatar_url) {
      const storagePath = extractStoragePath(provider.avatar_url)

      if (storagePath) {
        const { error: deleteError } = await supabase.storage
          .from(AVATARS_BUCKET)
          .remove([storagePath])

        if (deleteError) {
          logger.error('Error deleting avatar from storage:', deleteError)
          // Continue anyway to clear the database field
        }
      }

      // Set avatar_url to null
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', provider.id)

      if (updateError) {
        logger.error('Error clearing provider avatar_url:', updateError)
        return NextResponse.json(
          { error: 'Erreur lors de la suppression de l\'avatar' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Avatar DELETE error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
