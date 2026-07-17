import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getArtisanUrl } from '@/lib/utils'
import { cityValueToName } from '@/lib/insee-resolver'

// ISR : ce path effectue 1 requête DB pour resoudre slug/stable_id puis
// redirige (301). Resultat stable tant que `providers.slug/stable_id/
// address_city` ne change pas. revalidate=3600 = 1h CDN cache, evite des
// milliers de DB hits sur les slugs frequemment demandes.
export const revalidate = 3600

export const metadata = {
  robots: { index: false, follow: true },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ArtisanRedirectPage(props: Props) {
  const params = await props.params
  const slug = decodeURIComponent(params.slug || '').trim()
  if (!slug) notFound()

  // Héritage de la règle next.config '/artisan/:service' (retirée 2026-06-05
  // car elle avalait aussi les slugs fiche → gone-paths 410) : un slug qui
  // est un service du catalogue redirige vers son hub.
  if (SERVICE_TO_SPECIALTIES[slug]) {
    redirect(`/services/${slug}`)
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('providers')
    .select('slug, stable_id, specialty, address_city, is_active, noindex')
    .or(`slug.eq.${slug},stable_id.eq.${slug}`)
    .eq('is_active', true)
    .eq('noindex', false)
    .limit(1)
    .maybeSingle()

  if (!data) notFound()

  const url = getArtisanUrl({
    slug: data.slug,
    stable_id: data.stable_id,
    specialty: data.specialty,
    // address_city = code INSEE pour ~91% des lignes — getArtisanUrl attend
    // un nom de ville (résolution ici car insee-resolver est server-only).
    city: cityValueToName(data.address_city) || data.address_city,
  })

  if (!url || url.endsWith('/')) notFound()

  redirect(url)
}
