import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { getArtisanUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: true },
}

interface Props {
  params: { slug: string }
}

export default async function ArtisanRedirectPage({ params }: Props) {
  const slug = decodeURIComponent(params.slug || '').trim()
  if (!slug) notFound()

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
    city: data.address_city,
  })

  if (!url || url.endsWith('/')) notFound()

  redirect(url)
}
