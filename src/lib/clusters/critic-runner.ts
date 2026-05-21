/**
 * Cluster Critic runner — adapter sur src/lib/critic.
 *
 * Pourquoi un adapter :
 *   - Le Critic generique (`src/lib/critic`) ne connait pas la table cible.
 *     Cet adapter persiste chaque run dans `critic_runs` (mig 525) avec
 *     target_table = 'renovation_clusters' + target_id = cluster.slug.
 *   - Decision finale : si verdict != 'approve' -> on stamp critic_score
 *     uniquement (informatif), pas critic_passed_at. -> publisher.ts refuse.
 *
 * RGPD Art. 22 + AI Act §5b : chaque output YMYL = 1 row critic_runs.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { critique } from '@/lib/critic/critic'
import type { CriticInput, CriticVerdict } from '@/lib/critic/types'
import type { ClusterContent } from './types'

export type ClusterCriticInput = {
  slug: string
  content: ClusterContent
  primaryKw: string
  traceId: string
  agentName: string
}

export type ClusterCriticResult = {
  slug: string
  verdict: CriticVerdict
  pass: boolean
  costUsd?: number
  durationMs: number
  criticRunId: string | null
}

function flattenForCritic(content: ClusterContent): string {
  const parts: string[] = [content.h1, content.intro]
  for (const s of content.sections) {
    parts.push(s.h2, s.body)
    if (s.factsInjected) parts.push(...s.factsInjected)
  }
  for (const f of content.faq) {
    parts.push(f.question, f.answer)
  }
  for (const c of content.citedSources) {
    parts.push(`${c.title} (${c.url}, ${c.retrievedAt})`)
  }
  return parts.join('\n\n')
}

export async function runClusterCritic(input: ClusterCriticInput): Promise<ClusterCriticResult> {
  const t0 = Date.now()
  const criticInput: CriticInput = {
    primaryOutput: flattenForCritic(input.content),
    userQuery: input.primaryKw,
    ymylContext: 'aide_eligibility',
    sourceConversation: [],
    citedSources: input.content.citedSources,
    traceId: input.traceId,
    agentName: input.agentName,
  }

  const verdict = await critique(criticInput)
  const pass = verdict.decision === 'approve'
  const durationMs = Date.now() - t0

  const admin = createAdminClient()
  const { data: criticRow, error } = await admin
    .from('critic_runs')
    .insert({
      target_table: 'renovation_clusters',
      target_id: input.slug,
      ymyl_context: 'aide_eligibility',
      model: 'claude-opus-4-7',
      llm_score: verdict as unknown as Record<string, unknown>,
      decision: verdict.decision,
      pass,
      duration_ms: durationMs,
      trace_id: input.traceId,
      agent_name: input.agentName,
    })
    .select('id')
    .single()

  if (error || !criticRow) {
    return {
      slug: input.slug,
      verdict,
      pass,
      durationMs,
      criticRunId: null,
    }
  }

  if (pass) {
    await admin
      .from('renovation_clusters')
      .update({
        critic_score: verdict as unknown as Record<string, unknown>,
        critic_passed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', input.slug)
  } else {
    await admin
      .from('renovation_clusters')
      .update({
        critic_score: verdict as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', input.slug)
  }

  return {
    slug: input.slug,
    verdict,
    pass,
    durationMs,
    criticRunId: criticRow.id,
  }
}
