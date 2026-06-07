import { NextResponse } from 'next/server'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { invalidateCache } from '@/lib/cache'
import { revalidatePagePaths } from '@/lib/cms-revalidate'
import { z } from 'zod'
import { UUID_RE } from '@/lib/cms-utils'
import { sanitizeRichHtml } from '@/lib/sanitize-html-content'

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

// --- Schema ---

const restoreSchema = z.object({
  version_id: z.string().uuid('ID de version invalide'),
})

// --- POST: Restore a specific version ---

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // SLA-99.9 : rate limit restore 10/min/IP fail-open (action rare).
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-cms-restore:${ip}`, {
      window: 60_000,
      max: 10,
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

    const parsed = restoreSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Données invalides', details: parsed.error.flatten() },
        },
        { status: 400 }
      )
    }

    const { version_id } = parsed.data
    const supabase = createAdminClient()

    // SLA-99.9 : Fetch the version to restore (timeout 5s).
    const { data: version, error: versionError } = await withSupabaseTimeout(
      supabase
        .from('cms_page_versions')
        .select(
          'id, page_id, version_number, title, content_json, content_html, structured_data, meta_title, meta_description, status, created_by, created_at, change_summary'
        )
        .eq('id', version_id)
        .eq('page_id', id)
        .single()
    )

    if (versionError || !version) {
      return NextResponse.json(
        { success: false, error: { message: 'Version non trouvée' } },
        { status: 404 }
      )
    }

    // SLA-99.9 : snapshot avant écrasement (audit_logs.old_value).
    const { data: oldPage } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .select('id, slug, title, status, meta_title, meta_description, updated_at')
        .eq('id', id)
        .single()
    )

    // Update the page with the version's content (sanitize HTML)
    let sanitizedHtml = version.content_html
    if (version.content_html) {
      sanitizedHtml = sanitizeRichHtml(version.content_html)
    }
    // SLA-99.9 : Promise.race timeout 5s sur l'update.
    const { data: page, error: updateError } = await withSupabaseTimeout(
      supabase
        .from('cms_pages')
        .update({
          content_json: version.content_json,
          content_html: sanitizedHtml,
          structured_data: version.structured_data,
          title: version.title,
          meta_title: version.meta_title,
          meta_description: version.meta_description,
          updated_by: auth.admin.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    )

    if (updateError || !page) {
      logger.error('admin-cms-restore: error', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la restauration de la version' } },
        { status: 500 }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur restore — capital pour la chaîne de
    // responsabilité éditoriale (qui a remis quelle version, quand).
    try {
      await withSupabaseTimeout(
        supabase.from('audit_logs').insert({
          user_id: auth.admin.id,
          action: 'cms_page.restore',
          resource_type: 'cms_page',
          resource_id: id,
          old_value: oldPage ?? {},
          new_value: {
            slug: page.slug,
            version_id,
            version_number: version.version_number,
            title: version.title,
            restored_from_version_created_at: version.created_at,
          },
        })
      )
    } catch (auditError) {
      logger.warn('admin-cms-restore: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/cms/[id]/restore', method: 'POST', audit: 'failed' },
      })
    }
    void logAdminAction

    // Revalidate cached paths if the page is published
    if (page.status === 'published') {
      revalidatePagePaths(page)
    }

    // Invalidate in-memory cache
    invalidateCache(/^cms:/)

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    logger.error('admin-cms-restore: error', error)
    captureError(error, {
      tags: { route: 'admin/cms/[id]/restore', method: 'POST', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
