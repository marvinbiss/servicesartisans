import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { invalidateCache } from '@/lib/cache'
import { revalidatePagePaths } from '@/lib/cms-revalidate'
import { UUID_RE } from '@/lib/cms-utils'

export const dynamic = 'force-dynamic'

// --- POST: Publish a page ---

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'publish')
    if (!auth.success) return auth.error!

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Atomic publish: only update if NOT already published (prevents TOCTOU race)
    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: auth.admin!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .neq('status', 'published')
      .select()
      .single()

    if (error || !page) {
      // PGRST116 = no rows matched for .single() — either 404 or already published
      if (error?.code === 'PGRST116' || (!page && !error)) {
        const { data: existing } = await supabase
          .from('cms_pages')
          .select('status')
          .eq('id', id)
          .single()

        if (existing?.status === 'published') {
          return NextResponse.json(
            { success: false, error: { message: 'La page est déjà publiée' } },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { success: false, error: { message: 'Page non trouvée' } },
          { status: 404 }
        )
      }
      logger.error('CMS page publish error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la publication de la page' } },
        { status: 500 }
      )
    }

    // Revalidate cached paths + invalidate in-memory cache
    revalidatePagePaths(page)
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page publish error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- DELETE: Unpublish (revert to draft) ---

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'publish')
    if (!auth.success) return auth.error!

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch current page data first for path revalidation
    const { data: currentPage } = await supabase
      .from('cms_pages')
      .select('page_type, slug, service_slug, location_slug')
      .eq('id', id)
      .single()

    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        status: 'draft',
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !page) {
      logger.error('CMS page unpublish error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la dépublication de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // Revalidate cached paths using data from before the update
    if (currentPage) {
      revalidatePagePaths(currentPage)
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page unpublish error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
