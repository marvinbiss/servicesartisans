import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// --- Schema ---

const restoreSchema = z.object({
  version_id: z.string().uuid('ID de version invalide'),
})

// --- POST: Restore a specific version ---

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'write')
    if (!auth.success) return auth.error!

    const { id } = await params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Corps de requête JSON invalide' } },
        { status: 400 }
      )
    }

    const parsed = restoreSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { version_id } = parsed.data
    const supabase = createAdminClient()

    // Fetch the version to restore
    const { data: version, error: versionError } = await supabase
      .from('cms_page_versions')
      .select('*')
      .eq('id', version_id)
      .eq('page_id', id)
      .single()

    if (versionError || !version) {
      return NextResponse.json(
        { success: false, error: { message: 'Version non trouvée' } },
        { status: 404 }
      )
    }

    // Update the page with the version's content
    const { data: page, error: updateError } = await supabase
      .from('cms_pages')
      .update({
        content_json: version.content_json,
        content_html: version.content_html,
        structured_data: version.structured_data,
        title: version.title,
        meta_title: version.meta_title,
        meta_description: version.meta_description,
        updated_by: auth.admin!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError || !page) {
      logger.error('CMS page restore error', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la restauration de la version' } },
        { status: 500 }
      )
    }

    // Revalidate cached paths if the page is published
    if (page.status === 'published') {
      switch (page.page_type) {
        case 'static': revalidatePath(`/${page.slug}`); break
        case 'blog': revalidatePath(`/blog/${page.slug}`); revalidatePath('/blog'); break
        case 'service': revalidatePath(`/services/${page.slug}`); break
        case 'location':
          if (page.service_slug && page.location_slug) {
            revalidatePath(`/services/${page.service_slug}/${page.location_slug}`)
          }
          break
        case 'homepage': revalidatePath('/'); break
        case 'faq': revalidatePath('/faq'); break
      }
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page restore error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
