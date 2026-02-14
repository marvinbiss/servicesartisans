import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// --- Helpers ---

function revalidatePagePaths(page: {
  page_type: string
  slug: string
  service_slug?: string | null
  location_slug?: string | null
}) {
  switch (page.page_type) {
    case 'static':
      revalidatePath(`/${page.slug}`)
      break
    case 'blog':
      revalidatePath(`/blog/${page.slug}`)
      revalidatePath('/blog')
      break
    case 'service':
      revalidatePath(`/services/${page.slug}`)
      break
    case 'location':
      if (page.service_slug && page.location_slug) {
        revalidatePath(`/services/${page.service_slug}/${page.location_slug}`)
      }
      break
    case 'homepage':
      revalidatePath('/')
      break
    case 'faq':
      revalidatePath('/faq')
      break
  }
}

// --- POST: Publish a page ---

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'publish')
    if (!auth.success) return auth.error!

    const { id } = await params
    const supabase = createAdminClient()

    // Check if already published
    const { data: current } = await supabase
      .from('cms_pages')
      .select('status')
      .eq('id', id)
      .single()

    if (current?.status === 'published') {
      return NextResponse.json(
        { success: false, error: { message: 'La page est déjà publiée' } },
        { status: 409 }
      )
    }

    const { data: page, error } = await supabase
      .from('cms_pages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: auth.admin!.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !page) {
      logger.error('CMS page publish error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la publication de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // Revalidate cached paths
    revalidatePagePaths(page)

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

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page unpublish error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
