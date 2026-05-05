import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { computeSeoAggregate } from '@/lib/seo/baseline-aggregator'
import { logger } from '@/lib/logger'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

// Force dynamic rendering — cron lit request.headers (cron-secret) à chaque appel.
export const dynamic = 'force-dynamic'

/**
 * POST `/api/cron/seo-baseline-snapshot`
 *
 * Fige un instantané immuable des metrics `seo_page_scores` dans
 * `seo_baseline_snapshots`. Sert à valider le Gate P0 J+30 du plan ULTRA
 * DOMINATION SEO v2 (delta clics/orphans avant/après chaque sprint).
 *
 * Auth : `Authorization: Bearer <CRON_SECRET>` (timing-safe).
 *
 * Body JSON optionnel : `{ label?: string, notes?: string }`.
 * Si `label` absent → généré comme `auto-YYYY-MM-DD-HHmm`.
 *
 * Idempotence : la contrainte UNIQUE sur `label` empêche les doubles
 * snapshots officiels (gate-p0-j30, etc.). Réponse 409 sur conflit.
 */

const BodySchema = z
  .object({
    label: z
      .string()
      .min(3)
      .max(80)
      .regex(/^[a-z0-9][a-z0-9-]{1,80}[a-z0-9]$/, {
        message: 'label kebab-case lowercase, 3-82 chars',
      })
      .optional(),
    notes: z.string().max(500).optional(),
  })
  .strict()

function autoLabel(): string {
  const d = new Date()
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const min = String(d.getUTCMinutes()).padStart(2, '0')
  return `auto-${yyyy}-${mm}-${dd}-${hh}${min}`
}

export const POST = withCronCheckIn('cron-seo-baseline-snapshot', async (request: Request) => {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
  }
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let body: z.infer<typeof BodySchema> = {}
  try {
    const raw = await request.text()
    if (raw.trim().length > 0) {
      const parsed = BodySchema.safeParse(JSON.parse(raw))
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Body invalide', details: parsed.error.flatten() },
          { status: 400 }
        )
      }
      body = parsed.data
    }
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const label = body.label ?? autoLabel()
  const supabase = createAdminClient()

  try {
    const aggregate = await computeSeoAggregate(supabase)

    const { data, error } = await supabase
      .from('seo_baseline_snapshots')
      .insert({
        label,
        notes: body.notes ?? null,
        total_pages: aggregate.total_pages,
        indexed_count: aggregate.indexed_count,
        orphan_critical: aggregate.orphan_critical,
        orphan_weak: aggregate.orphan_weak,
        avg_link_score: aggregate.avg_link_score,
        median_link_score: aggregate.median_link_score,
        by_page_type: aggregate.by_page_type,
      })
      .select('id, label, snapshot_date')
      .single()

    if (error) {
      // 23505 unique_violation = label déjà pris
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Label déjà utilisé', label }, { status: 409 })
      }
      logger.error('[seo-baseline-snapshot] insert failed', { error: error.message, label })
      return NextResponse.json({ error: 'Insert échouée' }, { status: 500 })
    }

    return NextResponse.json(
      {
        ok: true,
        snapshot: {
          id: data.id,
          label: data.label,
          snapshot_date: data.snapshot_date,
        },
        aggregate,
      },
      { status: 201 }
    )
  } catch (err) {
    logger.error('[seo-baseline-snapshot] unhandled error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
})
