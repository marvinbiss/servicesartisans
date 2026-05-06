import { NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { invalidateCache } from '@/lib/cache'
import { revalidatePagePaths } from '@/lib/cms-revalidate'
import { UUID_RE, updatePageSchema, sanitizeTextFields } from '@/lib/cms-utils'

export const dynamic = 'force-dynamic'

// SLA-99.9 : timeout 5s pour borner Supabase.
const SUPABASE_TIMEOUT_MS = 5_000

function withSupabaseTimeout<T>(p: PromiseLike<T>): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
    ),
  ])
}

// --- GET: Single page by ID ---

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit lecture 60/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-get:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const auth = await requirePermission('content', 'read')
    if (!auth.success) return auth.error

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : Promise.race timeout 5s.
    const { data: page, error } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .select(
          'id, slug, page_type, title, content_json, content_html, structured_data, meta_title, meta_description, og_image_url, canonical_url, excerpt, author, author_bio, category, tags, read_time, featured_image, service_slug, location_slug, status, published_at, published_by, sort_order, is_active, created_by, updated_by, created_at, updated_at'
        )
        .eq('id', id)
        .single()
    )

    if (error || !page) {
      return NextResponse.json(
        { success: false, error: { message: 'Page non trouvée' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-get: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- PUT: Update page ---

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit mutation 30/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-put:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const auth = await requirePermission('content', 'write')
    if (!auth.success) return auth.error

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
        {
          success: false,
          error: { message: 'Données invalides', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const validated = parsed.data

    // Sanitize HTML content (lazy-import to avoid JSDOM crash in serverless cold start)
    if (validated.content_html) {
      const { default: DOMPurify } = await import('isomorphic-dompurify')
      validated.content_html = DOMPurify.sanitize(validated.content_html)
    }

    // Strip HTML from text-only fields
    sanitizeTextFields(validated)

    // Guard against oversized JSON payloads
    if (validated.content_json && JSON.stringify(validated.content_json).length > 500000) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Le contenu JSON dépasse la taille maximale autorisée' },
        },
        { status: 400 }
      )
    }
    if (validated.structured_data && JSON.stringify(validated.structured_data).length > 100000) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Les données structurées dépassent la taille maximale autorisée' },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : snapshot avant update (audit_logs.old_value + détection slug/type change).
    const { data: oldPage } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .select(
          'slug, page_type, service_slug, location_slug, status, title, meta_title, meta_description'
        )
        .eq('id', id)
        .single()
    )

    // SLA-99.9 : Promise.race timeout 5s.
    const { data: page, error } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .update({
          ...validated,
          updated_by: auth.admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    )

    if (error || !page) {
      logger.error('admin-cms-put: update error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la mise à jour de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur mutation.
    try {
      await withSupabaseTimeout(
        supabase.from('audit_logs').insert({
          user_id: auth.admin.id,
          action: 'cms_page.update',
          resource_type: 'cms_page',
          resource_id: id,
          old_value: oldPage ?? {},
          new_value: {
            slug: page.slug,
            page_type: page.page_type,
            title: page.title,
            status: page.status,
            updated_fields: Object.keys(validated),
          },
        })
      )
    } catch (auditError) {
      logger.warn('admin-cms-put: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/cms/[id]', method: 'PUT', audit: 'failed' },
      })
    }
    void logAdminAction

    // Revalidate cached paths if the page is published
    if (page.status === 'published') {
      revalidatePagePaths(page)
      // Also revalidate old path if slug/type changed
      if (
        oldPage &&
        oldPage.status === 'published' &&
        (oldPage.slug !== page.slug || oldPage.page_type !== page.page_type)
      ) {
        revalidatePagePaths(oldPage)
      }
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-put: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]', method: 'PUT', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- DELETE: Soft delete (set is_active = false) ---

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit destructif 30/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-delete:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const auth = await requirePermission('content', 'delete')
    if (!auth.success) return auth.error

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : snapshot avant soft-delete.
    const { data: oldPage } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .select('slug, page_type, status, is_active, title')
        .eq('id', id)
        .single()
    )

    // SLA-99.9 : Promise.race timeout 5s.
    const { data: page, error } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .update({
          is_active: false,
          updated_by: auth.admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    )

    if (error || !page) {
      logger.error('admin-cms-delete: error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la suppression de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur soft-delete.
    try {
      await withSupabaseTimeout(
        supabase.from('audit_logs').insert({
          user_id: auth.admin.id,
          action: 'cms_page.delete',
          resource_type: 'cms_page',
          resource_id: id,
          old_value: oldPage ?? {},
          new_value: { slug: page.slug, is_active: false },
        })
      )
    } catch (auditError) {
      logger.warn('admin-cms-delete: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/cms/[id]', method: 'DELETE', audit: 'failed' },
      })
    }

    // Revalidate public paths so the page disappears from the site
    if (page.status === 'published') {
      revalidatePagePaths(page)
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-delete: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]', method: 'DELETE', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
