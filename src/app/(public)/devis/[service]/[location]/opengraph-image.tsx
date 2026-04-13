import { ImageResponse } from 'next/og'
import { services as staticServicesList, getVilleBySlug } from '@/lib/data/france'
import { OgCard } from '@/lib/og/og-card'

export const runtime = 'edge'

export const alt = 'ServicesArtisans — Devis gratuit artisan'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ service: string; location: string }>
}) {
  const { service: serviceSlug, location: locationSlug } = await params

  const staticSvc = staticServicesList.find((s) => s.slug === serviceSlug)
  const ville = getVilleBySlug(locationSlug)

  const serviceName = staticSvc?.name || serviceSlug
  const cityName = ville?.name || locationSlug
  const departement = ville?.departement || ''

  return new ImageResponse(
    <OgCard
      badge="Devis gratuit"
      headline={serviceName}
      subline={`à ${cityName}`}
      detail={departement}
      tagline="Comparez jusqu'à 5 devis · Sans engagement"
    />,
    { ...size }
  )
}
