import { NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { invalidateCache } from '@/lib/cache'
import { revalidatePagePaths } from '@/lib/cms-revalidate'
import DOMPurify from 'isomorphic-dompurify'
import { UUID_RE, updatePageSchema, sanitizeTextFields } from '@/lib/cms-utils'

export const dynamic = 'force-dynamic'

// --- GET: Single page by ID ---

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'read')
    if (!auth.success) return auth.error!

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: page, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !page) {
      return NextResponse.json(
        { success: false, error: { message: 'Page non trouvée' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page get error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- PUT: Update page ---

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'write')
    if (!auth.success) return auth.error!

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Corps de requête JSON invalide' } },
        { status: 400 }
      )
    }

    const parsed = updatePageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Données invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const validated = parsed.data

    // Sanitize HTML content
    if (validated.content_html) {
      validated.content_html = DOMPurify.sanitize(validated.content_html)
    }

    // Strip HTML from text-only fields
    sanitizeTextFields(validated)

    // Guard against oversized JSON payloads
    if (validated.content_json && JSON.stringify(validated.content_json).length > 500000) {
      return NextResponse.json(
        { success: false, error: { message: 'Le contenu JSON dépasse la taille maximale autorisée' } },
        { status: 400 }
      )
    }
    if (validated.structured_data && JSON.stringify(validated.structured_data).length > 100000) {
      return NextResponse.json(
        { success: false, error: { message: 'Les données structurées dépassent la taille maximale autorisée' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Fetch old slug/type before update for stale-path revalidation
    let oldPage: { slug: string; page_type: string; service_slug: string | null; location_slug: string | null; status: string } | null = null
    if (validated.slug || validated.page_type) {
      const { data } = await supabase
        .from('cms_pages')
        .select('slug, page_type, service_slug, location_slug, status')
        .eq('id', id)
        .single()
      oldPage = data
    }

    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        ...validated,
        updated_by: auth.admin!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !page) {
      logger.error('CMS page update error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la mise à jour de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // Log d'audit
    await logAdminAction(auth.admin!.id, 'cms_page.update', 'cms_page', id, { slug: page.slug, page_type: page.page_type })

    // Revalidate cached paths if the page is published
    if (page.status === 'published') {
      revalidatePagePaths(page)
      // Also revalidate old path if slug/type changed
      if (oldPage && oldPage.status === 'published' && (oldPage.slug !== page.slug || oldPage.page_type !== page.page_type)) {
        revalidatePagePaths(oldPage)
      }
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page update error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- DELETE: Soft delete (set is_active = false) ---

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'delete')
    if (!auth.success) return auth.error!

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        is_active: false,
        updated_by: auth.admin!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !page) {
      logger.error('CMS page delete error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // Log d'audit
    await logAdminAction(auth.admin!.id, 'cms_page.delete', 'cms_page', id, { slug: page.slug })

    // Revalidate public paths so the page disappears from the site
    if (page.status === 'published') {
      revalidatePagePaths(page)
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
