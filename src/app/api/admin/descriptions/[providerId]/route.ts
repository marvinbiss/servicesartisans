import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { isValidUuid } from '@/lib/sanitize'
import {
  buildProviderUrls,
  submitUrlsWithRetry,
  type ProviderSeoRefreshEvent,
} from '@/lib/seo/provider-seo-refresh'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  action: z.enum(['publish', 'reject', 'edit']),
  draft_text: z.string().min(50).max(5000).optional(),
  rejection_reason: z.string().max(1000).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { providerId: string } }) {
  try {
    const auth = await requirePermission('providers', 'write')
    if (!auth.success || !auth.admin) {
      return (
        auth.error ??
        NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
      )
    }

    if (!isValidUuid(params.providerId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid provider id' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid body', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { action, draft_text, rejection_reason } = parsed.data

    if (action === 'edit') {
      if (!draft_text) {
        return NextResponse.json(
          { success: false, error: { message: 'draft_text required for edit' } },
          { status: 400 }
        )
      }
      const wordCount = draft_text.trim().split(/\s+/).length
      const { error } = await supabase
        .from('provider_descriptions_draft')
        .update({ draft_text, word_count: wordCount })
        .eq('provider_id', params.providerId)
      if (error) {
        return NextResponse.json(
          { success: false, error: { message: error.message } },
          { status: 500 }
        )
      }
      await logAdminAction(auth.admin.id, 'description.edit', 'provider', params.providerId, {
        word_count: wordCount,
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('provider_descriptions_draft')
        .update({
          status: 'judged_fail',
          rejection_reason: rejection_reason ?? 'Rejected by admin',
        })
        .eq('provider_id', params.providerId)
      if (error) {
        return NextResponse.json(
          { success: false, error: { message: error.message } },
          { status: 500 }
        )
      }
      await logAdminAction(auth.admin.id, 'description.reject', 'provider', params.providerId, {
        rejection_reason,
      })
      return NextResponse.json({ success: true })
    }

    // action === 'publish'
    const { data: draft, error: draftErr } = await supabase
      .from('provider_descriptions_draft')
      .select('draft_text')
      .eq('provider_id', params.providerId)
      .maybeSingle()

    if (draftErr || !draft?.draft_text) {
      return NextResponse.json(
        { success: false, error: { message: 'Draft not found or empty' } },
        { status: 404 }
      )
    }

    const { data: provider, error: providerFetchErr } = await supabase
      .from('providers')
      .select('id, slug, stable_id, specialty, address_city')
      .eq('id', params.providerId)
      .maybeSingle()

    if (providerFetchErr || !provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Provider not found' } },
        { status: 404 }
      )
    }

    const { error: updErr } = await supabase
      .from('providers')
      .update({
        description: draft.draft_text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.providerId)

    if (updErr) {
      return NextResponse.json(
        { success: false, error: { message: updErr.message } },
        { status: 500 }
      )
    }

    const { error: flipErr } = await supabase
      .from('provider_descriptions_draft')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('provider_id', params.providerId)

    if (flipErr) {
      logger.warn('[admin/descriptions] draft flip failed after publish', {
        providerId: params.providerId,
        error: flipErr.message,
      })
    }

    // Fire-and-forget IndexNow — never block the admin response.
    const event: ProviderSeoRefreshEvent = {
      reason: 'provider_activated',
      provider_id: params.providerId,
      specialty: provider.specialty,
      city: provider.address_city,
      slug: provider.slug,
      stable_id: provider.stable_id,
    }
    const urls = buildProviderUrls(event)
    if (urls.length > 0) {
      submitUrlsWithRetry(urls, 'provider_activated').catch((err) => {
        logger.warn('[admin/descriptions] indexnow push failed', {
          providerId: params.providerId,
          error: err instanceof Error ? err.message : String(err),
        })
      })
    }

    await logAdminAction(auth.admin.id, 'description.publish', 'provider', params.providerId, {
      urls_count: urls.length,
    })

    return NextResponse.json({ success: true, urls_count: urls.length })
  } catch (err) {
    logger.error('admin/descriptions PATCH fatal', err as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
