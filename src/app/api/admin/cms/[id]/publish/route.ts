import { NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { invalidateCache } from '@/lib/cache'
import { revalidatePagePaths } from '@/lib/cms-revalidate'
import { UUID_RE } from '@/lib/cms-utils'

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

// --- POST: Publish a page ---

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit publish 20/min/IP fail-open (action sensible mais doit
    // pas bloquer un admin qui pousse plusieurs pages d'affilée).
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-publish:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const auth = await requirePermission('content', 'publish')
    if (!auth.success) return auth.error

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : Atomic publish with Promise.race timeout 5s.
    // Only update if NOT already published (prevents TOCTOU race).
    const { data: page, error } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: auth.admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .neq('status', 'published')
        .select()
        .single()
    )

    if (error || !page) {
      // PGRST116 = no rows matched for .single() — either 404 or already published
      if (error?.code === 'PGRST116' || (!page && !error)) {
        const { data: existing } = await withSupabaseTimeout(
          supabase.from('cms_pages').select('status').eq('id', id).single()
        )

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
      logger.error('admin-cms-publish: error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la publication de la page' } },
        { status: 500 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur publish, avec slug pour traçabilité SEO.
    try {
      await withSupabaseTimeout(
        supabase.from('audit_logs').insert({
          user_id: auth.admin.id,
          action: 'cms_page.publish',
          resource_type: 'cms_page',
          resource_id: id,
          old_value: { status: 'draft' },
          new_value: {
            slug: page.slug,
            page_type: page.page_type,
            status: 'published',
            published_at: page.published_at,
          },
        })
      )
    } catch (auditError) {
      logger.warn('admin-cms-publish: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/cms/[id]/publish', method: 'POST', audit: 'failed' },
      })
    }
    void logAdminAction

    // Revalidate cached paths + invalidate in-memory cache
    revalidatePagePaths(page)
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-publish: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]/publish', method: 'POST', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// --- DELETE: Unpublish (revert to draft) ---

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit unpublish 20/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-unpublish:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const auth = await requirePermission('content', 'publish')
    if (!auth.success) return auth.error

    const { id } = await params
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { success: false, error: { message: 'ID invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : Fetch current page data first (timeout 5s) for path revalidation + audit.
    const { data: currentPage } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .select('page_type, slug, service_slug, location_slug, status, published_at')
        .eq('id', id)
        .single()
    )

    // SLA-99.9 : Promise.race timeout 5s.
    const { data: page, error } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .update({
          status: 'draft',
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    )

    if (error || !page) {
      logger.error('admin-cms-unpublish: error', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la dépublication de la page' } },
        { status: error ? 500 : 404 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur unpublish.
    try {
      await withSupabaseTimeout(
        supabase.from('audit_logs').insert({
          user_id: auth.admin.id,
          action: 'cms_page.unpublish',
          resource_type: 'cms_page',
          resource_id: id,
          old_value: currentPage ?? { status: 'published' },
          new_value: {
            slug: page.slug,
            status: 'draft',
            published_at: null,
          },
        })
      )
    } catch (auditError) {
      logger.warn('admin-cms-unpublish: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/cms/[id]/publish', method: 'DELETE', audit: 'failed' },
      })
    }

    // Revalidate cached paths using data from before the update
    if (currentPage) {
      revalidatePagePaths(currentPage)
    }
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-unpublish: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]/publish', method: 'DELETE', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
