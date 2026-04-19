import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  status: z
    .enum(['pending', 'generating', 'judged_pass', 'judged_fail', 'published', 'archived', 'all'])
    .default('judged_pass'),
  minScore: z.coerce.number().min(0).max(10).default(0),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission('providers', 'read')
    if (!auth.success || !auth.admin) {
      return (
        auth.error ??
        NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })
      )
    }

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = querySchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid params', details: parsed.error.flatten() } },
        { status: 400 }
      )
    }

    const { status, minScore, page, limit } = parsed.data
    const supabase = createAdminClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('provider_descriptions_draft')
      .select(
        'provider_id, draft_text, word_count, prompt_version, rubric_version, model_used, tokens_input, tokens_output, cost_estimate_usd, judge_score, judge_breakdown, status, rejection_reason, hallucination_flags, attempts, generated_at, judged_at, published_at, updated_at',
        { count: 'exact' }
      )
      .order('judged_at', { ascending: false, nullsFirst: false })
      .range(from, to)

    if (status !== 'all') query = query.eq('status', status)
    if (minScore > 0) query = query.gte('judge_score', minScore)

    const { data, error, count } = await query
    if (error) {
      logger.error('admin/descriptions list failed', error as Error)
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 500 }
      )
    }

    const drafts = data ?? []
    const providerIds = drafts.map((d) => d.provider_id as string)
    const providersMap = new Map<
      string,
      {
        id: string
        name: string | null
        slug: string | null
        address_city: string | null
        description: string | null
      }
    >()

    if (providerIds.length > 0) {
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name, slug, address_city, description')
        .in('id', providerIds)
      for (const p of providers ?? []) providersMap.set(p.id as string, p as never)
    }

    const items = drafts.map((d) => ({
      ...d,
      provider: providersMap.get(d.provider_id as string) ?? null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: count ?? items.length,
        page,
        limit,
      },
    })
  } catch (err) {
    logger.error('admin/descriptions fatal', err as Error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
