import { NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { createPageSchema, sanitizeTextFields } from '@/lib/cms-utils'

export const dynamic = 'force-dynamic'

// --- Schemas ---

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  page_type: z.enum(['static', 'blog', 'service', 'location', 'homepage', 'faq']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['updated_at', 'created_at', 'title', 'status', 'page_type', 'published_at']).optional().default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  show_inactive: z.enum(['true', 'false']).optional(),
})

// --- GET: List CMS pages ---

export async function GET(request: Request) {
  try {
    const auth = await requirePermission('content', 'read')
    if (!auth.success) return auth.error!

    const { searchParams } = new URL(request.url)
    const queryParams = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      page_type: searchParams.get('page_type') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'updated_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
      show_inactive: searchParams.get('show_inactive') || undefined,
    }

    const parsed = listQuerySchema.safeParse(queryParams)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Paramètres invalides', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { page, pageSize, page_type, status, search, sortBy, sortOrder, show_inactive } = parsed.data
    const offset = (page - 1) * pageSize

    const supabase = createAdminClient()

    let query = supabase
      .from('cms_pages')
      .select('id, slug, page_type, title, status, meta_title, meta_description, published_at, updated_at, created_at, author, category, tags, sort_order, is_active, excerpt, featured_image, service_slug, location_slug', { count: 'exact' })

    // Filters
    if (page_type) {
      query = query.eq('page_type', page_type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      const escapedSearch = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
      query = query.ilike('title', `%${escapedSearch}%`)
    }

    // By default, only show active pages unless explicitly requested
    const showInactive = show_inactive === 'true'
    if (!showInactive) {
      query = query.eq('is_active', true)
    }

    // Sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1)

    const { data: pages, error, count } = await query

    if (error) {
      logger.error('CMS pages list error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la récupération des pages' } },
        { status: 500 }
      )
    }

    const total = count || 0

    return NextResponse.json({
      success: true,
      data: pages || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    logger.error('CMS pages list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- POST: Create a CMS page ---

export async function POST(request: Request) {
  try {
    const auth = await requirePermission('content', 'write')
    if (!auth.success) return auth.error!

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'Corps de requête JSON invalide' } },
        { status: 400 }
      )
    }

    const parsed = createPageSchema.safeParse(body)
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

    const { data: page, error } = await supabase
      .from('cms_pages')
      .insert({
        ...validated,
        created_by: auth.admin!.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: { message: 'Un slug identique existe déjà pour ce type de page' } },
          { status: 409 }
        )
      }
      logger.error('CMS page create error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la création de la page' } },
        { status: 500 }
      )
    }

    // Log d'audit
    await logAdminAction(auth.admin!.id, 'cms_page.create', 'cms_page', page.id, { slug: validated.slug, page_type: validated.page_type })

    return NextResponse.json({ success: true, data: page }, { status: 201 })
  } catch (error) {
    logger.error('CMS page create error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
