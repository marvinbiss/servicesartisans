/**
 * Page comparateur d'artisans — URL shareable.
 *
 * Convention : `/comparer?ids=stableId1,stableId2,stableId3` (max 3).
 *
 * Pourquoi server component :
 * - Évite le "blank flash" : la comparaison est rendue HTML côté serveur, pas
 *   reconstituée client après hydratation (l'état localStorage du CompareProvider
 *   est limité à la session courante de navigation).
 * - Le lien est partageable : un utilisateur peut envoyer son comparateur par
 *   SMS/email et le destinataire voit les mêmes 3 artisans.
 *
 * SEO : noindex — la page est transactionnelle et propre à chaque utilisateur,
 * pas une URL canonique qu'on veut indexer dans Google.
 *
 * @kw-primary : N/A (page utilitaire, pas une cible SEO)
 */
import { Metadata } from 'next'
import { Suspense } from 'react'
import { getProviderByStableId, getProviderById } from '@/lib/supabase'
import { Provider } from '@/types'
import { ComparerPageClient } from './ComparerPageClient'

export const metadata: Metadata = {
  title: 'Comparer les artisans',
  description:
    'Comparez 2 à 3 artisans côte à côte : notes, certifications RGE, vérifications, coordonnées.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const MAX_COMPARE = 3

function parseIds(raw: string | string[] | undefined): string[] {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw.join(',') : raw
  return list
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE)
}

async function fetchProviders(ids: string[]): Promise<Provider[]> {
  const results = await Promise.all(
    ids.map(async (id) => {
      // Try stable_id first (preferred — public-facing identifier), then fall back to UUID id.
      const byStable = await getProviderByStableId(id)
      if (byStable) return byStable as unknown as Provider
      const byId = await getProviderById(id)
      return byId ? (byId as unknown as Provider) : null
    })
  )
  return results.filter((p): p is Provider => p !== null)
}

export default async function ComparerPage(props: {
  searchParams: Promise<{ ids?: string | string[] }>
}) {
  const searchParams = await props.searchParams
  const ids = parseIds(searchParams.ids)
  const providers = ids.length > 0 ? await fetchProviders(ids) : []

  return (
    <Suspense fallback={null}>
      <ComparerPageClient providers={providers} requestedCount={ids.length} />
    </Suspense>
  )
}
