/**
 * Cluster publisher — gate critic_passed_at -> published_at + noindex = false.
 *
 * Source de verite : table `renovation_clusters` (mig 524). On ne publie
 * jamais un cluster sans :
 *   - critic_passed_at != null (verifie en DB)
 *   - content_jsonb shape valide (schema runtime check ici)
 *   - aucune redaction sourceCitation manquante
 *
 * Append-only update (UPDATE row, jamais DELETE). Service role only.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { ClusterContent } from './types'

export type PublishResult =
  | { kind: 'published'; slug: string; publishedAt: string }
  | { kind: 'rejected'; slug: string; reason: string }

function isPublishableContent(content: ClusterContent | null): content is ClusterContent {
  if (!content) return false
  if (!content.h1 || !content.metaTitle || !content.metaDescription) return false
  if (!Array.isArray(content.sections) || content.sections.length < 3) return false
  if (!Array.isArray(content.faq) || content.faq.length < 4) return false
  if (!Array.isArray(content.citedSources) || content.citedSources.length < 2) return false
  if (!content.author?.name) return false
  return true
}

export async function publishCluster(slug: string): Promise<PublishResult> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('renovation_clusters')
    .select('slug, content_jsonb, critic_passed_at, published_at, noindex')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) {
    return { kind: 'rejected', slug, reason: error?.message ?? 'not found' }
  }

  if (!data.critic_passed_at) {
    return { kind: 'rejected', slug, reason: 'critic_passed_at missing' }
  }

  if (!isPublishableContent(data.content_jsonb as ClusterContent | null)) {
    return { kind: 'rejected', slug, reason: 'content_jsonb shape invalid' }
  }

  const publishedAt = new Date().toISOString()
  const { error: updErr } = await admin
    .from('renovation_clusters')
    .update({ published_at: publishedAt, noindex: false, updated_at: publishedAt })
    .eq('slug', slug)

  if (updErr) return { kind: 'rejected', slug, reason: updErr.message }

  return { kind: 'published', slug, publishedAt }
}

export async function publishReadyBatch(limit = 100): Promise<ReadonlyArray<PublishResult>> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('renovation_clusters')
    .select('slug')
    .eq('noindex', true)
    .not('critic_passed_at', 'is', null)
    .order('critic_passed_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  const results: PublishResult[] = []
  for (const row of data) {
    results.push(await publishCluster(row.slug))
  }
  return results
}
