import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

export const dynamic = 'force-dynamic'

// --- Schema ---

const updatePageSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets').optional(),
  page_type: z.enum(['static', 'blog', 'service', 'location', 'homepage', 'faq']).optional(),
  title: z.string().min(1).max(500).optional(),
  content_json: z.record(z.string(), z.unknown()).nullable().optional(),
  content_html: z.string().nullable().optional(),
  structured_data: z.record(z.string(), z.unknown()).nullable().optional(),
  meta_title: z.string().max(70).nullable().optional(),
  meta_description: z.string().max(170).nullable().optional(),
  og_image_url: z.string().url().nullable().optional(),
  excerpt: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  featured_image: z.string().nullable().optional(),
  service_slug: z.string().nullable().optional(),
  location_slug: z.string().nullable().optional(),
})

// --- GET: Single page by ID ---

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission('content', 'read')
    if (!auth.success) return auth.error!

    const { id } = await params
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

    const supabase = createAdminClient()

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

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('CMS page delete error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
